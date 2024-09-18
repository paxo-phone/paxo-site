import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PressArticle extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public rank: number

  @column()
  public title: string

  @column()
  public newspaper: string

  @column()
  public link: string

  @column()
  public imageLink: string | null

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
