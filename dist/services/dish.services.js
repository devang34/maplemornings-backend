"use strict";
// src/services/dishService.ts
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
exports.deleteDishById = exports.getDishesByDiseaseId = exports.updateDishById = exports.getDishById = exports.getAllDishes = exports.createDish = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Service to add a new dish with associated diseases
const createDish = (name, info, meals, price, image) => __awaiter(void 0, void 0, void 0, function* () {
    // Create the dish in the database without connecting to diseases
    const dish = yield prisma.dish.create({
        data: {
            name,
            info,
            meals,
            price,
            image
        },
    });
    return dish;
});
exports.createDish = createDish;
const getAllDishes = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.dish.findMany();
});
exports.getAllDishes = getAllDishes;
// Service to fetch a single dish by ID
const getDishById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.dish.findUnique({
        where: { id },
    });
});
exports.getDishById = getDishById;
// Service to update a dish by ID
const updateDishById = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.dish.update({
        where: { id },
        data: updates,
    });
});
exports.updateDishById = updateDishById;
const getDishesByDiseaseId = (diseaseId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.dish.findMany({
        where: {
            diseases: {
                some: {
                    id: diseaseId,
                },
            },
        },
    });
});
exports.getDishesByDiseaseId = getDishesByDiseaseId;
const deleteDishById = (dishId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.dish.delete({
        where: { id: dishId },
    });
});
exports.deleteDishById = deleteDishById;
