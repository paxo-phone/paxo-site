import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import App from 'App/Models/App'
import User from 'App/Models/User'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'

function removeDirectory(directoryPath: string) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(directoryPath)
  }
}


export default class StoreController 
{
  public async home({ auth, request, view }: HttpContextContract)
  {
    const user = auth.use('web').user

    const app_per_page = 15
    const parameters = request.qs()

    parameters.page = parameters.page ? parameters.page : 1
    parameters.type = parameters.type ? parameters.type : -1

    const apps = await App.query()
      .orderBy('downloads')
      .if(parameters.type !== -1, (query) => {
        query.where('category', parameters.type)
      })
      .offset(app_per_page * (parameters.page - 1))
      .limit(app_per_page)

    const users = await User.all()

    return view.render('store/store', {
      apps: apps,
      users: users,
      user: user
    })
  }

  public async myapps({ auth, response, view }: HttpContextContract)
  {
    const user = auth.use('web').user

    if (!user) {
      return response.redirect().toPath('/auth/login/?redirect=/store/myapps')
    }

    const apps = await App.query()
      .where('userId', user.id)

    return view.render('store/myapps', {
      apps: apps,
      user: user
    })
  }

  public async app({ auth, response, request, view }: HttpContextContract)
  {
    const id = request.params().id

    const app = await App.findOrFail(id)

    if(!app)
    {
      return response.redirect('/store')
    }

    const appuser = await User.findOrFail(app.userId)

    const user = auth.use('web').user

    //const size = 

    return view.render('store/app', {
      app: app,
      appuser: appuser,
      user: user
    })
  }

  public async myapp({ auth, response, request, view }: HttpContextContract)
  {
    const id = request.params().id

    const app = await App.findOrFail(id)

    if(!app)
    {
      return response.redirect('/store/myapps')
    }

    const appuser = await User.findOrFail(app.userId)

    const user = auth.use('web').user

    if (!user) {
      return response.redirect().toPath('/auth/login/?redirect=/store/myapps')
    }

    if (appuser.id !== user.id) {
      return response.redirect().toPath('/store/myapps')
    }

    return view.render('store/myapp', {
      app: app,
      appuser: appuser,
      user: user
    })
  }

  public async new({ auth, response,view }: HttpContextContract)
  {
    const user = auth.use('web').user

    if (!user) {
      return response.redirect().toPath('/auth/login?redirect=/store/new')
    }

    console.log(user?.username)

    return view.render('store/new', {
      user: user,
    })
  }

  public async post({ auth, request, response }: HttpContextContract) {
    try {
      const erase = request.qs().eraseid

      const user = auth.use('web').user
  
      if (!user) {
        return response.redirect().toPath('/auth/login?redirect=/store/new')
      }

  
      const files = request.files('files')
  
      if (!files || files.length === 0) {
        console.log('No files uploaded')
        return response.badRequest('No files uploaded')
      }
  
      const timestamp = new Date().getTime()
      const folderPath = `public_apps/${user.id}/${timestamp}` // absolute  path in the public dir

      let app: App
      let directorytoremove = ""

      if(erase !== undefined)
      {
        console.log('reusing app ' + erase)

        app = await App.findByOrFail('id', erase)
        if(!app || app.userId !== user.id)
        {
          return response.redirect('/store/new')
        }
        directorytoremove = app.path
      }
      else
      {
        app = new App()
        console.log('Creating new app')
      }

      app.userId = user.id;
      app.name = request.input('name');
      app.desc = request.input('desc');
      app.source_url = request.input('source_url');
      app.category = request.input('category');
      app.path = folderPath + '/' + files[0].clientName.split('/')[0];

      await app.save();
  
      if(erase !== undefined)
        response.redirect('/store/myapps')
      else
        response.redirect('/store/apps')

      console.log('Starting folder upload')
  
      for (let file of files) {
        
        if (!file.isValid) {
          console.log('File upload issue:', file.errors)
          continue
        }
  
        const fileName = file.clientName
  
        await file.move(Application.publicPath(folderPath), {
          name: fileName,
          overwrite: true,
        })
      }

      if(erase !== undefined && directorytoremove.length > 0)
      {
        console.log(directorytoremove)
        removeDirectory(Application.publicPath(directorytoremove.split('/').slice(0, -1).join('/')))
      }
    } catch (error) {
      console.error('Folder upload failed:', error);
      return response.status(500).send('Folder upload failed'); 
    }
  }

  public async download({ request, response }: HttpContextContract) {
    const id = request.params().id

    const app = await App.findOrFail(id)

    if(!app)
    {
      return response.redirect('/store')
    }
    
    const directoryPath = Application.publicPath("" + app.path/*.split('/').slice(0, -1).join('/')*/)
    const zipFileName = app.name + '.zip'

    const zip = new AdmZip()
    zip.addLocalFolder(directoryPath)

    const zipBuffer = zip.toBuffer()

    response.type('application/zip')
    response.header('Content-Disposition', `attachment; filename="${zipFileName}"`)

    return response.send(zipBuffer)
  }
}
