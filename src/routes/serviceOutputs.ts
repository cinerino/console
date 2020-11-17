/**
 * サービスアウトプットルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

// const debug = createDebug('cinerino-console:routes');
const serviceOutputsRouter = express.Router();

/**
 * カード追加
 */
// serviceOutputsRouter.all(
//     '/new',
//     async (req, res, next) => {
//         try {
//             let message;
//             let attributes: cinerinoapi.factory.paymentMethod.paymentCard.prepaidCard.IPrepaidCard | undefined;

//             const projectService = new cinerinoapi.service.Project({
//                 endpoint: req.project.settings.API_ENDPOINT,
//                 auth: req.user.authClient
//             });
//             const project = await projectService.findById({ id: req.project.id });

//             if (req.method === 'POST') {
//                 try {
//                     attributes = createAttributesFromBody({
//                         project: project,
//                         req: req
//                     });
//                     const paymentServiceService = new cinerinoapi.service.PaymentMethod({
//                         endpoint: req.project.settings.API_ENDPOINT,
//                         auth: req.user.authClient,
//                         project: { id: req.project.id }
//                     });
//                     const prepaidCard = await paymentServiceService.createPrepaidCard(<any>attributes);
//                     req.flash('message', 'プリペイドカードを作成しました');
//                     res.redirect(`/projects/${req.project.id}/paymentMethods/prepaidCard/${prepaidCard.identifier}`);

//                     return;
//                 } catch (error) {
//                     console.error(error);
//                     message = error.message;
//                 }
//             }

//             res.render('paymentMethods/prepaidCard/new', {
//                 message: message,
//                 attributes: attributes
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

/**
 * 検索
 */
serviceOutputsRouter.get(
    '',
    async (req, res, next) => {
        try {
            const serviceOutputService = new cinerinoapi.service.ServiceOutput({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const searchConditions: any = {
                limit: req.query.limit,
                page: req.query.page,
                typeOf: {
                    ...(typeof req.query?.typeOf?.$eq === 'string')
                        ? { $eq: req.query?.typeOf?.$eq }
                        : { $exists: true }
                },
                identifier: (typeof req.query.identifier === 'string' && req.query.identifier.length > 0)
                    ? { $eq: req.query.identifier }
                    : undefined,
                issuedBy: {
                    id: (typeof req.query.issuedBy?.id?.$eq === 'string' && req.query.issuedBy.id.$eq.length > 0)
                        ? { $eq: req.query.issuedBy.id.$eq }
                        : undefined
                },
                issuedThrough: {
                    id: (typeof req.query.issuedThrough?.id?.$eq === 'string' && req.query.issuedThrough.id.$eq.length > 0)
                        ? { $eq: req.query.issuedThrough.id.$eq }
                        : undefined
                }
            };

            if (req.query.format === 'datatable') {
                const { data } = await serviceOutputService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(data.length),
                    data: data
                });
            } else {
                // ペイメントカードを検索
                const productService = new cinerinoapi.service.Product({
                    endpoint: req.project.settings.API_ENDPOINT,
                    auth: req.user.authClient,
                    project: { id: req.project.id }
                });

                let paymentCards: any[] = [];
                try {
                    const searchPaymentCardsResult = await productService.search({
                        typeOf: { $eq: cinerinoapi.factory.chevre.service.paymentService.PaymentServiceType.PaymentCard }
                    });
                    paymentCards = searchPaymentCardsResult.data;
                } catch (error) {
                    // no op
                }

                let membershipServices: any[] = [];
                try {
                    const searchMembershipServicesResult = await productService.search({
                        typeOf: { $eq: cinerinoapi.factory.chevre.product.ProductType.MembershipService }
                    });
                    membershipServices = searchMembershipServicesResult.data;
                } catch (error) {
                    // no op
                }

                let accountServices: any[] = [];
                try {
                    const searchAccountServicesResult = await productService.search({
                        typeOf: { $eq: cinerinoapi.factory.chevre.product.ProductType.PaymentCard }
                    });
                    accountServices = searchAccountServicesResult.data;
                } catch (error) {
                    // no op
                }

                // 販売者検索
                const sellerService = new cinerinoapi.service.Seller({
                    endpoint: req.project.settings.API_ENDPOINT,
                    auth: req.user.authClient,
                    project: { id: req.project.id }
                });
                const searchSellersResult = await sellerService.search({ limit: 100 });

                res.render('serviceOutputs', {
                    searchConditions: searchConditions,
                    paymentCards: paymentCards,
                    membershipServices: membershipServices,
                    accountServices: accountServices,
                    sellers: searchSellersResult.data
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * カード認証
 */
serviceOutputsRouter.all(
    '/check',
    async (req, res, next) => {
        try {
            const paymentService = new cinerinoapi.service.Payment({
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
                    typeOf: cinerinoapi.factory.chevre.service.paymentService.PaymentServiceType.MovieTicket,
                    movieTickets: [{
                        project: { typeOf: req.project.typeOf, id: req.project.id },
                        typeOf: cinerinoapi.factory.chevre.paymentMethodType.MovieTicket,
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
                    seller: {
                        typeOf: seller.typeOf,
                        id: String(seller.id)
                    }
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
                res.render('serviceOutputs/check', {
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
 * カード詳細
 */
// serviceOutputsRouter.get(
//     '/:identifier',
//     async (req, res, next) => {
//         try {
//             const message = undefined;

//             const paymentMethodService = new cinerinoapi.service.PaymentMethod({
//                 endpoint: req.project.settings.API_ENDPOINT,
//                 auth: req.user.authClient,
//                 project: { id: req.project.id }
//             });
//             const searchResult = await paymentMethodService.searchPrepaidCards({
//                 limit: 1,
//                 identifier: { $eq: req.params.identifier }
//             });
//             const prepaidCard = searchResult.data.shift();
//             if (prepaidCard === undefined) {
//                 throw new cinerinoapi.factory.errors.NotFound('PrepaidCard');
//             }

//             res.render('paymentMethods/prepaidCard/show', {
//                 message: message,
//                 prepaidCard: prepaidCard
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

/**
 * カードの注文検索
 */
// serviceOutputsRouter.get(
//     '/:identifier/orders',
//     async (req, res, next) => {
//         try {
//             const orderService = new cinerinoapi.service.Order({
//                 endpoint: req.project.settings.API_ENDPOINT,
//                 auth: req.user.authClient,
//                 project: { id: req.project.id }
//             });
//             const searchResult = await orderService.search({
//                 limit: req.query.limit,
//                 page: req.query.page,
//                 sort: { orderDate: cinerinoapi.factory.sortType.Descending },
//                 paymentMethods: {
//                     typeOfs: [''],
//                     paymentMethodIds: [req.params.identifier]
//                 }
//             });
//             res.json(searchResult);
//         } catch (error) {
//             next(error);
//         }
//     }
// );

export default serviceOutputsRouter;
