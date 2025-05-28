import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { models } from './AdminModelController'

export default class AdminController {
  public async index({ bouncer, view }: HttpContextContract) {
    return view.render('admin/index', {
      models: Object.keys(models),
    })
  }
}
