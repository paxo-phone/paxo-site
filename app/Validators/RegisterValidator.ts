import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export default class RegisterValidator {
  constructor() { }

  public schema = schema.create({
    username: schema.string({}, [
      rules.regex(/^[a-zA-Z0-9_.]+$/),  // all upper and lower case + all figures + ._
      rules.minLength(3),
      rules.maxLength(20),
      rules.unique({ table: 'users', column: 'username' })
    ]),
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    password: schema.string({}, [
      rules.confirmed(),
      rules.minLength(10),
      rules.maxLength(50),
      rules.unique({ table: 'users', column: 'password' })
    ])
  })

  public messages: CustomMessages = { 
    'username.required':  'error : The username nom is mandatory.',
    'username.minLength': 'error : The username must contain at least 3 characters.',
    'username.maxLength': 'error : The username must contain at most 20 characters.',
    'username.unique':    'error : This username is already used.',
    'email.required':     'error : The email adress is mandatory.',
    'email.email':        'error : Provide a valid e-mail address.',
    'email.unique':       'error : This email adress is already used.',
    'password.required':  'error : The password is mandatory.',
    'password.minLength': 'error : The password must contain at least 3 characters.',
    'password.maxLength': 'error : The password must contain at most 20 characters.',
    'password.confirmed': 'error : The password or the username is not correct.',
    'invalid data':       'error : Your password must contain at least 10 characters, up to 50 characters.',
  }
}

