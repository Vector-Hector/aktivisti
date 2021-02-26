import { UserDto } from '@/api/model/UserDto.ts'

export const sampleUsers: Partial<UserDto>[] = [{
  id: 1,
  username: 'aktivist',
  email: 'aktivist@die-linke.de'
}, {
  id: 2,
  username: 'rosaluxemburg',
  email: 'r.luxemburg@die-linke.de'
}]