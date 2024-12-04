"use strict";
// src/controllers/diseaseController.ts
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiseaseController =
  exports.addDishesToDiseaseController =
  exports.getDisease =
  exports.getAllDiseases =
  exports.updateDisease =
  exports.addDisease =
    void 0;
const disease_services_1 = require("../services/disease.services");
function isPrismaError(error) {
  return typeof error === "object" && error !== null && "code" in error;
}
// Add a disease (admin only)
const addDisease = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { name, desc, prevention } = req.body;
      if (!name || !desc || !prevention) {
        res
          .status(400)
          .json({ error: "Name, description, and prevention are required" });
        return;
      }
      const existingDisease = yield (0,
      disease_services_1.checkExistingDisease)(name);
      if (existingDisease) {
        res.status(400).json({ error: "Disease name must be unique" });
        return;
      }
      const disease = yield (0, disease_services_1.createDisease)(
        name,
        desc,
        prevention
      );
      res
        .status(201)
        .json({ message: "Disease created successfully", disease });
    } catch (error) {
      console.error("Error in addDisease:", error);
      if (isPrismaError(error) && error.code === "P2002") {
        res.status(400).json({ error: "Disease name must be unique" });
      } else {
        res.status(500).json({ error: "Failed to create disease" });
      }
    }
  });
exports.addDisease = addDisease;
// Update a disease (admin only)
const updateDisease = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { id } = req.params;
      const { name, desc, prevention } = req.body;
      if (!name && !desc && !prevention) {
        res.status(400).json({
          error:
            "At least one field (name, desc, or prevention) is required to update",
        });
        return;
      }
      const updatedDisease = yield (0, disease_services_1.updateDiseaseById)(
        Number(id),
        {
          name,
          desc,
          prevention,
        }
      );
      res.status(200).json({
        message: "Disease updated successfully",
        disease: updatedDisease,
      });
    } catch (error) {
      console.error("Error in updateDisease:", error);
      if (isPrismaError(error) && error.code === "P2025") {
        res.status(404).json({ error: "Disease not found" });
      } else {
        res.status(500).json({ error: "Failed to update disease" });
      }
    }
  });
exports.updateDisease = updateDisease;
// Get all diseases (public access)
const getAllDiseases = (_req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const diseases = yield (0, disease_services_1.getAllDisease)();
      res.status(200).json(diseases);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve diseases" });
    }
  });
exports.getAllDiseases = getAllDiseases;
// Get a single disease by ID (public access)
const getDisease = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { id } = req.params;
      console.log(id, "id");
      const numericId = Number(id);
      if (isNaN(numericId)) {
        res.status(400).json({ error: "Invalid ID: ID must be a number" });
        return;
      }
      // Fetch disease by ID
      const disease = yield (0, disease_services_1.getDiseaseById)(numericId);
      if (!disease) {
        res.status(404).json({ error: "Disease not found" });
        return;
      }
      res.status(200).json(disease);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve disease" });
    }
  });
exports.getDisease = getDisease;
const addDishesToDiseaseController = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { id: diseaseId } = req.params;
      const { dishIds } = req.body;
      if (!dishIds || !Array.isArray(dishIds) || dishIds.length === 0) {
        res
          .status(400)
          .json({ error: "A non-empty array of dishIds is required" });
        return;
      }
      const diseaseExistsOrNot = yield (0, disease_services_1.diseaseExists)(
        diseaseId
      );
      if (!diseaseExistsOrNot) {
        res.status(404).json({ error: "Disease not found" });
        return;
      }
      const updatedDisease = yield (0, disease_services_1.addDishesToDisease)(
        Number(diseaseId),
        dishIds
      );
      res.status(200).json({
        message: "Dishes added to disease successfully",
        disease: updatedDisease,
      });
    } catch (error) {
      console.error(error);
      if (error.code === "P2025") {
        res
          .status(404)
          .json({ error: "Disease or one of the dishes not found" });
      } else {
        res.status(500).json({ error: "Failed to add dishes to disease" });
      }
    }
  });
exports.addDishesToDiseaseController = addDishesToDiseaseController;
const deleteDiseaseController = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { id } = req.params;
      yield (0, disease_services_1.deleteDiseaseById)(Number(id));
      res.status(200).json({ message: "Disease deleted successfully" });
    } catch (error) {
      console.error(error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Disease not found" });
      } else {
        res.status(500).json({ error: "Failed to delete disease" });
      }
    }
  });
exports.deleteDiseaseController = deleteDiseaseController;
