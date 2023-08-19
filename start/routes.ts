/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'CoreController.index')
  Route.get('/contact', 'CoreController.contact')
  Route.get('/contribute', 'CoreController.contribute')
  Route.get('/projects', 'CoreController.projects')
}).prefix('/')

Route.group(() => {
  Route.get('/register', 'UsersController.register')
    .as('users.register')
  Route.post('/register', 'UsersController.store')

  Route.get('/login', 'UsersController.login')
    .as('users.login')
  Route.post('/login', 'UsersController.loginProcess')

  Route.post('/logout', 'UsersController.logoutProcess')
    .as('users.logoutProcess')

  Route.get('/dashboard', 'UsersController.dashboard')
    .middleware('auth')
    .as('users.dashboard')
}).prefix('/users')

Route.group(() => {
  Route.get('/', 'AdminController.index')
    .as("adminPanel.index")

})
  .middleware('auth')
  .prefix('/admin-panel')
