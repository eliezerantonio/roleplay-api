import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GroupRequest from 'App/Models/GroupRequest'

export default class GroupRequestsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const groupId = request.param('groupId') as number
    const userId = auth.user!.id

    const groupRequest = await GroupRequest.create({ groupId, userId })
    await groupRequest.refresh()

    return response.created({ groupRequest })
  }
}
