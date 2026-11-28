import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

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
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Xóa những trường o cho phép update
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    await boardModel.update(boardId, updateData)
  } catch (error) {
    throw new Error(error)
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của column ban đầu chứa nó
    await columnModel.update(reqBody.prevColumnId, { cardOrderIds: reqBody.prevCardOrderIds, updatedAt: Date.now() })
    // B2: Cập nhật mảng cardOrderIds của column mới chứa nó
    await columnModel.update(reqBody.nextColumnId, { cardOrderIds: reqBody.nextCardOrderIds, updatedAt: Date.now() })
    // B3: Cập nhật columnId mới của card đó
    await cardModel.update(reqBody.currentCardId, { columnId: reqBody.nextColumnId, updatedAt: Date.now() })
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu client không truyền page hoặc itemsPerPage thì dùng giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
