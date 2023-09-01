import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const AUTHFLOW_COOKIE = 'AUTH_FLOW'

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
  invalid: boolean = false

  constructor(redirect?: string) {
    if (redirect) { this.redirect = redirect }
    this.step = AuthFlowStep.UID_ENTRY
  }

  public progress(newStep: AuthFlowStep, response: HttpContextContract['response']) {
    this.step = newStep
    this.sendCookie(response)
    response.redirect().toRoute(this.step)
  }

  public endFlow(response: HttpContextContract['response']) {
    response.clearCookie(AUTHFLOW_COOKIE)
    response.redirect().toPath(this.redirect || "/dashboard")
  }

  public static getCookie(request: HttpContextContract['request']): AuthFlow {
    const data = request.cookie(AUTHFLOW_COOKIE)
    return Object.assign(new AuthFlow(), data || { invalid: true })
  }

  public sendCookie(response: HttpContextContract['response']) {
    response.cookie(AUTHFLOW_COOKIE, this)
  }
}

export default class AuthFlowMiddleware {
  public async handle(
    { auth, request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {

    let flow = AuthFlow.getCookie(request)

    if (flow.invalid) {
      flow = new AuthFlow(request.input('next'))
      flow.sendCookie(response)
    }
    if (await auth.check()) {
      flow.endFlow(response)
    }

    // Redirect to correct route
    if (!request.matchesRoute(request.method().toUpperCase() != "POST" ? flow.step : flow.step + ".post")) {
      response.redirect().toRoute(flow.step)
    } else {
      await next()
    }
  }
}
