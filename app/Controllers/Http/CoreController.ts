import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'

export default class CoreController {
  public async index({ view }: HttpContextContract) {
    return view.render('core/index')
  }

  public async contact({ view }: HttpContextContract) {
    return view.render('core/contact')
  }

  public async contributors({ view }: HttpContextContract) {
    return view.render('core/contributors')
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

  public async paxoIde({ view }: HttpContextContract) {
    return view.render('core/paxoide')
  }

  public async about({ view }: HttpContextContract) {
      return view.render('core/about')
    }
}
