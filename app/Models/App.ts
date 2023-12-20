import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import { updateAppDetails } from 'App/Controllers/Http/AppsController'

export enum AppCategory { // If you want to add an app category, append to the bottom and add translation in language files
  UTILITIES,
  COMMUNICATION,
  GAMES,
  OTHER
}

export default class App extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @belongsTo(() => User)
  public author: BelongsTo<typeof User>

  @column()
  public authorId: number

  @column()
  public name: string

  @column()
  public desc: string

  @column()
  public source_url: string

  @column()
  public image: string

  @column()
  public releases: string

  @column()
  public category: AppCategory

  @column()
  public downloads: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async fetchGithub(target) {
    await updateAppDetails(target)
  }
}
