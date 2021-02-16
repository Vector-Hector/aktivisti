import { Model } from 'miragejs'
import { TokenDto } from '@/api/model/TokenDto.ts'

export const TokenModel = Model.extend<Partial<TokenDto>>({
  id: 1
})
