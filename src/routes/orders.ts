/**
 * 注文ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import { ACCEPTED, CREATED } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

import * as TimelineFactory from '../factory/timeline';

const debug = createDebug('cinerino-console:routes');

const ordersRouter = express.Router();

/**
 * 注文検索
 */
ordersRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity
    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    async (req, res, next) => {
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

            const searchSellersResult = await sellerService.search({});

            let applications: any[] = [];
            try {
                // IAMメンバー検索(アプリケーション)
                const searchMembersResult = await iamService.searchMembers({
                    member: { typeOf: { $eq: cinerinoapi.factory.creativeWorkType.WebApplication } }
                });
                applications = searchMembersResult.data.map((m) => m.member);
            } catch (error) {
                // no op
            }

            let identifiers: cinerinoapi.factory.order.IIdentifier | undefined;
            let customerIdentifiers: cinerinoapi.factory.person.IIdentifier | undefined;

            if (req.query.identifier !== undefined) {
                if (req.query.identifier.$in !== '') {
                    const splitted = (<string>req.query.identifier.$in).split(':');
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
                    customerIdentifiers = req.query.customer.userPoolClients.map((userPoolClient: string) => {
                        return {
                            name: 'clientId',
                            value: userPoolClient
                        };
                    });
                }

                if (req.query.customer.identifiers !== '') {
                    const splitted = (<string>req.query.customer.identifiers).split(':');
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

            const searchConditions: cinerinoapi.factory.order.ISearchConditions = {
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
                        ? (<string>req.query.customer.ids).split(',')
                            .map((v) => v.trim())
                        : undefined,
                    membershipNumbers: (req.query.customer !== undefined
                        && req.query.customer.membershipNumbers !== undefined
                        && req.query.customer.membershipNumbers !== '')
                        ? (<string>req.query.customer.membershipNumbers).split(',')
                            .map((v) => v.trim())
                        : undefined,
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
                    givenName: (req.query.customer !== undefined && req.query.customer.givenName !== '')
                        ? req.query.customer.givenName
                        : undefined,
                    familyName: (req.query.customer !== undefined && req.query.customer.familyName !== '')
                        ? req.query.customer.familyName
                        : undefined,
                    email: (req.query.customer !== undefined && req.query.customer.email !== '')
                        ? req.query.customer.email
                        : undefined,
                    telephone: (req.query.customer !== undefined && req.query.customer.telephone !== '')
                        ? req.query.customer.telephone
                        : undefined
                },
                orderNumbers: (req.query.orderNumbers !== undefined && req.query.orderNumbers !== '')
                    ? (<string>req.query.orderNumbers).split(',')
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
                    ? (<string>req.query.confirmationNumbers).split(',')
                        .map((v) => v.trim())
                    : undefined,
                acceptedOffers: {
                    itemOffered: {
                        ids: (req.query.acceptedOffers !== undefined
                            && req.query.acceptedOffers.itemOffered !== undefined
                            && req.query.acceptedOffers.itemOffered.ids !== undefined
                            && req.query.acceptedOffers.itemOffered.ids !== '')
                            ? (<string>req.query.acceptedOffers.itemOffered.ids).split(',')
                                .map((v) => v.trim())
                            : undefined,
                        reservationNumbers: (req.query.acceptedOffers !== undefined
                            && req.query.acceptedOffers.itemOffered !== undefined
                            && req.query.acceptedOffers.itemOffered.reservationNumbers !== undefined
                            && req.query.acceptedOffers.itemOffered.reservationNumbers !== '')
                            ? (<string>req.query.acceptedOffers.itemOffered.reservationNumbers).split(',')
                                .map((v) => v.trim())
                            : undefined,
                        reservationFor: {
                            ids: (req.query.acceptedOffers !== undefined
                                && req.query.acceptedOffers.itemOffered !== undefined
                                && req.query.acceptedOffers.itemOffered.reservationFor !== undefined
                                && req.query.acceptedOffers.itemOffered.reservationFor.ids !== '')
                                ? (<string>req.query.acceptedOffers.itemOffered.reservationFor.ids).split(',')
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
                                    ? (<string>req.query.acceptedOffers.itemOffered.reservationFor.superEvent.ids)
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
                                        ? (<string>req.query.acceptedOffers.itemOffered.reservationFor.superEvent.workPerformed.identifiers)
                                            .split(',')
                                            .map((v) => v.trim())
                                        : undefined
                                }
                            }
                        }
                    }
                },
                paymentMethods: {
                    ...{
                        accountIds: (req.query.paymentMethods !== undefined
                            && req.query.paymentMethods.accountIds !== undefined
                            && req.query.paymentMethods.accountIds !== '')
                            ? (<string>req.query.paymentMethods.accountIds).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    // : Object.values(cinerinoapi.factory.paymentMethodType),
                    paymentMethodIds: (req.query.paymentMethods !== undefined
                        && req.query.paymentMethods.paymentMethodIds !== undefined
                        && req.query.paymentMethods.paymentMethodIds !== '')
                        ? (<string>req.query.paymentMethods.paymentMethodIds).split(',')
                            .map((v) => v.trim())
                        : undefined,
                    typeOfs: (req.query.paymentMethods !== undefined
                        && req.query.paymentMethods.typeOfs !== undefined)
                        ? req.query.paymentMethods.typeOfs
                        : undefined
                }
            };

            if (req.query.format === 'datatable') {
                const searchOrdersResult = await iamService.fetch({
                    uri: '/orders/v2',
                    method: 'GET',
                    // tslint:disable-next-line:no-magic-numbers
                    expectedStatusCodes: [200],
                    qs: searchConditions
                })
                    .then(async (response) => {
                        return {
                            data: await response.json()
                        };
                    });
                // const searchOrdersResult = await orderService.search({
                //     ...searchConditions,
                //     ...{
                //         disableTotalCount: true
                //     }
                // });

                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (searchOrdersResult.data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchOrdersResult.data.length),
                    data: searchOrdersResult.data
                });
            } else if (req.query.format === cinerinoapi.factory.encodingFormat.Text.csv) {
                const stream = <NodeJS.ReadableStream>await orderService.download({
                    ...searchConditions,
                    format: cinerinoapi.factory.encodingFormat.Text.csv,
                    limit: undefined,
                    page: undefined
                });
                const filename = 'OrderReport';
                res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.csv`)}`);
                res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Text.csv}; charset=UTF-8`);
                stream.pipe(res);
            } else if (req.query.format === cinerinoapi.factory.encodingFormat.Application.json) {
                const stream = <NodeJS.ReadableStream>await orderService.download({
                    ...searchConditions,
                    format: cinerinoapi.factory.encodingFormat.Application.json,
                    limit: undefined,
                    page: undefined
                });
                const filename = 'OrderReport';
                res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.json`)}`);
                res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Application.json}; charset=UTF-8`);
                stream.pipe(res);
            } else {
                res.render('orders/index', {
                    moment: moment,
                    sellers: searchSellersResult.data,
                    applications: applications,
                    searchConditions: searchConditions,
                    OrderStatus: cinerinoapi.factory.orderStatus,
                    PaymentMethodType: cinerinoapi.factory.paymentMethodType
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 注文詳細
 */
ordersRouter.get(
    '/:orderNumber',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const order = await orderService.findByOrderNumber({
                orderNumber: req.params.orderNumber
            });

            let actionsOnOrder: any[] = [];
            let timelines: TimelineFactory.ITimeline[] = [];
            try {
                actionsOnOrder = await orderService.searchActionsByOrderNumber({
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
            } catch (error) {
                // no op
            }

            res.render('orders/show', {
                moment: moment,
                order: order,
                timelines: timelines,
                ActionStatusType: cinerinoapi.factory.actionStatusType
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 注文返品
 */
ordersRouter.post(
    '/:orderNumber/return',
    async (req, res, next) => {
        try {
            const returnOrderService = new cinerinoapi.service.txn.ReturnOrder({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const returnOrderTransaction = await returnOrderService.start({
                expires: moment()
                    .add(1, 'minutes')
                    .toDate(),
                object: {
                    order: {
                        orderNumber: req.params.orderNumber
                    }
                }
            });
            await returnOrderService.confirm({
                id: returnOrderTransaction.id,
                potentialActions: {
                    returnOrder: {
                        potentialActions: {
                            refundMovieTicket: (req.body.refundMovieTicket === 'on')
                        }
                    }
                }
            });

            res.status(ACCEPTED)
                .end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 注文配送メール送信
 */
ordersRouter.post(
    '/:orderNumber/sendEmailMessage',
    async (req, res, next) => {
        try {
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const taskService = new cinerinoapi.service.Task({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchTransactionsResult = await placeOrderService.search({
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
            const taskAttributes: cinerinoapi.factory.task.IAttributes<cinerinoapi.factory.taskName.SendEmailMessage>[] =
                sendEmailMessageActionAttributes.map((a) => {
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

            const tasks = await Promise.all(taskAttributes.map(async (t) => {
                return taskService.create(t);
            }));

            res.status(CREATED)
                .json(tasks[0]);
        } catch (error) {
            next(error);
        }
    }
);

export default ordersRouter;
