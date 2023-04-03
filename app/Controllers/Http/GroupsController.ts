import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'
import CreateGroupValidator from 'App/Validators/CreateGroupValidator'

export default class GroupsController {
  public async store({ request, response }: HttpContextContract) {
    const groupPayload = await request.validate(CreateGroupValidator)
    const group = await Group.create(groupPayload)

    return response.created({ group })
  }
}
