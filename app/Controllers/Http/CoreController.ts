import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CoreController {
  public async index({ view }: HttpContextContract) {
    return view.render('core/index')
  }

  public async contact({ view }: HttpContextContract) {
    return view.render('core/contact')
  }

  public async contribute({ view }: HttpContextContract) {
    return view.render('core/contribute')
  }
}
