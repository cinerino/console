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

eventsRouter.get(
    '/chevreBackend',
    async (__, res, next) => {
        try {
            const url = <string>process.env.CHEVRE_CONSOLE_URL;

            res.redirect(url);
        } catch (error) {
            console.error(error);
            next(error);
        }
    }
);

/**
 * 上映イベント検索
 */
eventsRouter.get(
    '',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const eventService = new cinerinoapi.service.Event({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
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
                eventStatuses: (req.query.eventStatuses !== undefined)
                    ? req.query.eventStatuses
                    : undefined,
                typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent,
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
                ...{
                    seller: req.query.seller
                }
            };
            if (req.query.format === 'datatable') {
                const searchScreeningEventsResult = await eventService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchScreeningEventsResult.totalCount,
                    recordsFiltered: searchScreeningEventsResult.totalCount,
                    data: searchScreeningEventsResult.data
                });
            } else {
                res.render('events/index', {
                    EventStatusType: cinerinoapi.factory.chevre.eventStatusType,
                    moment: moment,
                    sellers: searchSellersResult.data,
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 上映イベントインポート
 */
eventsRouter.post(
    '/import',
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
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const taskService = new cinerinoapi.service.Task({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
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
                                        data: {
                                            importFrom: startFrom,
                                            importThrough: startThrough,
                                            locationBranchCode: offer.itemOffered.reservationFor.location.branchCode,
                                            offeredThrough: offer.offeredThrough,
                                            project: { typeOf: req.project.typeOf, id: req.project.id }
                                        },
                                        executionResults: [],
                                        name: <cinerinoapi.factory.taskName.ImportScreeningEvents>
                                            cinerinoapi.factory.taskName.ImportScreeningEvents,
                                        numberOfTried: 0,
                                        project: { typeOf: req.project.typeOf, id: req.project.id },
                                        remainingNumberOfTries: 1,
                                        runsAt: new Date(),
                                        status: cinerinoapi.factory.taskStatus.Ready
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
    }
);

/**
 * 上映イベント詳細
 */
eventsRouter.get(
    '/:id',
    async (req, res, next) => {
        try {
            const eventService = new cinerinoapi.service.Event({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const event = await eventService.findById({
                id: req.params.id
            });
            res.render('events/show', {
                message: '',
                moment: moment,
                event: event,
                orders: []
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * イベントのオファー検索
 */
eventsRouter.get(
    '/:id/offers',
    async (req, res, next) => {
        try {
            const eventService = new cinerinoapi.service.Event({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const event = await eventService.findById({
                id: req.params.id
            });

            let offers = [];
            const aggregateOffer = (<any>event).aggregateOffer;
            if (aggregateOffer !== undefined && aggregateOffer !== null) {
                offers = aggregateOffer.offers;
            }

            res.json({ data: offers });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 上映イベントの注文検索
 */
eventsRouter.get(
    '/:id/orders',
    async (req, res, next) => {
        try {
            const eventService = new cinerinoapi.service.Event({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const event = await eventService.findById({
                id: req.params.id
            });
            // const reservationStartDate = moment(`${event.coaInfo.rsvStartDate} 00:00:00+09:00`, 'YYYYMMDD HH:mm:ssZ').toDate();
            const searchOrdersResult = await orderService.search({
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
        } catch (error) {
            next(error);
        }
    }
);

export default eventsRouter;
