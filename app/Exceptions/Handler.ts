/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected ignoreStatuses = [
    401,
    400,
  ]

  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor(protected logger: typeof Logger) {
    super(logger)
  }
  
  async report (error: Error, ctx: HttpContextContract) {
    await super.report(error, ctx)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * On vérifie si l'erreur est une erreur de validation.
     * Le code 'E_VALIDATION_FAILURE' est le code unique pour ce type d'erreur.
     */
    if (error.code === 'E_VALIDATION_FAILURE') {
      // C'est la logique qui renvoie les erreurs au formulaire.
      ctx.session.flashAll() // Garde les anciennes valeurs (username, email)
      ctx.session.flash({ errors: error.messages }) // Passe les messages d'erreur
      
      return ctx.response.redirect().back()
    }

    /**
     * Pour toutes les autres erreurs, on laisse le gestionnaire par défaut
     * d'AdonisJS faire son travail (afficher une page 404, 500, etc.).
     */
    return super.handle(error, ctx)
  }
}