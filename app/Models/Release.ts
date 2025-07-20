import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import App from './App'

// On peut définir un enum pour le statut de la release
export enum ReleaseStatus {
  PENDING = 'pending',   // En attente de validation
  LIVE = 'live',         // La version actuellement publiée
  ARCHIVED = 'archived', // Une ancienne version
}

export default class Release extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // Clé étrangère qui lie cette release à une application
  @column()
  public appId: number

  // La relation "une release appartient à une app"
  @belongsTo(() => App)
  public app: BelongsTo<typeof App>

  // L'UUID unique pour le dossier de cette release spécifique
  @column()
  public uuid: string

  @column()
  public version: string // Ex: "1.0.0", "1.1.0-beta"

  @column()
  public notes: string // Les notes de version / changelog

  @column()
  public status: ReleaseStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
/*
export default class Release extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public appId: number

  @belongsTo(() => App)
  public app: BelongsTo<typeof App>

  @column()
  public name: string

  @column()
  public commitSha: string

  @column()
  public downloadLink: string

  @column()
  public changelog: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}*/
