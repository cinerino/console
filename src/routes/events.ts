/**
 * イベントルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

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
 * イベント検索
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

            const searchConditions: cinerinoapi.factory.chevre.event.screeningEvent.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                eventStatuses: (typeof req.query.eventStatus === 'string' && req.query.eventStatus.length > 0)
                    ? [req.query.eventStatus]
                    : undefined,
                typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent,
                superEvent: {
                    // locationBranchCodes: superEventLocationBranchCodes
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
                name: req.query.name
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
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * イベント詳細
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
 * イベントの注文検索
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
