/**
 * --------------------------------------------------------------------------
 * Routes
 * --------------------------------------------------------------------------
 *
 * This file is dedicated for defining HTTP routes. A single file is enough
 * for majority of projects, however you can define routes in different
 * files and just make sure to import them inside this file. For example
 *
 * Define routes in following two files
 * ├── start/routes/cart.ts
 * ├── start/routes/customer.ts
 *
 * and then import them inside `start/routes.ts` as follows
 *
 * import './routes/cart'
 * import './routes/customer''
 *
 */

import Route from '@ioc:Adonis/Core/Route'
import User, { UserType } from 'App/Models/User'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * ----------------------------------------------
 * Main routes
 * ----------------------------------------------
 */
// Route.group(() => {
//   Route.get('/', 'CoreController.index')
//   Route.get('about', 'CoreController.about')
//   Route.get('contact', 'CoreController.contact')
//   Route.get('contribute', 'CoreController.contribute')
//   Route.get('contributors', 'CoreController.contributors')
//   Route.get('projects', 'CoreController.projects')
//   Route.get('press', 'PressController.index')

//   Route.get('tedx', 'RedirectionsController.tedx')
// })

/**
 * ----------------------------------------------
 * Tutorials
 * ----------------------------------------------
 */
// Route.group(() => {
//   Route.get('/', 'TutorialsController.index').as('tutorials.index')
//   Route.get('/t/:id', 'TutorialsController.viewTutorial').as('tutorials.viewTutorial')
//   Route.get('/t/:id/view', 'TutorialsController.viewStep').as('tutorials.viewStep')
//   Route.get('/t/:id/end', 'TutorialsController.stepEnd').as('tutorials.stepEnd')
// })
//   .prefix('/tutorials')

// ----------------------------------------------
// Marketplace
// ----------------------------------------------

// DEPRECATED - Use StoreController instead

//Route.group(() => {
//   Route.get('/', 'AppsController.index')
//     .as('apps')
//  Route.get('/cat/:category', 'AppsController.index')
//   Route.get('/product', 'AppsController.product')
//   Route.get('/create', 'AppsController.create')
//   Route.post('/createProcess', 'AppsController.createProcess')

//   Route.get('/app/:id', 'AppsController.show')
//   Route.get('/app/:id/asJson', 'AppsController.getAppJson')

//   if (process.env.NODE_ENV == "development") {
//     console.warn("Development route /apps/appinstalledemo was loaded");
//     Route.get('/appinstalldemo', 'AppsController.appinstalldemo')
//   }
//}).prefix('/apps')
//   .middleware('silentAuth')


/**
 * ----------------------------------------------
 * Auth
 * ----------------------------------------------
 */
Route.group(() => {
  Route.get('/register', 'UsersController.register')
    .as('auth.register')
  Route.post('/register', 'UsersController.registerProcess')
    .as('auth.register.post')

  Route.get('/login', 'UsersController.login')
    .as('auth.login')
  Route.post('/login', 'UsersController.loginProcess')
    .as('auth.login.post')

  Route.post('/logout', 'UsersController.logoutProcess')
    .as('auth.logoutProcess')
    .middleware("auth")
}).prefix('/auth')

/**
 * ----------------------------------------------
 * Dashboard
 * ----------------------------------------------
 */
Route.get('/dash', 'DashboardController.index')
  .middleware('auth')
  .as('dash')

/**
 * ----------------------------------------------
 * Admin panel
 * ----------------------------------------------
 */
 Route.group(() => {
    Route.get('/', 'AdminController.index')
      .as('adminPanel.index')

    Route.get('/:model', 'AdminModelController.index')
      .as('adminPanel.model.view')

  /*
  |--------------------------------------------------------------------------
  | Routes for Reviewing APPLICATIONS
  |--------------------------------------------------------------------------
  */
  // Shows the list of new apps to be reviewed
  Route.get('/Review/Apps', 'AdminModelController.listApps')
    .as('adminPanel.listApps')

  // Show a specific app
  Route.get('/Review/Apps/:id', 'AdminModelController.reviewApp')
    .as('adminPanel.reviewApp')
  
  // Approves a new app
  Route.post('/Review/Apps/:id/approve', 'AdminModelController.approveApp')
    .as('adminPanel.apps.approve')
  
  // Rejects a new app
  Route.post('/Review/Apps/:id/reject', 'AdminModelController.rejectApp')
    .as('adminPanel.apps.reject')

  // Shows the file explorer for a specific app
  Route.get('/Review/Apps/:id/explorer', 'AdminModelController.explorerApp')
    .as('adminPanel.apps.explorerApp')

  // Serves a specific file from a release for viewing/downloading
  Route.get('/Review/Apps/:id/file/*', 'AdminModelController.fileApp')
    .as('adminPanel.fileApp')

  /*
  |--------------------------------------------------------------------------
  | Routes for Reviewing APP UPDATES (RELEASES)
  |--------------------------------------------------------------------------
  */
  // Shows the list of pending releases to be reviewed
  Route.get('/Review/Releases', 'AdminModelController.listReleases')
    .as('adminPanel.listReleases')

   // Show a specific release
  Route.get('/Review/Releases/:id', 'AdminModelController.reviewRelease')
    .as('adminPanel.reviewRelease')

  // Approves a specific release
  Route.post('/Review/Releases/:id/approve', 'AdminModelController.approveRelease')
    .as('adminPanel.releases.approve')

  // Rejects a specific release
  Route.post('/Review/Releases/:id/reject', 'AdminModelController.rejectRelease')
    .as('adminPanel.releases.reject')

  // Shows the file explorer for a specific release
  Route.get('/Review/Releases/:id/explorer', 'AdminModelController.explorerRelease')
    .as('adminPanel.explorerRelease')

  // Serves a specific file from a release for viewing/downloading
  Route.get('/Review/Releases/:id/file/*', 'AdminModelController.fileRelease')
    .as('adminPanel.fileRelease')
/*
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
  */
})
   .middleware(['auth', 'authAdmin'])
     .prefix('/admin-panel')

/**
 * ----------------------------------------------
 * Development environment
 * ----------------------------------------------
 */
if (process.env.NODE_ENV == "development") {
  /*Route.get('/loginAsUid/:uid', async ({ params, auth, response, session }: HttpContextContract) => {
     await auth.loginViaId(params.uid)
     session.flash({ success: "Logged in as " + auth.user?.username })
     return response.redirect().back()
   })*/
  Route.get('/setAsAdmin/:uid', async ({ params, response, session }: HttpContextContract) => {
    const user = await User
      .query()
      .where('id', params.uid)
      .firstOrFail()
    user.type = UserType.ADMIN
    user.save()

    session.flash({ success: "Made " + user?.username + " an admin." })

    return response.redirect().back()
  })
}

/**
 * ----------------------------------------------
 * Legal
 * ----------------------------------------------
 */
// Route.group(() => {
//   Route.get('/', 'LegalController.index').as('legal.index')
//   Route.get('/:slug', 'LegalController.view').as('legal.viewLegalDoc')
// })
//   .prefix('/legal')


/**
 * ----------------------------------------------
 * Store
 * ----------------------------------------------
 */

Route.group(() => {
  Route.get('/', 'StoreController.home')
  Route.get('/app/:id', 'StoreController.app')

  Route.get('/apps/:uuid/:fileName/manifest', 'StoreController.getManifest')
    .as('apps.manifest')
  Route.get('storage/apps/:uuid/manifest.json', 'StoreController.getManifestPath')
    .as('apps.manifestPath')
  Route.get('/apps/:uuid/:fileName', 'StoreController.getFirmware')
    .as('apps.firmware')
    
//  Route.get('/app/:appid/download', 'ReleasesController.download')
//  Route.get('/app/:appid/source', 'ReleasesController.source')
//  Route.get('/app/:appid/changelog/:relid', 'ReleasesController.changelog')

  Route.group(() => {
    Route.get('/app/:id/manage', 'StoreController.myapp')
    Route.post('/app/:id/manage', 'StoreController.update')
//  Route.get('/app/:id/releases/manage', 'ReleasesController.manage')
//  Route.get('/app/:id/releases/new', 'ReleasesController.new')
//  Route.post('/app/:id/releases/new', 'ReleasesController.create')
    Route.get('/apps/:id/releases/new', 'ReleasesController.create').as('releases.create')
    Route.post('/apps/:id/releases', 'ReleasesController.store').as('releases.store')

    Route.get('/myapps', 'StoreController.myapps')
      .as('store.myapps')

    Route.get('/new', 'StoreController.new')
    Route.post('/new', 'StoreController.post')
  })
    .middleware('auth')
})
  // .prefix('/store')
  .middleware(['silentAuth'])
