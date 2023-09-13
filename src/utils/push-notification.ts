import { Capacitor, PluginListenerHandle } from '@capacitor/core'
import { apiClient } from 'src/api/ApiClient'
import { RegisterDeviceDto } from 'src/api/model/RegisterDeviceDto'
import { PushNotifications } from '@capacitor/push-notifications'
import { Preferences } from '@capacitor/preferences'

const KEY_DEVICE_TOKEN = 'KEY_DEVICE_TOKEN'

const REGISTRATION_SUCCESS_TIMEOUT_SECONDS = 10

interface RegistrationControls {
  register: () => Promise<void>
  deregister: () => Promise<void>
}

const registerDevicePlatformMap: Record<string, RegistrationControls> = {
  web: {
    register: registerWebDevice,
    deregister: deregisterWebDevice
  },
  android: {
    register: registerAndroidDevice,
    deregister: deregisterMobileDevice
  },
  ios: {
    register: registerIOSDevice,
    deregister: deregisterMobileDevice
  }
}

export async function registerDevice(): Promise<void> {
  const platform = Capacitor.getPlatform()

  const registrationControls = registerDevicePlatformMap[platform]
  if (registrationControls != null) await registrationControls.register()
}

export async function deregisterDevice(): Promise<void> {
  const platform = Capacitor.getPlatform()

  const registrationControls = registerDevicePlatformMap[platform]
  if (registrationControls != null) await registrationControls.deregister()
}

async function registerWebDevice(): Promise<void> {
  if (!(await webUserHasGrantedNotificationPermissions())) return

  const serviceWorkerRegistration =
    await navigator.serviceWorker?.getRegistration()
  if (serviceWorkerRegistration == null) return

  const existingSubscription =
    await serviceWorkerRegistration.pushManager.getSubscription()

  if (existingSubscription != null)
    return registerSubscription(existingSubscription)

  const publicVapidToken = (await apiClient.account.getVapidPublicKey()).payload
    .data.key
  const convertedToken = urlBase64ToUint8Array(publicVapidToken)
  const newSubscription = await serviceWorkerRegistration.pushManager.subscribe(
    {
      userVisibleOnly: true,
      applicationServerKey: convertedToken
    }
  )

  if (newSubscription != null) return registerSubscription(newSubscription)
}

async function webUserHasGrantedNotificationPermissions(): Promise<boolean> {
  const permissions = await navigator.permissions.query({
    name: 'notifications'
  })

  if (permissions.state === 'granted') return true

  const requestedPermissions = await Notification.requestPermission()

  return requestedPermissions === 'granted'
}

async function registerSubscription(
  subscription: PushSubscription
): Promise<void> {
  const json = subscription.toJSON()
  if (json.endpoint == null || json.keys == null) return
  await apiClient.account.registerDevice({
    registration: json.endpoint,
    type: 'P',
    keys: json.keys as RegisterDeviceDto['keys']
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function deregisterWebDevice(): Promise<void> {
  const serviceWorkerRegistration =
    await navigator.serviceWorker?.getRegistration()
  if (serviceWorkerRegistration == null) return

  const existingSubscription =
    await serviceWorkerRegistration.pushManager.getSubscription()

  if (existingSubscription == null) return

  await apiClient.account.unregisterDevice({
    registration: existingSubscription.endpoint
  })
  await existingSubscription.unsubscribe()
}

async function registerAndroidDevice(): Promise<void> {
  await registerMobileDevice('A')
}

async function registerIOSDevice(): Promise<void> {
  await registerMobileDevice('I')
}

async function registerMobileDevice(mode: 'A' | 'I'): Promise<void> {
  if (!(await mobileUserHasGrantedNotificationPermissions())) return

  await PushNotifications.register()

  const token = await getMobileRegistrationToken()

  await apiClient.account.registerDevice({
    registration: token,
    type: mode
  })
}

async function mobileUserHasGrantedNotificationPermissions(): Promise<boolean> {
  const permissionStatus = await PushNotifications.checkPermissions()

  const shouldRequestPermission = permissionStatus.receive === 'prompt'
  if (shouldRequestPermission) {
    const requestedPermission = await PushNotifications.requestPermissions()
    return requestedPermission.receive === 'granted'
  }

  return permissionStatus.receive === 'granted'
}

async function deregisterMobileDevice(): Promise<void> {
  const token = await getMobileRegistrationToken()

  await Promise.all([
    PushNotifications.removeAllListeners(),
    PushNotifications.removeAllDeliveredNotifications(),
    apiClient.account.unregisterDevice({ registration: token })
  ])

  await Preferences.remove({ key: KEY_DEVICE_TOKEN })
}

async function getMobileRegistrationToken(): Promise<string> {
  const existingToken = (
    await Preferences.get({
      key: KEY_DEVICE_TOKEN
    })
  ).value
  if (existingToken != null) return existingToken

  const handlersToRemove: PluginListenerHandle[] = []

  const token = await new Promise<string>((resolve, reject) => {
    PushNotifications.addListener('registration', (token) => {
      void Preferences.set({
        key: KEY_DEVICE_TOKEN,
        value: token.value
      })
      resolve(token.value)

      setTimeout(() => {
        reject()
      }, REGISTRATION_SUCCESS_TIMEOUT_SECONDS * 1000)
    })
      .then((handler) => handler && handlersToRemove.push(handler))
      .catch(console.error)

    PushNotifications.addListener('registrationError', (error) => {
      reject(error)
    })
      .then((handler) => handler && handlersToRemove.push(handler))
      .catch(console.error)
  })

  for (const handler of handlersToRemove) void handler.remove()

  return token
}
