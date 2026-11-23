import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware đảm nhiệm việc xác thực JWT accessToken nhận được từ phía Client có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phía Client (tự động đính kèm nhờ withCredentials: true ở Axios)
  const clientAccessToken = req.cookies?.accessToken

  // Nếu không tìm thấy accessToken trong cookie thì trả về lỗi 401 Unauthorized ngay lập tức
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {
    // Bước 1: Giải mã và kiểm tra tính hợp lệ của token bằng chữ ký bí mật
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // Bước 2: Lưu thông tin  đã giải mã (_id, email) vào đối tượng req.jwtDecoded
    // để các tầng Controller / Service phía sau có thể truy xuất mà không cần query lại DB
    req.jwtDecoded = accessTokenDecoded

    // Bước 3: Cho phép request đi tiếp sang validation hoặc controller kế tiếp
    next()
  } catch (error) {
    // Trường hợp 1: accessToken hết hạn -> trả về mã lỗi 410 GONE
    // Phía Frontend (authorizeAxios Interceptor) sẽ bắt mã 410 này để âm thầm gọi API refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }

    // Trường hợp 2: accessToken không hợp lệ do sai chữ ký, bị chỉnh sửa hoặc lỗi khác -> trả về 401
    // Phía Frontend sẽ bắt mã 401 để thực hiện đăng xuất người dùng
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}