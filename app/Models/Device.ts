import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { randomBytes } from "node:crypto";
import { AuthContract } from '@ioc:Adonis/Addons/Auth';
import User from './User';

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public latestConnexion: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public userId: number

  @column()
  public token: string

  @column()
  public user_agent: string

  @beforeCreate()
  public static async preDeviceCreation(device: Device) {
    device.token = device.userId.toString().padStart(10, '0') + "."
      + device.id.toString().padStart(10, '0') + "." + randomBytes(79).toString("hex") // Generate token

    let trimmed = this.trimUserAgent(device.user_agent)
    if (trimmed.length <= 128) { device.user_agent = trimmed }
  }

  public static trimUserAgent(uAgent: string): string {
    return uAgent.replace(/(\/|(rv:))[0-9.]+/g, "") // Trim any versions
  }

  public static async performDeviceAuth(deviceToken: string, auth: AuthContract, uAgent?: string) {
    const device = await Device
      .query()
      .where('token', deviceToken)
      .firstOrFail()

    if (uAgent && this.trimUserAgent(uAgent) != device.user_agent) { return }

    const latestConn = device.latestConnexion.diffNow().as('days')

    if (latestConn <= 30) { // Can be authenticated
      await auth.use('web').loginViaId(device.userId)
    }
  }

  public static async postLogin(deviceToken: string, setToken: CallableFunction, uAgent?: string) {
    // TODO 
  }
}
