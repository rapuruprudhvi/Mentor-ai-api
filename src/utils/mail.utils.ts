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
