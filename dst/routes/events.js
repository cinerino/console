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
eventsRouter.get('/chevreBackend', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let url = '';
        const projectService = new cinerinoapi.service.Project({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const settings = yield projectService.getSettings({ id: req.project.id });
        if (settings !== undefined
            && settings.chevre !== undefined
            && settings.chevre.backend !== undefined
            && typeof settings.chevre.backend.url === 'string') {
            url = settings.chevre.backend.url;
        }
        res.redirect(url);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
}));
/**
 * 上映イベント検索
 */
eventsRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const eventService = new cinerinoapi.service.Event({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
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
        const searchConditions = Object.assign({ limit: req.query.limit, page: req.query.page, eventStatuses: (req.query.eventStatuses !== undefined)
                ? req.query.eventStatuses
                : undefined, typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent, superEvent: {
                locationBranchCodes: superEventLocationBranchCodes
            }, startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[0])
                    .toDate()
                : new Date(), startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[1])
                    .toDate()
                : moment()
                    .add(1, 'month')
                    .toDate(), name: req.query.name }, {
            seller: req.query.seller
        });
        if (req.query.format === 'datatable') {
            const searchScreeningEventsResult = yield eventService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchScreeningEventsResult.totalCount,
                recordsFiltered: searchScreeningEventsResult.totalCount,
                data: searchScreeningEventsResult.data
            });
        }
        else {
            res.render('events/index', {
                EventStatusType: cinerinoapi.factory.chevre.eventStatusType,
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
eventsRouter.post('/import', ...[
    check_1.body('seller.ids')
        .not()
        .isEmpty()
        .withMessage((_, options) => `${options.path} is required`)
        .isArray(),
    check_1.body('startRange')
        .not()
        .isEmpty()
        .withMessage((_, options) => `${options.path} is required`)
], validator_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const taskService = new cinerinoapi.service.Task({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
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
                        data: {
                            importFrom: startFrom,
                            importThrough: startThrough,
                            locationBranchCode: offer.itemOffered.reservationFor.location.branchCode,
                            offeredThrough: offer.offeredThrough,
                            project: { typeOf: req.project.typeOf, id: req.project.id }
                        },
                        executionResults: [],
                        name: cinerinoapi.factory.taskName.ImportScreeningEvents,
                        numberOfTried: 0,
                        project: { typeOf: req.project.typeOf, id: req.project.id },
                        remainingNumberOfTries: 1,
                        runsAt: new Date(),
                        status: cinerinoapi.factory.taskStatus.Ready
                    };
                }));
            }
            return a;
        }, []);
        const tasks = yield Promise.all(taskAttributes.map((a) => __awaiter(void 0, void 0, void 0, function* () {
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
eventsRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventService = new cinerinoapi.service.Event({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const event = yield eventService.findById({
            id: req.params.id
        });
        res.render('events/show', {
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
eventsRouter.get('/:id/orders', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventService = new cinerinoapi.service.Event({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const orderService = new cinerinoapi.service.Order({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const event = yield eventService.findById({
            id: req.params.id
        });
        // const reservationStartDate = moment(`${event.coaInfo.rsvStartDate} 00:00:00+09:00`, 'YYYYMMDD HH:mm:ssZ').toDate();
        const searchOrdersResult = yield orderService.search({
            limit: req.query.limit,
            page: req.query.page,
            sort: { orderDate: cinerinoapi.factory.sortType.Descending },
            orderDateFrom: moment(event.startDate)
                .add(-1, 'months')
                .toDate(),
            orderDateThrough: moment(event.startDate)
                .toDate(),
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
