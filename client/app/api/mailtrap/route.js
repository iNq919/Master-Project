import { MailtrapClient } from "mailtrap";

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

if (!TOKEN || !ENDPOINT) {
  throw new Error("Mailtrap credentials are not set.");
}

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

export async function POST(req) {
  const { email, verificationCode } = await req.json();

  if (!email || !verificationCode) {
    return new Response(
      JSON.stringify({ error: "Missing email or verification code." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const sender = {
    email: "mailtrap@demomailtrap.com",
    name: "Image Description",
  };

  const recipients = [{ email }];

  try {
    await client.send({
      from: sender,
      to: recipients,
      subject: "Kod weryfikacyjny",
      text: `Twój kod weryfikacyjny to: ${verificationCode}`,
      category: "Verification",
    });

    return new Response(JSON.stringify({ message: "E-mail wysłany" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email: ", error);
    return new Response(
      JSON.stringify({ error: "Błąd podczas wysyłania e-maila" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
