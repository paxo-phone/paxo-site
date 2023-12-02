import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LegalController {
    public async index({ view }: HttpContextContract) {
        return view.render('legal/index')
    }

    public async view({ params, response, view }: HttpContextContract) {
        if(params.slug in [
            "terms", 
            "privacy",
        ]) {
            return view.render(`legal/${params.slug}`)
        }
        return response.status(404)
    }
}
