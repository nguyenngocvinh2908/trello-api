import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Xử lý logic tùy đặc thù của dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title) // slugify title để tạo ra slug
    }

    // Gọi tới tầng Model để lưu trữ newBoard

    // Trả kết quả về, trong service luôn phải return
    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
