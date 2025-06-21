import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const isEmail = (contact: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
};


export const sendVerificationEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `"Mentor AI" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Verify your Email",
    html: `<p>Your OTP is <strong>${otp}</strong></p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetFrontendURL = `http://localhost:3000/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Mentor AI" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <p>You requested to reset your password.</p>
      <p>Click the link below to proceed:</p>
      <a href="${resetFrontendURL}" target="_blank" style="font-size: 16px; color: blue; text-decoration: underline;">
        Click here to reset your password
      </a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};





