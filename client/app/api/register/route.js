import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MailtrapClient } from "mailtrap";

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

if (!TOKEN || !ENDPOINT) {
  throw new Error("Mailtrap credentials are not set.");
}

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongoDB();

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
    });

    const sender = {
      email: "mailtrap@demomailtrap.com",
      name: "Mailtrap Test",
    };

    const recipients = [{ email }];

    await client.send({
      from: sender,
      to: recipients,
      subject: "Kod weryfikacyjny",
      text: `Twój kod weryfikacyjny to: ${verificationCode}`,
      category: "Verification",
    });

    return NextResponse.json(
      {
        message:
          "Rejestracja zakończona. Sprawdź swoją skrzynkę e-mailową, aby wprowadzić kod weryfikacyjny.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas rejestracji użytkownika." },
      { status: 500 }
    );
  }
}
