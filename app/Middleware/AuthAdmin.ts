import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserType } from 'App/Models/User'

export default class AuthAdmin {
  public async handle({ auth, response, session }: HttpContextContract, next: () => Promise<void>) {
    const user = auth.use('web').user
    if (!user) {
      return response.redirect().toRoute('auth.login') 
    }

    if (user.type !== UserType.ADMIN) {
      session.flash({ error: 'Accès non autorisé.' })
      return response.redirect().toRoute('adminPanel.index') 
    }

    await next()
  }
}
