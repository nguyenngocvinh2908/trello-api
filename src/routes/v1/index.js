import express from 'express'
import { boardRoutes } from './boardRoutes'
import { columnRoutes } from './columnRoutes'
import { cardRoutes } from './cardRoutes'

const Router = express.Router()

// Board APIs
Router.use('/boards', boardRoutes)

// Column APIs
Router.use('/columns', columnRoutes)

// Card APIs
Router.use('/cards', cardRoutes)

export const APIs_V1 = Router