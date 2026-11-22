import JWT from 'jsonwebtoken'

/**
 * Function tạo mới một token - Cần 3 tham số đầu vào:
 * - userInfo: Những thông tin muốn đính kèm vào token (ví dụ: _id, email)
 * - secretSignature: Chữ ký bí mật (dạng một chuỗi string ngẫu nhiên)
 * - tokenLife: Thời gian sống của token (ví dụ: '1h', '14 days')
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  return JWT.sign(userInfo, secretSignature, {
    algorithm: 'HS256',
    expiresIn: tokenLife
  })
}

/**
 * Function kiểm tra một token có hợp lệ hay không
 * Hợp lệ ở đây hiểu đơn giản là token được tạo ra có đúng với chữ ký bí mật secretSignature trong dự án hay không
 */
const verifyToken = async (token, secretSignature) => {
  return JWT.verify(token, secretSignature)
}

export const JwtProvider = {
  generateToken,
  verifyToken
}