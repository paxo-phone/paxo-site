import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tutorial from 'App/Models/Tutorial'

export default class TutorialsController {
  public async index({ view, request }: HttpContextContract) {
    const tutorials = await Tutorial.query().paginate(request.input('page', 1), 5)

    return view.render('tutorials/index', {
      tutorials,
    })
  }

  public async viewTutorial({ params, view }: HttpContextContract) {
    const tutorial = await Tutorial
      .query()
      .where('id', params.id)
      .firstOrFail()

    return view.render('tutorials/tutorial', {
      tutorial
    })
  }
}
