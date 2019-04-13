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
 * 注文取引ルーター
 */
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const cinerinoapi = require("../../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const placeOrderTransactionsRouter = express.Router();
/**
 * 検索
 */
placeOrderTransactionsRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchSellersResult = yield sellerService.search({});
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { startDate: cinerinoapi.factory.sortType.Descending },
            typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
            ids: (Array.isArray(req.query.ids)) ? req.query.ids : undefined,
            statuses: (req.query.statuses !== undefined) ? req.query.statuses : undefined,
            startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[0])
                    .toDate()
                : moment()
                    .add(-1, 'days')
                    .toDate(),
            startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[1])
                    .toDate()
                : moment()
                    .toDate(),
            endFrom: (req.query.endFrom !== undefined)
                ? moment(req.query.endFrom)
                    .toDate()
                : undefined,
            endThrough: (req.query.endThrough !== undefined)
                ? moment(req.query.endThrough)
                    .toDate()
                : undefined,
            agent: {
                ids: (req.query.agent !== undefined && req.query.agent.ids !== undefined && req.query.agent.ids !== '')
                    ? req.query.agent.ids.split(',')
                        .map((v) => v.trim())
                    : undefined,
                givenName: (req.query.agent !== undefined
                    && req.query.agent.givenName !== '')
                    ? req.query.agent.givenName : undefined,
                familyName: (req.query.agent !== undefined
                    && req.query.agent.familyName !== '')
                    ? req.query.agent.familyName : undefined,
                telephone: (req.query.agent !== undefined
                    && req.query.agent.telephone !== '')
                    ? req.query.agent.telephone : undefined,
                email: (req.query.agent !== undefined
                    && req.query.agent.email !== '')
                    ? req.query.agent.email : undefined
            },
            seller: {
                ids: (req.query.seller !== undefined && req.query.seller.ids !== undefined)
                    ? req.query.seller.ids
                    : undefined
            },
            object: {},
            result: {
                order: {
                    orderNumbers: (req.query.result !== undefined
                        && req.query.result.order !== undefined
                        && req.query.result.order.orderNumbers !== '')
                        ? req.query.result.order.orderNumbers.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            tasksExportationStatuses: (req.query.tasksExportationStatuses !== undefined)
                ? req.query.tasksExportationStatuses
                : undefined
        };
        debug('searchConditions:', searchConditions);
        if (req.query.format === 'datatable') {
            const searchScreeningEventsResult = yield placeOrderService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchScreeningEventsResult.totalCount,
                recordsFiltered: searchScreeningEventsResult.totalCount,
                data: searchScreeningEventsResult.data
            });
        }
        else if (req.query.format === cinerinoapi.factory.encodingFormat.Text.csv) {
            const stream = yield placeOrderService.stream(Object.assign({}, searchConditions, { format: cinerinoapi.factory.encodingFormat.Text.csv }));
            const filename = 'TransactionReport';
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.csv`)}`);
            res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Text.csv}; charset=UTF-8`);
            stream.pipe(res);
        }
        else if (req.query.format === cinerinoapi.factory.encodingFormat.Application.json) {
            const stream = yield placeOrderService.stream(Object.assign({}, searchConditions, { format: cinerinoapi.factory.encodingFormat.Application.json }));
            const filename = 'TransactionReport';
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.json`)}`);
            res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Application.json}; charset=UTF-8`);
            stream.pipe(res);
        }
        else {
            res.render('transactions/placeOrder/index', {
                moment: moment,
                sellers: searchSellersResult.data,
                TransactionStatusType: cinerinoapi.factory.transactionStatusType,
                TransactionTasksExportationStatus: cinerinoapi.factory.transactionTasksExportationStatus,
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 取引詳細
 */
placeOrderTransactionsRouter.get('/:transactionId', 
// tslint:disable-next-line:max-func-body-length
(req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchTransactionsResult = yield placeOrderService.search({
            typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
            ids: [req.params.transactionId]
        });
        const transaction = searchTransactionsResult.data.shift();
        if (transaction === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('Transaction');
        }
        let actionsOnTransaction = [];
        try {
            actionsOnTransaction = yield placeOrderService.searchActionsByTransactionId({
                id: transaction.id,
                sort: { startDate: cinerinoapi.factory.sortType.Ascending }
            });
        }
        catch (error) {
            // no op
        }
        const transactionAgentUrl = (transaction.agent.memberOf !== undefined)
            ? `/people/${transaction.agent.id}`
            : `/userPools/${process.env.DEFAULT_COGNITO_USER_POOL_ID}/clients/${transaction.agent.id}`;
        const timelines = [{
                action: {},
                agent: {
                    id: transaction.agent.id,
                    name: transaction.agent.id,
                    url: transactionAgentUrl
                },
                actionName: '開始',
                object: '取引',
                startDate: transaction.startDate,
                actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                result: undefined
            }];
        // tslint:disable-next-line:cyclomatic-complexity
        timelines.push(...actionsOnTransaction.map((a) => {
            let agent;
            if (a.agent.typeOf === cinerinoapi.factory.personType.Person) {
                const url = (a.agent.memberOf !== undefined)
                    ? `/people/${a.agent.id}`
                    : `/userPools/${process.env.DEFAULT_COGNITO_USER_POOL_ID}/clients/${a.agent.id}`;
                agent = {
                    id: a.agent.id,
                    name: a.agent.id,
                    url: url
                };
            }
            else if (a.agent.typeOf === cinerinoapi.factory.organizationType.MovieTheater) {
                agent = {
                    id: a.agent.id,
                    name: transaction.seller.name.ja,
                    url: `/sellers/${a.agent.id}`
                };
            }
            let actionName;
            switch (a.typeOf) {
                case cinerinoapi.factory.actionType.AuthorizeAction:
                    actionName = '承認';
                    break;
                default:
                    actionName = a.typeOf;
            }
            let object;
            switch (a.object.typeOf) {
                case cinerinoapi.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation:
                    object = '座席予約';
                    break;
                case cinerinoapi.factory.paymentMethodType.CreditCard:
                    object = 'クレジットカード決済';
                    break;
                case cinerinoapi.factory.paymentMethodType.Account:
                    object = '口座決済';
                    break;
                case cinerinoapi.factory.action.authorize.award.point.ObjectType.PointAward:
                    object = 'ポイントインセンティブ';
                    break;
                default:
                    object = a.object.typeOf;
            }
            return {
                action: a,
                agent,
                actionName,
                object,
                startDate: a.startDate,
                actionStatus: a.actionStatus,
                result: a.result
            };
        }));
        if (transaction.endDate !== undefined) {
            switch (transaction.status) {
                case cinerinoapi.factory.transactionStatusType.Canceled:
                    timelines.push({
                        action: {},
                        agent: {
                            id: transaction.agent.id,
                            name: transaction.agent.id,
                            url: transactionAgentUrl
                        },
                        actionName: '中止',
                        object: '取引',
                        startDate: transaction.endDate,
                        actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                        result: undefined
                    });
                    break;
                case cinerinoapi.factory.transactionStatusType.Confirmed:
                    timelines.push({
                        action: {},
                        agent: {
                            id: transaction.agent.id,
                            name: transaction.agent.id,
                            url: transactionAgentUrl
                        },
                        actionName: '確定',
                        object: '取引',
                        startDate: transaction.endDate,
                        actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                        result: undefined
                    });
                    break;
                case cinerinoapi.factory.transactionStatusType.Expired:
                    timelines.push({
                        action: {},
                        agent: {
                            id: '#',
                            name: 'システム',
                            url: '#'
                        },
                        actionName: '終了',
                        object: '取引',
                        startDate: transaction.endDate,
                        actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                        result: undefined
                    });
                    break;
                default:
            }
        }
        res.render('transactions/placeOrder/show', {
            moment: moment,
            transaction: transaction,
            timelines: timelines,
            ActionStatusType: cinerinoapi.factory.actionStatusType
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = placeOrderTransactionsRouter;
