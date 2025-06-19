import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterValidator from 'App/Validators/RegisterValidator'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and erimport { validator } from '../../config/app';
ror code for every exception.
|
| @example
| new RedirectingException('message', 500, 'E_RUNTIME_EXCEPTION', 'route')
|
*/
export default class RedirectingException extends Exception {
  redirectTo: string

  constructor(redirectTo: string, message: string, status?: number, code?: string) {
    super(message, status, code)
    this.redirectTo = redirectTo
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.session.flash({ error: `${error.status}: ${error.message}` })
    ctx.response.redirect().toRoute(error.redirectTo)
  }
  

}
