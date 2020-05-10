"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * プリペイドカードルーター
 */
// import * as createDebug from 'debug';
const express = require("express");
const cinerinoapi = require("../../cinerinoapi");
// const debug = createDebug('cinerino-console:routes');
const prepaidCardPaymentMethodRouter = express.Router();
/**
 * カード追加
 */
// prepaidCardPaymentMethodRouter.all(
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
// prepaidCardPaymentMethodRouter.get(
//     '',
//     async (req, res, next) => {
//         try {
//             const paymentMethodService = new cinerinoapi.service.PaymentMethod({
//                 endpoint: req.project.settings.API_ENDPOINT,
//                 auth: req.user.authClient,
//                 project: { id: req.project.id }
//             });
//             const searchConditions:
//                 cinerinoapi.factory.paymentMethod.ISearchConditions<cinerinoapi.factory.paymentMethodType.PrepaidCard> = {
//                 limit: req.query.limit,
//                 page: req.query.page,
//                 ...{
//                     identifier: (typeof req.query.identifier === 'string' && req.query.identifier.length > 0)
//                         ? { $eq: req.query.identifier }
//                         : undefined
//                 }
//             };
//             if (req.query.format === 'datatable') {
//                 const { totalCount, data } = await paymentMethodService.searchPrepaidCards(searchConditions);
//                 res.json({
//                     draw: req.query.draw,
//                     recordsTotal: totalCount,
//                     recordsFiltered: totalCount,
//                     data: data
//                 });
//             } else {
//                 res.render('paymentMethods/prepaidCard', {
//                     searchConditions: searchConditions
//                 });
//             }
//         } catch (error) {
//             next(error);
//         }
//     }
// );
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
// function createAttributesFromBody(params: {
//     project: cinerinoapi.factory.project.IProject;
//     req: express.Request;
// }): cinerinoapi.factory.paymentMethod.paymentCard.prepaidCard.IPrepaidCard {
//     return {
//         project: { typeOf: params.project.typeOf, id: params.project.id },
//         typeOf: cinerinoapi.factory.paymentMethodType.PrepaidCard,
//         identifier: '',
//         accessCode: params.req.body.accessCode,
//         serviceOutput: {},
//         ...{
//             name: params.req.body.name
//         }
//     };
// }
/**
 * カード認証
 */
prepaidCardPaymentMethodRouter.all('/check', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const searchSellersResult = yield sellerService.search({});
        const sellers = searchSellersResult.data;
        const searchConditions = {
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
            const checkAction = yield paymentService.checkMovieTicket({
                typeOf: cinerinoapi.factory.paymentMethodType.MovieTicket,
                movieTickets: [{
                        project: { typeOf: req.project.typeOf, id: req.project.id },
                        typeOf: cinerinoapi.factory.chevre.paymentMethodType.MovieTicket,
                        identifier: searchConditions.identifier,
                        accessCode: searchConditions.accessCode,
                        serviceType: '',
                        serviceOutput: {
                            reservationFor: {
                                // tslint:disable-next-line:max-line-length
                                typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEvent,
                                id: searchConditions.serviceOutput.reservationFor.id
                            },
                            reservedTicket: {
                                ticketedSeat: {
                                    typeOf: cinerinoapi.factory.chevre.placeType.Seat,
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
        }
        else {
            res.render('paymentMethods/prepaidCard/check', {
                searchConditions: searchConditions,
                sellers: sellers
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * カード詳細
 */
// prepaidCardPaymentMethodRouter.get(
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
// prepaidCardPaymentMethodRouter.get(
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
//                     typeOfs: [cinerinoapi.factory.paymentMethodType.PrepaidCard],
//                     paymentMethodIds: [req.params.identifier]
//                 }
//             });
//             res.json(searchResult);
//         } catch (error) {
//             next(error);
//         }
//     }
// );
exports.default = prepaidCardPaymentMethodRouter;
