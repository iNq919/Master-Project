import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, verificationCode } = await req.json();
    await connectMongoDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Użytkownik nie został znaleziony." },
        { status: 404 }
      );
    }

    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: "Nieprawidłowy kod weryfikacyjny." },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    return NextResponse.json(
      { message: "Email zweryfikowany pomyślnie." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred during verification." },
      { status: 500 }
    );
  }
}
