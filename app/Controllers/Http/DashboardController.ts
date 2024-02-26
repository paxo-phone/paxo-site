import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from 'App/Models/App'
import { usernameRegex } from 'App/Models/User'

export default class DashboardController {
  public async index({ view, auth, response }: HttpContextContract) {
    if (!auth.user) return response.redirect().toRoute('/')

    const myapps = await App.query()
      .where('user_id', auth.user.id)

    return view.render('dashboard/index', {
      myapps
    })
  }

  public async profile({ view }: HttpContextContract) {
    return view.render('dashboard/profile')
  }

  public async editProfile({ auth, request, response, session }: HttpContextContract) {
    if (!auth.user) {
      response.status(500)
      return
    }
    const body = request.body()

    let name: string = body['name']
    if (name) {
      name = name.trim()
      if (name.length > 38) {
        session.flash({ error: "Username is too long: maximum 38 characters" })
        return
      }
      if (name.length < 6) {
        session.flash({ error: "Username is too short: minimum 6 characters" })
        return
      }
      if (name.length != usernameRegex.exec(name)?.[0].length) {
        session.flash({ error: "Username must only contain alphanumeric characters and dashes" })
        return
      }

      auth.user.name = name
    }

    const pfp = request.file('picture')
    if (pfp) {
      const filename = auth.user.id.toString() + (pfp.extname ? "." + pfp.extname : "")
      await pfp.moveToDisk('/pictures', {
        name: filename
      })

      const url = process.env.ACCESS_ADDRESS + "/uploads/pictures/" + filename
      auth.user.picture = url
    }

    await auth.user.save()

    session.flash({ success: "Profile updated successfully" })
    return response.redirect().back()
  }
}
