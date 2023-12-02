import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RedirectingException from 'App/Exceptions/RedirectingException'
import { NotificationsValidator } from 'App/Validators/SettingsValidators'

export default class SettingsController {
  public async notifications({ request, auth, response }: HttpContextContract) {
    const data = await request.validate(new NotificationsValidator())

    const user = auth.use('web').user
    if (!user) throw new RedirectingException('/', 'Unauthorized', 403)

    if (data.email && data.email != user.email) {
      user.email = data.email
      user.save()
    }

    return response.redirect().back()
  }
}
