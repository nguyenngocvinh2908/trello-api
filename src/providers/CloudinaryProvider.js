import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'


// ** https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud
// Cấu hình thông tin kết nối tới tài khoản Cloudinary của dự án:
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

/**
 * Hàm upload file lên Cloudinary thông qua luồng dữ liệu (Stream)
 * @param {Buffer} fileBuffer - Dữ liệu nhị phân của file nằm trên RAM (do Multer memoryStorage tạo ra)
 * @param {string} folderName - Tên thư mục lưu trữ trên Cloudinary (ví dụ: 'users', 'boards'...)
 */
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    // 1. Tạo một luồng ghi (Writable Stream) đẩy thẳng dữ liệu lên Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (err, result) => {
        if (err) {
          reject(err)
        }
        else resolve(result) // Trả về object chứa secure_url, public_id... khi upload thành công
      }
    )
    // 2. Dùng streamifier biến fileBuffer thành luồng đọc (Readable Stream) và nối ống (pipe) vào luồng upload ở trên
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = {
  streamUpload
}