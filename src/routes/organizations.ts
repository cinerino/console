/**
 * 組織ルーター
 */
import * as chevreapi from '@chevre/api-nodejs-client';
import * as cinerinoapi from '@cinerino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
import { NO_CONTENT } from 'http-status';

const debug = createDebug('cinerino-console:routes');
const chevreAuthClient = new chevreapi.auth.ClientCredentials({
    domain: <string>process.env.CHEVRE_AUTHORIZE_SERVER_DOMAIN,
    clientId: <string>process.env.CHEVRE_CLIENT_ID,
    clientSecret: <string>process.env.CHEVRE_CLIENT_SECRET,
    scopes: [],
    state: ''
});
const organizationsRouter = express.Router();
/**
 * 販売者検索
 */
organizationsRouter.get(
    '/movieTheater',
    async (req, res, next) => {
        try {
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.organization.movieTheater.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                name: req.query.name
            };
            if (req.query.format === 'datatable') {
                const searchMovieTheatersResult = await organizationService.searchMovieTheaters(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchMovieTheatersResult.totalCount,
                    recordsFiltered: searchMovieTheatersResult.totalCount,
                    data: searchMovieTheatersResult.data
                });
            } else {
                res.render('organizations/movieTheater/index', {
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
organizationsRouter.all(
    '/movieTheater/new',
    async (req, res, next) => {
        try {
            let message;
            let attributes: cinerinoapi.factory.organization.IAttributes<cinerinoapi.factory.organizationType.MovieTheater> | undefined;
            if (req.method === 'POST') {
                try {
                    attributes = await createAttributesFromBody({ body: req.body });
                    debug('creating organization...', attributes);
                    const organizationService = new cinerinoapi.service.Organization({
                        endpoint: <string>process.env.API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    const movieTheater = await organizationService.openMovieTheater(attributes);
                    req.flash('message', '販売者を作成しました');
                    res.redirect(`/organizations/movieTheater/${movieTheater.id}`);

                    return;
                } catch (error) {
                    debug(error);
                    message = error.message;
                }
            }
            res.render('organizations/movieTheater/new', {
                message: message,
                attributes: attributes,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType
            });
        } catch (error) {
            next(error);
        }
    }
);
/**
 * 販売者編集
 */
organizationsRouter.all(
    '/movieTheater/:id',
    async (req, res, next) => {
        try {
            let message;
            let attributes: cinerinoapi.factory.organization.IAttributes<cinerinoapi.factory.organizationType.MovieTheater> | undefined;
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const movieTheater = await organizationService.findMovieTheaterById({ id: req.params.id });
            if (req.method === 'DELETE') {
                await organizationService.deleteMovieTheaterById({ id: req.params.id });
                res.status(NO_CONTENT).end();

                return;
            } else if (req.method === 'POST') {
                try {
                    attributes = await createAttributesFromBody({ body: req.body });
                    // if (!Array.isArray(movieTheater.paymentAccepted)) {
                    //     movieTheater.paymentAccepted = [];
                    // }
                    // update.paymentAccepted = movieTheater.paymentAccepted;
                    // // ポイント決済を有効にする場合、口座未開設であれば開設する
                    // if (update.pecorinoPaymentAccepted === 'on') {
                    //     // tslint:disable-next-line:max-line-length
                    //    if (movieTheater.paymentAccepted.find(
                    //        (p) => p.paymentMethodType === cinerino.factory.paymentMethodType.Pecorino) === undefined
                    //    ) {
                    //         const account = await cinerino.service.account.open({
                    //             name: movieTheater.name.ja
                    //         })({
                    //             accountNumber: new cinerino.repository.AccountNumber(redisClient),
                    //             accountService: new cinerino.pecorinoapi.service.Account({
                    //                 endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                    //                 auth: pecorinoAuthClient
                    //             })
                    //         });
                    //         debug('account opened.');
                    //         update.paymentAccepted.push({
                    //             paymentMethodType: cinerino.factory.paymentMethodType.Pecorino,
                    //             accountNumber: account.accountNumber
                    //         });
                    //     }
                    // }
                    await organizationService.updateMovieTheaterById({ id: req.params.id, attributes: attributes });
                    req.flash('message', '更新しました');
                    res.redirect(req.originalUrl);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }
            res.render('organizations/movieTheater/edit', {
                message: message,
                movieTheater: movieTheater,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType
            });
        } catch (error) {
            next(error);
        }
    }
);
async function createAttributesFromBody(params: {
    body: any;
}): Promise<cinerinoapi.factory.organization.IAttributes<cinerinoapi.factory.organizationType.MovieTheater>> {
    // Chevreから情報取得
    const placeService = new chevreapi.service.Place({
        endpoint: <string>process.env.CHEVRE_ENDPOINT,
        auth: chevreAuthClient
    });
    const movieTheaterFromChevre = await placeService.findMovieTheaterByBranchCode({ branchCode: params.body.branchCode });

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
        paymentAccepted: [
            {
                paymentMethodType: cinerinoapi.factory.paymentMethodType.CreditCard,
                gmoInfo: {
                    siteId: <string>process.env.GMO_SITE_ID,
                    shopId: params.body['gmoInfo.shopId'],
                    shopPass: params.body['gmoInfo.shopPass']
                }
            }
        ]
    };
}
export default organizationsRouter;
