import { LocationDto } from 'src/api/model/LocationDto'
import { useI18n } from 'vue-i18n'

export enum PosterStatus {
  ABSENT = 'ABSENT',
  MOUNTED = 'MOUNTED',
  DAMAGED = 'DAMAGED'
}

export enum PosterMount {
  LAMPPOST = 'LAMPPOST',
  TREE = 'TREE',
  OTHER = 'OTHER'
}

export function usePosterOptions() {
  const { t } = useI18n()
  class PosterStatusUtil {
    static getLabel(posterStatus: PosterStatus): string {
      return t('api.model.PosterDto.status.' + posterStatus)
    }
  }
  const posterStatusOptions: { key: PosterStatus; label: string }[] =
    Object.keys(PosterStatus).map((key) => ({
      key: key as PosterStatus,
      label: PosterStatusUtil.getLabel(key as PosterStatus)
    }))
  class PosterMountUtil {
    static getLabel(posterMount: PosterMount): string {
      return t('api.model.PosterDto.mountedOn.' + posterMount)
    }
  }

  const posterMountOptions: { key: string; label: string }[] = Object.keys(
    PosterMount
  ).map((key) => ({
    key: key,
    label: PosterMountUtil.getLabel(key as PosterMount)
  }))

  return {
    PosterStatusUtil,
    posterStatusOptions,
    PosterMountUtil,
    posterMountOptions
  }
}

export interface PosterDto {
  id: number
  location_description: string
  location: LocationDto
  status: PosterStatus
  mounted_on: PosterMount
  event: number
  poster_id: number
  area: number
}
