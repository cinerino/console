/**
 * 注文ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const ordersRouter = express.Router();
/**
 * 注文検索
 */
ordersRouter.get(
    '',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchMovieTheatersResult = await organizationService.searchMovieTheaters({});

            const orderStatusChoices = [
                cinerinoapi.factory.orderStatus.OrderDelivered,
                cinerinoapi.factory.orderStatus.OrderPickupAvailable,
                cinerinoapi.factory.orderStatus.OrderProcessing,
                cinerinoapi.factory.orderStatus.OrderReturned
            ];
            const searchConditions: cinerinoapi.factory.order.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sellerIds: (req.query.sellerIds !== undefined)
                    ? req.query.sellerIds
                    : searchMovieTheatersResult.data.map((m) => m.id),
                customerMembershipNumbers: (req.query.customerMembershipNumbers !== undefined && req.query.customerMembershipNumbers !== '')
                    ? (<string>req.query.customerMembershipNumbers).split(',').map((v) => v.trim())
                    : [],
                orderNumbers: (req.query.orderNumbers !== undefined && req.query.orderNumbers !== '')
                    ? (<string>req.query.orderNumbers).split(',').map((v) => v.trim())
                    : [],
                orderStatuses: (req.query.orderStatuses !== undefined)
                    ? req.query.orderStatuses
                    : orderStatusChoices,
                orderDateFrom: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                    ? moment(req.query.orderDateRange.split(' - ')[0]).toDate()
                    : moment().add(-1, 'month').toDate(),
                orderDateThrough: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                    ? moment(req.query.orderDateRange.split(' - ')[1]).toDate()
                    : moment().add(1, 'day').toDate(),
                confirmationNumbers: (req.query.confirmationNumbers !== undefined && req.query.confirmationNumbers !== '')
                    ? (<string>req.query.confirmationNumbers).split(',').map((v) => v.trim())
                    : []
            };
            if (req.query.format === 'datatable') {
                const searchOrdersResult = await orderService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: searchOrdersResult.totalCount,
                    data: searchOrdersResult.data
                });
            } else {
                res.render('orders/index', {
                    moment: moment,
                    movieTheaters: searchMovieTheatersResult.data,
                    searchConditions: searchConditions,
                    orderStatusChoices: orderStatusChoices
                });
            }
        } catch (error) {
            next(error);
        }
    });
/**
 * 注文詳細
 */
ordersRouter.get(
    '/:orderNumber',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                orderNumbers: [req.params.orderNumber],
                orderDateFrom: moment('2017-04-20T00:00:00+09:00').toDate(),
                orderDateThrough: new Date()
            });
            const order = searchOrdersResult.data.shift();
            if (order === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('Order');
            }
            const actionsOnOrder = await orderService.searchActionsByOrderNumber({
                orderNumber: order.orderNumber,
                sort: { endDate: cinerinoapi.factory.sortType.Ascending }
            });
            // tslint:disable-next-line:cyclomatic-complexity
            const timelines = actionsOnOrder.map((a) => {
                let agent: any;
                if (a.agent.typeOf === cinerinoapi.factory.personType.Person) {
                    agent = {
                        id: a.agent.id,
                        name: order.customer.name,
                        url: '#'
                    };
                } else if (a.agent.typeOf === cinerinoapi.factory.organizationType.MovieTheater) {
                    agent = {
                        id: a.agent.id,
                        name: order.seller.name,
                        url: `/organizations/movieTheater/${a.agent.id}`
                    };
                }

                let actionName: string;
                switch (a.typeOf) {
                    case cinerinoapi.factory.actionType.OrderAction:
                        actionName = '注文';
                        break;
                    case cinerinoapi.factory.actionType.GiveAction:
                        actionName = '付与';
                        break;
                    case cinerinoapi.factory.actionType.SendAction:
                        if (a.object.typeOf === 'Order') {
                            actionName = '配送';
                        } else if (a.object.typeOf === cinerinoapi.factory.creativeWorkType.EmailMessage) {
                            actionName = '送信';
                        } else {
                            actionName = '送信';
                        }
                        break;
                    case cinerinoapi.factory.actionType.PayAction:
                        actionName = '支払';
                        break;
                    case cinerinoapi.factory.actionType.ReturnAction:
                        if (a.object.typeOf === 'Order') {
                            actionName = '返品';
                        } else {
                            actionName = '返却';
                        }
                        break;
                    case cinerinoapi.factory.actionType.RefundAction:
                        actionName = '返金';
                        break;
                    default:
                        actionName = a.typeOf;
                }

                let object: string;
                switch (a.object.typeOf) {
                    case 'Order':
                        object = '注文';
                        break;
                    case cinerinoapi.factory.action.transfer.give.pointAward.ObjectType.PointAward:
                        object = 'ポイント';
                        break;
                    case cinerinoapi.factory.actionType.SendAction:
                        if (a.object.typeOf === 'Order') {
                            object = '配送';
                        } else if (a.object.typeOf === cinerinoapi.factory.creativeWorkType.EmailMessage) {
                            object = '送信';
                        } else {
                            object = '送信';
                        }
                        break;
                    case cinerinoapi.factory.creativeWorkType.EmailMessage:
                        object = 'Eメール';
                        break;
                    case 'PaymentMethod':
                        object = a.object.paymentMethod.typeOf;
                        break;
                    case cinerinoapi.factory.actionType.PayAction:
                        object = a.object.object.paymentMethod.typeOf;
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
            });
            res.render('orders/show', {
                moment: moment,
                order: order,
                timelines: timelines
            });
        } catch (error) {
            next(error);
        }
    });
export default ordersRouter;
