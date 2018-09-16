"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引ルーター
 */
const express = require("express");
const placeOrder_1 = require("./transactions/placeOrder");
const transactionsRouter = express.Router();
transactionsRouter.use('/placeOrder', placeOrder_1.default);
exports.default = transactionsRouter;
