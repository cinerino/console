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
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes:events');
const eventsRouter = express.Router();
eventsRouter.get('/chevreBackend', (__, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = process.env.CHEVRE_CONSOLE_URL;
        res.redirect(url);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
}));
/**
 * イベント検索
 */
eventsRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const eventService = new cinerinoapi.service.Event({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            eventStatuses: (req.query.eventStatuses !== undefined)
                ? req.query.eventStatuses
                : undefined,
            typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent,
            superEvent: {
            // locationBranchCodes: superEventLocationBranchCodes
            },
            startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[0])
                    .toDate()
                : new Date(),
            startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[1])
                    .toDate()
                : moment()
                    .add(1, 'month')
                    .toDate(),
            name: req.query.name
        };
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
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * イベント詳細
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
 * イベントのオファー検索
 */
eventsRouter.get('/:id/offers', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventService = new cinerinoapi.service.Event({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const event = yield eventService.findById({
            id: req.params.id
        });
        let offers = [];
        const aggregateOffer = event.aggregateOffer;
        if (aggregateOffer !== undefined && aggregateOffer !== null) {
            offers = aggregateOffer.offers;
        }
        res.json({ data: offers });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * イベントの注文検索
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
