import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasMany, HasMany} from '@ioc:Adonis/Lucid/Orm'

import User from 'App/Models/User'
import Release from 'App/Models/Release';


export enum AppCategory { // If you want to add an app category, append to the bottom and add translation in language files
  PRODUCTIVITY,
  UTILITIES,
  COMMUNICATION,
  GAMES,
  MULTIMEDIA,
  OTHER
}
export enum ReviewCategory { // If you want to add an app category, append to the bottom and add translation in language files
  WAITING,
  APPROVED,
  REJECTED,
}


export default class App extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public uuid: string

  @belongsTo(() => User)
  public author: BelongsTo<typeof User>

  @column()
  public name: string

  @column()
  public desc: string

  @column()
  public category: AppCategory

  @column({
    prepare: (value: { [key: string]: any } | undefined): string => {
      // Ensure a string representation of an object is always returned.
      // If value is undefined or null, stringify an empty object.
      return JSON.stringify(value || {});
    },
    consume: (dbValue: string | null): { [key: string]: any } => {
      // Ensure an object is always returned for the model property.
      if (typeof dbValue === 'string') {
        try {
          const parsed = JSON.parse(dbValue);
          // Ensure the parsed value is an object, not a primitive JSON type.
          if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
          }
          // If JSON is valid but not an object (e.g. "123", "\"a string\""), return default.
          return {};
        } catch (e) {
          // JSON parsing error, return default.
          return {};
        }
      }
      // DB value is null or not a string, return default.
      return {};
    },
  })
  public capabilities: { [key: string]: any }

  @column()
  public downloads: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  // REVIEW //
  @column()
  public review: ReviewCategory

  @column()
  public comment: string | null

  // UPDATE //
  @hasMany(() => Release)
  public releases: HasMany<typeof Release>

}
