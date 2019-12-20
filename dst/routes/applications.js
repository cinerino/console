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
 * アプリケーションルーター
 */
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const applicationsRouter = express.Router();
/**
 * アプリケーション検索
 */
applicationsRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPoolService = new cinerinoapi.service.UserPool({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            name: req.query.name
        };
        if (req.query.format === 'datatable') {
            const searchApplicationsResult = yield userPoolService.fetch({
                uri: '/applications',
                method: 'GET',
                // tslint:disable-next-line:no-magic-numbers
                expectedStatusCodes: [200],
                qs: searchConditions
            })
                .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    totalCount: Number(response.headers.get('X-Total-Count')),
                    data: yield response.json()
                };
            }));
            res.json({
                draw: req.query.draw,
                recordsTotal: searchApplicationsResult.totalCount,
                recordsFiltered: searchApplicationsResult.totalCount,
                data: searchApplicationsResult.data
            });
        }
        else {
            res.render('applications/index', {
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
applicationsRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPoolService = new cinerinoapi.service.UserPool({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const projectService = new cinerinoapi.service.Project({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        if (project.settings === undefined || project.settings.cognito === undefined) {
            throw new Error('Project settings undefined');
        }
        const customerUserPoolId = project.settings.cognito.customerUserPool.id;
        const adminUserPoolId = project.settings.cognito.adminUserPool.id;
        const application = yield userPoolService.fetch({
            uri: `/applications/${req.params.id}`,
            method: 'GET',
            // tslint:disable-next-line:no-magic-numbers
            expectedStatusCodes: [200]
        })
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            return response.json();
        }));
        let userPoolClient;
        try {
            userPoolClient = yield userPoolService.findClientById({
                userPoolId: customerUserPoolId,
                clientId: application.id
            });
        }
        catch (error) {
            userPoolClient = yield userPoolService.findClientById({
                userPoolId: adminUserPoolId,
                clientId: application.id
            });
        }
        res.render('applications/show', {
            moment: moment,
            application: application,
            userPoolClient: userPoolClient
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * アプリケーションの注文検索
 */
applicationsRouter.get('/:id/orders', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const orderService = new cinerinoapi.service.Order({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchOrdersResult = yield orderService.search({
            limit: req.query.limit,
            page: req.query.page,
            sort: { orderDate: cinerinoapi.factory.sortType.Descending },
            orderDateFrom: moment(now)
                .add(-1, 'day')
                .toDate(),
            orderDateThrough: now,
            customer: {
                identifiers: [
                    {
                        name: 'clientId',
                        value: req.params.id
                    }
                ]
            }
        });
        debug(searchOrdersResult.totalCount, 'orders found.');
        res.json(searchOrdersResult);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = applicationsRouter;
