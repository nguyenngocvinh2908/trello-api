import { StatusCodes } from 'http-status-codes'

const createNew = (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller: API create a new board' })
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew
}