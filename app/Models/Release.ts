import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import App from './App'

export default class Release extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public appId: number

  @belongsTo(() => App)
  public author: BelongsTo<typeof App>

  @column()
  public commitSha: string

  @column()
  public downloadLink: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
