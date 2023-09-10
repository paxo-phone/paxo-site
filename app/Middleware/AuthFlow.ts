import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RedirectingException from 'App/Exceptions/RedirectingException'

const COOKIE_NAME = 'AUTH_FLOW'
const COOKIE_AGE = 600 // in seconds

export enum AuthFlowStep {
  UID_ENTRY = "auth",
  REGISTER_DETAILS = "auth.register",
  REGISTER_MAIL_SENT = "auth.register.mail_confirm",
  LOGIN_PASSWORD = "auth.login",
  LOGIN_2FA = "auth.login.2fa",
  COMPLETE = "auth.complete"
}

export class AuthFlow {
  step: AuthFlowStep
  redirect?: string
  email?: string
  uid?: number
  expiresAt: number

  constructor(redirect?: string, expiresAt?: number) {
    if (redirect) { this.redirect = redirect }
    if (expiresAt) { this.expiresAt = expiresAt }
    this.step = AuthFlowStep.UID_ENTRY
  }

  public progress(newStep: AuthFlowStep, response: HttpContextContract['response']) {
    this.step = newStep
    this.sendCookie(response)
    response.redirect().toRoute(this.step)
  }

  public endFlow(response: HttpContextContract['response'], redirectOverwrite?: string) {
    response.clearCookie(COOKIE_NAME)
    response.redirect().toPath(redirectOverwrite || this.redirect || "/dash")
  }

  public static getCookie(request: HttpContextContract['request']): AuthFlow | undefined {

    const data = request.cookie(COOKIE_NAME)
    if (data) { return Object.assign(new AuthFlow(), data) }
    return undefined
  }

  public static getSureCookie(request: HttpContextContract['request']): AuthFlow {
    const obj = this.getCookie(request)
    if (!obj) throw new RedirectingException("auth", "No Authflow found.", 500)
    return obj
  }

  public sendCookie(response: HttpContextContract['response']) {
    response.cookie(COOKIE_NAME, this, { expires: new Date(this.expiresAt) })
  }
}

export default class AuthFlowMiddleware {
  public async handle(
    { auth, request, response, view }: HttpContextContract,
    next: () => Promise<void>
  ) {

    let flow = AuthFlow.getCookie(request)

    if (!flow || flow.expiresAt < Date.now()) {
      flow = new AuthFlow(request.input('next'), Date.now() + COOKIE_AGE * 1000) //10 minutes
      flow.sendCookie(response)
    }
    if (await auth.check()) {
      flow.endFlow(response)
    }

    // Redirect to correct route
    if (!request.matchesRoute("auth.cancelflow") && !request.matchesRoute(request.method().toUpperCase() != "POST" ? flow.step : flow.step + ".post")) {
      response.redirect().toRoute(flow.step)
    } else {
      view.share({ flow })
      request.flow = flow
      await next()
    }
  }
}
