import { LocationDto } from 'src/api/model/LocationDto'

export enum PosterStatus {
  ABSENT = 'ABSENT',
  MOUNTED = 'MOUNTED',
  DAMAGED = 'DAMAGED'
}

enum _PosterStatusString {
  ABSENT = 'fehlt',
  MOUNTED = 'hängt',
  DAMAGED = 'beschädigt'
}

export class PosterStatusUtil {
  static getLabel(posterStatus: PosterStatus): string {
    return _PosterStatusString[posterStatus]
  }
}

export const posterStatusOptions: { key: string, label: string }[] = Object.keys(PosterStatus).map((key) => ({
  key: key,
  label: PosterStatusUtil.getLabel(key as PosterStatus)
}))

export enum PosterMount {
  LAMPPOST = 'LAMPPOST',
  TREE = 'TREE',
  OTHER = 'OTHER',
}

enum PosterMountString {
  LAMPPOST = 'Straßenlaterne',
  TREE = 'Baum',
  OTHER = 'Sonstige',
}

export class PosterMountUtil {
  static getLabel(posterMount: PosterMount): string {
    return PosterMountString[posterMount]
  }
}

export const posterMountOptions: { key: string, label: string }[] = Object.keys(PosterMount).map((key) => ({
  key: key,
  label: PosterMountUtil.getLabel(key as PosterMount)
}))

export interface PosterDto {
  id: number
  location_description: string
  location: LocationDto,
  status: PosterStatus
  mounted_on: PosterMount
  event: number
  poster_id: number
  area: number
}
