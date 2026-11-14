import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    // ...
    if (getNewColumn) {
      // Xử lý đúng dữ liệu để trả cho fontEnd
      getNewColumn.cards = []

      // Cập nhật lại mảng columnOrderIds trong Collection boards
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
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
    await columnModel.update(columnId, updateData)
  } catch (error) {
    throw new Error(error)
  }
}

export const columnService = {
  createNew,
  update
}
