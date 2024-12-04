import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { SignUpDto, SignInDto } from "../dto/auth.dto";
import logger from "../utils/logger";
import nodemailer from "nodemailer";

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

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Use the SMTP server you are using (e.g., Gmail, Mailtrap, etc.)
  secure: false,
  port: 587,
  auth: {
    user: "rohitsingh66604@gmail.com", // Email user from env
    pass: "nfutlgxrcllqbikx", // Email password from env
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Use the following OTP to reset your password:</p>
            <h3 style="color: #4CAF50;">${otp}</h3>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <br />
            <p>Best regards,<br/>Maple Mornings</p>
          </div>
        </body>
      </html>
    `,
  };
  console.log(process.env.MAIL_FROM, "user");

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`OTP sent to email: ${email}`);
    return info;
  } catch (error) {
    logger.error("Error sending OTP email", error);
    throw new Error("Failed to send OTP");
  }
};

export const generateAndSaveOtp = async (userId: number) => {
  const otp = generateOtp();
  const otpRecord = await prisma.otp.create({
    data: {
      userId,
      otpCode: otp,
      expiryAt: new Date(new Date().getTime() + 15 * 60000),
    },
  });
  return otpRecord;
};

export const validateOtp = async (userId: number, otp: string) => {
  try {
    // Try to find a valid OTP that has not been used and hasn't expired
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId,
        otpCode: otp,
        used: false,
        expiryAt: { gt: new Date() }, // Ensure the OTP has not expired
      },
    });

    if (!otpRecord) {
      // Detailed logging for debugging
      const otpFromDb = await prisma.otp.findFirst({
        where: {
          userId,
          otpCode: otp,
        },
      });

      logger.error(`OTP validation failed for userId: ${userId}, OTP: ${otp}`);
      logger.error(`OTP record: ${JSON.stringify(otpFromDb)}`);

      // Throw an error with 400 status instead of 500
      throw new Error("Invalid or expired OTP");
    }

    logger.info(`OTP validated for userId: ${userId}, OTP: ${otp}`);
    return otpRecord;
  } catch (error) {
    logger.error(
      `Error during OTP validation for userId: ${userId}, OTP: ${otp}`,
      error
    );
    // Here we throw an error with a 400 status if OTP is invalid or expired
    throw "Invalid or expired OTP";
  }
};

export const resetUserPassword = async (
  userId: number,
  newPassword: string
) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    logger.info(`Password reset successful for user ID: ${userId}`);
  } catch (error) {
    logger.error(`Error resetting password for userId: ${userId}`, error);
    throw new Error("Error resetting password");
  }
};

export const markOtpAsUsed = async (otpId: number) => {
  try {
    await prisma.otp.update({
      where: { id: otpId },
      data: { used: true },
    });
    logger.info(`OTP with ID: ${otpId} marked as used`);
  } catch (error) {
    logger.error(`Error marking OTP as used for OTP ID: ${otpId}`, error);
    throw new Error("Error marking OTP as used");
  }
};
