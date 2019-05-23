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
 * ダッシュボードルーター
 */
// import * as createDebug from 'debug';
const express = require("express");
const http_status_1 = require("http-status");
const moment = require("moment-timezone");
const cinerinoapi = require("../cinerinoapi");
// const debug = createDebug('cinerino-console:routes');
const dashboardRouter = express.Router();
dashboardRouter.get('', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userPoolService = new cinerinoapi.service.UserPool({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        let userPool;
        let userPoolClients = [];
        let adminUserPool;
        let adminUserPoolClients = [];
        try {
            userPool = yield userPoolService.findById({
                userPoolId: req.project.settings.DEFAULT_COGNITO_USER_POOL_ID
            });
            const searchUserPoolClientsResult = yield userPoolService.searchClients({ userPoolId: userPool.Id });
            userPoolClients = searchUserPoolClientsResult.data;
            adminUserPool = yield userPoolService.findById({
                userPoolId: req.project.settings.ADMIN_COGNITO_USER_POOL_ID
            });
            const searchAdminUserPoolClientsResult = yield userPoolService.searchClients({ userPoolId: adminUserPool.Id });
            adminUserPoolClients = searchAdminUserPoolClientsResult.data;
        }
        catch (error) {
            // no op
        }
        const searchSellersResult = yield sellerService.search({});
        res.render('index', {
            message: 'Welcome to Cinerino Console!',
            userPool: userPool,
            userPoolClients: userPoolClients,
            adminUserPool: adminUserPool,
            adminUserPoolClients: adminUserPoolClients,
            PaymentMethodType: cinerinoapi.factory.paymentMethodType,
            sellers: searchSellersResult.data
        });
    }
    catch (error) {
        next(error);
    }
}));
dashboardRouter.get('/countNewOrder', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: 1,
            page: 1,
            orderDateFrom: moment()
                .tz('Asia/Tokyo')
                .startOf('day')
                .toDate()
        };
        const { totalCount } = yield orderService.search(searchConditions);
        res.json({
            totalCount: totalCount
        });
    }
    catch (error) {
        next(error);
    }
}));
dashboardRouter.get('/aggregateExitRate', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
            limit: 1,
            page: 1,
            startFrom: moment()
                .tz('Asia/Tokyo')
                .startOf('day')
                .toDate()
        };
        const searchResult = yield placeOrderService.search(searchConditions);
        searchConditions.statuses = [
            cinerinoapi.factory.transactionStatusType.Canceled,
            cinerinoapi.factory.transactionStatusType.Expired
        ];
        const searchExitResult = yield placeOrderService.search(searchConditions);
        res.json({
            rate: (searchResult.totalCount > 0)
                // tslint:disable-next-line:no-magic-numbers
                ? Math.floor(searchExitResult.totalCount / searchResult.totalCount * 100)
                : 0
        });
    }
    catch (error) {
        next(error);
    }
}));
dashboardRouter.get('/countNewUser', (_, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 未実装
        res.json({
            totalCount: 0
        });
    }
    catch (error) {
        next(error);
    }
}));
dashboardRouter.get('/countNewTransaction', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
            limit: 1,
            page: 1,
            startFrom: moment()
                .tz('Asia/Tokyo')
                .startOf('day')
                .toDate()
        };
        const searchResult = yield placeOrderService.search(searchConditions);
        res.json({
            totalCount: searchResult.totalCount
        });
    }
    catch (error) {
        next(error);
    }
}));
dashboardRouter.get('/orders', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchOrdersResult = yield orderService.search({
            limit: req.query.limit,
            page: req.query.page,
            sort: (req.query.sort !== undefined) ? req.query.sort : { orderDate: cinerinoapi.factory.sortType.Descending },
            orderDateFrom: moment(req.query.orderDateFrom)
                .toDate(),
            orderDateThrough: moment(req.query.orderDateThrough)
                .toDate()
        });
        res.json(searchOrdersResult);
    }
    catch (error) {
        next(error);
    }
}));
dashboardRouter.get('/dbStats', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const eventService = new cinerinoapi.service.Event({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const stats = yield eventService.fetch({
            uri: '/stats/dbStats',
            method: 'GET',
            // tslint:disable-next-line:no-magic-numbers
            expectedStatusCodes: [200]
        })
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            return response.json();
        }));
        res.json(stats);
    }
    catch (error) {
        res.status(http_status_1.INTERNAL_SERVER_ERROR)
            .json({
            error: { message: error.message }
        });
    }
}));
dashboardRouter.get('/health', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const eventService = new cinerinoapi.service.Event({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const stats = yield eventService.fetch({
            uri: '/health',
            method: 'GET',
            // tslint:disable-next-line:no-magic-numbers
            expectedStatusCodes: [200]
        })
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            const version = response.headers.get('X-API-Version');
            return {
                version: version,
                status: response.status
            };
        }));
        res.json(stats);
    }
    catch (error) {
        res.status(http_status_1.INTERNAL_SERVER_ERROR)
            .json({
            error: { message: error.message }
        });
    }
}));
dashboardRouter.get('/queueCount', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const taskService = new cinerinoapi.service.Task({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const result = yield taskService.search({
            limit: 1,
            runsFrom: moment()
                .add(-1, 'day')
                .toDate(),
            runsThrough: moment()
                .toDate(),
            statuses: [cinerinoapi.factory.taskStatus.Ready]
        });
        res.json(result);
    }
    catch (error) {
        res.status(http_status_1.INTERNAL_SERVER_ERROR)
            .json({
            error: { message: error.message }
        });
    }
}));
exports.default = dashboardRouter;
