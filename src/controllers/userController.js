import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'
import ApiError from '~/utils/ApiError' 

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

const logout = async (req, res, next) => {
  try {
    // Xóa cặp cookie xác thực khỏi trình duyệt
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    // Ghi đè accessToken mới vào httpOnly cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Login! (Error from refresh Token)'))
  }
}

const update = async (req, res, next) => {
  try {
    // Lấy _id của user hiện tại từ token đã được authMiddleware giải mã
    const userId = req.jwtDecoded._id

    // File ảnh avatar do Multer xử lý và gắn vào req.file (nếu có upload ảnh)
    const userAvatarFile = req.file

    const updatedUser = await userService.update(userId, req.body, userAvatarFile)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}