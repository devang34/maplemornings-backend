"use strict";
// src/controllers/userController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserInfoAndGetDiseaseDetailsController = exports.getUser = void 0;
const client_1 = require("@prisma/client");
const user_services_1 = require("../services/user.services");
const prisma = new client_1.PrismaClient();
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, username: true },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve user" });
    }
});
exports.getUser = getUser;
const updateUserInfoAndGetDiseaseDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        const { age, diseaseId } = req.body;
        if (age === undefined || !diseaseId) {
            res.status(400).json({ error: "Both age and disease ID are required" });
            return;
        }
        const { diseaseData } = yield (0, user_services_1.updateUserAgeDiseaseAndGetDiseaseInfo)(userId, age, diseaseId);
        res.status(200).json({
            message: "User information updated successfully",
            disease: {
                name: diseaseData.name,
                prevention: diseaseData.prevention,
            },
            dishes: diseaseData.dishes,
        });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Disease not found") {
            res.status(404).json({ error: "Disease not found" });
        }
        else {
            res.status(500).json({
                error: "Failed to update user information and retrieve disease details",
            });
        }
    }
});
exports.updateUserInfoAndGetDiseaseDetailsController = updateUserInfoAndGetDiseaseDetailsController;
