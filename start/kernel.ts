/*
|--------------------------------------------------------------------------
| Application middleware
|--------------------------------------------------------------------------
|
| This file is used to define middleware for HTTP requests. You can register
| middleware as a `closure` or an IoC container binding. The bindings are
| preferred, since they keep this file clean.
|
*/

import Server from '@ioc:Adonis/Core/Server'
import { trending_apps } from 'App/Controllers/Http/AppsController'
import App, { AppCategory } from 'App/Models/App'

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| An array of global middleware, that will be executed in the order they
| are defined for every HTTP requests.
|
*/
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('App/Middleware/DetectUserLocale')
])

/*
|--------------------------------------------------------------------------
| Named middleware
|--------------------------------------------------------------------------
|
| Named middleware are defined as key-value pair. The value is the namespace
| or middleware function and key is the alias. Later you can use these
| alias on individual routes. For example:
|
| { auth: () => import('App/Middleware/Auth') }
|
| and then use it as follows
|
| Route.get('dashboard', 'UserController.dashboard').middleware('auth')
|
*/
Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth'),
  silentAuth: () => import('App/Middleware/SilentAuth')
})

// ======================
// Clocks
// ======================

// Trending apps
export const clocks = [
  async function updateTrendingApps() {
    console.log("Updating trending apps")
    for (const cat of Object.values(AppCategory)) {
      trending_apps[cat] = await App.query()
        .orderBy("downloads", "desc")
        .where("category", cat)
        .limit(15)
        .exec()
    }
  }
]

if (process.argv[2] == "serve") {
  clocks.forEach((clk) => {
    setInterval(clk, 1000 * 60 * 15).unref() // Every 15 minutes
    clk()
  })
}
