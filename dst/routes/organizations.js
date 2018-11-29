"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 組織ルーター
 */
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const moment = require("moment");
const chevreapi = require("../chevreapi");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const organizationsRouter = express.Router();
/**
 * 販売者検索
 */
organizationsRouter.get('/movieTheater', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const organizationService = new cinerinoapi.service.Organization({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            name: req.query.name
        };
        if (req.query.format === 'datatable') {
            const searchMovieTheatersResult = yield organizationService.searchMovieTheaters(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchMovieTheatersResult.totalCount,
                recordsFiltered: searchMovieTheatersResult.totalCount,
                data: searchMovieTheatersResult.data
            });
        }
        else {
            res.render('organizations/movieTheater/index', {
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 販売者追加
 */
organizationsRouter.all('/movieTheater/new', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let message;
        let attributes;
        if (req.method === 'POST') {
            try {
                attributes = yield createAttributesFromBody({ body: req.body, authClient: req.user.chevreAuthClient });
                debug('creating organization...', attributes);
                const organizationService = new cinerinoapi.service.Organization({
                    endpoint: process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                const movieTheater = yield organizationService.openMovieTheater(attributes);
                req.flash('message', '販売者を作成しました');
                res.redirect(`/organizations/movieTheater/${movieTheater.id}`);
                return;
            }
            catch (error) {
                debug(error);
                message = error.message;
            }
        }
        res.render('organizations/movieTheater/new', {
            message: message,
            attributes: attributes,
            PaymentMethodType: cinerinoapi.factory.paymentMethodType,
            PlaceType: cinerinoapi.factory.placeType
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 販売者編集
 */
organizationsRouter.all('/movieTheater/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let message;
        let attributes;
        const organizationService = new cinerinoapi.service.Organization({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const movieTheater = yield organizationService.findMovieTheaterById({ id: req.params.id });
        if (req.method === 'DELETE') {
            yield organizationService.deleteMovieTheaterById({ id: req.params.id });
            res.status(http_status_1.NO_CONTENT).end();
            return;
        }
        else if (req.method === 'POST') {
            try {
                attributes = yield createAttributesFromBody({ body: req.body, authClient: req.user.chevreAuthClient });
                yield organizationService.updateMovieTheaterById({ id: req.params.id, attributes: attributes });
                req.flash('message', '更新しました');
                res.redirect(req.originalUrl);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('organizations/movieTheater/edit', {
            message: message,
            movieTheater: movieTheater,
            PaymentMethodType: cinerinoapi.factory.paymentMethodType,
            PlaceType: cinerinoapi.factory.placeType
        });
    }
    catch (error) {
        next(error);
    }
}));
// tslint:disable-next-line:max-func-body-length
function createAttributesFromBody(params) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(params);
        // Chevreから情報取得
        const placeService = new chevreapi.service.Place({
            endpoint: process.env.CHEVRE_ENDPOINT,
            auth: params.authClient
        });
        const movieTheaterFromChevre = yield placeService.findMovieTheaterByBranchCode({ branchCode: params.body.branchCode });
        const paymentAccepted = [
            {
                paymentMethodType: cinerinoapi.factory.paymentMethodType.CreditCard,
                gmoInfo: {
                    siteId: process.env.GMO_SITE_ID,
                    shopId: params.body.gmoInfo.shopId,
                    shopPass: params.body.gmoInfo.shopPass
                }
            }
        ];
        // ムビチケ決済を有効にする場合
        if (params.body.movieTicketPaymentAccepted === 'on') {
            paymentAccepted.push({
                paymentMethodType: cinerinoapi.factory.paymentMethodType.MovieTicket,
                movieTicketInfo: params.body.movieTicketInfo
            });
        }
        // if (!Array.isArray(movieTheater.paymentAccepted)) {
        //     movieTheater.paymentAccepted = [];
        // }
        // コイン口座決済を有効にする場合、口座未開設であれば開設する
        if (params.body.coinAccountPaymentAccepted === 'on') {
            if (params.body.coinAccountPayment.accountNumber === '') {
                // const account = await cinerinoapi.service.account.open({
                //     name: movieTheater.name.ja
                // })({
                //     accountNumber: new cinerino.repository.AccountNumber(redisClient),
                //     accountService: new cinerino.pecorinoapi.service.Account({
                //         endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                //         auth: pecorinoAuthClient
                //     })
                // });
                // debug('account opened.');
                // update.paymentAccepted.push({
                //     paymentMethodType: cinerino.factory.paymentMethodType.Pecorino,
                //     accountNumber: account.accountNumber
                // });
            }
            else {
                paymentAccepted.push({
                    paymentMethodType: cinerinoapi.factory.paymentMethodType.Account,
                    accountType: cinerinoapi.factory.accountType.Coin,
                    accountNumber: params.body.coinAccountPayment.accountNumber
                });
            }
        }
        const hasPOS = [];
        if (Array.isArray(params.body.hasPOS)) {
            params.body.hasPOS.forEach((pos) => {
                if (pos.id !== '') {
                    hasPOS.push({
                        typeOf: 'POS',
                        id: pos.id,
                        name: pos.name
                    });
                }
            });
        }
        const areaServed = [];
        if (Array.isArray(params.body.areaServed)) {
            params.body.areaServed.forEach((area) => {
                if (area.id !== '') {
                    areaServed.push({
                        typeOf: area.typeOf,
                        id: area.id,
                        name: area.name
                    });
                }
            });
        }
        return {
            typeOf: cinerinoapi.factory.organizationType.MovieTheater,
            name: movieTheaterFromChevre.name,
            legalName: movieTheaterFromChevre.name,
            parentOrganization: {
                name: {
                    en: 'Motionpicture Co., Ltd.',
                    ja: '株式会社モーションピクチャー'
                },
                identifier: 'Motionpicture',
                typeOf: cinerinoapi.factory.organizationType.Corporation
            },
            location: {
                typeOf: movieTheaterFromChevre.typeOf,
                branchCode: movieTheaterFromChevre.branchCode,
                name: movieTheaterFromChevre.name
            },
            telephone: movieTheaterFromChevre.telephone,
            url: params.body.url,
            paymentAccepted: paymentAccepted,
            hasPOS: hasPOS,
            areaServed: areaServed
        };
    });
}
/**
 * 劇場の注文検索
 */
organizationsRouter.get('/movieTheater/:id/orders', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchOrdersResult = yield orderService.search({
            limit: req.query.limit,
            page: req.query.page,
            sort: { orderDate: cinerinoapi.factory.sortType.Descending },
            orderDateFrom: moment().add(-1, 'months').toDate(),
            orderDateThrough: new Date(),
            seller: {
                typeOf: cinerinoapi.factory.organizationType.MovieTheater,
                ids: [req.params.id]
            }
        });
        debug(searchOrdersResult.totalCount, 'orders found.');
        res.json(searchOrdersResult);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = organizationsRouter;
