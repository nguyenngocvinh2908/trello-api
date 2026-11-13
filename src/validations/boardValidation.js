import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để cho Front-end tự validate và custom message phía FE cho đẹp.
   * BE chỉ cần validate đảm bảo dữ liệu chuẩn xác, và trả message từ thư viện là được
   * Quan trọng: Việc validate dữ liệu BẮT BUỘC phải được xử lý ở BE vì đây là điểm cuối để lưu trư dữ liệu vào DB
   * Và thông thường chúng ta sẽ validate dữ liệu ở cả 2 phía FE và BE để đảm bảo tính toàn vẹn dữ liệu
   */
  const correctConditionSchema = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().message({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must be at most 50 characters long',
      'string.trim': 'Title cannot have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict().message({
      'any.required': 'Description is required',
      'string.empty': 'Description cannot be empty',
      'string.min': 'Description must be at least 3 characters long',
      'string.max': 'Description must be at most 256 characters long',
      'string.trim': 'Description cannot have leading or trailing whitespace'
    }),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    await correctConditionSchema.validateAsync(req.body, { abortEarly: false })
    // Nếu dữ liệu hợp lệ, tiếp tục xử lý request sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message ))
  }
}

const update = async (req, res, next) => {
  // Lưu ý không dùng hàm require() nếu update
  const correctConditionSchema = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([])
  })

  try {
    await correctConditionSchema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    // Nếu dữ liệu hợp lệ, tiếp tục xử lý request sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message ))
  }
}

export const boardValidation = {
  createNew,
  update
}
