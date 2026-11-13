import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic tùy đặc thù của dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title) // slugify title để tạo ra slug
    }

    // Gọi tới tầng Model để lưu trữ newBoard
    const createdBoard = await boardModel.createNew(newBoard)

    // Lấy bản ghi board sau khi gọi tùy mục đích dự án có cần bước này hay ko
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Trả kết quả về, trong service luôn phải return
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Deep Clone board ra một cách mới để xử lý, không ảnh hưởng tới board ban đầu , tùy mục đích về sau có cần cloneDeep hay không.
    const resBoard = cloneDeep(board)
    // Đưa card về đúng column của nó
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw new Error(error)
  }
}

export const boardService = {
  createNew,
  getDetails
}
