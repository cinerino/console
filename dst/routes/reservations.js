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
 * 予約ルーター
 */
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const reservationsRouter = express.Router();
/**
 * 予約検索
 */
reservationsRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const reservationService = new cinerinoapi.service.Reservation({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const streamingReservationService = new cinerinoapi.service.Reservation({
            endpoint: process.env.STREAMING_API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            // sort: { bookingTime: cinerinoapi.factory.sortType.Descending },
            typeOf: cinerinoapi.factory.chevre.reservationType.EventReservation,
            underName: {
                id: (req.query.underName !== undefined && req.query.underName.id !== '')
                    ? req.query.underName.id
                    : undefined,
                name: (req.query.underName !== undefined && req.query.underName.name !== '')
                    ? req.query.underName.name
                    : undefined,
                familyName: (req.query.underName !== undefined && req.query.underName.familyName !== '')
                    ? req.query.underName.familyName
                    : undefined,
                givenName: (req.query.underName !== undefined && req.query.underName.givenName !== '')
                    ? req.query.underName.givenName
                    : undefined,
                email: (req.query.underName !== undefined && req.query.underName.email !== '')
                    ? req.query.underName.email
                    : undefined,
                telephone: (req.query.underName !== undefined && req.query.underName.telephone !== '')
                    ? req.query.underName.telephone
                    : undefined,
                identifier: {
                    $all: (req.query.underName !== undefined
                        && req.query.underName.identifier !== undefined
                        && req.query.underName.identifier !== ''
                        && req.query.underName.identifier.split(':').length > 0)
                        ? [
                            {
                                name: req.query.underName.identifier.split(':')[0],
                                value: req.query.underName.identifier.split(':')[1]
                            }
                        ]
                        : undefined
                }
            },
            reservationStatuses: (req.query.reservationStatuses !== undefined)
                ? req.query.reservationStatuses
                : undefined,
            bookingFrom: (req.query.bookingTimeRange !== undefined && req.query.bookingTimeRange !== '')
                ? moment(req.query.bookingTimeRange.split(' - ')[0])
                    .toDate()
                : undefined,
            bookingThrough: (req.query.bookingTimeRange !== undefined && req.query.bookingTimeRange !== '')
                ? moment(req.query.bookingTimeRange.split(' - ')[1])
                    .toDate()
                : undefined,
            modifiedFrom: (req.query.modifiedTimeRange !== undefined && req.query.modifiedTimeRange !== '')
                ? moment(req.query.modifiedTimeRange.split(' - ')[0])
                    .toDate()
                : undefined,
            modifiedThrough: (req.query.modifiedTimeRange !== undefined && req.query.modifiedTimeRange !== '')
                ? moment(req.query.modifiedTimeRange.split(' - ')[1])
                    .toDate()
                : undefined,
            ids: (req.query.ids !== undefined
                && req.query.ids !== '')
                ? req.query.ids.split(',')
                    .map((v) => v.trim())
                : undefined,
            reservationNumbers: (req.query.reservationNumbers !== undefined
                && req.query.reservationNumbers !== '')
                ? req.query.reservationNumbers.split(',')
                    .map((v) => v.trim())
                : undefined,
            additionalTicketText: (req.query.additionalTicketText !== '')
                ? req.query.additionalTicketText
                : undefined,
            reservationFor: {
                ids: (req.query.reservationFor !== undefined
                    && req.query.reservationFor.ids !== '')
                    ? req.query.reservationFor.ids.split(',')
                        .map((v) => v.trim())
                    : undefined,
                startFrom: (req.query.reservationFor !== undefined
                    && req.query.reservationFor.startDateRange !== undefined
                    && req.query.reservationFor.startDateRange !== '')
                    ? moment(req.query.reservationFor.startDateRange.split(' - ')[0])
                        .toDate()
                    : undefined,
                startThrough: (req.query.reservationFor !== undefined
                    && req.query.reservationFor.startDateRange !== undefined
                    && req.query.reservationFor.startDateRange !== '')
                    ? moment(req.query.reservationFor.startDateRange.split(' - ')[1])
                        .toDate()
                    : undefined,
                superEvent: {
                    ids: (req.query.reservationFor !== undefined
                        && req.query.reservationFor.superEvent !== undefined
                        && req.query.reservationFor.superEvent.ids !== '')
                        ? req.query.reservationFor.superEvent.ids
                            .split(',')
                            .map((v) => v.trim())
                        : undefined
                    // workPerformed: {
                    //     identifiers: (req.query.acceptedOffers !== undefined
                    //         && req.query.acceptedOffers.itemOffered !== undefined
                    //         && req.query.acceptedOffers.itemOffered.reservationFor !== undefined
                    //         && req.query.acceptedOffers.itemOffered.reservationFor.superEvent !== undefined
                    //         && req.query.acceptedOffers.itemOffered.reservationFor.superEvent.workPerformed !== undefined
                    //         && req.query.acceptedOffers.itemOffered.reservationFor.superEvent.workPerformed.identifiers !== '')
                    //         ? (<string>req.query.acceptedOffers.itemOffered.reservationFor.superEvent.workPerformed.identifiers)
                    //             .split(',')
                    //             .map((v) => v.trim())
                    //         : undefined
                }
            },
            reservedTicket: {
                ticketedSeat: {
                    seatNumbers: (req.query.reservedTicket !== undefined
                        && req.query.reservedTicket.ticketedSeat !== undefined
                        && req.query.reservedTicket.ticketedSeat.seatNumbers !== undefined
                        && req.query.reservedTicket.ticketedSeat.seatNumbers !== '')
                        ? req.query.reservedTicket.ticketedSeat.seatNumbers.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                ticketType: {
                    ids: (req.query.reservedTicket !== undefined
                        && req.query.reservedTicket.ticketType !== undefined
                        && req.query.reservedTicket.ticketType.ids !== undefined
                        && req.query.reservedTicket.ticketType.ids !== '')
                        ? req.query.reservedTicket.ticketType.ids.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            }
        };
        if (req.query.format === 'datatable') {
            const searchOrdersResult = yield reservationService.search(Object.assign(Object.assign({}, searchConditions), {
                disableTotalCount: true
            }));
            res.json({
                draw: req.query.draw,
                // recordsTotal: searchOrdersResult.totalCount,
                recordsFiltered: (searchOrdersResult.data.length === Number(searchConditions.limit))
                    ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                    : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchOrdersResult.data.length),
                data: searchOrdersResult.data
            });
        }
        else if (req.query.format === cinerinoapi.factory.chevre.encodingFormat.Text.csv) {
            const stream = yield streamingReservationService.download(Object.assign(Object.assign({}, searchConditions), { format: cinerinoapi.factory.chevre.encodingFormat.Text.csv, limit: undefined, page: undefined }));
            const filename = 'ReservationReport';
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.csv`)}`);
            res.setHeader('Content-Type', `${cinerinoapi.factory.chevre.encodingFormat.Text.csv}; charset=UTF-8`);
            stream.pipe(res);
        }
        else if (req.query.format === cinerinoapi.factory.chevre.encodingFormat.Application.json) {
            const stream = yield streamingReservationService.download(Object.assign(Object.assign({}, searchConditions), { format: cinerinoapi.factory.chevre.encodingFormat.Application.json, limit: undefined, page: undefined }));
            const filename = 'ReservationReport';
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.json`)}`);
            res.setHeader('Content-Type', `${cinerinoapi.factory.chevre.encodingFormat.Application.json}; charset=UTF-8`);
            stream.pipe(res);
        }
        else {
            const consoleUrl = process.env.CHEVRE_CONSOLE_URL;
            res.render('reservations/index', {
                moment: moment,
                consoleUrl: consoleUrl,
                searchConditions: searchConditions,
                ReservationStatusType: cinerinoapi.factory.chevre.reservationStatusType
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = reservationsRouter;
