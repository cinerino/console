"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * プロジェクトルーター
 */
const express = require("express");
const cinerinoapi = require("../cinerinoapi");
const accounts_1 = require("./accounts");
const actions_1 = require("./actions");
const authorizations_1 = require("./authorizations");
const dashboard_1 = require("./dashboard");
const events_1 = require("./events");
const iam_1 = require("./iam");
const invoices_1 = require("./invoices");
const orders_1 = require("./orders");
const ownershipInfos_1 = require("./ownershipInfos");
const movieTicket_1 = require("./paymentMethods/movieTicket");
const pecorino_1 = require("./pecorino");
const people_1 = require("./people");
const reservations_1 = require("./reservations");
const sellers_1 = require("./sellers");
const tasks_1 = require("./tasks");
const transactions_1 = require("./transactions");
const userPools_1 = require("./userPools");
const waiter_1 = require("./waiter");
const projects = (process.env.PROJECTS !== undefined) ? JSON.parse(process.env.PROJECTS) : [];
const projectsRouter = express.Router();
projectsRouter.all('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const message = '';
        const projectFromEnvironment = projects.find((p) => p.id === req.params.id);
        const projectService = new cinerinoapi.service.Project({
            endpoint: projectFromEnvironment.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: projectFromEnvironment.id });
        req.project = Object.assign({}, project, { settings: Object.assign({}, project.settings, projectFromEnvironment.settings) });
        res.render('projects/edit', {
            message: message,
            project: req.project
        });
    }
    catch (error) {
        next(error);
    }
}));
projectsRouter.all('/:id/*', (req, _, next) => __awaiter(this, void 0, void 0, function* () {
    // ルーティングからプロジェクトをセット
    const projectFromEnvironment = projects.find((p) => p.id === req.params.id);
    const projectService = new cinerinoapi.service.Project({
        endpoint: projectFromEnvironment.settings.API_ENDPOINT,
        auth: req.user.authClient
    });
    const project = yield projectService.findById({ id: projectFromEnvironment.id });
    req.project = Object.assign({}, project, { settings: Object.assign({}, project.settings, projectFromEnvironment.settings) });
    next();
}));
projectsRouter.use('/:id/accounts', accounts_1.default);
projectsRouter.use('/:id/actions', actions_1.default);
projectsRouter.use('/:id/authorizations', authorizations_1.default);
projectsRouter.use('/:id/dashboard', dashboard_1.default);
projectsRouter.use('/:id/events', events_1.default);
projectsRouter.use('/:id/iam', iam_1.default);
projectsRouter.use('/:id/invoices', invoices_1.default);
projectsRouter.use('/:id/orders', orders_1.default);
projectsRouter.use('/:id/ownershipInfos', ownershipInfos_1.default);
projectsRouter.use('/:id/paymentMethods/movieTicket', movieTicket_1.default);
projectsRouter.use('/:id/pecorino', pecorino_1.default);
projectsRouter.use('/:id/people', people_1.default);
projectsRouter.use('/:id/reservations', reservations_1.default);
projectsRouter.use('/:id/sellers', sellers_1.default);
projectsRouter.use('/:id/tasks', tasks_1.default);
projectsRouter.use('/:id/transactions', transactions_1.default);
projectsRouter.use('/:id/userPools', userPools_1.default);
projectsRouter.use('/:id/waiter', waiter_1.default);
exports.default = projectsRouter;
