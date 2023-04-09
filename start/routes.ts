/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/users', 'UsersController.store')
Route.put('/users/:id', 'UsersController.update').middleware('auth')

Route.post('/forgot-password', 'PasswordController.forgotPassword')
Route.post('/reset-password', 'PasswordController.resetPassword')

Route.post('/sessions', 'SessionsController.store')
Route.delete('/sessions', 'SessionsController.destroy')

Route.post('/groups', 'GroupsController.store').middleware('auth')
Route.delete('/groups/:id', 'GroupsController.destroy').middleware('auth')
Route.patch('/groups/:id', 'GroupsController.update').middleware('auth')

Route.delete('/groups/:groupId/players/:playerId', 'GroupsController.removePlayer').middleware(
  'auth'
)

Route.get('/groups/:groupId/requests', 'GroupRequestsController.index')
Route.post('/groups/:groupId/requests', 'GroupRequestsController.store').middleware('auth')

Route.post(
  '/groups/:groupId/requests/:requestId/accept',
  'GroupRequestsController.accept'
).middleware('auth')

Route.delete('/groups/:groupId/requests/:requestId', 'GroupRequestsController.destroy').middleware(
  'auth'
)
