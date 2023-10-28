import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export default class PasswordValidator {
  constructor() { }

  public schema = schema.create({
    password: schema.string({}, [
      rules.confirmed(),
      rules.minLength(8),
      rules.maxLength(50)
    ])
  })

  public messages: CustomMessages = {}
}
