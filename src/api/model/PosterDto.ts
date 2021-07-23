import { LocationDto } from 'src/api/model/LocationDto'

export enum PosterStatus {
  ABSENT = 'ABSENT',
  MOUNTED = 'MOUNTED',
  DAMAGED = 'DAMAGED'
}

export const posterStatusOptions: { key: string, label: string }[] = [{
  key: PosterStatus.ABSENT,
  label: 'fehlt'
}, {
  key: PosterStatus.MOUNTED,
  label: 'hängt'
}, {
  key: PosterStatus.DAMAGED,
  label: 'beschädigt'
}]

export enum PosterMount {
  LAMPPOST = 'LAMPPOST',
  TREE = 'TREE',
  OTHER = 'OTHER',
}

export const posterMountOptions: { key: string, label: string }[] = [{
  key: PosterMount.LAMPPOST,
  label: 'Straßenlaterne'
}, {
  key: PosterMount.OTHER,
  label: 'Sonstige'
}, {
  key: PosterMount.TREE,
  label: 'Baum'
}]

export interface PosterDto {
  id: number
  location_description: string
  location: LocationDto,
  status: PosterStatus
  mounted_on: PosterMount
  event: number
  poster_id: number
}
