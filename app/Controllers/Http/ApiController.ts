import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import fetch from 'isomorphic-fetch'

import {WebpageSimplifierService} from "App/Services/Api/WebpageSimplifierService"


const DOMAIN = process.env.NODE_ENV === 'development' ? 'localhost:3333' : 'paxo.fr'

@inject()
export default class ApiController {
  constructor(private wpSimplifierService: WebpageSimplifierService) {
  }

  public async index({ response }: HttpContextContract){
    return response.redirect().toPath(`http://${DOMAIN}/`)
  }

  public async webpageSimplifier({ request, response, view }: HttpContextContract){
    const url = request.qs().url
    const version = request.qs().v ? request.qs().v : '0.1-alpha.0'
    const isNeperRequest = request.qs().neper === 'true'
    try {
      const responseHtml = await (await fetch(url)).text()
      const html = this.wpSimplifierService.simplify(responseHtml)

      return view.render('api/webpage-simplifier/index', {
        html: html,
        version: version,
        isNeperRequest: isNeperRequest
      })
    } catch (err) {
      return response.badRequest('error: please provide a correct url')
    }
  }
}
