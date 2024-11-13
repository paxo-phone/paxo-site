import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from "App/Models/App"

export default class DashboardController {
    public async index({ auth, view }: HttpContextContract) {
        const user = auth.use('web').user

        // show all apps for every user -> print
        const apps = await App.query();

        for (let i = 0; i < apps.length; i++) {
            console.log(apps[i]);
        }

        console.log(user)
        return view.render('core/dashboard', {
            user: user,
        })
    }
}