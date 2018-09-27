"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ルーター
 */
const express = require("express");
const authentication_1 = require("../middlewares/authentication");
const accounts_1 = require("./accounts");
const auth_1 = require("./auth");
const events_1 = require("./events");
const home_1 = require("./home");
const orders_1 = require("./orders");
const organizations_1 = require("./organizations");
const transactions_1 = require("./transactions");
const router = express.Router();
// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })
router.use(auth_1.default);
router.use(authentication_1.default);
router.use(home_1.default);
router.use('/accounts', accounts_1.default);
router.use('/events', events_1.default);
router.use('/orders', orders_1.default);
router.use('/organizations', organizations_1.default);
router.use('/transactions', transactions_1.default);
exports.default = router;
