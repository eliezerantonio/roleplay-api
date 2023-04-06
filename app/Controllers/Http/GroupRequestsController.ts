import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import Group from 'App/Models/Group'
import GroupRequest from 'App/Models/GroupRequest'

export default class GroupRequestsController {
  public async index({ request, response }: HttpContextContract) {
    const { master } = request.qs()
    if (!master) {
      throw new BadRequestException('master query should be provided', 422)
    }
    const groupRequests = await GroupRequest.query()
      .select('id', 'groupId', 'userId', 'status')
      .preload('group', (query) => {
        query.select('name', 'master')
      })
      .preload('user', (query) => {
        query.select('username')
      })
      .whereHas('group', (query) => {
        query.where('master', Number(master))
      })
      .where('status', 'PENDING')

    return response.ok({ groupRequests })
  }

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

    const userAlreadyInGroup = await Group.query()
      .whereHas('players', (query) => {
        query.where('id', userId)
      })
      .andWhere('id', groupId)
      .first()

    if (userAlreadyInGroup) {
      throw new BadRequestException('user is already in he group', 422)
    }
    const groupRequest = await GroupRequest.create({ groupId, userId })
    await groupRequest.refresh()

    return response.created({ groupRequest })
  }
}
