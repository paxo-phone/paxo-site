// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from "@ioc:Adonis/Addons/Mail"

enum MailTemplate {
  REGISTRATION
}

const templates = [
  {
    subject: "Confirm email address to complete registration",
    template: "mail/registration"
  }
]

export default class MailController {
  public async sendMail(to: string, template: MailTemplate, shared?) {
    //await Mail.sendLater((message) => {
    const mail = await Mail.preview((message) => {
      message
        .from('noreply@paxo.fr')
        .to(to)
        .subject(templates[template].subject)
        .htmlView(templates[template].template, shared)
    })
    console.info("Sent mail: " + mail.url)
  }
}
