/**
 * ムビチケ決済方法ルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';

import * as cinerinoapi from '../../cinerinoapi';

// const debug = createDebug('cinerino-console:routes');
const movieTicketPaymentMethodRouter = express.Router();

/**
 * 検索
 */
movieTicketPaymentMethodRouter.get(
    '',
    async (req, res, next) => {
        try {
            const paymentMethodService = new cinerinoapi.service.PaymentMethod({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions:
                cinerinoapi.factory.paymentMethod.ISearchConditions<cinerinoapi.factory.paymentMethodType.MovieTicket> = {
                limit: req.query.limit,
                page: req.query.page,
                identifiers: (req.query.identifiers !== undefined && req.query.identifiers !== '')
                    ? (<string>req.query.identifiers).split(',')
                        .map((v) => v.trim())
                    : undefined,
                serviceTypes: (req.query.serviceTypes !== undefined && req.query.serviceTypes !== '')
                    ? (<string>req.query.serviceTypes).split(',')
                        .map((v) => v.trim())
                    : undefined
            };

            if (req.query.format === 'datatable') {
                const { totalCount, data } = await paymentMethodService.searchMovieTickets(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: totalCount,
                    recordsFiltered: totalCount,
                    data: data
                });
            } else {
                res.render('paymentMethods/movieTicket', {
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ムビチケ認証
 */
movieTicketPaymentMethodRouter.all(
    '/check',
    async (req, res, next) => {
        try {
            const paymentService = new cinerinoapi.service.Payment({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const searchSellersResult = await sellerService.search({});
            const sellers = searchSellersResult.data;

            const searchConditions: any = {
                seller: {
                    id: (req.body.seller !== undefined)
                        ? req.body.seller.id
                        : undefined
                },
                identifier: req.body.identifier,
                accessCode: req.body.accessCode,
                serviceOutput: {
                    reservationFor: {
                        id: (req.body.serviceOutput !== undefined
                            && req.body.serviceOutput.reservationFor !== undefined)
                            ? req.body.serviceOutput.reservationFor.id
                            : undefined
                    }
                }
            };

            if (req.body.format === 'datatable') {
                const seller = sellers.find((s) => s.id === searchConditions.seller.id);
                if (seller === undefined) {
                    throw new Error(`Seller ${searchConditions.seller.id} not found`);
                }

                const checkAction = await paymentService.checkMovieTicket({
                    typeOf: cinerinoapi.factory.paymentMethodType.MovieTicket,
                    movieTickets: [{
                        project: { typeOf: req.project.typeOf, id: req.project.id },
                        typeOf: <cinerinoapi.factory.chevre.paymentMethodType.MovieTicket>
                            cinerinoapi.factory.chevre.paymentMethodType.MovieTicket,
                        identifier: searchConditions.identifier,
                        accessCode: searchConditions.accessCode,
                        serviceType: '',
                        serviceOutput: {
                            reservationFor: {
                                // tslint:disable-next-line:max-line-length
                                typeOf: <cinerinoapi.factory.chevre.eventType.ScreeningEvent>cinerinoapi.factory.chevre.eventType.ScreeningEvent,
                                id: searchConditions.serviceOutput.reservationFor.id
                            },
                            reservedTicket: {
                                ticketedSeat: {
                                    typeOf: <cinerinoapi.factory.chevre.placeType.Seat>cinerinoapi.factory.chevre.placeType.Seat,
                                    seatNumber: '',
                                    seatRow: '',
                                    seatSection: ''
                                }
                            }
                        }
                    }],
                    seller: seller
                });

                const result = checkAction.result;
                if (result === undefined) {
                    throw new Error('checkAction.result undefined');
                }

                res.json({
                    draw: req.body.draw,
                    recordsTotal: result.movieTickets.length,
                    recordsFiltered: result.movieTickets.length,
                    data: result.movieTickets
                });
            } else {
                res.render('paymentMethods/movieTicket/check', {
                    searchConditions: searchConditions,
                    sellers: sellers
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ムビチケ詳細
 */
movieTicketPaymentMethodRouter.get(
    '/:identifier',
    async (req, res, next) => {
        try {
            const message = undefined;

            const paymentMethodService = new cinerinoapi.service.PaymentMethod({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchResult = await paymentMethodService.searchMovieTickets({
                limit: 1,
                identifiers: [req.params.identifier]
            });
            const movieTicket = searchResult.data.shift();
            if (movieTicket === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('Movie Ticket');
            }

            res.render('paymentMethods/movieTicket/show', {
                message: message,
                movieTicket: movieTicket,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType,
                PlaceType: cinerinoapi.factory.placeType
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ムビチケの注文検索
 */
movieTicketPaymentMethodRouter.get(
    '/:identifier/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                paymentMethods: {
                    typeOfs: [cinerinoapi.factory.paymentMethodType.MovieTicket],
                    paymentMethodIds: [req.params.identifier]
                }
            });
            res.json(searchResult);
        } catch (error) {
            next(error);
        }
    }
);

export default movieTicketPaymentMethodRouter;
