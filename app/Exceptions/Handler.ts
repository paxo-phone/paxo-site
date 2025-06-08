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
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class ExceptionHandler {
  protected ignoreStatuses = [
    401,
    400,
  ]

  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor(private logger: typeof Logger) {}
  
  async report (error: Error, ctx: HttpContextContract) {
  }

  async handle(error, ctx: HttpContextContract) {
    ctx.session.flash({ error: ctx.response.getStatus() })
  
    return ctx.response.redirect().back()
  }
}
