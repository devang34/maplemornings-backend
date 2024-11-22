"use strict";
// src/controllers/authController.ts
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
exports.signInController = exports.signUpController = void 0;
const auth_services_1 = require("../services/auth.services");
const signUpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dto = req.body;
        const result = yield (0, auth_services_1.signUp)(dto);
        res.json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.signUpController = signUpController;
const signInController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dto = req.body;
        const result = yield (0, auth_services_1.signIn)(dto);
        res.json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.signInController = signInController;
