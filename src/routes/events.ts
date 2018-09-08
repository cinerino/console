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
                superEvent: {
                    locationBranchCodes: searchMovieTheatersResult.data.map((m) => m.location.branchCode)
                },
                superEventLocationIds: searchMovieTheatersResult.data.map((m) => m.id),
                startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[0]).toDate()
                    : new Date(),
                startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[1]).toDate()
                    : moment().add(1, 'day').toDate(),
                ...req.query
            };

            debug('searching events...', searchConditions);
            const searchScreeningEventsResult = await eventService.searchScreeningEvents(searchConditions);
            debug(searchScreeningEventsResult.totalCount, 'events found.');
            res.render('events/screeningEvent/index', {
                movieTheaters: searchMovieTheatersResult.data,
                searchConditions: searchConditions,
                events: searchScreeningEventsResult.data
            });
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
            debug('req.query:', req.query);
            const eventService = new cinerinoapi.service.Event({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchMovieTheatersResult = await organizationService.searchMovieTheaters({});

            debug('searching events...');
            const event = await eventService.findScreeningEventById({
                id: req.params.id
            });
            debug('events found.', event);

            // イベント開催の劇場取得
            const movieTheater = searchMovieTheatersResult.data.find((o) => o.location.branchCode === event.superEvent.location.branchCode);
            if (movieTheater === undefined) {
                throw new Error('Movie Theater Not Found');
            }
            // const screeningRoom = movieTheater.containsPlace.find((p) => p.branchCode === event.location.branchCode);
            // debug('searching orders by event...');
            // const reservationStartDate = moment(`${event.coaInfo.rsvStartDate} 00:00:00+09:00`, 'YYYYMMDD HH:mm:ssZ').toDate();
            const searchOrdersResult = await orderService.search({
                // tslint:disable-next-line:no-magic-numbers
                orderDateFrom: moment(event.startDate).add(-3, 'months').toDate(),
                orderDateThrough: new Date(),
                reservedEventIds: [event.id]
            });
            debug(searchOrdersResult.totalCount, 'orders found.');

            res.render('events/screeningEvent/show', {
                moment: moment,
                movieTheater: movieTheater,
                screeningRoom: {},
                movieTheaters: searchMovieTheatersResult.data,
                event: event,
                orders: searchOrdersResult.data
            });
        } catch (error) {
            next(error);
        }
    });

export default eventsRouter;
