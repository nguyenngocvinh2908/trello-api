import { BrevoClient } from '@getbrevo/brevo'
import { env } from '~/config/environment'

// Khởi tạo client theo chuẩn @getbrevo/brevo phiên bản mới (o dùng phiên bản cũ)
const brevo = new BrevoClient({
  apiKey: env.BREVO_API_KEY
})

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  return await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      email: env.ADMIN_EMAIL_ADDRESS,
      name: env.ADMIN_EMAIL_NAME
    },
    to: [{ email: recipientEmail }],
    subject: customSubject,
    htmlContent: customHtmlContent
  })
}

export const BrevoProvider = {
  sendEmail
}