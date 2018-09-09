/**
 * 組織ルーター
 */
import * as chevreapi from '@chevre/api-nodejs-client';
import * as cinerinoapi from '@cinerino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';

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
    });
/**
 * 販売者追加
 */
organizationsRouter.all(
    '/movieTheater/new',
    async (req, res, next) => {
        try {
            throw new Error('implementing...');
            // @ts-ignore: Unreachable code error
            let message;
            if (req.method === 'POST') {
                try {
                    // Chevreから情報取得
                    const placeService = new chevreapi.service.Place({
                        endpoint: <string>process.env.CHEVRE_ENDPOINT,
                        auth: chevreAuthClient
                    });
                    const movieTheaterFromChevre = await placeService.findMovieTheaterByBranchCode({ branchCode: req.body.branchCode });
                    const movieTheater: cinerinoapi.factory.organization.movieTheater.IOrganization = {
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
                                    siteId: <string>process.env.GMO_SITE_ID,
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
                } catch (error) {
                    message = error.message;
                }
            }
            res.render('organizations/movieTheater/new', {
                message: message
            });
        } catch (error) {
            next(error);
        }
    });
/**
 * 販売者編集
 */
organizationsRouter.all(
    '/movieTheater/:id',
    async (_, __, next) => {
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
        } catch (error) {
            next(error);
        }
    });
export default organizationsRouter;
