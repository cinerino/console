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
/**
 * プロジェクトルーター
 */
const express = require("express");
const http_status_1 = require("http-status");
const cinerinoapi = require("../cinerinoapi");
const accounts_1 = require("./accounts");
const actions_1 = require("./actions");
const applications_1 = require("./applications");
const authorizations_1 = require("./authorizations");
const events_1 = require("./events");
const home_1 = require("./home");
const iam_1 = require("./iam");
const invoices_1 = require("./invoices");
const orders_1 = require("./orders");
const ownershipInfos_1 = require("./ownershipInfos");
const movieTicket_1 = require("./paymentMethods/movieTicket");
const paymentServices_1 = require("./paymentServices");
const people_1 = require("./people");
const products_1 = require("./products");
const reservations_1 = require("./reservations");
const resources_1 = require("./resources");
const sellers_1 = require("./sellers");
const serviceOutputs_1 = require("./serviceOutputs");
const tasks_1 = require("./tasks");
const transactions_1 = require("./transactions");
const userPools_1 = require("./userPools");
const waiter_1 = require("./waiter");
const API_ENDPOINT = process.env.API_ENDPOINT;
const projectsRouter = express.Router();
/**
 * プロジェクト作成
 */
projectsRouter.all('/new', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        let attributes = {
            typeOf: cinerinoapi.factory.chevre.organizationType.Project,
            id: '',
            name: '新しいプロジェクト名称',
            parentOrganization: {
                typeOf: cinerinoapi.factory.chevre.organizationType.Corporation,
                name: { ja: '', en: '' }
            },
            // デフォルト設定をセット
            settings: {}
        };
        const projectService = new cinerinoapi.service.Project({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        if (req.method === 'POST') {
            try {
                attributes = yield createProjectFromBody({
                    req: req
                });
                const project = yield projectService.create(attributes);
                req.flash('message', 'プロジェクトを作成しました');
                res.redirect(`/projects/${project.id}/home`);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('projects/new', {
            layout: 'layouts/dashboard',
            message: message,
            attributes: attributes,
            OrganizationType: cinerinoapi.factory.chevre.organizationType
        });
    }
    catch (error) {
        next(error);
    }
}));
function createProjectFromBody(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            typeOf: cinerinoapi.factory.chevre.organizationType.Project,
            id: params.req.body.id,
            name: params.req.body.name,
            logo: params.req.body.logo,
            parentOrganization: params.req.body.parentOrganization,
            settings: Object.assign({}, params.req.body.settings)
        };
    });
}
projectsRouter.all('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message = '';
        const projectService = new cinerinoapi.service.Project({
            endpoint: API_ENDPOINT,
            auth: req.user.authClient
        });
        let project = yield projectService.findById({ id: req.params.id });
        if (req.method === 'DELETE') {
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        else if (req.method === 'POST') {
            try {
                project = yield createProjectFromBody({
                    req: req
                });
                yield projectService.update(project);
                req.flash('message', '更新しました');
                res.redirect(req.originalUrl);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        req.project = Object.assign(Object.assign({}, project), { settings: Object.assign(Object.assign({}, project.settings), { id: project.id, API_ENDPOINT: API_ENDPOINT }) });
        res.render('projects/edit', {
            message: message,
            project: project
        });
    }
    catch (error) {
        next(error);
    }
}));
projectsRouter.all('/:id/*', (req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.project = {
        typeOf: cinerinoapi.factory.chevre.organizationType.Project,
        id: req.params.id,
        settings: { id: req.params.id, API_ENDPOINT: API_ENDPOINT }
    };
    next();
}));
projectsRouter.get('/:id/logo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let logo = 'https://s3-ap-northeast-1.amazonaws.com/cinerino/logos/cinerino.png';
    try {
        const projectService = new cinerinoapi.service.Project({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        if (typeof project.logo === 'string') {
            logo = project.logo;
        }
    }
    catch (error) {
        console.error(error);
    }
    res.redirect(logo);
}));
projectsRouter.use('/:id/accounts', accounts_1.default);
projectsRouter.use('/:id/actions', actions_1.default);
projectsRouter.use('/:id/applications', applications_1.default);
projectsRouter.use('/:id/authorizations', authorizations_1.default);
projectsRouter.use('/:id/events', events_1.default);
projectsRouter.use('/:id/home', home_1.default);
projectsRouter.use('/:id/iam', iam_1.default);
projectsRouter.use('/:id/invoices', invoices_1.default);
projectsRouter.use('/:id/orders', orders_1.default);
projectsRouter.use('/:id/ownershipInfos', ownershipInfos_1.default);
projectsRouter.use('/:id/paymentMethods/movieTicket', movieTicket_1.default);
projectsRouter.use('/:id/paymentServices', paymentServices_1.default);
projectsRouter.use('/:id/people', people_1.default);
projectsRouter.use('/:id/products', products_1.default);
projectsRouter.use('/:id/reservations', reservations_1.default);
projectsRouter.use('/:id/resources', resources_1.default);
projectsRouter.use('/:id/sellers', sellers_1.default);
projectsRouter.use('/:id/serviceOutputs', serviceOutputs_1.default);
projectsRouter.use('/:id/tasks', tasks_1.default);
projectsRouter.use('/:id/transactions', transactions_1.default);
projectsRouter.use('/:id/userPools', userPools_1.default);
projectsRouter.use('/:id/waiter', waiter_1.default);
exports.default = projectsRouter;
