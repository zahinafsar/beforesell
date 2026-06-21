import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, createToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validations";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextApiRequest<RegisterBody>) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verifyToken = generateToken();

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        verifyToken,
      },
    });

    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch {
      // Email failed but user created - they can request a new verification email later
    }

    // Issue an auth token so mobile clients can sign in immediately after registering.
    const authToken = await createToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      message: "Registration successful. Please check your email to verify your account.",
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
