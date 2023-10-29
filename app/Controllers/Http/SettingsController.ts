import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PasswordChangeValidator } from 'App/Validators/SettingsValidators'

export default class SettingsController {
  public async password({ request, auth, session, response }: HttpContextContract) {
    const data = await request.validate(new PasswordChangeValidator())
    const user = await auth.authenticate()

    if (user.password) {
      try {
        await auth.verifyCredentials(user.username, request.input("old_password"))
      } catch {
        session.flash({ error: "The old password is incorrect." })
        return response.redirect().back()
      }
    }

    user.password = data.password
    await user.save()

    session.flash({ success: "Password changed successfully." })
    return response.redirect().back()
  }
}
