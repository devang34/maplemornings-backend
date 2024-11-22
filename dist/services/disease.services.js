"use strict";
// src/services/diseaseService.ts
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
exports.diseaseExists = exports.deleteDiseaseById = exports.addDishesToDisease = exports.getDiseaseById = exports.getAllDisease = exports.updateDiseaseById = exports.checkExistingDisease = exports.createDisease = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Service to add a new disease
const createDisease = (name, desc, prevention) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.disease.create({
        data: { name, desc, prevention },
    });
});
exports.createDisease = createDisease;
const checkExistingDisease = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.disease.findUnique({
        where: { name },
    });
});
exports.checkExistingDisease = checkExistingDisease;
// Service to update an existing disease
const updateDiseaseById = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.disease.update({
        where: { id },
        data: updates,
    });
});
exports.updateDiseaseById = updateDiseaseById;
// Service to retrieve all diseases
const getAllDisease = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.disease.findMany();
});
exports.getAllDisease = getAllDisease;
// Service to retrieve a single disease by ID
const getDiseaseById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(id)) {
        throw new Error("Invalid ID: ID must be a number");
    }
    return yield prisma.disease.findUnique({
        where: { id },
    });
});
exports.getDiseaseById = getDiseaseById;
// Service to add dishes to a disease
const addDishesToDisease = (diseaseId, dishIds) => __awaiter(void 0, void 0, void 0, function* () {
    const dishesToConnect = dishIds.map((id) => ({ id }));
    // Update the disease to connect the dishes
    const updatedDisease = yield prisma.disease.update({
        where: { id: diseaseId },
        data: {
            dishes: {
                connect: dishesToConnect,
            },
        },
    });
    return updatedDisease;
});
exports.addDishesToDisease = addDishesToDisease;
const deleteDiseaseById = (diseaseId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.disease.delete({
        where: { id: diseaseId },
    });
});
exports.deleteDiseaseById = deleteDiseaseById;
const diseaseExists = (diseaseId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.disease.findUnique({
        where: { id: Number(diseaseId) },
    });
});
exports.diseaseExists = diseaseExists;
