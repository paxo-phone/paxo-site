import { DateTime } from 'luxon'
import {BaseModel, belongsTo, column, BelongsTo} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Tutorial extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public content: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
