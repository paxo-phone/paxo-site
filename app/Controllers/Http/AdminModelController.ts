import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {ProjectService} from "App/Services/ProjectService";
import {UserService} from "App/Services/UserService";
import {inject} from "@adonisjs/fold";
import {TutorialService} from "App/Services/TutorialService";
import {StepService} from "App/Services/StepService"

/**
 * @author Welpike
 * @param model {string}
 * @param callback {(params: array) => any} The callback function
 * @param callbackParams {array} Callback function params (model service added in this function)
 * @param response {HttpContextContract['response']}
 */
interface InteractInterface {
  model: string,
  callback: (params: object) => any,
  callbackParams: object,
  response: HttpContextContract['response']
}

@inject()
export default class AdminModelController {
  private MODELS: object = {
    "projects": this.projectService,
    "users": this.userService,
    "tutorials": this.tutorialService,
    "steps": this.stepService
  }

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private tutorialService: TutorialService,
    private stepService: StepService
  ) {
  }

  public async index({ params, response, view }: HttpContextContract) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {

        const items = await params["service"].readAll()

        return view.render('adminmodel/index', {
          model: params['model'],
          items: items.data
        })
      },
      callbackParams: {
        service: undefined,
        model: params['model']
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  public async create({ params, response, view }: HttpContextContract) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {
        const fields = params["service"].getCreateFields()

        return view.render('adminmodel/create', {
          model: params['model'],
          fields: fields
        })
      },
      callbackParams: {
        service: undefined,
        model: params['model']
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  public async createProcess({ params, response, request }: HttpContextContract) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {
        const item = await params["service"].create(request)

        return response.redirect().toRoute('adminPanel.model.view', {
          model: params['model'],
          id: item.id
        })
      },
      callbackParams: {
        service: undefined,
        model: params['model'],
        id: params['id'],
        request: request
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  public async view({ params, response, view }: HttpContextContract) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {

        const item = await params["service"].read(Number(params['id']))

        return view.render('adminmodel/view', {
          model: params['model'],
          item: item
        })
      },
      callbackParams: {
        service: undefined,
        model: params['model'],
        id: params['id']
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  public async update({ params, response, view }: HttpContextContract) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {
        const item = await params["service"].read(Number(params['id']), true)

        return view.render('adminmodel/update', {
          model: params['model'],
          item: item,
          id: params['id']
        })
      },
      callbackParams: {
        service: undefined,
        model: params['model'],
        id: params['id']
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  public async updateProcess({ bouncer, params, response, request }: HttpContextContract) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {
        if (params['service']["fields"].includes('username')) {  // if user is editing a User, change the authorize rule (custom rule for user editing)
          await params['bouncer'].authorize('editUserOnAdminPanel', params["service"].read(Number(params['id'])))
        } else {
          await params['bouncer'].authorize('editModelOnAdminPanel', params["service"].read(Number(params['id'])))
        }

        await params["service"].update(Number(params['id']), request)

        return response.redirect().toRoute('adminPanel.model.view', {
          model: params['model'],
          id: params['id']
        })
      },
      callbackParams: {
        service: undefined,
        model: params['model'],
        id: params['id'],
        request: request,
        bouncer: bouncer
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  public async delete({ params, response, view}) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {
        const item = await params["service"].read(Number(params['id']))

        return view.render('adminmodel/delete', {
          model: params['model'],
          item: item
        })
      },
      callbackParams: {
        service: undefined,
        model: params['model'],
        id: params['id']
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  public async deleteProcess({ bouncer, params, response }: HttpContextContract) {
    let interactParams: InteractInterface = {
      model: params['model'],
      callback: async (params) => {
        if (params['service']["fields"].includes('username')) {  // if user is editing a User, change the authorize rule (custom rule for user editing)
          await params['bouncer'].authorize('editUserOnAdminPanel', params["service"].read(Number(params['id'])))
        } else {
          await params['bouncer'].authorize('editModelOnAdminPanel', params["service"].read(Number(params['id'])))
        }

        await params["service"].delete(Number(params['id']))

        return response.redirect().toRoute('adminPanel.model.index', {model: params['model']})
      },
      callbackParams: {
        service: undefined,
        model: params['model'],
        id: params['id'],
        bouncer: bouncer
      },
      response: response
    }

    return await this.interact(interactParams)
  }

  /**
   * Selects the model's service and interacts (callback function passed in params) with it.
   * @author Welpike
   * @param params {InteractInterface}
   */
  private async interact(
    params: InteractInterface
  ) {
    if (params.model in this.MODELS) {
      params.callbackParams['service'] = this.MODELS[params.model]
      return params.callback(params.callbackParams)
    } else {
      return params.response.status(404)
    }
  }
}
