import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Step from "App/Models/Step";
import Tutorial from "App/Models/Tutorial";

export default class TutorialsController {
  public async index({ view }: HttpContextContract) {
    const tutorials = await Tutorial.query().preload('user')

    return view.render('tutorials/index', {
      tutorials: tutorials
    })
  }

  public async viewTutorial({ params, view }: HttpContextContract) {
    const tutorial = await Tutorial
      .query()
      .preload('user')
      .where('id', params.id)
      .firstOrFail()

    return view.render('tutorials/tutorial', {
      tutorial: tutorial
    })
  }

  public async viewStep({ params, request, view }: HttpContextContract) {
    const tutorial = await Tutorial.findOrFail(params.id)
    const step = await Step
      .query()
      .where('tutorial_id', tutorial.id)
      .where('step_index', Number(request.qs()['index']))
      .firstOrFail()

    if (request.headers()['hx-request']) {
      return view.render('tutorials/partials/step', {
        step: step,
        tutorial: tutorial
      })
    }

    return view.render('tutorials/step.edge', {
      step: step,
      tutorial: tutorial
    })
  }

  public async stepEnd({ params, view }: HttpContextContract) {
    const tutorial = await Tutorial.findOrFail(params.id)
    return view.render('tutorials/step-end', {
      tutorial: tutorial
    })
  }
}
