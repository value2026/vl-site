const nodemailer = require('nodemailer');

/**
 * Creates the Nodemailer SMTP Transporter.
 * Falls back to console logger if credentials are not configured.
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // true for 465, false for other ports
      auth: { user, pass },
    });
  }

  // If no credentials configured, create an ephemeral Ethereal SMTP test account
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('⚠️ Mailer: Failed to create Ethereal test mailer account, falling back to mock logger.', err.message);
    return {
      sendMail: async (options) => {
        console.log('\n--- ✉️ MOCK EMAIL LOG ---');
        console.log(`To:      ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n${options.text}`);
        console.log('-------------------------\n');
        return { messageId: 'mock-id-' + Math.random().toString(36).substring(7) };
      }
    };
  }
}

/**
 * Sends a welcome email to the newly created user containing their credentials.
 */
async function sendWelcomeEmail(user, plainTextPassword) {
  const from = process.env.SMTP_FROM || '"Virtual Labs Admin" <no-reply@virtuallabs.in>';
  
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; rounded: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
        <span style="font-size: 24px;">🔬</span>
        <h2 style="color: #0f172a; margin-top: 10px; margin-bottom: 0;">Welcome to Virtual Labs</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Your academic simulator account is ready</p>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello <strong>${user.name}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">An account has been created for you by the administrator on the Virtual Labs platform. You can now log in using the credentials below:</p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 14px;">
        <div style="margin-bottom: 8px;"><strong style="color: #475569;">Username:</strong> <span style="color: #0f172a; font-weight: bold;">${user.username}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: #475569;">Email:</strong> <span style="color: #0f172a;">${user.email}</span></div>
        <div><strong style="color: #475569;">Password:</strong> <span style="color: #dc2626; font-weight: bold;">${plainTextPassword}</span></div>
      </div>

      <p style="color: #ef4444; font-size: 11px; font-weight: bold; margin: -10px 0 20px 0;">⚠️ Please change your password immediately after logging in for security.</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="http://localhost:5173/login" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">Log In to Platform</a>
      </div>

      <p style="color: #64748b; font-size: 11px; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center;">
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  `;

  const textContent = `
Hello ${user.name},

Welcome to Virtual Labs! An account has been created for you on the platform.

Your credentials:
Username: ${user.username}
Email: ${user.email}
Password: ${plainTextPassword}

Please log in at: http://localhost:5173/login
Make sure to change your password after logging in for security.
  `;

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from,
      to: user.email,
      subject: 'Welcome to Virtual Labs — Your Account Credentials',
      text: textContent,
      html: htmlContent,
    });
    console.log(`✉️ Mailer: Welcome email sent successfully to ${user.email} (Id: ${info.messageId})`);
    
    // If it's an Ethereal test account, log the URL where it can be previewed!
    if (info.messageId && info.messageId.includes('ethereal')) {
      const nodemailerLib = require('nodemailer');
      console.log('✉️ Ethereal Preview URL:', nodemailerLib.getTestMessageUrl(info));
    }
    
    return true;
  } catch (err) {
    console.error('❌ Mailer Error: Failed to send welcome email.', err);
    return false;
  }
}

/**
 * Sends a password reset recovery link to the user.
 */
async function sendPasswordResetEmail(user, token) {
  const from = process.env.SMTP_FROM || '"Virtual Labs Admin" <no-reply@virtuallabs.in>';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
        <span style="font-size: 24px;">🔑</span>
        <h2 style="color: #0f172a; margin-top: 10px; margin-bottom: 0;">Reset Your Password</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Virtual Labs Security Recovery</p>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello <strong>${user.name}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">We received a request to reset your password. You can complete the process by clicking the button below:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" target="_blank" style="background-color: #ef4444; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
        This password reset link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email. Your password will remain unchanged.
      </p>

      <div style="margin-top: 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; word-break: break-all;">
        If you are having trouble clicking the button, copy and paste the link below into your web browser:<br/>
        <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
      </div>
    </div>
  `;

  const textContent = `
Hello ${user.name},

We received a request to reset your password on the Virtual Labs platform. 
Please visit the link below to reset your password:

${resetLink}

This link is valid for 1 hour. If you did not request this, please ignore this email.
`;

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from,
      to: user.email,
      subject: 'Reset Your Virtual Labs Password',
      text: textContent,
      html: htmlContent,
    });
    console.log(`✉️ Mailer: Password reset link sent successfully to ${user.email} (Id: ${info.messageId})`);
    
    if (info.messageId && info.messageId.includes('ethereal')) {
      const nodemailerLib = require('nodemailer');
      console.log('✉️ Ethereal Reset Link Preview URL:', nodemailerLib.getTestMessageUrl(info));
    }

    return true;
  } catch (err) {
    console.error('❌ Mailer Error: Failed to send password reset email.', err);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
