"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ルーター
 */
const express = require("express");
const authentication_1 = require("../middlewares/authentication");
const accounts_1 = require("./accounts");
const auth_1 = require("./auth");
const authorizations_1 = require("./authorizations");
const dashboard_1 = require("./dashboard");
const events_1 = require("./events");
const home_1 = require("./home");
const iam_1 = require("./iam");
const invoices_1 = require("./invoices");
const orders_1 = require("./orders");
const ownershipInfos_1 = require("./ownershipInfos");
const movieTicket_1 = require("./paymentMethods/movieTicket");
const pecorino_1 = require("./pecorino");
const people_1 = require("./people");
const projects_1 = require("./projects");
const reservations_1 = require("./reservations");
const sellers_1 = require("./sellers");
const tasks_1 = require("./tasks");
const transactions_1 = require("./transactions");
const userPools_1 = require("./userPools");
const waiter_1 = require("./waiter");
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
router.use('/authorizations', authorizations_1.default);
router.use('/dashboard', dashboard_1.default);
router.use('/events', events_1.default);
router.use('/iam', iam_1.default);
router.use('/invoices', invoices_1.default);
router.use('/orders', orders_1.default);
router.use('/ownershipInfos', ownershipInfos_1.default);
router.use('/paymentMethods/movieTicket', movieTicket_1.default);
router.use('/pecorino', pecorino_1.default);
router.use('/people', people_1.default);
router.use('/projects', projects_1.default);
router.use('/reservations', reservations_1.default);
router.use('/sellers', sellers_1.default);
router.use('/tasks', tasks_1.default);
router.use('/transactions', transactions_1.default);
router.use('/userPools', userPools_1.default);
router.use('/waiter', waiter_1.default);
exports.default = router;
