import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const isEmail = (contact: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
};

const corporateTemplate = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
    <h2 style="color: #004085; border-bottom: 1px solid #ccc;">Mentor AI Support System</h2>
    <h3 style="color: #333;">${title}</h3>
    <div style="font-size: 15px; color: #444; line-height: 1.6;">
      ${body}
    </div>
    <hr style="margin: 20px 0;">
    <footer style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</footer>
  </div>
`;

export const sendVerificationEmail = async (email: string, otp: string) => {
  const html = corporateTemplate(
    'Verify Your Email',
    `<p>Your verification code (OTP) is:</p>
     <p style="font-size: 20px; font-weight: bold; color: #007bff;">${otp}</p>
     <p>This OTP is valid for 10 minutes.</p>`
  );

  await transporter.sendMail({
    from: `"Mentor AI" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Email Verification - Mentor AI',
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = corporateTemplate(
    'Reset Your Password',
    `<p>You requested to reset your password.</p>
     <p>Click the link below to proceed:</p>
     <a href="${resetURL}" style="color: #007bff; font-weight: bold;">Reset Password</a>
     <p>If you didn't request this, you can safely ignore this email.</p>`
  );

  await transporter.sendMail({
    from: `"Mentor AI" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Reset Your Password - Mentor AI',
    html,
  });
};

export const sendSupportTicketEmail = async (
  user: { name: string; email: string },
  ticketId: string
) => {
  const ticketLink = `${process.env.FRONTEND_URL}/support/view/${ticketId}`;

  const html = corporateTemplate(
    'New Support Ticket Submitted',
    `
    <p><strong>User Name:</strong> ${user.name}</p>
    <p><strong>User Email:</strong> ${user.email}</p>
    <p><strong>Issue:</strong> A new support ticket has been submitted.</p>
    <p><a href="${ticketLink}" style="color: #007bff; font-weight: bold;">Click here to view the ticket</a></p>
    `
  );

  const developerEmails = process.env.DEVELOPER_RECEIVER?.split(',') || [];

  await transporter.sendMail({
    from: `"Support Team" <${process.env.SMTP_EMAIL}>`,
    to: developerEmails,
    subject: 'New Support Ticket - Mentor AI',
    html,
  });
};
