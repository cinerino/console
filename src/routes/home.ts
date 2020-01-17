/**
 * プロジェクトホームルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import * as moment from 'moment-timezone';

import * as cinerinoapi from '../cinerinoapi';

import * as TimelineFactory from '../factory/timeline';

// const debug = createDebug('cinerino-console:routes');
const homeRouter = express.Router();

homeRouter.get(
    '',
    async (req, res, next) => {
        try {
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });

            const project = await projectService.findById({ id: req.project.id });

            let userPool: cinerinoapi.factory.cognito.UserPoolType | undefined;
            let adminUserPool: cinerinoapi.factory.cognito.UserPoolType | undefined;
            let applications: any[] = [];

            try {
                if (project.settings !== undefined && project.settings.cognito !== undefined) {
                    userPool = await userPoolService.findById({
                        userPoolId: project.settings.cognito.customerUserPool.id
                    });

                    adminUserPool = await userPoolService.findById({
                        userPoolId: project.settings.cognito.adminUserPool.id
                    });
                }

                // IAMメンバー検索(アプリケーション)
                const searchMembersResult = await iamService.searchMembers({
                    member: { typeOf: { $eq: cinerinoapi.factory.creativeWorkType.WebApplication } }
                });
                applications = searchMembersResult.data.map((m) => m.member);
            } catch (error) {
                // no op
            }

            const searchSellersResult = await sellerService.search({});

            res.render('home', {
                message: 'Welcome to Cinerino Console!',
                userPool: userPool,
                applications: applications,
                adminUserPool: adminUserPool,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType,
                sellers: searchSellersResult.data,
                moment: moment,
                timelines: []
            });
        } catch (error) {
            next(error);
        }
    }
);

homeRouter.get(
    '/countNewOrder',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.order.ISearchConditions = {
                limit: 1,
                page: 1,
                orderDateFrom: moment()
                    .tz('Asia/Tokyo')
                    .startOf('day')
                    .toDate()
            };
            const { totalCount } = await orderService.search(searchConditions);
            res.json({
                totalCount: totalCount
            });
        } catch (error) {
            next(error);
        }
    }
);

homeRouter.get(
    '/aggregateExitRate',
    async (req, res, next) => {
        try {
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                limit: 1,
                page: 1,
                startFrom: moment()
                    .tz('Asia/Tokyo')
                    .startOf('day')
                    .toDate(),
                statuses: [
                    cinerinoapi.factory.transactionStatusType.Confirmed,
                    cinerinoapi.factory.transactionStatusType.Canceled,
                    cinerinoapi.factory.transactionStatusType.Expired
                ]
            };
            const searchResult = await placeOrderService.search(searchConditions);
            searchConditions.statuses = [
                cinerinoapi.factory.transactionStatusType.Canceled,
                cinerinoapi.factory.transactionStatusType.Expired
            ];
            const searchExitResult = await placeOrderService.search(searchConditions);
            res.json({
                rate: (searchResult.totalCount > 0)
                    // tslint:disable-next-line:no-magic-numbers
                    ? Math.floor(searchExitResult.totalCount / searchResult.totalCount * 100)
                    : 0
            });
        } catch (error) {
            next(error);
        }
    }
);

homeRouter.get(
    '/countNewUser',
    async (req, res, next) => {
        try {
            const actionService = new cinerinoapi.service.Action({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const { totalCount } = await actionService.search({
                limit: 1,
                page: 1,
                typeOf: cinerinoapi.factory.actionType.RegisterAction,
                object: {
                    typeOf: { $in: [cinerinoapi.factory.programMembership.ProgramMembershipType.ProgramMembership] }
                    // id: { $in: [''] }
                },
                actionStatusTypes: [cinerinoapi.factory.actionStatusType.CompletedActionStatus],
                startFrom: moment()
                    .tz('Asia/Tokyo')
                    .startOf('day')
                    .toDate()
            });

            res.json({
                totalCount: totalCount
            });
        } catch (error) {
            next(error);
        }
    }
);

homeRouter.get(
    '/countNewTransaction',
    async (req, res, next) => {
        try {
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                limit: 1,
                page: 1,
                startFrom: moment()
                    .tz('Asia/Tokyo')
                    .startOf('day')
                    .toDate()
            };
            const { totalCount } = await placeOrderService.search(searchConditions);
            res.json({
                totalCount: totalCount
            });
        } catch (error) {
            next(error);
        }
    }
);

homeRouter.get(
    '/timelines',
    async (req, res, next) => {
        try {
            const timelines: TimelineFactory.ITimeline[] = [];
            const actionService = new cinerinoapi.service.Action({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            try {
                const searchActionsResult = await actionService.search({
                    limit: 10,
                    sort: { startDate: cinerinoapi.factory.sortType.Descending },
                    startFrom: moment(req.query.startFrom)
                        .toDate(),
                    startThrough: moment(req.query.startThrough)
                        .toDate()
                });
                timelines.push(...searchActionsResult.data.map((a) => {
                    return TimelineFactory.createFromAction({
                        project: req.project,
                        action: a
                    });
                }));
            } catch (error) {
                // no op
                console.error(error);
            }

            res.json(timelines);
        } catch (error) {
            next(error);
        }
    }
);

homeRouter.get(
    '/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: (req.query.sort !== undefined) ? req.query.sort : { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment(req.query.orderDateFrom)
                    .toDate(),
                orderDateThrough: moment(req.query.orderDateThrough)
                    .toDate()
            });
            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    }
);

homeRouter.get(
    '/dbStats',
    async (req, res) => {
        try {
            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const stats = await projectService.getDBStats({});

            res.json(stats);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR)
                .json({
                    error: { message: error.message }
                });
        }
    }
);

homeRouter.get(
    '/health',
    async (req, res) => {
        try {
            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const health = await projectService.getHealth({});

            res.json(health);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR)
                .json({
                    error: { message: error.message }
                });
        }
    }
);

homeRouter.get(
    '/queueCount',
    async (req, res) => {
        try {
            const taskService = new cinerinoapi.service.Task({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const result = await taskService.search({
                limit: 1,
                runsFrom: moment()
                    .add(-1, 'day')
                    .toDate(),
                runsThrough: moment()
                    .toDate(),
                statuses: [cinerinoapi.factory.taskStatus.Ready]
            });

            res.json(result);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR)
                .json({
                    error: { message: error.message }
                });
        }
    }
);

export default homeRouter;
