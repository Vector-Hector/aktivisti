export interface RegisterDeviceDto {
  registration: string
  type: 'P' | 'I' | 'A'
  keys?: {
    auth: string
    p256dh: string
  }
}
