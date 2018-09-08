/**
 * 組織ルーター
 */
import * as cinerinoapi from '@cinerino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';

const debug = createDebug('cinerino-console:routes');
const organizationsRouter = express.Router();
/**
 * 劇場検索
 */
organizationsRouter.get(
    '/movieTheater',
    async (req, res, next) => {
        try {
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            debug('searching movie theaters...', req.query);
            const searchMovieTheatersResult = await organizationService.searchMovieTheaters({
            });
            debug('movie theaters found.', searchMovieTheatersResult.data);
            res.render('organizations/movieTheater/index', {
                query: req.query,
                movieTheaters: searchMovieTheatersResult.data
            });
        } catch (error) {
            next(error);
        }
    });
/**
 * 劇場追加
 */
organizationsRouter.all(
    '/movieTheater/new',
    async (_, __, next) => {
        try {
            throw new Error('implementing...');
            // let message;
            // const organizationRepo = new cinerino.repository.Organization(cinerino.mongoose.connection);

            // if (req.method === 'POST') {
            //     try {
            //         debug('creating...', req.body);
            //         // COAから劇場情報抽出
            //         const theaterFromCOA = await cinerino.COA.services.master.theater({ theaterCode: req.body.branchCode });
            //         let movieTheater: cinerino.factory.organization.movieTheater.IOrganization = {
            //             id: '',
            //             typeOf: cinerino.factory.organizationType.MovieTheater,
            //             identifier: `${cinerino.factory.organizationType.MovieTheater}-${req.body.branchCode}`,
            //             name: {
            //                 ja: theaterFromCOA.theaterName,
            //                 en: theaterFromCOA.theaterNameEng
            //             },
            //             legalName: {
            //                 ja: '',
            //                 en: ''
            //             },
            //             branchCode: req.body.branchCode,
            //             parentOrganization: {
            //                 name: {
            //                     ja: '佐々木興業株式会社',
            //                     en: 'Cinema Sunshine Co., Ltd.'
            //                 },
            //                 identifier: cinerino.factory.organizationIdentifier.corporation.SasakiKogyo,
            //                 typeOf: cinerino.factory.organizationType.Corporation
            //             },
            //             location: {
            //                 typeOf: cinerino.factory.placeType.MovieTheater,
            //                 branchCode: req.body.branchCode,
            //                 name: {
            //                     ja: theaterFromCOA.theaterName,
            //                     en: theaterFromCOA.theaterNameEng
            //                 }
            //             },
            //             telephone: theaterFromCOA.theaterTelNum,
            //             url: req.body.url,
            //             paymentAccepted: [],
            //             gmoInfo: {
            //                 siteId: <string>process.env.GMO_SITE_ID,
            //                 shopId: req.body['gmoInfo.shopId'],
            //                 shopPass: req.body['gmoInfo.shopPass']
            //             }
            //         };
            //         debug('creating movie...');
            //         const doc = await organizationRepo.organizationModel.create(movieTheater);
            //         movieTheater = doc.toObject();
            //         debug('movie theater created.');
            //         req.flash('message', '劇場を作成しました。');
            //         res.redirect(`/organizations/movieTheater/${movieTheater.id}`);

            //         return;
            //     } catch (error) {
            //         message = error.message;
            //     }
            // }

            // res.render('organizations/movieTheater/new', {
            //     message: message
            // });
        } catch (error) {
            next(error);
        }
    });
/**
 * 劇場編集
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
