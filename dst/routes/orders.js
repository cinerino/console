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
 * 注文ルーター
 */
const cinerinoapi = require("@cinerino/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const debug = createDebug('cinerino-console:routes');
const ordersRouter = express.Router();
/**
 * 注文検索
 */
ordersRouter.get('', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const orderService = new cinerinoapi.service.Order({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const organizationService = new cinerinoapi.service.Organization({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchMovieTheatersResult = yield organizationService.searchMovieTheaters({});
        const orderStatusChoices = [
            cinerinoapi.factory.orderStatus.OrderDelivered,
            cinerinoapi.factory.orderStatus.OrderPickupAvailable,
            cinerinoapi.factory.orderStatus.OrderProcessing,
            cinerinoapi.factory.orderStatus.OrderReturned
        ];
        const searchConditions = {
            sellerIds: (req.query.sellerIds !== undefined)
                ? req.query.sellerIds
                : searchMovieTheatersResult.data.map((m) => m.id),
            customerMembershipNumbers: (req.query.customerMembershipNumbers !== undefined && req.query.customerMembershipNumbers !== '')
                ? req.query.customerMembershipNumbers.split(',').map((v) => v.trim())
                : [],
            orderNumbers: (req.query.orderNumbers !== undefined && req.query.orderNumbers !== '')
                ? req.query.orderNumbers.split(',').map((v) => v.trim())
                : [],
            orderStatuses: (req.query.orderStatuses !== undefined)
                ? req.query.orderStatuses
                : orderStatusChoices,
            orderDateFrom: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                ? moment(req.query.orderDateRange.split(' - ')[0]).toDate()
                : moment().add(-1, 'day').toDate(),
            orderDateThrough: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                ? moment(req.query.orderDateRange.split(' - ')[1]).toDate()
                : new Date(),
            confirmationNumbers: (req.query.confirmationNumbers !== undefined && req.query.confirmationNumbers !== '')
                ? req.query.confirmationNumbers.split(',').map((v) => v.trim())
                : []
        };
        debug('searching orders...', searchConditions);
        const searchOrdersResult = yield orderService.search(searchConditions);
        debug(searchOrdersResult.totalCount, 'orders found.');
        res.render('orders/index', {
            moment: moment,
            movieTheaters: searchMovieTheatersResult.data,
            searchConditions: searchConditions,
            orders: searchOrdersResult.data,
            orderStatusChoices: orderStatusChoices
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 注文詳細
 */
ordersRouter.get('/:orderNumber', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchOrdersResult = yield orderService.search({
            orderNumbers: [req.params.orderNumber],
            orderDateFrom: moment('2017-04-20T00:00:00+09:00').toDate(),
            orderDateThrough: new Date()
        });
        const order = searchOrdersResult.data.shift();
        if (order === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('Order');
        }
        res.render('orders/show', {
            moment: moment,
            order: order
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = ordersRouter;
