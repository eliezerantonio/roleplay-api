import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import Group from 'App/Models/Group'
import CreateGroupValidator from 'App/Validators/CreateGroupValidator'

export default class GroupsController {
  public async index({ request, response }: HttpContextContract) {
    const { text, ['user']: userId } = request.qs()

    const page = request.input('page', 1)
    const limit = request.input('limit', 5)

    const groupsQuery = this.filterByQueryString(userId, text)
    const groups = await groupsQuery.paginate(page, limit)

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

  private filterByQueryString(userId: number, text: string) {
    if (userId && text) {
      return this.filterByUserAndText(userId, text)
    } else if (userId) {
      return this.filterByUser(userId)
    } else if (text) {
      return this.filterByText(text)
    } else {
      return this.all()
    }
  }
  private all() {
    return Group.query().preload('players').preload('masterUser')
  }

  private filterByUser(userId: number) {
    return Group.query()
      .preload('players')
      .preload('masterUser')
      .withScopes((scope) => scope.withPlayer(userId))
  }

  private filterByText(text: string) {
    return Group.query()
      .preload('players')
      .preload('masterUser')
      .withScopes((scope) => scope.withText(text))
  }

  private filterByUserAndText(userId: number, text: string) {
    return Group.query()
      .preload('players')
      .preload('masterUser')
      .withScopes((scope) => scope.withPlayer(userId))
      .withScopes((scope) => scope.withText(text))
  }
}
