import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { SignUpDto, SignInDto } from "../dto/auth.dto";
import logger from "../utils/logger";

const prisma = new PrismaClient();

const generateToken = () => crypto.randomBytes(30).toString("hex");

export const signUp = async (dto: SignUpDto) => {
  try {
    logger.info("SignUp process started for email: %s", dto.email);
    if (!dto.email || dto.email.trim() === "") {
      logger.error("Email is required.");
      throw new Error("Email is required.");
    }
    if (!dto.username || dto.username.trim() === "") {
      logger.error("Username is required.");

      throw new Error("Username is required.");
    }
    if (!dto.password || dto.password.trim() === "") {
      logger.error("Password is required.");
      throw new Error("Password is required.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    if (!hashedPassword) {
      logger.error("Password hashing failed for email: %s", dto.email);
      throw new Error("Password Hashing Failed");
    }

    const role = dto.isAdmin ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        role,
      },
    });
    logger.info("User created with ID: %d", user.id);

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
    logger.info(
      "SignUp process completed successfully for email: %s",
      dto.email
    );
    return response;
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      logger.error("Email or Username already exists for email: %s", dto.email);
      throw { status: 400, message: "Email or Username Already Exists" };
    }

    logger.error(
      "SignUp process failed for email: %s, Error: %O",
      dto.email,
      error
    );

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
      diseaseId?: number;
      username: string;
    } = {
      token: token.token,
      username: user.username, // Add username to the response
    };

    if (user.role === "ADMIN") {
      response.isAdmin = true;
    }

    // If the user is registered, add isRegistered and diseaseId to the response
    if (user.age) {
      response.isRegistered = true;
      response.diseaseId = Number(user.disease) || undefined; // Set diseaseId if it exists
    }

    return response;
  } catch (error: any) {
    throw error.status && error.message
      ? error
      : { status: 500, message: `Internal Server Error ${error}` };
  }
};
