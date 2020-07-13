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
 * 販売者ルーター
 */
const COA = require("@motionpicture/coa-service");
const createDebug = require("debug");
const express = require("express");
const google_libphonenumber_1 = require("google-libphonenumber");
const http_status_1 = require("http-status");
const moment = require("moment");
const chevreapi = require("../chevreapi");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const sellersRouter = express.Router();
/**
 * 販売者検索
 */
sellersRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            name: req.query.name
        };
        if (req.query.format === 'datatable') {
            const searchResult = yield sellerService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                // recordsTotal: searchOrdersResult.totalCount,
                recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                    ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                    : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                data: searchResult.data
            });
        }
        else {
            res.render('sellers/index', {
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
sellersRouter.all('/new', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        let attributes;
        const projectService = new cinerinoapi.service.Project({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        if (req.method === 'POST') {
            try {
                attributes = yield createAttributesFromBody({
                    project: project,
                    req: req
                });
                debug('creating organization...', attributes);
                const sellerService = new cinerinoapi.service.Seller({
                    endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                    auth: req.user.authClient
                });
                const seller = yield sellerService.create(attributes);
                req.flash('message', '販売者を作成しました');
                res.redirect(`/projects/${req.project.id}/sellers/${seller.id}`);
                return;
            }
            catch (error) {
                debug(error);
                message = error.message;
            }
        }
        res.render('sellers/new', {
            message: message,
            attributes: attributes,
            PaymentMethodType: cinerinoapi.factory.paymentMethodType,
            OrganizationType: cinerinoapi.factory.organizationType,
            PlaceType: { Online: 'Online', Store: 'Store' },
            WebAPIIdentifier: cinerinoapi.factory.service.webAPI.Identifier,
            project: project
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 販売者編集
 */
sellersRouter.all('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        let attributes;
        const projectService = new cinerinoapi.service.Project({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const seller = yield sellerService.findById({ id: req.params.id });
        if (req.method === 'DELETE') {
            yield sellerService.deleteById({ id: req.params.id });
            if (Array.isArray(seller.paymentAccepted)) {
                // 口座があれば解約
                const accountService = new cinerinoapi.service.Account({
                    endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                    auth: req.user.authClient
                });
                const accountPaymentsAccepted = seller.paymentAccepted.filter((p) => p.paymentMethodType === cinerinoapi.factory.paymentMethodType.Account);
                yield Promise.all(accountPaymentsAccepted.map((paymentAccepted) => __awaiter(void 0, void 0, void 0, function* () {
                    debug('closing account...', paymentAccepted);
                    yield accountService.close({
                        accountType: paymentAccepted.accountType,
                        accountNumber: paymentAccepted.accountNumber
                    });
                })));
            }
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        else if (req.method === 'POST') {
            try {
                attributes = yield createAttributesFromBody({
                    project: project,
                    req: req
                });
                yield sellerService.update({ id: req.params.id, attributes: attributes });
                req.flash('message', '更新しました');
                res.redirect(req.originalUrl);
                return;
            }
            catch (error) {
                console.error(error);
                message = error.message;
            }
        }
        res.render('sellers/edit', {
            message: message,
            seller: seller,
            PaymentMethodType: cinerinoapi.factory.paymentMethodType,
            OrganizationType: cinerinoapi.factory.organizationType,
            PlaceType: { Online: 'Online', Store: 'Store' },
            WebAPIIdentifier: cinerinoapi.factory.service.webAPI.Identifier,
            project: project
        });
    }
    catch (error) {
        next(error);
    }
}));
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
function createAttributesFromBody(params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (((_a = params.project.settings) === null || _a === void 0 ? void 0 : _a.gmo) === undefined) {
            throw new Error('Project gmo settings undefined');
        }
        const body = params.req.body;
        const authClient = params.req.user.chevreAuthClient;
        const webAPIIdentifier = body.makesOffer.offeredThrough.identifier;
        const branchCode = body.branchCode;
        const initialName = `${params.project.id}-${cinerinoapi.factory.chevre.placeType.MovieTheater}`;
        let movieTheaterFromChevre;
        try {
            switch (webAPIIdentifier) {
                case cinerinoapi.factory.service.webAPI.Identifier.COA:
                    // COAから情報取得
                    let theaterFromCOA;
                    try {
                        theaterFromCOA = yield COA.services.master.theater({ theaterCode: branchCode });
                    }
                    catch (error) {
                        // no op
                    }
                    // COAから情報取得できればmovieTheaterFromChevreを上書き
                    if (theaterFromCOA !== undefined) {
                        // 日本語フォーマットで電話番号が提供される想定なので変換
                        let formatedPhoneNumber = '';
                        if (typeof theaterFromCOA.theaterTelNum === 'string' && theaterFromCOA.theaterTelNum.length > 0) {
                            try {
                                const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
                                const phoneNumber = phoneUtil.parse(theaterFromCOA.theaterTelNum, 'JP');
                                if (!phoneUtil.isValidNumber(phoneNumber)) {
                                    throw new Error('Invalid phone number format.');
                                }
                                formatedPhoneNumber = phoneUtil.format(phoneNumber, google_libphonenumber_1.PhoneNumberFormat.E164);
                            }
                            catch (error) {
                                throw new Error(`電話番号フォーマット時に問題が発生しました:${error.message}`);
                            }
                        }
                        movieTheaterFromChevre = {
                            project: { typeOf: params.req.project.typeOf, id: params.req.project.id },
                            typeOf: cinerinoapi.factory.chevre.placeType.MovieTheater,
                            branchCode: theaterFromCOA.theaterCode,
                            name: {
                                ja: (theaterFromCOA !== undefined) ? theaterFromCOA.theaterName : initialName,
                                en: (theaterFromCOA !== undefined) ? theaterFromCOA.theaterNameEng : initialName
                            },
                            telephone: formatedPhoneNumber,
                            screenCount: 0,
                            kanaName: '',
                            id: '',
                            containsPlace: [] // 使用しないので適当に
                        };
                    }
                    break;
                case cinerinoapi.factory.service.webAPI.Identifier.Chevre:
                    // Chevreから情報取得
                    const placeService = new chevreapi.service.Place({
                        endpoint: process.env.DEFAULT_CHEVRE_API_ENDPOINT,
                        auth: authClient
                    });
                    const searchMovieTheatersResult = yield placeService.searchMovieTheaters({
                        project: { ids: [params.req.project.id] },
                        branchCodes: [branchCode]
                    });
                    const movieTheater = searchMovieTheatersResult.data.shift();
                    if (movieTheater === undefined) {
                        throw new Error(`Movie Theater ${branchCode} Not Found`);
                    }
                    movieTheaterFromChevre = yield placeService.findMovieTheaterById({ id: movieTheater.id });
                    break;
                default:
                // no op
                // throw new Error(`Unsupported WebAPI identifier: ${webAPIIdentifier}`);
            }
        }
        catch (error) {
            throw new Error(`${webAPIIdentifier}から劇場情報取得時に問題が発生しました: ${error.message}`);
        }
        const paymentAccepted = [
            {
                paymentMethodType: cinerinoapi.factory.paymentMethodType.CreditCard,
                gmoInfo: {
                    siteId: params.project.settings.gmo.siteId,
                    shopId: body.gmoInfo.shopId,
                    shopPass: body.gmoInfo.shopPass
                }
            }
        ];
        // ムビチケ決済を有効にする場合
        if (body.movieTicketPaymentAccepted === 'on') {
            paymentAccepted.push({
                paymentMethodType: cinerinoapi.factory.paymentMethodType.MovieTicket,
                movieTicketInfo: body.movieTicketInfo
            });
        }
        // ポイント口座決済を有効にする場合
        if (body.pointAccountPaymentAccepted === 'on') {
            if (body.pointAccountPayment.accountNumber === '') {
                // 口座番号の指定がなければ自動開設
                const accountService = new cinerinoapi.service.Account({
                    endpoint: `${params.req.project.settings.API_ENDPOINT}/projects/${params.req.project.id}`,
                    auth: params.req.user.authClient
                });
                const account = yield accountService.open({
                    accountType: 'Point',
                    name: (body.name.ja !== '') ? body.name.ja : initialName
                });
                debug('account opened');
                paymentAccepted.push({
                    paymentMethodType: cinerinoapi.factory.paymentMethodType.Account,
                    accountType: account.accountType,
                    accountNumber: account.accountNumber
                });
            }
            else {
                paymentAccepted.push({
                    paymentMethodType: cinerinoapi.factory.paymentMethodType.Account,
                    accountType: 'Point',
                    accountNumber: body.pointAccountPayment.accountNumber
                });
            }
        }
        // 現金決済を有効にする場合
        if (body.cashPaymentAccepted === 'on') {
            paymentAccepted.push({
                paymentMethodType: cinerinoapi.factory.paymentMethodType.Cash
            });
        }
        // 電子マネー決済を有効にする場合
        if (body.emoneyPaymentAccepted === 'on') {
            paymentAccepted.push({
                paymentMethodType: cinerinoapi.factory.paymentMethodType.EMoney
            });
        }
        // その他の決済を有効にする場合
        if (body.othersPaymentAccepted === 'on') {
            paymentAccepted.push({
                paymentMethodType: cinerinoapi.factory.paymentMethodType.Others
            });
        }
        const hasPOS = [];
        const areaServed = [];
        const makesOffer = [];
        if (movieTheaterFromChevre !== undefined) {
            makesOffer.push({
                project: { typeOf: params.project.typeOf, id: params.project.id },
                typeOf: cinerinoapi.factory.chevre.offerType.Offer,
                priceCurrency: cinerinoapi.factory.priceCurrency.JPY,
                offeredThrough: {
                    typeOf: 'WebAPI',
                    identifier: webAPIIdentifier
                },
                itemOffered: {
                    typeOf: cinerinoapi.factory.chevre.reservationType.EventReservation,
                    reservationFor: {
                        typeOf: cinerinoapi.factory.chevre.eventType.ScreeningEventSeries,
                        location: {
                            typeOf: movieTheaterFromChevre.typeOf,
                            branchCode: movieTheaterFromChevre.branchCode
                        }
                    }
                }
            });
        }
        return Object.assign(Object.assign({ project: { typeOf: params.project.typeOf, id: params.project.id }, typeOf: body.typeOf, name: {
                ja: (body.name.ja !== undefined && body.name.ja !== '') ? body.name.ja : initialName,
                en: (body.name.en !== undefined && body.name.en !== '') ? body.name.en : initialName
            }, legalName: {
                ja: (body.name.ja !== undefined && body.name.ja !== '') ? body.name.ja : initialName,
                en: (body.name.en !== undefined && body.name.en !== '') ? body.name.en : initialName
            }, parentOrganization: params.project.parentOrganization, telephone: (body.telephone !== undefined && body.telephone !== '')
                ? body.telephone
                : (movieTheaterFromChevre !== undefined) ? movieTheaterFromChevre.telephone : '', url: body.url, paymentAccepted: paymentAccepted, areaServed: areaServed, makesOffer: makesOffer }, {
            hasPOS: hasPOS
        }), (movieTheaterFromChevre !== undefined)
            ? {
                location: {
                    typeOf: movieTheaterFromChevre.typeOf,
                    branchCode: movieTheaterFromChevre.branchCode,
                    name: movieTheaterFromChevre.name
                }
            }
            : { $unset: { location: 1 } });
    });
}
/**
 * 劇場の注文検索
 */
sellersRouter.get('/:id/orders', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchOrdersResult = yield orderService.search({
            limit: req.query.limit,
            page: req.query.page,
            sort: { orderDate: cinerinoapi.factory.sortType.Descending },
            orderDateFrom: moment()
                .add(-1, 'day')
                .toDate(),
            orderDateThrough: new Date(),
            seller: {
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
exports.default = sellersRouter;
