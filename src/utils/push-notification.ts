import { Capacitor } from '@capacitor/core'
import { apiClient } from 'src/api/ApiClient'
import { RegisterDeviceDto } from 'src/api/model/RegisterDeviceDto'

interface RegistrationControls {
  register: () => Promise<void>
  deregister: () => Promise<void>
}

const registerDevicePlatformMap: Record<string, RegistrationControls> = {
  web: {
    register: registerWebDevice,
    deregister: deregisterWebDevice
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
  if (!(await userHasGrantedNotificationPermissions())) return

  const serviceWorkerRegistration =
    await navigator.serviceWorker?.getRegistration()
  if (serviceWorkerRegistration == null) return

  const existingSubscription =
    await serviceWorkerRegistration.pushManager.getSubscription()

  if (existingSubscription != null)
    return registerSubscription(existingSubscription)

  const publicVapidToken = (await apiClient.account.getToken()).payload
  const convertedToken = urlBase64ToUint8Array(publicVapidToken)
  const newSubscription = await serviceWorkerRegistration.pushManager.subscribe(
    {
      userVisibleOnly: true,
      applicationServerKey: convertedToken
    }
  )

  if (newSubscription != null) return registerSubscription(newSubscription)
}

async function userHasGrantedNotificationPermissions(): Promise<boolean> {
  const permissions = await navigator.permissions.query({
    name: 'notifications'
  })
  return permissions.state === 'granted'
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
