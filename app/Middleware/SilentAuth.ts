import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserType } from 'App/Models/User'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  /**
   * Handle request
   */
  public async handle({ auth, view }: HttpContextContract, next: () => Promise<void>) {
    /**
     * Check if user is logged-in or not. If yes, then `ctx.auth.user` will be
     * set to the instance of the currently logged in user.
     */
    await auth.check()

    view.share({ admin: auth.user?.type == UserType.ADMIN, user: auth.user })
    await next()
  }
}
