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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDishController = exports.getDishesByDiseaseController = exports.updateDishController = exports.getDishByIdController = exports.getAllDishesController = exports.addDish = void 0;
const dish_services_1 = require("../services/dish.services");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const addDish = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, info, meals, price, image } = req.body;
        if (!name || !info || !meals || !price || !image) {
            res
                .status(400)
                .json({ error: "Name, info, meals, price and image are required" });
            return;
        }
        yield (0, dish_services_1.createDish)(name, info, meals, price, image);
        res.status(201).json({ message: "Dish created successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create dish" });
    }
});
exports.addDish = addDish;
const getAllDishesController = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dishes = yield (0, dish_services_1.getAllDishes)();
        res.status(200).json(dishes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve dishes" });
    }
});
exports.getAllDishesController = getAllDishesController;
// Controller to get a dish by ID
const getDishByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const dish = yield (0, dish_services_1.getDishById)(Number(id));
        if (!dish) {
            res.status(404).json({ error: "Dish not found" });
            return;
        }
        res.status(200).json(dish);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve dish" });
    }
});
exports.getDishByIdController = getDishByIdController;
// Controller to update a dish by ID
const updateDishController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, info, meals } = req.body;
        if (!name && !info && !meals) {
            res.status(400).json({
                error: "At least one field (name, info, or meals) is required to update",
            });
            return;
        }
        const updatedDish = yield (0, dish_services_1.updateDishById)(Number(id), { name, info, meals });
        res
            .status(200)
            .json({ message: "Dish updated successfully", dish: updatedDish });
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2025") {
            res.status(404).json({ error: "Dish not found" });
        }
        else {
            res.status(500).json({ error: "Failed to update dish" });
        }
    }
});
exports.updateDishController = updateDishController;
const getDishesByDiseaseController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: diseaseId } = req.params;
        const disease = yield prisma.disease.findUnique({
            where: { id: Number(diseaseId) },
        });
        if (!disease) {
            res.status(404).json({ error: "Disease not found" });
            return;
        }
        const dishes = yield (0, dish_services_1.getDishesByDiseaseId)(Number(diseaseId));
        // if (dishes.length === 0) {
        //   res.status(404).json({ error: "No dishes found for this disease" });
        //   return;
        // }
        res.status(200).json(dishes);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Failed to retrieve dishes for the disease" });
    }
});
exports.getDishesByDiseaseController = getDishesByDiseaseController;
const deleteDishController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield (0, dish_services_1.deleteDishById)(Number(id));
        res.status(200).json({ message: "Dish deleted successfully" });
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2025") {
            res.status(404).json({ error: "Dish not found" });
        }
        else {
            res.status(500).json({ error: "Failed to delete dish" });
        }
    }
});
exports.deleteDishController = deleteDishController;
