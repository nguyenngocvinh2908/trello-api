import { env } from '~/config/environment'
import { MongoClient, ServerApiVersion } from 'mongodb'

// Khởi tạo một đối tượng trelloDatabaseInstance ban đầu là null (vì chưa connect tới MongoDB)
let trelloDatabaseInstance = null

// Khoi tạo một đối tượng mongoClientInstance để kết nối tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URL, {
  // Lưu ý: Cái serverApi này là để đảm bảo rằng các tính năng mới của MongoDB sẽ được sử dụng, và nếu có bất kỳ tính năng nào bị lỗi hoặc không được hỗ trợ, nó sẽ báo lỗi ngay lập tức.
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới Database MongoDB
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB với URL đã khai báo trong thân mongoClientInstance
  await mongoClientInstance.connect()
  // Kết nối thành công thì gán giá trị của biến trelloDatabaseInstance bằng database có tên DATABASE_NAME
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// Đóng kết nối tới Database MongoDB khi ứng dụng thoát (exit) hoặc khi không còn sử dụng nữa.
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}

// Funtion GET_DB() để lấy ra đối tượng trelloDatabaseInstance (đối tượng này sẽ được sử dụng để thao tác với database MongoDB) ở nhiều nơi khác trong ứng dụng. 
// Nếu chưa kết nối tới MongoDB thì sẽ throw ra một lỗi.
export const GET_DB = () => {
  if (!trelloDatabaseInstance) {
    throw new Error('Database not connected. Please call CONNECT_DB() first.')
  }
  return trelloDatabaseInstance
}
