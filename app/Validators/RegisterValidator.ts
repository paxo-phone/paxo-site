import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export default class RegisterValidator {
  constructor() { }

  public schema = schema.create({
    password: schema.string({}, [
      rules.confirmed(),
      rules.minLength(8),
      rules.maxLength(50)
    ]),
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    username: schema.string({}, [
      rules.regex(/^[a-zA-Z0-9_.]+$/),  // all upper and lower case + all figures + ._
      rules.minLength(3),
      rules.maxLength(20),
      rules.unique({ table: 'users', column: 'username', caseInsensitive: true })
    ])
  })

  public messages: CustomMessages = {
    'email.unique': 'This email address is already in use.'
  }
}
