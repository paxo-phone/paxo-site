import { AuthFlow } from "App/Middleware/AuthFlow";

declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    flow?: AuthFlow
  }
}