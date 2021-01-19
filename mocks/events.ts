import { belongsTo, hasMany, Model } from 'miragejs'

interface User {
  id: number;
  participants: any;
  campaign: any;
  email?: string
}

export const EventModel = Model.extend<User>({
  id: 1,
  participants: hasMany("user"),
  campaign: belongsTo("campaigns")
})
