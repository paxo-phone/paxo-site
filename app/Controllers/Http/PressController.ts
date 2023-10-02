import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PressArticle from "App/Models/PressArticle"

export default class PressController {
  public async index({ view }: HttpContextContract) {
    const pressArticles = await PressArticle.query().paginate(1)

    return view.render('press/index', {
      pressArticles: pressArticles
    })
  }
}
