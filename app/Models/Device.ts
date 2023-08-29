import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { randomBytes } from "node:crypto";
import { AuthContract } from '@ioc:Adonis/Addons/Auth';

export default class Device extends BaseModel {
  public static COOKIE_TOKEN = "DEVICE_TOKEN"

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public latestConnexion: DateTime

  @column()
  public userId: number

  @column()
  public token: string

  @column()
  public user_agent: string

  @beforeCreate()
  public static async preDeviceCreation(device: Device) {
    device.token = randomBytes(79).toString("hex") // Generate token

    let trimmed = this.trimUserAgent(device.user_agent)
    if (trimmed.length <= 128) { device.user_agent = trimmed }
  }

  public static trimUserAgent(uAgent: string): string {
    return uAgent.replace(/(\/|(rv:))[0-9.]+/g, "") // Trim any versions
  }

  public static getClientToken(dev: Device): string {
    return dev.userId.toString().padStart(10, '0') + "." + dev.id.toString().padStart(10, '0') + "." + dev.token
  }

  public static async getDeviceFromToken(token: string): Promise<Device> {
    return Device
      .query()
      .where('token', token.slice(22))
      .firstOrFail()
  }

  public static async performDeviceAuth(deviceToken: string, auth: AuthContract, uAgent?: string): Promise<boolean> { // Returns true if token should be kept
    let device
    try {
      device = await this.getDeviceFromToken(deviceToken)
    } catch { return false }
    if (uAgent && this.trimUserAgent(uAgent) != device.user_agent) { return false }

    const latestConn = device.latestConnexion.diffNow().as('days')

    if (latestConn <= 30) { // Can be authenticated
      await auth.use('web').loginViaId(device.userId)
      return true
    }
    if (latestConn >= 90) { // Token expired, should be destroyed
      await device.delete()
      return false
    }
    return true // Token remains valid but reauthentication is required
  }

  public static async postLogin(deviceToken?: string, uAgent?: string, uid?: number): Promise<string | undefined> {
    if (deviceToken) { // Refresh latestConnexion
      const dev = await this.getDeviceFromToken(deviceToken)

      dev.latestConnexion.set(DateTime.now())
    } else { // Generate new token
      const dev = await Device.create({
        user_agent: uAgent,
        userId: uid
      })
      return this.getClientToken(dev)
    }
  }
}
