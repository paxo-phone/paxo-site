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
  }

  async handle(error, ctx: HttpContextContract) {
    // Loggue TOUTES les erreurs qui arrivent ici
    Logger.error('Une erreur a été interceptée par ExceptionHandler:')
    Logger.error(error) // Loggue l'objet erreur complet
    if (error.stack) {
      Logger.error(error.stack) // Loggue la stack trace si disponible
    }

    // Commentez temporairement la gestion spécifique de RedirectingException
    /*
    if (error instanceof RedirectingException) {
      // Pour l'instant, laissons le parent gérer pour voir si on a des logs
      // error.handle(ctx) // Si RedirectingException.handle prend seulement ctx
      // return
    }
    */

    // Laissez la classe parente HttpExceptionHandler faire son travail standard
    // Elle devrait logguer l'erreur et retourner une réponse appropriée (page d'erreur 500 avec détails en dev)
    return super.handle(error, ctx)
  }
}
