import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export default class TwoFAValidator {
  constructor() { }

  public schema = schema.create({
    type: schema.enum(['totp']),
  })

  public messages: CustomMessages = {}
}

export class TOTPValidator {
  constructor() { }

  public schema = schema.create({
    code: schema.string({}, [
      rules.regex(/[0-9]{6}/)
    ])
  })

  public messages: CustomMessages = {}
}
