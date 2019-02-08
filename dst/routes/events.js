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
 * イベントルーター
 */
const createDebug = require("debug");
const express = require("express");
// tslint:disable-next-line:no-submodule-imports
const check_1 = require("express-validator/check");
const http_status_1 = require("http-status");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('cinerino-console:routes:events');
const eventsRouter = express.Router();
/**
 * 上映イベント検索
 */
eventsRouter.get('/screeningEvent', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const eventService = new cinerinoapi.service.Event({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchSellersResult = yield sellerService.search({});
        const sellers = searchSellersResult.data;
        // 販売者はデフォルトで全選択
        if (req.query.seller === undefined) {
            req.query.seller = {};
        }
        if (!Array.isArray(req.query.seller.ids)) {
            req.query.seller.ids = sellers.map((s) => s.id);
        }
        let superEventLocationBranchCodes;
        const selectedSellers = sellers.filter((s) => req.query.seller.ids.indexOf(s.id) >= 0);
        superEventLocationBranchCodes = selectedSellers.reduce((a, b) => {
            if (Array.isArray(b.makesOffer)) {
                a.push(...b.makesOffer.map((offer) => offer.itemOffered.reservationFor.location.branchCode));
            }
            return a;
        }, []);
        const searchConditions = Object.assign({ limit: req.query.limit, page: req.query.page, sort: { startDate: cinerinoapi.factory.chevre.sortType.Ascending }, superEvent: {
                locationBranchCodes: superEventLocationBranchCodes
            }, startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[0])
                    .toDate()
                : new Date(), startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[1])
                    .toDate()
                : moment()
                    .add(1, 'month')
                    .toDate() }, req.query);
        if (req.query.format === 'datatable') {
            const searchScreeningEventsResult = yield eventService.searchScreeningEvents(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchScreeningEventsResult.totalCount,
                recordsFiltered: searchScreeningEventsResult.totalCount,
                data: searchScreeningEventsResult.data
            });
        }
        else {
            res.render('events/screeningEvent/index', {
                moment: moment,
                sellers: searchSellersResult.data,
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 上映イベントインポート
 */
eventsRouter.post('/screeningEvent/import', ...[
    check_1.body('seller.ids')
        .not()
        .isEmpty()
        .withMessage((_, options) => `${options.path} is required`)
        .isArray(),
    check_1.body('startRange')
        .not()
        .isEmpty()
        .withMessage((_, options) => `${options.path} is required`)
], validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const taskService = new cinerinoapi.service.Task({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const sellerIds = req.body.seller.ids;
        const searchSellersResult = yield sellerService.search({});
        const sellers = searchSellersResult.data;
        const selectedSellers = sellers.filter((s) => sellerIds.indexOf(s.id) >= 0);
        // const superEventLocationBranchCodes = selectedSellers.reduce<string[]>(
        //     (a, b) => {
        //         if (Array.isArray(b.makesOffer)) {
        //             a.push(...b.makesOffer.map(
        //                 (offer) => offer.itemOffered.reservationFor.location.branchCode
        //             ));
        //         }
        //         return a;
        //     },
        //     []
        // );
        const startFrom = moment(req.body.startRange.split(' - ')[0])
            .toDate();
        const startThrough = moment(req.body.startRange.split(' - ')[1])
            .toDate();
        const taskAttributes = selectedSellers
            .reduce((a, b) => {
            if (Array.isArray(b.makesOffer)) {
                a.push(...b.makesOffer.map((offer) => {
                    return {
                        name: cinerinoapi.factory.taskName.ImportScreeningEvents,
                        status: cinerinoapi.factory.taskStatus.Ready,
                        runsAt: new Date(),
                        remainingNumberOfTries: 1,
                        numberOfTried: 0,
                        executionResults: [],
                        data: {
                            offeredThrough: offer.offeredThrough,
                            locationBranchCode: offer.itemOffered.reservationFor.location.branchCode,
                            importFrom: startFrom,
                            importThrough: startThrough
                        }
                    };
                }));
            }
            return a;
        }, []);
        const tasks = yield Promise.all(taskAttributes.map((a) => __awaiter(this, void 0, void 0, function* () {
            return taskService.create(a);
        })));
        res.status(http_status_1.CREATED)
            .json(tasks);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 上映イベント詳細
 */
eventsRouter.get('/screeningEvent/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const eventService = new cinerinoapi.service.Event({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const event = yield eventService.findScreeningEventById({
            id: req.params.id
        });
        res.render('events/screeningEvent/show', {
            message: '',
            moment: moment,
            event: event,
            orders: []
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 上映イベントの注文検索
 */
eventsRouter.get('/screeningEvent/:id/orders', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const eventService = new cinerinoapi.service.Event({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const orderService = new cinerinoapi.service.Order({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const event = yield eventService.findScreeningEventById({
            id: req.params.id
        });
        // const reservationStartDate = moment(`${event.coaInfo.rsvStartDate} 00:00:00+09:00`, 'YYYYMMDD HH:mm:ssZ').toDate();
        const searchOrdersResult = yield orderService.search({
            limit: req.query.limit,
            page: req.query.page,
            sort: { orderDate: cinerinoapi.factory.sortType.Ascending },
            orderDateFrom: moment(event.startDate)
                // tslint:disable-next-line:no-magic-numbers
                .add(-3, 'months')
                .toDate(),
            orderDateThrough: new Date(),
            acceptedOffers: {
                itemOffered: {
                    reservationFor: { ids: [event.id] }
                }
            }
        });
        debug(searchOrdersResult.totalCount, 'orders found.');
        res.json(searchOrdersResult);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = eventsRouter;
