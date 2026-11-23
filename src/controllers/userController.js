import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'

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

const login = async (req, res, next) => {
  try {
    // Điều hướng đến service để xử lý
    const result = await userService.login(req.body)

    /**
     * Xử lý trả về httpOnly Cookie cho phía trình duyệt
     * Thời gian sống của cookie (maxAge) để khớp với thời gian sống tối đa của refreshToken (ví dụ 14 ngày)
     */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login
}