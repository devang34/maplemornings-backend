"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = exports.signUp = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const generateToken = () => crypto_1.default.randomBytes(30).toString("hex");
const signUp = (dto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("SignUp process started for email: %s", dto.email);
        if (!dto.email || dto.email.trim() === "") {
            logger_1.default.error("Email is required.");
            throw new Error("Email is required.");
        }
        if (!dto.username || dto.username.trim() === "") {
            logger_1.default.error("Username is required.");
            throw new Error("Username is required.");
        }
        if (!dto.password || dto.password.trim() === "") {
            logger_1.default.error("Password is required.");
            throw new Error("Password is required.");
        }
        const hashedPassword = yield bcrypt_1.default.hash(dto.password, 10);
        if (!hashedPassword) {
            logger_1.default.error("Password hashing failed for email: %s", dto.email);
            throw new Error("Password Hashing Failed");
        }
        const role = dto.isAdmin ? "ADMIN" : "USER";
        const user = yield prisma.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
                role,
            },
        });
        logger_1.default.info("User created with ID: %d", user.id);
        const tokenValue = generateToken();
        const userToken = yield prisma.token.create({
            data: {
                userId: user.id,
                token: tokenValue,
            },
        });
        const response = {
            token: userToken.token,
        };
        if (role === "ADMIN") {
            response.isAdmin = true;
        }
        logger_1.default.info("SignUp process completed successfully for email: %s", dto.email);
        return response;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            logger_1.default.error("Email or Username already exists for email: %s", dto.email);
            throw { status: 400, message: "Email or Username Already Exists" };
        }
        logger_1.default.error("SignUp process failed for email: %s, Error: %O", dto.email, error);
        if (error.status && error.message) {
            throw error;
        }
        throw { status: 500, message: `Internal Server Error ${error}` };
    }
});
exports.signUp = signUp;
const signIn = (dto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!dto.name) {
            throw { status: 400, message: "Email or Username is required." };
        }
        if (!dto.password) {
            throw { status: 400, message: "Password is required." };
        }
        // Determine if `name` is an email or username
        const isEmail = dto.name.includes("@");
        const user = yield prisma.user.findUnique({
            where: isEmail ? { email: dto.name } : { username: dto.name },
        });
        if (!user) {
            throw { status: 404, message: "User Does Not Exist" };
        }
        // Verify password
        const isMatch = yield bcrypt_1.default.compare(dto.password, user.password);
        if (!isMatch) {
            throw { status: 400, message: "Invalid Credentials" };
        }
        // Generate or update token
        const tokenValue = generateToken();
        const token = yield prisma.token.upsert({
            where: { userId: user.id },
            update: { token: tokenValue },
            create: { userId: user.id, token: tokenValue },
        });
        // Build response with conditional fields
        const response = {
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
    }
    catch (error) {
        throw error.status && error.message
            ? error
            : { status: 500, message: `Internal Server Error ${error}` };
    }
});
exports.signIn = signIn;
