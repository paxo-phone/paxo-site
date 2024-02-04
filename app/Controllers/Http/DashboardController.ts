import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DashboardController {
  public async index({ view }: HttpContextContract) {
    return view.render('dashboard/index')
  }

  public async profile({ view }: HttpContextContract) {
    return view.render('dashboard/profile')
  }
}
