import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { SignUpDto, SignInDto } from "../dto/auth.dto";

const prisma = new PrismaClient();

const generateToken = () => crypto.randomBytes(30).toString("hex");

export const signUp = async (dto: SignUpDto) => {
  try {
    if (!dto.email || dto.email.trim() === "") {
      throw new Error("Email is required.");
    }
    if (!dto.username || dto.username.trim() === "") {
      throw new Error("Username is required.");
    }
    if (!dto.password || dto.password.trim() === "") {
      throw new Error("Password is required.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    if (!hashedPassword) throw new Error("Password Hashing Failed");

    const role = dto.isAdmin ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        role,
      },
    });

    const tokenValue = generateToken();
    const userToken = await prisma.token.create({
      data: {
        userId: user.id,
        token: tokenValue,
      },
    });

    const response: { token: string; isAdmin?: boolean } = {
      token: userToken.token,
    };
    if (role === "ADMIN") {
      response.isAdmin = true;
    }

    return response;
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw { status: 400, message: "Email or Username Already Exists" };
    }

    if (error.status && error.message) {
      throw error;
    }

    throw { status: 500, message: `Internal Server Error ${error}` };
  }
};

export const signIn = async (dto: SignInDto) => {
  try {
    if (!dto.name) {
      throw { status: 400, message: "Email or Username is required." };
    }
    if (!dto.password) {
      throw { status: 400, message: "Password is required." };
    }

    // Determine if `name` is an email or username
    const isEmail = dto.name.includes("@");
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: dto.name } : { username: dto.name },
    });

    if (!user) {
      throw { status: 404, message: "User Does Not Exist" };
    }

    // Verify password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw { status: 400, message: "Invalid Credentials" };
    }

    // Generate or update token
    const tokenValue = generateToken();
    const token = await prisma.token.upsert({
      where: { userId: user.id },
      update: { token: tokenValue },
      create: { userId: user.id, token: tokenValue },
    });

    // Build response with conditional fields
    const response: {
      token: string;
      isAdmin?: boolean;
      isRegistered?: boolean;
    } = {
      token: token.token,
    };

    if (user.role === "ADMIN") {
      response.isAdmin = true;
    }

    response.isRegistered = Boolean(user.age);

    return response;
  } catch (error: any) {
    throw error.status && error.message
      ? error
      : { status: 500, message: `Internal Server Error ${error}` };
  }
};
