export const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'TaskFlow',
    email: process.env.SMTP_USER,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  resetTokenExpiry: 15 * 60 * 1000, // 15 minutes in milliseconds
};
