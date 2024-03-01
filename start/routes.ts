/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const LogsController = () => import('#controllers/logs_controller')

router.on('/').render('pages/home')

router
  .group(() => {
    router.get('/', [LogsController, 'index'])
    router.get('/:id/view', [LogsController, 'view'])
    router.get('/:id/download', [LogsController, 'download'])
  })
  .prefix('/logs')
