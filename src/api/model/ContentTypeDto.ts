export enum ContentTypeNaturalKey {
  SUB_ASSOCIATION = 'core.subassociation',
  STATE_ASSOCIATION = 'core.stateassociation',
  CAMPAIGN = 'core.campaign'
}

export interface ContentTypeDto {
  id: number
  name: string
  natural_key: ContentTypeNaturalKey
}
