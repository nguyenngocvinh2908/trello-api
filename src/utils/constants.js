import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'http://localhost:5173'
  // ...vv ví dụ mai sau deploy lên domain chính thức thì thêm domain vào đây
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production')
  ? env.WEBSITE_DOMAIN_PRODUCTION
  : env.WEBSITE_DOMAIN_DEVELOPMENT