import Drive from '@ioc:Adonis/Core/Drive'
import { BaseModel, beforeDelete, column } from '@ioc:Adonis/Lucid/Orm'

export default class File extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public file: string

  @beforeDelete()
  public static async postDelete(target: File) {
    await Drive.delete(target.file)
  }
}
