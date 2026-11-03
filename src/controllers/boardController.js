import { StatusCodes } from 'http-status-codes'

const createNew = (req, res) => {
  try {
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller: API create a new board' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message
    })
  }
}

export const boardController = {
  createNew
}