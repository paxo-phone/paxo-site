import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from "App/Models/App"

export default class DashboardController {
  public async index({ auth, view }: HttpContextContract) {
    const user = auth.use('web').user

    // show all apps for every user -> print
    const apps = await App.query();

    return view.render('core/dashboard', {
      user: user,
    })
  }
}
