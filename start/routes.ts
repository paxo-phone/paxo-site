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
  Route.get('contact', 'CoreController.contact')
  Route.get('contribute', 'CoreController.contribute')
  Route.get('projects', 'CoreController.projects')
})

Route.group(() => {
  Route.get('/', 'TutorialsController.index').as('tutorials.index')
  Route.get('/t/:id', 'TutorialsController.viewTutorial').as('tutorials.viewTutorial')
  Route.get('/t/:id/view', 'TutorialsController.viewStep').as('tutorials.viewStep')
  Route.get('/t/:id/end', 'TutorialsController.stepEnd').as('tutorials.stepEnd')
})
  .prefix('/tutorials')

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
    .as('adminPanel.index')

  Route.get('/:model', 'AdminModelController.index')
    .as('adminPanel.model.index')

  Route.get('/:model/i/:id', 'AdminModelController.view')
    .as('adminPanel.model.view')

  Route.get('/:model/create', 'AdminModelController.create')
    .as('adminPanel.model.create')
  Route.post('/:model/create', 'AdminModelController.createProcess')

  Route.get('/:model/i/:id/update', 'AdminModelController.update')
    .as('adminPanel.model.update')
  Route.post('/:model/i/:id/update', 'AdminModelController.updateProcess')

  Route.get('/:model/i/:id/delete', 'AdminModelController.delete')
    .as('adminPanel.model.delete')
  Route.post('/:model/i/:id/delete', 'AdminModelController.deleteProcess')
})
  .middleware('auth')
  .prefix('/admin-panel')
