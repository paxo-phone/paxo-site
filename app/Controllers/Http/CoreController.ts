import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CoreController {
  async index({ view }: HttpContextContract) {
    return view.render('core/index')
  }

  async contact({ view }: HttpContextContract) {
    return view.render('core/contact')
  }

  async contribute({ view }: HttpContextContract) {
    return view.render('core/contribute')
  }
}
