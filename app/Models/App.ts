import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export enum AppCategory { // If you want to add an app category, append to the bottom and add translation in language files
  PRODUCTIVITY,
  UTILITIES,
  COMMUNICATION,
  GAMES,
  MULTIMEDIA,
  OTHER
}
export default class App extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public author: BelongsTo<typeof User>

  @column()
  public name: string

  @column()
  public desc: string

  @column()
  public ext_url: string

  @column()
  public source: string

  @column()
  public category: AppCategory

  @column()
  public downloads: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
