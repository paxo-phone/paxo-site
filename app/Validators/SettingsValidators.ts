import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export class PasswordChangeValidator {
  constructor() { }

  public schema = schema.create({
    old_password: schema.string.optional(),
    password: schema.string({}, [
      rules.confirmed(),
      rules.minLength(8),
      rules.maxLength(50)
    ]),
  })

  public messages: CustomMessages = {}
}
