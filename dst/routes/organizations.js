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
const chevreapi = require("@chevre/api-nodejs-client");
const cinerinoapi = require("@cinerino/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const debug = createDebug('cinerino-console:routes');
const chevreAuthClient = new chevreapi.auth.ClientCredentials({
    domain: process.env.CHEVRE_AUTHORIZE_SERVER_DOMAIN,
    clientId: process.env.CHEVRE_CLIENT_ID,
    clientSecret: process.env.CHEVRE_CLIENT_SECRET,
    scopes: [],
    state: ''
});
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
        throw new Error('implementing...');
        // @ts-ignore: Unreachable code error
        let message;
        if (req.method === 'POST') {
            try {
                // Chevreから情報取得
                const placeService = new chevreapi.service.Place({
                    endpoint: process.env.CHEVRE_ENDPOINT,
                    auth: chevreAuthClient
                });
                const movieTheaterFromChevre = yield placeService.findMovieTheaterByBranchCode({ branchCode: req.body.branchCode });
                const movieTheater = {
                    id: '',
                    typeOf: cinerinoapi.factory.organizationType.MovieTheater,
                    identifier: `${cinerinoapi.factory.organizationType.MovieTheater}-${req.body.branchCode}`,
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
                    url: req.body.url,
                    paymentAccepted: [
                        {
                            paymentMethodType: cinerinoapi.factory.paymentMethodType.CreditCard,
                            gmoInfo: {
                                siteId: process.env.GMO_SITE_ID,
                                shopId: req.body['gmoInfo.shopId'],
                                shopPass: req.body['gmoInfo.shopPass']
                            }
                        }
                    ]
                };
                debug('creating organization...', movieTheater);
                // const doc = await organizationRepo.organizationModel.create(movieTheater);
                // movieTheater = doc.toObject();
                // req.flash('message', '劇場を作成しました。');
                // res.redirect(`/organizations/movieTheater/${movieTheater.id}`);
                res.redirect('/organizations/movieTheater/new');
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('organizations/movieTheater/new', {
            message: message
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 販売者編集
 */
organizationsRouter.all('/movieTheater/:id', (_, __, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        throw new Error('implementing...');
        // let message;
        // const organizationService = new cinerinoapi.service.Organization({
        //     endpoint: <string>process.env.API_ENDPOINT,
        //     auth: req.user.authClient
        // });
        // const organizationRepo = new cinerino.repository.Organization(cinerino.mongoose.connection);
        // const doc = await organizationRepo.organizationModel.findById(req.params.id).exec();
        // if (doc === null) {
        //     throw new cinerino.factory.errors.NotFound('Movie theater');
        // }
        // const movieTheater = <cinerino.factory.organization.movieTheater.IOrganization>doc.toObject();
        // if (Array.isArray(movieTheater.paymentAccepted) &&
        //    movieTheater.paymentAccepted.find(
        //        (p) => p.paymentMethodType === cinerino.factory.paymentMethodType.Pecorino) !== undefined
        //    ) {
        //     (<any>movieTheater).pecorinoPaymentAccepted = 'on';
        // }
        // if (req.method === 'POST') {
        //     try {
        //         const update = req.body;
        //         if (!Array.isArray(movieTheater.paymentAccepted)) {
        //             movieTheater.paymentAccepted = [];
        //         }
        //         update.paymentAccepted = movieTheater.paymentAccepted;
        //         // ポイント決済を有効にする場合、口座未開設であれば開設する
        //         if (update.pecorinoPaymentAccepted === 'on') {
        //             // tslint:disable-next-line:max-line-length
        //            if (movieTheater.paymentAccepted.find(
        //                (p) => p.paymentMethodType === cinerino.factory.paymentMethodType.Pecorino) === undefined
        //            ) {
        //                 const account = await cinerino.service.account.open({
        //                     name: movieTheater.name.ja
        //                 })({
        //                     accountNumber: new cinerino.repository.AccountNumber(redisClient),
        //                     accountService: new cinerino.pecorinoapi.service.Account({
        //                         endpoint: <string>process.env.PECORINO_API_ENDPOINT,
        //                         auth: pecorinoAuthClient
        //                     })
        //                 });
        //                 debug('account opened.');
        //                 update.paymentAccepted.push({
        //                     paymentMethodType: cinerino.factory.paymentMethodType.Pecorino,
        //                     accountNumber: account.accountNumber
        //                 });
        //             }
        //         }
        //         debug('updating movie theater:', update);
        //         await organizationRepo.organizationModel.findByIdAndUpdate(movieTheater.id, update).exec();
        //         debug('movie theater updated.');
        //         req.flash('message', '更新しました。');
        //         res.redirect(req.originalUrl);
        //         return;
        //     } catch (error) {
        //         message = error.message;
        //     }
        // }
        // res.render('organizations/movieTheater/edit', {
        //     message: message
        //     // movieTheater: movieTheater
        // });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = organizationsRouter;
