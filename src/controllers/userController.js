import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng đến service để xử lý
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    // Điều hướng đến service để xử lý
    await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json({ message: 'Account verified successfully!' })
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount
}