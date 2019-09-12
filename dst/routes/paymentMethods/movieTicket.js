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
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            identifiers: (req.query.identifiers !== undefined && req.query.identifiers !== '')
                ? req.query.identifiers.split(',')
                    .map((v) => v.trim())
                : undefined,
            serviceTypes: (req.query.serviceTypes !== undefined && req.query.serviceTypes !== '')
                ? req.query.serviceTypes.split(',')
                    .map((v) => v.trim())
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
 * ムビチケ認証
 */
movieTicketPaymentMethodRouter.all('/check', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const paymentService = new cinerinoapi.service.Payment({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchSellersResult = yield sellerService.search({});
        const sellers = searchSellersResult.data;
        const searchConditions = {
            seller: {
                id: (req.body.seller !== undefined)
                    ? req.body.seller.id
                    : undefined
            },
            identifier: req.body.identifier,
            accessCode: req.body.accessCode,
            serviceOutput: {
                reservationFor: {
                    id: (req.body.serviceOutput !== undefined
                        && req.body.serviceOutput.reservationFor !== undefined)
                        ? req.body.serviceOutput.reservationFor.id
                        : undefined
                }
            }
        };
        if (req.body.format === 'datatable') {
            const seller = sellers.find((s) => s.id === searchConditions.seller.id);
            if (seller === undefined) {
                throw new Error(`Seller ${searchConditions.seller.id} not found`);
            }
            const checkAction = yield paymentService.checkMovieTicket({
                typeOf: cinerinoapi.factory.paymentMethodType.MovieTicket,
                movieTickets: [{
                        project: { typeOf: req.project.typeOf, id: req.project.id },
                        typeOf: cinerinoapi.factory.paymentMethodType.MovieTicket,
                        identifier: searchConditions.identifier,
                        accessCode: searchConditions.accessCode,
                        serviceType: '',
                        serviceOutput: {
                            reservationFor: {
                                typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent,
                                id: searchConditions.serviceOutput.reservationFor.id
                            },
                            reservedTicket: {
                                ticketedSeat: {
                                    typeOf: cinerinoapi.factory.chevre.placeType.Seat,
                                    seatingType: {
                                        typeOf: 'Default'
                                    },
                                    seatNumber: '',
                                    seatRow: '',
                                    seatSection: ''
                                }
                            }
                        }
                    }],
                seller: seller
            });
            const result = checkAction.result;
            if (result === undefined) {
                throw new Error('checkAction.result undefined');
            }
            res.json({
                draw: req.body.draw,
                recordsTotal: result.movieTickets.length,
                recordsFiltered: result.movieTickets.length,
                data: result.movieTickets
            });
        }
        else {
            res.render('paymentMethods/movieTicket/check', {
                searchConditions: searchConditions,
                sellers: sellers
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
            endpoint: req.project.settings.API_ENDPOINT,
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
            endpoint: req.project.settings.API_ENDPOINT,
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
