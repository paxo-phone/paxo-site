import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import I18n from '@ioc:Adonis/Addons/I18n'

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

  public async projects({ view }: HttpContextContract) {
    const projects = await Project.all()
    return view.render('core/projects', {
      projects: projects,
    })
  }
}
