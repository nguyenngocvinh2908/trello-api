import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctConditionSchema = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await correctConditionSchema.validateAsync(req.body, { abortEarly: false })
    // Nếu dữ liệu hợp lệ, tiếp tục xử lý request sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message ))
  }
}

const verifyAccount = async (req, res, next) => {
  const correctConditionSchema = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required()
  })

  try {
    await correctConditionSchema.validateAsync(req.body, { abortEarly: false })
    // Nếu dữ liệu hợp lệ, tiếp tục xử lý request sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message ))
  }
}

const login = async (req, res, next) => {
  const correctConditionSchema = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
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
  const correctConditionSchema = Joi.object({
    displayName: Joi.string().trim().strict(),
    current_password: Joi.string().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    new_password: Joi.string().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
      .invalid(Joi.ref('current_password'))
      .messages({ 'any.invalid': 'New password must be different from current password!' })
  }).and('current_password', 'new_password')

  try {
    await correctConditionSchema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    // Nếu dữ liệu hợp lệ, tiếp tục xử lý request sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message ))
  }
}

export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update
}