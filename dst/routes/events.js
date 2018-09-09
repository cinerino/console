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
const cinerinoapi = require("@cinerino/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
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
        const organizationService = new cinerinoapi.service.Organization({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchMovieTheatersResult = yield organizationService.searchMovieTheaters({});
        const searchConditions = Object.assign({ limit: req.query.limit, page: req.query.page, sort: { startDate: cinerinoapi.factory.chevre.sortType.Ascending }, superEvent: {
                locationBranchCodes: (req.query.superEventLocationBranchCodes !== undefined)
                    ? req.query.superEventLocationBranchCodes
                    : searchMovieTheatersResult.data.map((m) => m.location.branchCode)
            }, startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[0]).toDate()
                : new Date(), startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[1]).toDate()
                : moment().add(1, 'month').toDate() }, req.query);
        const searchScreeningEventsResult = yield eventService.searchScreeningEvents(searchConditions);
        if (req.query.format === 'datatable') {
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
                movieTheaters: searchMovieTheatersResult.data,
                searchConditions: searchConditions,
                events: searchScreeningEventsResult.data
            });
        }
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
        debug('req.query:', req.query);
        const eventService = new cinerinoapi.service.Event({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const organizationService = new cinerinoapi.service.Organization({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const orderService = new cinerinoapi.service.Order({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchMovieTheatersResult = yield organizationService.searchMovieTheaters({});
        debug('searching events...');
        const event = yield eventService.findScreeningEventById({
            id: req.params.id
        });
        debug('events found.', event);
        // イベント開催の劇場取得
        const movieTheater = searchMovieTheatersResult.data.find((o) => o.location.branchCode === event.superEvent.location.branchCode);
        if (movieTheater === undefined) {
            throw new Error('Movie Theater Not Found');
        }
        // const screeningRoom = movieTheater.containsPlace.find((p) => p.branchCode === event.location.branchCode);
        // debug('searching orders by event...');
        // const reservationStartDate = moment(`${event.coaInfo.rsvStartDate} 00:00:00+09:00`, 'YYYYMMDD HH:mm:ssZ').toDate();
        const searchOrdersResult = yield orderService.search({
            // tslint:disable-next-line:no-magic-numbers
            orderDateFrom: moment(event.startDate).add(-3, 'months').toDate(),
            orderDateThrough: new Date(),
            reservedEventIds: [event.id]
        });
        debug(searchOrdersResult.totalCount, 'orders found.');
        res.render('events/screeningEvent/show', {
            moment: moment,
            movieTheater: movieTheater,
            screeningRoom: {},
            movieTheaters: searchMovieTheatersResult.data,
            event: event,
            orders: searchOrdersResult.data
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = eventsRouter;
