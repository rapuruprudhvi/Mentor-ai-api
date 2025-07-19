import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { Database, Resource } from '@adminjs/typeorm'
import { AppDataSource } from "./database"
import { entities } from '../entity/index'

AdminJS.registerAdapter({
  Resource,
  Database,
})

export const setupAdmin = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const admin = new AdminJS({
    rootPath: '/admin',
    resources: entities,
  })

  const adminRouter = AdminJSExpress.buildRouter(admin)
  return { admin, adminRouter }
}