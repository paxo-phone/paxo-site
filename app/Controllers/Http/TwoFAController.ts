import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RedirectingException from 'App/Exceptions/RedirectingException';
import { AuthFlow, AuthFlowStep } from 'App/Middleware/AuthFlow';
import User from 'App/Models/User';
import TwoFAValidator, { TOTPValidator } from 'App/Validators/TwoFAValidator';
import { authenticator } from 'otplib';

export default class TwoFAController {
  public async registerTOTP({ view, response, auth, request }: HttpContextContract) {
    if (!auth.user) throw new RedirectingException('auth', 'Access denied', 403)


    let token = request.cookie('dancing_square')
    if (!token) {
      token = authenticator.generateSecret(64)
      response.cookie('dancing_square', token, { maxAge: 600000 })
    }

    return view.render('settings/register_totp', {
      qruri: authenticator.keyuri(auth.user.username, "Paxo", token)
    })
  }

  public async storeTOTP({ request, auth, session, response }: HttpContextContract) {
    const token = request.cookie('dancing_square')
    if (!token) throw new RedirectingException('settings.setTOTP', 'No dancing square', 400)
    if (!auth.user) throw new RedirectingException('auth', 'Access denied', 403)

    if (this.checkTOTP((await request.validate(new TOTPValidator())).code, token)) {
      auth.user.totp_secret = token
      auth.user.save()
      session.flash({ success: 'TOTP setup successfully.' })
      response.clearCookie('dancing_square')
      response.redirect().toRoute('dash')
    } else throw new RedirectingException('settings.setTOTP', 'Access denied', 403)
  }

  public async login({ view, request }: HttpContextContract) {
    const flow = AuthFlow.getSureCookie(request)
    const user = await User
      .query()
      .where('id', flow.uid || -1)
      .firstOrFail()

    return view.render('auth/login2FA', {
      has_totp: user.totp_secret != null
    })
  }

  public async process({ request, response, session }: HttpContextContract) {
    const type = (await request.validate(new TwoFAValidator())).type
    const flow = AuthFlow.getSureCookie(request)
    const user = await User
      .query()
      .where('id', flow.uid || -1)
      .firstOrFail()

    if (type == 'totp') {
      console.log(user)
      if (!user.totp_secret) {
        throw new RedirectingException('auth.login.2fa', "TOTP not set up", 403)
      }
      const code = (await request.validate(new TOTPValidator())).code
      if (this.checkTOTP(code, user.totp_secret)) {
        flow.progress(AuthFlowStep.COMPLETE, response)
      } else {
        session.flash({ error: 'Invalid credentials' })
        response.redirect().back()
      }
    }
  }

  private checkTOTP(code: string, secret: string): boolean {
    return authenticator.verify({ token: code, secret: secret })
  }
}
