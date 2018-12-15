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
 * ムビチケ決済方法ルーター
 */
// import * as createDebug from 'debug';
const express = require("express");
const cinerinoapi = require("../../cinerinoapi");
// const debug = createDebug('cinerino-console:routes');
const movieTicketPaymentMethodRouter = express.Router();
/**
 * 検索
 */
movieTicketPaymentMethodRouter.get('', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const paymentMethodService = new cinerinoapi.service.PaymentMethod({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { identifier: cinerinoapi.factory.sortType.Ascending },
            identifiers: (req.query.identifiers !== undefined && req.query.identifiers !== '')
                ? req.query.identifiers.split(',').map((v) => v.trim())
                : undefined,
            serviceTypes: (req.query.serviceTypes !== undefined && req.query.serviceTypes !== '')
                ? req.query.serviceTypes.split(',').map((v) => v.trim())
                : undefined
        };
        if (req.query.format === 'datatable') {
            const { totalCount, data } = yield paymentMethodService.searchMovieTickets(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: totalCount,
                recordsFiltered: totalCount,
                data: data
            });
        }
        else {
            res.render('paymentMethods/movieTicket', {
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ムビチケ詳細
 */
movieTicketPaymentMethodRouter.get('/:identifier', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const message = undefined;
        const paymentMethodService = new cinerinoapi.service.PaymentMethod({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchResult = yield paymentMethodService.searchMovieTickets({
            limit: 1,
            identifiers: [req.params.identifier]
        });
        const movieTicket = searchResult.data.shift();
        if (movieTicket === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('Movie Ticket');
        }
        res.render('paymentMethods/movieTicket/show', {
            message: message,
            movieTicket: movieTicket,
            PaymentMethodType: cinerinoapi.factory.paymentMethodType,
            PlaceType: cinerinoapi.factory.placeType
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ムビチケの注文検索
 */
movieTicketPaymentMethodRouter.get('/:identifier/orders', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchResult = yield orderService.search({
            limit: req.query.limit,
            page: req.query.page,
            sort: { orderDate: cinerinoapi.factory.sortType.Descending },
            paymentMethods: {
                typeOfs: [cinerinoapi.factory.paymentMethodType.MovieTicket],
                paymentMethodIds: [req.params.identifier]
            }
        });
        res.json(searchResult);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = movieTicketPaymentMethodRouter;
