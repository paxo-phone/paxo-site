import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserType } from 'App/Models/User'

export default class AuthAdmin {
  public async handle({ auth, response, session }: HttpContextContract, next: () => Promise<void>) {
    console.log('[POINT DE CONTRÔLE A] --- Entrée dans le middleware AuthAdmin ---');
    const user = auth.use('web').user

    // 1. L'utilisateur est-il bien connecté ?
    if (!user) {
      // Normalement, le middleware 'auth' devrait déjà avoir redirigé,
      // mais c'est une sécurité supplémentaire.
      return response.redirect().toRoute('auth.login') 
    }

    // 2. L'utilisateur a-t-il le bon type ? 
    // D'après votre log précédent, le type admin est '1'.
    // Si c'est une autre valeur, changez-la ici.
    if (user.type !== UserType.ADMIN) {
      // L'utilisateur est connecté, mais n'est PAS admin.
      session.flash({ error: 'Accès non autorisé.' })
      return response.redirect().toRoute('adminPanel.index') // On le renvoie à l'accueil
    }

    // 3. SI TOUT EST OK : On passe à la suite (le contrôleur)
    // C'EST LA LIGNE LA PLUS IMPORTANTE !
    await next()
  }
}
