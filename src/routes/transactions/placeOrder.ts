/**
 * 注文取引ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../../cinerinoapi';

import * as TimelineFactory from '../../factory/timeline';

const debug = createDebug('cinerino-console:routes');
const placeOrderTransactionsRouter = express.Router();

/**
 * 検索
 */
placeOrderTransactionsRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });

            const searchSellersResult = await sellerService.search({});

            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
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
                        ? (<string>req.query.agent.ids).split(',')
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
                object: {
                },
                result: {
                    order: {
                        orderNumbers: (req.query.result !== undefined
                            && req.query.result.order !== undefined
                            && req.query.result.order.orderNumbers !== '')
                            ? (<string>req.query.result.order.orderNumbers).split(',')
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
                const searchScreeningEventsResult = await placeOrderService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchScreeningEventsResult.totalCount,
                    recordsFiltered: searchScreeningEventsResult.totalCount,
                    data: searchScreeningEventsResult.data
                });
            } else if (req.query.format === cinerinoapi.factory.encodingFormat.Text.csv) {
                const stream = <NodeJS.ReadableStream>await placeOrderService.stream({
                    ...searchConditions,
                    format: cinerinoapi.factory.encodingFormat.Text.csv
                });
                const filename = 'TransactionReport';
                res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.csv`)}`);
                res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Text.csv}; charset=UTF-8`);
                stream.pipe(res);
            } else if (req.query.format === cinerinoapi.factory.encodingFormat.Application.json) {
                const stream = <NodeJS.ReadableStream>await placeOrderService.stream({
                    ...searchConditions,
                    format: cinerinoapi.factory.encodingFormat.Application.json
                });
                const filename = 'TransactionReport';
                res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.json`)}`);
                res.setHeader('Content-Type', `${cinerinoapi.factory.encodingFormat.Application.json}; charset=UTF-8`);
                stream.pipe(res);
            } else {
                res.render('transactions/placeOrder/index', {
                    moment: moment,
                    sellers: searchSellersResult.data,
                    TransactionStatusType: cinerinoapi.factory.transactionStatusType,
                    TransactionTasksExportationStatus: cinerinoapi.factory.transactionTasksExportationStatus,
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 取引詳細
 */
placeOrderTransactionsRouter.get(
    '/:transactionId',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });

            const project = await projectService.findById({ id: req.project.id });

            const searchTransactionsResult = await placeOrderService.search({
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                ids: [req.params.transactionId]
            });
            const transaction = searchTransactionsResult.data.shift();
            if (transaction === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('Transaction');
            }

            let actionsOnTransaction: any[] = [];
            try {
                actionsOnTransaction = await placeOrderService.searchActionsByTransactionId({
                    id: transaction.id,
                    sort: { startDate: cinerinoapi.factory.sortType.Ascending }
                });
            } catch (error) {
                // no op
            }

            const transactionAgentUrl = (transaction.agent.memberOf !== undefined)
                ? `/projects/${req.project.id}/people/${transaction.agent.id}`
                : (project.settings !== undefined && project.settings.cognito !== undefined)
                    // tslint:disable-next-line:max-line-length
                    ? `/projects/${req.project.id}/userPools/${project.settings.cognito.customerUserPool.id}/clients/${transaction.agent.id}`
                    : '#';

            let timelines: TimelineFactory.ITimeline[] = [{
                action: {},
                agent: {
                    id: transaction.agent.id,
                    name: transaction.agent.id,
                    url: transactionAgentUrl
                },
                actionName: '開始',
                object: {
                    name: '取引'
                },
                startDate: transaction.startDate,
                actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                actionStatusDescription: 'しました',
                result: undefined
            }];

            timelines.push(...actionsOnTransaction.map((a) => {
                return TimelineFactory.createFromAction({
                    project: req.project,
                    action: a
                });
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
                            object: { name: '取引' },
                            startDate: transaction.endDate,
                            actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                            actionStatusDescription: 'しました',
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
                            object: { name: '取引' },
                            startDate: transaction.endDate,
                            actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                            actionStatusDescription: 'しました',
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
                            object: { name: '取引' },
                            startDate: transaction.endDate,
                            actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                            actionStatusDescription: 'しました',
                            result: undefined
                        });
                        break;
                    default:
                }
            }

            timelines = timelines.sort((a, b) => Number(a.startDate > b.startDate));

            res.render('transactions/placeOrder/show', {
                moment: moment,
                transaction: transaction,
                timelines: timelines,
                ActionStatusType: cinerinoapi.factory.actionStatusType
            });
        } catch (error) {
            next(error);
        }
    }
);

export default placeOrderTransactionsRouter;
