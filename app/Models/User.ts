import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export enum UserElevation {
  DEFAULT,
  MOD,
  ADMIN
}

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public verified: boolean

  @column()

  public elevation: UserElevation
  @column()
  public google_id: number
  @column()
  public github_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
