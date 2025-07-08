import axios from "axios";

export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) throw new Error("RECAPTCHA_SECRET_KEY not set");

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret,
          response: token,
        },
      }
    );

    return response.data.success;
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    return false;
  }
};
