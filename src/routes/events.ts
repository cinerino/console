/**
 * イベントルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
// tslint:disable-next-line:no-submodule-imports
import { body } from 'express-validator/check';
import { CREATED } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';
import validator from '../middlewares/validator';

const debug = createDebug('cinerino-console:routes:events');
const eventsRouter = express.Router();
/**
 * 上映イベント検索
 */
eventsRouter.get(
    '/screeningEvent',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const eventService = new cinerinoapi.service.Event({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });

            const searchSellersResult = await sellerService.search({});
            const sellers = searchSellersResult.data;

            // 販売者はデフォルトで全選択
            if (req.query.seller === undefined) {
                req.query.seller = {};
            }
            if (!Array.isArray(req.query.seller.ids)) {
                req.query.seller.ids = sellers.map((s) => s.id);
            }

            let superEventLocationBranchCodes: string[] | undefined;
            const selectedSellers = sellers.filter((s) => req.query.seller.ids.indexOf(s.id) >= 0);
            superEventLocationBranchCodes = selectedSellers.reduce<string[]>(
                (a, b) => {
                    if (Array.isArray(b.makesOffer)) {
                        a.push(...b.makesOffer.map(
                            (offer) => offer.itemOffered.reservationFor.location.branchCode
                        ));
                    }

                    return a;
                },
                []
            );

            const searchConditions: cinerinoapi.factory.chevre.event.screeningEvent.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: cinerinoapi.factory.chevre.sortType.Ascending },
                superEvent: {
                    locationBranchCodes: superEventLocationBranchCodes
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
                name: req.query.name,
                ...<any>{
                    seller: req.query.seller
                }
            };
            if (req.query.format === 'datatable') {
                const searchScreeningEventsResult = await eventService.searchScreeningEvents(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchScreeningEventsResult.totalCount,
                    recordsFiltered: searchScreeningEventsResult.totalCount,
                    data: searchScreeningEventsResult.data
                });
            } else {
                res.render('events/screeningEvent/index', {
                    moment: moment,
                    sellers: searchSellersResult.data,
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    });
/**
 * 上映イベントインポート
 */
eventsRouter.post(
    '/screeningEvent/import',
    ...[
        body('seller.ids')
            .not()
            .isEmpty()
            .withMessage((_, options) => `${options.path} is required`)
            .isArray(),
        body('startRange')
            .not()
            .isEmpty()
            .withMessage((_, options) => `${options.path} is required`)
    ],
    validator,
    async (req, res, next) => {
        try {
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const taskService = new cinerinoapi.service.Task({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });

            const sellerIds = <string[]>req.body.seller.ids;
            const searchSellersResult = await sellerService.search({});
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
                .reduce<cinerinoapi.factory.task.IAttributes<cinerinoapi.factory.taskName.ImportScreeningEvents>[]>(
                    (a, b) => {
                        if (Array.isArray(b.makesOffer)) {
                            a.push(...b.makesOffer.map(
                                (offer) => {
                                    return {
                                        name: <cinerinoapi.factory.taskName.ImportScreeningEvents>
                                            cinerinoapi.factory.taskName.ImportScreeningEvents,
                                        status: cinerinoapi.factory.taskStatus.Ready,
                                        runsAt: new Date(),
                                        remainingNumberOfTries: 1,
                                        numberOfTried: 0,
                                        executionResults: [],
                                        data: {
                                            offeredThrough: offer.offeredThrough,
                                            locationBranchCode: offer.itemOffered.reservationFor.location.branchCode,
                                            importFrom: startFrom,
                                            importThrough: startThrough
                                        }
                                    };
                                }
                            ));
                        }

                        return a;
                    },
                    []
                );
            const tasks = await Promise.all(taskAttributes.map(async (a) => {
                return taskService.create(a);
            }));

            res.status(CREATED)
                .json(tasks);
        } catch (error) {
            next(error);
        }
    });
/**
 * 上映イベント詳細
 */
eventsRouter.get(
    '/screeningEvent/:id',
    async (req, res, next) => {
        try {
            const eventService = new cinerinoapi.service.Event({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const event = await eventService.findScreeningEventById({
                id: req.params.id
            });
            res.render('events/screeningEvent/show', {
                message: '',
                moment: moment,
                event: event,
                orders: []
            });
        } catch (error) {
            next(error);
        }
    });
/**
 * 上映イベントの注文検索
 */
eventsRouter.get(
    '/screeningEvent/:id/orders',
    async (req, res, next) => {
        try {
            const eventService = new cinerinoapi.service.Event({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const event = await eventService.findScreeningEventById({
                id: req.params.id
            });
            // const reservationStartDate = moment(`${event.coaInfo.rsvStartDate} 00:00:00+09:00`, 'YYYYMMDD HH:mm:ssZ').toDate();
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Ascending },
                orderDateFrom: moment(event.startDate)
                    // tslint:disable-next-line:no-magic-numbers
                    .add(-3, 'months')
                    .toDate(),
                orderDateThrough: new Date(),
                acceptedOffers: {
                    itemOffered: {
                        reservationFor: { ids: [event.id] }
                    }
                }
            });
            debug(searchOrdersResult.totalCount, 'orders found.');
            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    });
export default eventsRouter;
