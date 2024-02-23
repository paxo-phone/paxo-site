import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export const usernameRegex: RegExp = /[a-zA-Z0-9-]+/

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public picture: string

  @column()
  public email: string

  @column()
  public verified: boolean

  @column()
  public mod: boolean

  @column()
  public admin: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
