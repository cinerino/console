/**
 * イベントルーター
 */
import * as cinerinoapi from '@cinerino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

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
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchMovieTheatersResult = await organizationService.searchMovieTheaters({});
            const searchConditions: cinerinoapi.factory.chevre.event.screeningEvent.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: cinerinoapi.factory.chevre.sortType.Ascending },
                superEvent: {
                    locationBranchCodes: (req.query.superEventLocationBranchCodes !== undefined)
                        ? req.query.superEventLocationBranchCodes
                        : searchMovieTheatersResult.data.map((m) => m.location.branchCode)
                },
                startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[0]).toDate()
                    : new Date(),
                startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[1]).toDate()
                    : moment().add(1, 'month').toDate(),
                ...req.query
            };
            const searchScreeningEventsResult = await eventService.searchScreeningEvents(searchConditions);
            if (req.query.format === 'datatable') {
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchScreeningEventsResult.totalCount,
                    recordsFiltered: searchScreeningEventsResult.totalCount,
                    data: searchScreeningEventsResult.data
                });
            } else {
                res.render('events/screeningEvent/index', {
                    moment: moment,
                    movieTheaters: searchMovieTheatersResult.data,
                    searchConditions: searchConditions,
                    events: searchScreeningEventsResult.data
                });
            }
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
                // tslint:disable-next-line:no-magic-numbers
                orderDateFrom: moment(event.startDate).add(-3, 'months').toDate(),
                orderDateThrough: new Date(),
                reservedEventIds: [event.id]
            });
            debug(searchOrdersResult.totalCount, 'orders found.');
            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    });
export default eventsRouter;
