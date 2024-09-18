import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'

export default class EmailValidator {
  constructor() { }


  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
    ]),
  })

  public messages: CustomMessages = {}
}
