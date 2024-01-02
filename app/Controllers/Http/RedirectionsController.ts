import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RedirectionsController {
  public async tedx({ response }: HttpContextContract) {
    return response.redirect('https://www.youtube.com/watch?v=DAcFH5vDjlc')
  }
}
