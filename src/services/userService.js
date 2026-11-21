import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

// Chỉ định những trường không cho phép cập nhật ở tầng Service
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const createNew = async (reqBody) => {
  try {
    // 1. Kiểm tra xem email đã tồn tại trong hệ thống hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // 2. Tạo dữ liệu user để lưu vào Database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số thứ 2: là giá trị phức tạp, giá trị càng cao băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // 3. Lưu thông tin user mới vào Database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // 4. Gửi email xác thực tài khoản (tích hợp Brevo)
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello MERN Stack: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/>- Trello Vingadev - A Programmer -</h3>
    `
    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // 5. Trả về dữ liệu đã lọc bỏ các trường nhạy cảm
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // 1. Tìm user trong Database theo email
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // 2. Kiểm tra các điều kiện hợp lệ trước khi kích hoạt tài khoản
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    }
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')
    }

    // 3. Cập nhật trạng thái kích hoạt và xóa verifyToken để vô hiệu hóa link cũ
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    // 3. Thực hiện hành động update trong tầng model
    await userModel.update(existUser._id, updateData)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount
}