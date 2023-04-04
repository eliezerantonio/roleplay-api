import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import GroupRequest from 'App/Models/GroupRequest'

export default class GroupRequestsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const groupId = request.param('groupId') as number
    const userId = auth.user!.id

    const existingGroupRequest = await GroupRequest.query()
      .where('groupId', groupId)
      .andWhere('userId', userId)
      .first()

    if (existingGroupRequest) {
      throw new BadRequestException('group request already exists', 409)
    }

    const groupRequest = await GroupRequest.create({ groupId, userId })
    await groupRequest.refresh()

    return response.created({ groupRequest })
  }
}
