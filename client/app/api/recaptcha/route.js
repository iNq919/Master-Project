// pages/api/verifyRecaptcha.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { recaptchaToken } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      body: new URLSearchParams({
        secret: secretKey,
        response: recaptchaToken,
      }),
    }
  );

  const data = await response.json();

  if (data.success) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: "reCAPTCHA verification failed." });
  }
}
