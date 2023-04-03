import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'

export default class GroupsController {
  public async store({ request, response }: HttpContextContract) {
    const groupPayload = request.all()
    const group = await Group.create(groupPayload)

    return response.created({ group })
  }
}
