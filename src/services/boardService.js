import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
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

export const boardService = {
  createNew
}
