import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctConditionSchema = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
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
    // Nếu cần làm tính năng di chuyển column sang board khác thì mới thêm tính năng validate boardId
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([])
  })

  try {
    await correctConditionSchema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    // Nếu dữ liệu hợp lệ, tiếp tục xử lý request sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message ))
  }
}

export const columnValidation = {
  createNew,
  update
}