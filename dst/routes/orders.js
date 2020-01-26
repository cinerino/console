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
 * 注文ルーター
 */
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const TimelineFactory = require("../factory/timeline");
const debug = createDebug('cinerino-console:routes');
const ordersRouter = express.Router();
/**
 * 注文検索
 */
ordersRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const iamService = new cinerinoapi.service.IAM({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const orderService = new cinerinoapi.service.Order({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const searchSellersResult = yield sellerService.search({});
        let applications = [];
        try {
            // IAMメンバー検索(アプリケーション)
            const searchMembersResult = yield iamService.searchMembers({
                member: { typeOf: { $eq: cinerinoapi.factory.creativeWorkType.WebApplication } }
            });
            applications = searchMembersResult.data.map((m) => m.member);
        }
        catch (error) {
            // no op
        }
        let identifiers;
        let customerIdentifiers;
        if (req.query.identifier !== undefined) {
            if (req.query.identifier.$in !== '') {
                const splitted = req.query.identifier.$in.split(':');
                if (splitted.length > 1) {
                    identifiers = [
                        {
                            name: splitted[0],
                            value: splitted[1]
                        }
                    ];
                }
            }
        }
        if (req.query.customer !== undefined) {
            if (Array.isArray(req.query.customer.userPoolClients)) {
                customerIdentifiers = req.query.customer.userPoolClients.map((userPoolClient) => {
                    return {
                        name: 'clientId',
                        value: userPoolClient
                    };
                });
            }
            if (req.query.customer.identifiers !== '') {
                const splitted = req.query.customer.identifiers.split(':');
                if (splitted.length > 1) {
                    customerIdentifiers = [
                        {
                            name: splitted[0],
                            value: splitted[1]
                        }
                    ];
                }
            }
        }
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { orderDate: cinerinoapi.factory.sortType.Descending },
            seller: {
                ids: (req.query.seller !== undefined && req.query.seller.ids !== undefined)
                    ? req.query.seller.ids
                    : undefined
            },
            identifier: { $in: identifiers },
            customer: {
                ids: (req.query.customer !== undefined && req.query.customer.ids !== undefined && req.query.customer.ids !== '')
                    ? req.query.customer.ids.split(',')
                        .map((v) => v.trim())
                    : undefined,
                memberOf: {
                    membershipNumber: {
                        $in: (req.query.customer !== undefined
                            && req.query.customer.membershipNumbers !== undefined
                            && req.query.customer.membershipNumbers !== '')
                            ? req.query.customer.membershipNumbers.split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                identifiers: customerIdentifiers,
                // : [
                //     ...searchUserPoolClientsResult.data.map((userPoolClient) => {
                //         return {
                //             name: 'clientId',
                //             value: <string>userPoolClient.ClientId
                //         };
                //     }),
                //     ...searchAdminUserPoolClientsResult.data.map((userPoolClient) => {
                //         return {
                //             name: 'clientId',
                //             value: <string>userPoolClient.ClientId
                //         };
                //     })
                // ],
                givenName: {
                    $eq: (req.query.customer !== undefined
                        && req.query.customer.givenName !== undefined
                        && typeof req.query.customer.givenName.$eq === 'string'
                        && req.query.customer.givenName.$eq !== '')
                        ? req.query.customer.givenName.$eq
                        : undefined,
                    $regex: (req.query.customer !== undefined
                        && req.query.customer.givenName !== undefined
                        && typeof req.query.customer.givenName.$regex === 'string'
                        && req.query.customer.givenName.$regex !== '')
                        ? req.query.customer.givenName.$regex
                        : undefined
                },
                familyName: {
                    $eq: (req.query.customer !== undefined
                        && req.query.customer.familyName !== undefined
                        && typeof req.query.customer.familyName.$eq === 'string'
                        && req.query.customer.familyName.$eq !== '')
                        ? req.query.customer.familyName.$eq
                        : undefined,
                    $regex: (req.query.customer !== undefined
                        && req.query.customer.familyName !== undefined
                        && typeof req.query.customer.familyName.$regex === 'string'
                        && req.query.customer.familyName.$regex !== '')
                        ? req.query.customer.familyName.$regex
                        : undefined
                },
                email: {
                    $eq: (req.query.customer !== undefined
                        && req.query.customer.email !== undefined
                        && typeof req.query.customer.email.$eq === 'string'
                        && req.query.customer.email.$eq !== '')
                        ? req.query.customer.email.$eq
                        : undefined,
                    $regex: (req.query.customer !== undefined
                        && req.query.customer.email !== undefined
                        && typeof req.query.customer.email.$regex === 'string'
                        && req.query.customer.email.$regex !== '')
                        ? req.query.customer.email.$regex
                        : undefined
                },
                telephone: {
                    $eq: (req.query.customer !== undefined
                        && req.query.customer.telephone !== undefined
                        && typeof req.query.customer.telephone.$eq === 'string'
                        && req.query.customer.telephone.$eq !== '')
                        ? req.query.customer.telephone.$eq
                        : undefined,
                    $regex: (req.query.customer !== undefined
                        && req.query.customer.telephone !== undefined
                        && typeof req.query.customer.telephone.$regex === 'string'
                        && req.query.customer.telephone.$regex !== '')
                        ? req.query.customer.telephone.$regex
                        : undefined
                }
            },
            orderNumbers: (req.query.orderNumbers !== undefined && req.query.orderNumbers !== '')
                ? req.query.orderNumbers.split(',')
                    .map((v) => v.trim())
                : undefined,
            orderStatuses: (req.query.orderStatuses !== undefined)
                ? req.query.orderStatuses
                : undefined,
            orderDateFrom: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                ? moment(req.query.orderDateRange.split(' - ')[0])
                    .toDate()
                // : moment()
                //     .add(-1, 'year')
                //     .toDate(),
                : undefined,
            orderDateThrough: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                ? moment(req.query.orderDateRange.split(' - ')[1])
                    .toDate()
                // : moment()
                //     .toDate(),
                : undefined,
            confirmationNumbers: (req.query.confirmationNumbers !== undefined && req.query.confirmationNumbers !== '')
                ? req.query.confirmationNumbers.split(',')
                    .map((v) => v.trim())
                : undefined,
            acceptedOffers: {
                itemOffered: {
                    ids: (req.query.acceptedOffers !== undefined
                        && req.query.acceptedOffers.itemOffered !== undefined
                        && req.query.acceptedOffers.itemOffered.ids !== undefined
                        && req.query.acceptedOffers.itemOffered.ids !== '')
                        ? req.query.acceptedOffers.itemOffered.ids.split(',')
                            .map((v) => v.trim())
                        : undefined,
                    reservationNumbers: (req.query.acceptedOffers !== undefined
                        && req.query.acceptedOffers.itemOffered !== undefined
                        && req.query.acceptedOffers.itemOffered.reservationNumbers !== undefined
                        && req.query.acceptedOffers.itemOffered.reservationNumbers !== '')
                        ? req.query.acceptedOffers.itemOffered.reservationNumbers.split(',')
                            .map((v) => v.trim())
                        : undefined,
                    reservationFor: {
                        ids: (req.query.acceptedOffers !== undefined
                            && req.query.acceptedOffers.itemOffered !== undefined
                            && req.query.acceptedOffers.itemOffered.reservationFor !== undefined
                            && req.query.acceptedOffers.itemOffered.reservationFor.ids !== '')
                            ? req.query.acceptedOffers.itemOffered.reservationFor.ids.split(',')
                                .map((v) => v.trim())
                            : undefined,
                        name: (req.query.acceptedOffers !== undefined
                            && req.query.acceptedOffers.itemOffered !== undefined
                            && req.query.acceptedOffers.itemOffered.reservationFor !== undefined
                            && req.query.acceptedOffers.itemOffered.reservationFor.name !== '')
                            ? req.query.acceptedOffers.itemOffered.reservationFor.name
                            : undefined,
                        inSessionFrom: (req.query.reservationForInSessionRange !== undefined
                            && req.query.reservationForInSessionRange !== '')
                            ? moment(req.query.reservationForInSessionRange.split(' - ')[0])
                                .toDate()
                            : undefined,
                        inSessionThrough: (req.query.reservationForInSessionRange !== undefined
                            && req.query.reservationForInSessionRange !== '')
                            ? moment(req.query.reservationForInSessionRange.split(' - ')[1])
                                .toDate()
                            : undefined,
                        superEvent: {
                            ids: (req.query.acceptedOffers !== undefined
                                && req.query.acceptedOffers.itemOffered !== undefined
                                && req.query.acceptedOffers.itemOffered.reservationFor !== undefined
                                && req.query.acceptedOffers.itemOffered.reservationFor.superEvent !== undefined
                                && req.query.acceptedOffers.itemOffered.reservationFor.superEvent.ids !== '')
                                ? req.query.acceptedOffers.itemOffered.reservationFor.superEvent.ids
                                    .split(',')
                                    .map((v) => v.trim())
                                : undefined,
                            workPerformed: {
                                identifiers: (req.query.acceptedOffers !== undefined
                                    && req.query.acceptedOffers.itemOffered !== undefined
                                    && req.query.acceptedOffers.itemOffered.reservationFor !== undefined
                                    && req.query.acceptedOffers.itemOffered.reservationFor.superEvent !== undefined
                                    && req.query.acceptedOffers.itemOffered.reservationFor.superEvent.workPerformed !== undefined
                                    && req.query.acceptedOffers.itemOffered.reservationFor.superEvent.workPerformed.identifiers !== '')
                                    ? req.query.acceptedOffers.itemOffered.reservationFor.superEvent.workPerformed.identifiers
                                        .split(',')
                                        .map((v) => v.trim())
                                    : undefined
                            }
                        }
                    }
                }
            },
            paymentMethods: Object.assign({
                accountIds: (req.query.paymentMethods !== undefined
                    && req.query.paymentMethods.accountIds !== undefined
                    && req.query.paymentMethods.accountIds !== '')
                    ? req.query.paymentMethods.accountIds.split(',')
                        .map((v) => v.trim())
                    : undefined
            }, { 
                // : Object.values(cinerinoapi.factory.paymentMethodType),
                paymentMethodIds: (req.query.paymentMethods !== undefined
                    && req.query.paymentMethods.paymentMethodIds !== undefined
                    && req.query.paymentMethods.paymentMethodIds !== '')
                    ? req.query.paymentMethods.paymentMethodIds.split(',')
                        .map((v) => v.trim())
                    : undefined, typeOfs: (req.query.paymentMethods !== undefined
                    && req.query.paymentMethods.typeOfs !== undefined)
                    ? req.query.paymentMethods.typeOfs
                    : undefined })
        };
        if (req.query.format === 'datatable') {
            const searchOrdersResult = yield orderService.search(Object.assign(Object.assign({}, searchConditions), {
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
        else if (req.query.format === cinerinoapi.factory.encodingFormat.Text.csv) {
            const stream = yield orderService.download(Object.assign(Object.assign({}, searchConditions), { format: cinerinoapi.factory.encodingFormat.Text.csv, limit: undefined, page: undefined }));
            const filename = 'OrderReport';
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.csv`)}`);
            res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Text.csv}; charset=UTF-8`);
            stream.pipe(res);
        }
        else if (req.query.format === cinerinoapi.factory.encodingFormat.Application.json) {
            const stream = yield orderService.download(Object.assign(Object.assign({}, searchConditions), { format: cinerinoapi.factory.encodingFormat.Application.json, limit: undefined, page: undefined }));
            const filename = 'OrderReport';
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.json`)}`);
            res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Application.json}; charset=UTF-8`);
            stream.pipe(res);
        }
        else {
            res.render('orders/index', {
                moment: moment,
                sellers: searchSellersResult.data,
                applications: applications,
                searchConditions: searchConditions,
                OrderStatus: cinerinoapi.factory.orderStatus,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 注文詳細
 */
ordersRouter.get('/:orderNumber', 
// tslint:disable-next-line:max-func-body-length
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const order = yield orderService.findByOrderNumber({
            orderNumber: req.params.orderNumber
        });
        let actionsOnOrder = [];
        let timelines = [];
        try {
            actionsOnOrder = yield orderService.searchActionsByOrderNumber({
                orderNumber: order.orderNumber,
                sort: { startDate: cinerinoapi.factory.sortType.Ascending }
            });
            // tslint:disable-next-line:max-func-body-length
            timelines = actionsOnOrder.map((a) => {
                return TimelineFactory.createFromAction({
                    project: req.project,
                    action: a
                });
            });
        }
        catch (error) {
            // no op
        }
        res.render('orders/show', {
            moment: moment,
            order: order,
            timelines: timelines,
            ActionStatusType: cinerinoapi.factory.actionStatusType
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 注文返品
 */
ordersRouter.post('/:orderNumber/return', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const returnOrderService = new cinerinoapi.service.txn.ReturnOrder({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const returnOrderTransaction = yield returnOrderService.start({
            expires: moment()
                .add(1, 'minutes')
                .toDate(),
            object: {
                order: {
                    orderNumber: req.params.orderNumber
                }
            }
        });
        yield returnOrderService.confirm({
            id: returnOrderTransaction.id,
            potentialActions: {
                returnOrder: {
                    potentialActions: {
                        refundMovieTicket: (req.body.refundMovieTicket === 'on')
                    }
                }
            }
        });
        res.status(http_status_1.ACCEPTED)
            .end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 注文配送メール送信
 */
ordersRouter.post('/:orderNumber/sendEmailMessage', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const taskService = new cinerinoapi.service.Task({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchTransactionsResult = yield placeOrderService.search({
            limit: 1,
            typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
            result: { order: { orderNumbers: [req.params.orderNumber] } }
        });
        if (searchTransactionsResult.totalCount === 0) {
            throw new cinerinoapi.factory.errors.NotFound('Order');
        }
        const placeOrderTransaction = searchTransactionsResult.data[0];
        const potentialActions = placeOrderTransaction.potentialActions;
        if (potentialActions === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('Transactino potentialActions');
        }
        const orderPotentialActions = potentialActions.order.potentialActions;
        if (orderPotentialActions === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('Order potentialActions');
        }
        if (orderPotentialActions.sendOrder === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('SendOrder actionAttributes');
        }
        const sendOrderPotentialActions = orderPotentialActions.sendOrder.potentialActions;
        if (sendOrderPotentialActions === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('SendOrder potentialActions');
        }
        const sendEmailMessageActionAttributes = sendOrderPotentialActions.sendEmailMessage;
        if (sendEmailMessageActionAttributes === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('SendEmailMessage actionAttributes');
        }
        const taskAttributes = sendEmailMessageActionAttributes.map((a) => {
            return {
                data: {
                    actionAttributes: a
                },
                executionResults: [],
                name: cinerinoapi.factory.taskName.SendEmailMessage,
                numberOfTried: 0,
                project: { typeOf: req.project.typeOf, id: req.project.id },
                remainingNumberOfTries: 3,
                runsAt: new Date(),
                status: cinerinoapi.factory.taskStatus.Ready
            };
        });
        const tasks = yield Promise.all(taskAttributes.map((t) => __awaiter(void 0, void 0, void 0, function* () {
            return taskService.create(t);
        })));
        res.status(http_status_1.CREATED)
            .json(tasks[0]);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = ordersRouter;
