import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DashboardController {
  public async index({ auth, view }: HttpContextContract) {
    const user = auth.use('web').user

    return view.render('core/dashboard', {
      user: user,
    })
  }
}
