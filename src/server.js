/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'


const START_SERVER = () => {
  const app = express()

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray()) // In ra đối tượng trelloDatabaseInstance để kiểm tra xem đã kết nối thành công tới MongoDB hay chưa
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Hi ${env.AUTHOR}, Back-end Server is running successfully at Host: ${env.APP_HOST} and Port: ${env.APP_PORT}`)
  })

  // Khi nhận được tín hiệu thoát (exit signal) từ hệ thống, sẽ gọi hàm async-exit-hook để thực hiện các công việc dọn dẹp trước khi thoát khỏi ứng dụng.
  exitHook(() => {
    try {
      console.log('4. Closing Server connection...')
      CLOSE_DB()
      console.log('5. Server connection closed successfully!')
    } catch (error) {
      console.error('Error closing MongoDB connection:', error)
    }
  })
}

// Chỉ kết nối tới Database MongoDB thành công thì mới Start Server lên
(async () => {
  try {
    console.log('1. Connecting to MongoDB...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')
    START_SERVER()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(0) // Exit the process with an error code
  }
})()
