import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'

// Define Collection (Name $ Schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PRIVATE, BOARD_TYPES.PUBLIC).required(),

  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Những Admin của 1 board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Những thành viên của 1 board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Function createNew để thêm mới một board vào collection boards trong database MongoDB
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
  } catch (error) { throw new Error(error) }
}

// Function findOneById
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) { throw new Error(error) }
}

// Function findOneById
const getDetails = async (boardId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(boardId),
        _destroy: false
      } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id', // trường này là trường key chính
        foreignField: 'boardId', // trường này là khóa phụ. Nó sẽ tìm boardId nào có cùng khóa chính
        as: 'columns' // Đặt tên key cho mảng tìm được
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

// Nhiệm vụ của function này là push một giá trị id của column mới tạo vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { ReturnDocument: 'after' } // Trả ngay bản ghi đc update mới luôn
    )
  } catch (error) { throw new Error(error)}
}

const update = async (boardId, updateData) => {
  // Nếu DB quy ước lưu cardOrderIds dạng ObjectId thì convert luôn tại đây
  if (updateData.columnOrderIds) {
    updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
  }
  try {
    return await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { ReturnDocument: 'after' } // Trả ngay bản ghi đc update mới luôn
    )
  } catch (error) { throw new Error(error)}
}

// Nhiệm vụ của function này là pull một giá trị id của column ra khỏi mảng columnOrderIds
const pullColumnOrderIds = async (column) => {
  try {
    await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { ReturnDocument: 'after' } // Trả ngay bản ghi đc update mới luôn
    )
  } catch (error) { throw new Error(error)}
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Mảng điều kiện lọc chung
    const queryConditions = [
      // Điều kiện 1: Board chưa bị xóa mềm
      { _destroy: false },
      // Điều kiện 2: User hiện tại phải là chủ sở hữu (ownerIds) HOẶC thành viên (memberIds) của Board
      {
        $or:
        [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // Sắp xếp danh sách Board theo tiêu đề A-Z (hoặc đổi thành { createdAt: -1 } để board mới nhất lên đầu)
        { $sort: { title: 1 } },
        {
          // $facet giúp chạy song song nhiều luồng xử lý trên cùng tập dữ liệu đã lọc
          $facet: {
            // Luồng 1: Lấy danh sách Board cho trang hiện tại
            queryBoards: [
              { $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi của các trang trước
              { $limit: itemsPerPage } // Giới hạn số lượng bản ghi lấy về trên 1 trang
            ],
            // Luồng 2: Đếm tổng số lượng Board thỏa mãn điều kiện để Frontend tính tổng số trang
            queryTotalBoards: [{ $count: 'countedAllBoards' }]
          }
        }
      ],
      // Khai báo collation 'en' để sắp xếp chữ cái chuẩn (tránh chữ 'B' hoa đứng trước 'a' thường theo bảng mã ASCII)
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards
}
