import { belongsTo, hasMany, Model } from 'miragejs'

interface User {
  participants: any;
  campaign: any;
  email?: string
}

export const EventModel = Model.extend<User>({
  participants: hasMany("user"),
  campaign: belongsTo("campaigns")
})
