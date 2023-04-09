import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import Group from 'App/Models/Group'
import CreateGroupValidator from 'App/Validators/CreateGroupValidator'

export default class GroupsController {
  public async index({ request, response }: HttpContextContract) {
    const groups = await Group.query().preload('players').preload('masterUser')
    return response.ok({ groups })
  }

  public async store({ request, response }: HttpContextContract) {
    const groupPayload = await request.validate(CreateGroupValidator)
    const group = await Group.create(groupPayload)

    await group.related('players').attach([groupPayload.master])
    await group.load('players')

    return response.created({ group })
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')
    const payload = request.all()

    const group = await Group.findOrFail(id)
    await bouncer.authorize('updateGroup', group)
    const updatedGroup = await group.merge(payload).save()

    response.ok({ group: updatedGroup })
  }

  public async removePlayer({ request, response, bouncer }: HttpContextContract) {
    const groupId = request.param('groupId') as number
    const playerId = +request.param('playerId')

    const group = await Group.findOrFail(groupId)
    await bouncer.authorize('deleteGroup', group)

    if (playerId === group.master) {
      throw new BadRequestException('cannot remove master form group', 400)
    }

    await group.related('players').detach([playerId])
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')

    const group = await Group.findOrFail(id)

    await group.delete()

    return response.ok({})
  }
}
