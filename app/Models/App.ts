import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export enum AppCategory {
  UTILITIES,
  COMMUNICATION,
  GAMES,
  OTHER
}

export default class App extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public userId: number

  @column()
  public repoId: number

  @column()
  public name: string

  @column()
  public desc: string

  @column()
  public repoStars: number

  @column()
  public category: AppCategory

  @column()
  public downloads: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
