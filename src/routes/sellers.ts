/**
 * 販売者ルーター
 */
import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as express from 'express';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { NO_CONTENT } from 'http-status';
import * as moment from 'moment';

import * as chevreapi from '../chevreapi';
import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const sellersRouter = express.Router();

/**
 * 販売者検索
 */
sellersRouter.get(
    '',
    async (req, res, next) => {
        try {
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.seller.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                name: req.query.name
            };
            if (req.query.format === 'datatable') {
                const searchResult = await sellerService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                    data: searchResult.data
                });
            } else {
                res.render('sellers/index', {
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 販売者追加
 */
sellersRouter.all(
    '/new',
    async (req, res, next) => {
        try {
            let message;
            let attributes: cinerinoapi.factory.seller.IAttributes<cinerinoapi.factory.organizationType> | undefined;

            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

            if (req.method === 'POST') {
                try {
                    attributes = await createAttributesFromBody({
                        project: project,
                        req: req
                    });
                    debug('creating organization...', attributes);
                    const sellerService = new cinerinoapi.service.Seller({
                        endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                        auth: req.user.authClient
                    });
                    const seller = await sellerService.create<cinerinoapi.factory.organizationType>(attributes);
                    req.flash('message', '販売者を作成しました');
                    res.redirect(`/projects/${req.project.id}/sellers/${seller.id}`);

                    return;
                } catch (error) {
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
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 販売者編集
 */
sellersRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            let message;
            let attributes: cinerinoapi.factory.seller.IAttributes<cinerinoapi.factory.organizationType> | undefined;

            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

            const sellerService = new cinerinoapi.service.Seller({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const seller = await sellerService.findById({ id: req.params.id });

            if (req.method === 'DELETE') {
                await sellerService.deleteById({ id: req.params.id });

                if (Array.isArray(seller.paymentAccepted)) {
                    // 口座があれば解約
                    const accountService = new cinerinoapi.service.Account({
                        endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                        auth: req.user.authClient
                    });

                    const accountPaymentsAccepted
                        = <cinerinoapi.factory.seller.IPaymentAccepted<cinerinoapi.factory.paymentMethodType.Account>[]>
                        seller.paymentAccepted.filter(
                            (p) => p.paymentMethodType === cinerinoapi.factory.paymentMethodType.Account
                        );

                    await Promise.all(accountPaymentsAccepted.map(async (paymentAccepted) => {
                        debug('closing account...', paymentAccepted);
                        await accountService.close({
                            accountType: paymentAccepted.accountType,
                            accountNumber: paymentAccepted.accountNumber
                        });
                    }));
                }

                res.status(NO_CONTENT)
                    .end();

                return;
            } else if (req.method === 'POST') {
                try {
                    attributes = await createAttributesFromBody({
                        project: project,
                        req: req
                    });
                    await sellerService.update({ id: req.params.id, attributes: attributes });
                    req.flash('message', '更新しました');
                    res.redirect(req.originalUrl);

                    return;
                } catch (error) {
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
        } catch (error) {
            next(error);
        }
    }
);

// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
async function createAttributesFromBody(params: {
    project: cinerinoapi.factory.project.IProject;
    req: express.Request;
}): Promise<cinerinoapi.factory.seller.IAttributes<cinerinoapi.factory.organizationType>> {
    if (params.project.settings?.gmo === undefined) {
        throw new Error('Project gmo settings undefined');
    }

    const body = params.req.body;
    const authClient = params.req.user.chevreAuthClient;

    const webAPIIdentifier = body.makesOffer.offeredThrough.identifier;
    const branchCode: string = body.branchCode;
    const initialName = `${params.project.id}-${cinerinoapi.factory.chevre.placeType.MovieTheater}`;
    let movieTheaterFromChevre: cinerinoapi.factory.chevre.place.movieTheater.IPlace | undefined;

    try {
        switch (webAPIIdentifier) {
            case cinerinoapi.factory.service.webAPI.Identifier.COA:
                // COAから情報取得
                let theaterFromCOA: COA.services.master.ITheaterResult | undefined;
                try {
                    theaterFromCOA = await COA.services.master.theater({ theaterCode: branchCode });
                } catch (error) {
                    // no op
                }

                // COAから情報取得できればmovieTheaterFromChevreを上書き
                if (theaterFromCOA !== undefined) {
                    // 日本語フォーマットで電話番号が提供される想定なので変換
                    let formatedPhoneNumber: string = '';
                    if (typeof theaterFromCOA.theaterTelNum === 'string' && theaterFromCOA.theaterTelNum.length > 0) {
                        try {
                            const phoneUtil = PhoneNumberUtil.getInstance();
                            const phoneNumber = phoneUtil.parse(theaterFromCOA.theaterTelNum, 'JP');
                            if (!phoneUtil.isValidNumber(phoneNumber)) {
                                throw new Error('Invalid phone number format.');
                            }

                            formatedPhoneNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
                        } catch (error) {
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
                        screenCount: 0, // 使用しないので適当に
                        kanaName: '', // 使用しないので適当に
                        id: '', // 使用しないので適当に
                        containsPlace: [] // 使用しないので適当に
                    };
                }

                break;

            case cinerinoapi.factory.service.webAPI.Identifier.Chevre:
                // Chevreから情報取得
                const placeService = new chevreapi.service.Place({
                    endpoint: <string>process.env.DEFAULT_CHEVRE_API_ENDPOINT,
                    auth: authClient
                });
                const searchMovieTheatersResult = await placeService.searchMovieTheaters({
                    project: { ids: [params.req.project.id] },
                    branchCodes: [branchCode]
                });
                const movieTheater = searchMovieTheatersResult.data.shift();
                if (movieTheater === undefined) {
                    throw new Error(`Movie Theater ${branchCode} Not Found`);
                }

                movieTheaterFromChevre = await placeService.findMovieTheaterById({ id: movieTheater.id });

                break;

            default:
            // no op
            // throw new Error(`Unsupported WebAPI identifier: ${webAPIIdentifier}`);
        }
    } catch (error) {
        throw new Error(`${webAPIIdentifier}から劇場情報取得時に問題が発生しました: ${error.message}`);
    }

    const paymentAccepted: cinerinoapi.factory.seller.IPaymentAccepted<cinerinoapi.factory.paymentMethodType>[] = [
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

    // if (!Array.isArray(movieTheater.paymentAccepted)) {
    //     movieTheater.paymentAccepted = [];
    // }
    // コイン口座決済を有効にする場合、口座未開設であれば開設する
    // if (body.coinAccountPaymentAccepted === 'on') {
    //     if (body.coinAccountPayment.accountNumber === '') {
    //         // 口座番号の指定がなければ自動開設
    //         const accountService = new cinerinoapi.service.Account({
    //             endpoint: `${params.req.project.settings.API_ENDPOINT}/projects/${params.req.project.id}`,
    //             auth: params.req.user.authClient
    //         });
    //         const account = await accountService.open({
    //             accountType: cinerinoapi.factory.paymentMethodType.PrepaidCard,
    //             name: (body.name.ja !== '') ? body.name.ja : initialName
    //         });
    //         debug('account opened');

    //         paymentAccepted.push(<any>{
    //             paymentMethodType: cinerinoapi.factory.paymentMethodType.PaymentCard,
    //             identifier: account.accountNumber
    //         });
    //     } else {
    //         paymentAccepted.push(<any>{
    //             paymentMethodType: cinerinoapi.factory.paymentMethodType.PaymentCard,
    //             identifier: body.coinAccountPayment.accountNumber
    //         });
    //     }
    // }

    // ポイント口座決済を有効にする場合
    if (body.pointAccountPaymentAccepted === 'on') {
        if (body.pointAccountPayment.accountNumber === '') {
            // 口座番号の指定がなければ自動開設
            const accountService = new cinerinoapi.service.Account({
                endpoint: `${params.req.project.settings.API_ENDPOINT}/projects/${params.req.project.id}`,
                auth: params.req.user.authClient
            });
            const account = await accountService.open({
                accountType: 'Point',
                name: (body.name.ja !== '') ? body.name.ja : initialName
            });
            debug('account opened');

            paymentAccepted.push({
                paymentMethodType: cinerinoapi.factory.paymentMethodType.Account,
                accountType: account.accountType,
                accountNumber: account.accountNumber
            });
        } else {
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

    let hasPOS: any[] = [];
    if (Array.isArray(body.hasPOS)) {
        body.hasPOS.forEach((pos: any) => {
            if (pos.id !== '') {
                hasPOS.push({
                    typeOf: 'POS',
                    id: pos.id,
                    name: pos.name
                });
            }
        });
    }
    hasPOS = hasPOS.sort((a, b) => (String(a.id) < String(b.id)) ? -1 : 1);

    const areaServed: cinerinoapi.factory.seller.IAreaServed[] = [];
    if (Array.isArray(body.areaServed)) {
        body.areaServed.forEach((area: any) => {
            if (area.id !== '') {
                areaServed.push({
                    typeOf: area.typeOf,
                    id: area.id,
                    name: area.name
                });
            }
        });
    }

    const makesOffer: cinerinoapi.factory.seller.IMakesOffer[] = [];
    if (movieTheaterFromChevre !== undefined) {
        makesOffer.push({
            project: { typeOf: params.project.typeOf, id: params.project.id },
            typeOf: cinerinoapi.factory.chevre.offerType.Offer,
            priceCurrency: cinerinoapi.factory.priceCurrency.JPY,
            offeredThrough: {
                typeOf: <'WebAPI'>'WebAPI',
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

    return {
        project: { typeOf: params.project.typeOf, id: params.project.id },
        typeOf: body.typeOf,
        name: {
            ja: (body.name.ja !== undefined && body.name.ja !== '') ? body.name.ja : initialName,
            en: (body.name.en !== undefined && body.name.en !== '') ? body.name.en : initialName
        },
        legalName: {
            ja: (body.name.ja !== undefined && body.name.ja !== '') ? body.name.ja : initialName,
            en: (body.name.en !== undefined && body.name.en !== '') ? body.name.en : initialName
        },
        parentOrganization: params.project.parentOrganization,
        telephone: (body.telephone !== undefined && body.telephone !== '')
            ? body.telephone
            : (movieTheaterFromChevre !== undefined) ? movieTheaterFromChevre.telephone : '',
        url: body.url,
        paymentAccepted: paymentAccepted,
        areaServed: areaServed,
        makesOffer: makesOffer,
        ...{
            hasPOS: hasPOS
        },
        ...(movieTheaterFromChevre !== undefined)
            ? {
                location: {
                    typeOf: movieTheaterFromChevre.typeOf,
                    branchCode: movieTheaterFromChevre.branchCode,
                    name: <any>movieTheaterFromChevre.name
                }
            }
            : { $unset: { location: 1 } }
    };
}

/**
 * 劇場の注文検索
 */
sellersRouter.get(
    '/:id/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
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
        } catch (error) {
            next(error);
        }
    }
);

export default sellersRouter;
