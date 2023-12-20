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

// ----------------------------------------------
// Main routes
// ----------------------------------------------
Route.group(() => {
  Route.get('/', 'CoreController.index')
  Route.get('contact', 'CoreController.contact')
  Route.get('contribute', 'CoreController.contribute')
  Route.get('projects', 'CoreController.projects')
  Route.get('press', 'PressController.index')
})

// ----------------------------------------------
// Tutorials
// ----------------------------------------------
Route.group(() => {
  Route.get('/', 'TutorialsController.index').as('tutorials.index')
  Route.get('/t/:id', 'TutorialsController.viewTutorial').as('tutorials.viewTutorial')
  Route.get('/t/:id/view', 'TutorialsController.viewStep').as('tutorials.viewStep')
  Route.get('/t/:id/end', 'TutorialsController.stepEnd').as('tutorials.stepEnd')
})
  .prefix('/tutorials')

Route.group(() => {
  Route.get('/', 'AppsController.index')
    .as('apps')

  Route.get('/app/:id', 'AppsController.show')
}).prefix('/apps')

// ----------------------------------------------
// Auth
// ----------------------------------------------
Route.group(() => {
  Route.get('/', 'UsersController.login')
    .as('auth.login')
  Route.get('/callback', 'UsersController.callback')

  Route.get('/logout', 'UsersController.logout')
    .as('auth.logout')
}).prefix('/auth')

// ----------------------------------------------
// Dashboard
// ----------------------------------------------
Route.group(() => {
  Route.get('/', 'DashboardController.index')
    .as('dash')

  Route.group(() => {
    Route.get('/', 'DashboardController.settings')

    Route.post('/notifications', 'SettingsController.notifications')
  }).prefix('/settings')
})
  .middleware('auth')
  .prefix('/dash')

// ----------------------------------------------
// Admin panel
// ----------------------------------------------
const admin_panel = Route.group(() => {
  Route.get('/', 'AdminController.index')
    .as('adminPanel.index')

  Route.get('/confirm_register', 'AdminController.confirmRegister')
    .as('adminPanel.confirmRegister')

  Route.post('/confirm_register', 'AdminController.confirmRegisterProcess')

  Route.get('/:model', 'AdminModelController.index')
    .as('adminPanel.model.index')

  Route.get('/:model/i/:id', 'AdminModelController.view')
    .as('adminPanel.model.view')

  Route.get('/:model/create', 'AdminModelController.create')
    .as('adminPanel.model.create')
  Route.post('/:model/create', 'AdminModelController.createProcess')

  Route.post('/:model/inject', 'AdminModelController.injectProcess')

  Route.get('/:model/i/:id/update', 'AdminModelController.update')
    .as('adminPanel.model.update')
  Route.post('/:model/i/:id/update', 'AdminModelController.updateProcess')

  Route.get('/:model/i/:id/delete', 'AdminModelController.deleteProcess')
    .as('adminPanel.model.delete')
})
  .prefix('/admin-panel')

if (process.env.UNSAFE_ADMIN_PANEL) {
  console.warn("Unsafe admin panel enabled")
} else {
  admin_panel.middleware('auth')
}
