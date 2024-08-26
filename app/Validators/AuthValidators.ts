import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

// const picture = schema.string.optional({}, [
//     rules.url(),
//     rules.maxLength(255)
// ])

export class AccountValidator {
  data: { email: string }
  constructor(data) {
    this.data = data
  }

  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ])
  })

  public messages: CustomMessages = {
    'email.unique': 'The email address associated with this %s account is already in use. Try to login another way.'
  }
}

export class OauthRegisterValidator {
  constructor() { }

  public schema = schema.create({
    username: schema.string({}, [
      rules.regex(/^[a-zA-Z0-9_.]+$/),  // all upper and lower case + all figures + ._
      rules.minLength(3),
      rules.maxLength(20),
      rules.unique({ table: 'users', column: 'username', caseInsensitive: true })
    ]),
    oauth_profile: schema.string()
  })
}

export class OauthRegisterChecker {
  constructor() { }

  public schema = schema.create({
    username: schema.string({}, [
      rules.unique({ table: 'users', column: 'username', caseInsensitive: true })
    ]),
  })
}

export class OauthValidator {
  constructor() { }

  public schema = schema.create({
    code: schema.string({}, [
      rules.regex(/^[a-zA-Z0-9_/-]+$/)
    ])
  })

  public messages: CustomMessages = {
    '*': "The authentication service returned an error"
  }
}
