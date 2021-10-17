"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
var config = dotenv_1.default.config().parsed;
console.log(config === null || config === void 0 ? void 0 : config.PORT);
exports.PORT = parseInt(config === null || config === void 0 ? void 0 : config.PORT, 10);
