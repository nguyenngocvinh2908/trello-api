import express from 'express'
import { boardRoutes } from './boardRoutes'
import { columnRoutes } from './columnRoutes'
import { cardRoutes } from './cardRoutes'
import { userRoutes } from './userRoutes'

const Router = express.Router()

// Board APIs
Router.use('/boards', boardRoutes)

// Column APIs
Router.use('/columns', columnRoutes)

// Card APIs
Router.use('/cards', cardRoutes)

// User APIs
Router.use('/users', userRoutes)

export const APIs_V1 = Router