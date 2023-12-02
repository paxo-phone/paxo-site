import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export class NotificationsValidator {
  constructor() { }

  public schema = schema.create({
    email: schema.string.optional({}, [
      rules.email()
    ])
  })

  public messages: CustomMessages = {}
}
