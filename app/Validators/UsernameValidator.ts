import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export default class UsernameValidator {
  constructor() { }

  public schema = schema.create({
    username: schema.string({}, [
      rules.regex(/^[a-zA-Z0-9_.]+$/),  // all upper and lower case + all figures + ._
      rules.minLength(3),
      rules.maxLength(20),
      rules.unique({ table: 'users', column: 'username' })
    ])
  })

  public messages: CustomMessages = {}
}