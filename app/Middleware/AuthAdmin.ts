import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserType } from 'App/Models/User'

export default class AuthAdmin {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    // Check if user is authenticated
    console.log(auth.user)
    if (!auth.user) {
      return response.unauthorized('Unauthorized')
    }
    // Check if user is an admin
    if (auth.user.type != UserType.ADMIN) {
      console.log(typeof auth.user.type)
      return response.forbidden('Forbidden')
    
    }

    // If everything is okay, proceed to the next middleware or route
    next()
  }
}
