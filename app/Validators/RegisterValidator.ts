import { schema, rules } from '@ioc:Adonis/Core/Validator'

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
      rules.minLength(10),
      rules.maxLength(50),
      rules.confirmed(), 
    ])
  })

  public messages = { 
    'username.required':  'The username nom is mandatory.',
    'username.minLength': 'The username must contain at least 3 characters.',
    'username.maxLength': 'The username must contain at most 20 characters.',
    'username.unique':    'This username is already used.',
    'email.required':     'The email adress is mandatory.',
    'email.email':        'Provide a valid e-mail address.',
    'email.unique':       'This email adress is already used.',
    'password.required':  'The password is mandatory.',
    'password.minLength': 'The password must contain at least 10 characters.',
    'password.maxLength': 'The password must contain at most 20 characters.',
    'password.confirmed': 'The two passwords do not match.',
    'invalid data':       'Your password must contain at least 10 characters, up to 20 characters.',
  }
}

