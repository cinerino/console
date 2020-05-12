/**
 * 会員ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import { NO_CONTENT } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const peopleRouter = express.Router();

type IAccountOwnershipInfo =
    // tslint:disable-next-line:max-line-length
    cinerinoapi.factory.ownershipInfo.IOwnershipInfo<cinerinoapi.factory.ownershipInfo.IGoodWithDetail<cinerinoapi.factory.ownershipInfo.AccountGoodType.Account>>;

/**
 * 会員検索
 */
peopleRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const personService = new cinerinoapi.service.Person({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions = {
                // limit: req.query.limit,
                // page: req.query.page,
                id: (req.query.id !== undefined && req.query.id !== '') ? req.query.id : undefined,
                username: (req.query.username !== undefined && req.query.username !== '') ? req.query.username : undefined,
                email: (req.query.email !== undefined && req.query.email !== '') ? req.query.email : undefined,
                telephone: (req.query.telephone !== undefined && req.query.telephone !== '') ? req.query.telephone : undefined,
                familyName: (req.query.familyName !== undefined && req.query.familyName !== '') ? req.query.familyName : undefined,
                givenName: (req.query.givenName !== undefined && req.query.givenName !== '') ? req.query.givenName : undefined
            };
            if (req.query.format === 'datatable') {
                const searchResult = await personService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchResult.totalCount,
                    recordsFiltered: searchResult.totalCount,
                    data: searchResult.data
                });
            } else {
                res.render('people/index', {
                    moment: moment,
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員編集
 */
peopleRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            let message = '';
            const personService = new cinerinoapi.service.Person({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const person = await personService.findById({ id: req.params.id });

            if (req.method === 'DELETE') {
                const physically = req.body.physically === 'on';
                await personService.deletById({ id: person.id, physically: physically });

                res.status(NO_CONTENT)
                    .end();

                return;
            } else if (req.method === 'POST') {
                try {
                    // 管理者としてプロフィール更新の場合、メールアドレスを認証済にセット
                    const additionalProperty = (Array.isArray(req.body.additionalProperty))
                        ? <cinerinoapi.factory.person.IAdditionalProperty>req.body.additionalProperty
                        : [];
                    additionalProperty.push({
                        name: 'email_verified',
                        value: 'true'
                    });
                    const profile = {
                        ...(typeof req.body.familyName === 'string') ? { familyName: req.body.familyName } : {},
                        ...(typeof req.body.givenName === 'string') ? { givenName: req.body.givenName } : {},
                        ...(typeof req.body.telephone === 'string') ? { telephone: req.body.telephone } : {},
                        ...(typeof req.body.email === 'string') ? { email: req.body.email } : {},
                        additionalProperty: additionalProperty
                    };

                    await personService.updateProfile({
                        id: req.params.id,
                        ...profile
                    });

                    req.flash('message', '更新しました');
                    res.redirect(req.originalUrl);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            res.render('people/show', {
                message: message,
                moment: moment,
                person: person
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員注文検索
 */
peopleRouter.get(
    '/:id/orders',
    async (req, res, next) => {
        try {
            const now = new Date();

            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment(now)
                    .add(-1, 'months')
                    .toDate(),
                orderDateThrough: now,
                customer: {
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

/**
 * 予約検索
 */
peopleRouter.get(
    '/:id/reservations',
    async (req, res, next) => {
        try {
            const now = new Date();

            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchResult =
                await personOwnershipInfoService.search<cinerinoapi.factory.chevre.reservationType.EventReservation>({
                    limit: req.query.limit,
                    page: req.query.page,
                    id: req.params.id,
                    typeOfGood: {
                        typeOf: cinerinoapi.factory.chevre.reservationType.EventReservation
                    },
                    ownedFrom: moment(now)
                        .add(-1, 'month')
                        .toDate(),
                    ownedThrough: now
                });
            debug(searchResult.totalCount, 'reservations found.');
            res.json(searchResult);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員プログラム検索
 */
peopleRouter.get(
    '/:id/programMemberships',
    async (req, res, next) => {
        try {
            const now = new Date();

            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchResult =
                await personOwnershipInfoService.search({
                    limit: req.query.limit,
                    page: req.query.page,
                    id: req.params.id,
                    typeOfGood: {
                        typeOf: cinerinoapi.factory.programMembership.ProgramMembershipType.ProgramMembership
                    },
                    ownedFrom: moment(now)
                        .add(-1, 'month')
                        .toDate(),
                    ownedThrough: now
                });
            debug(searchResult.totalCount, 'programMemberships found.');
            res.json(searchResult);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * クレジットカード検索
 */
peopleRouter.get(
    '/:id/creditCards',
    async (req, res, next) => {
        try {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const creditCards = await personOwnershipInfoService.searchCreditCards({ id: req.params.id });

            res.json(creditCards);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * クレジットカード削除
 */
peopleRouter.delete(
    '/:id/creditCards/:cardSeq',
    async (req, res, next) => {
        try {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            await personOwnershipInfoService.deleteCreditCard({
                id: req.params.id,
                cardSeq: req.params.cardSeq
            });

            res.status(NO_CONTENT)
                .end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 口座検索
 */
peopleRouter.get(
    '/:id/accounts',
    async (req, res, next) => {
        try {
            const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const coinAccounts: IAccountOwnershipInfo[] = [];
            let pointAccounts: IAccountOwnershipInfo[] = [];

            // const searchCoinAccountsResult =
            //     await personOwnershipInfoService.search<cinerinoapi.factory.ownershipInfo.AccountGoodType.Account>({
            //         id: req.params.id,
            //         typeOfGood: {
            //             typeOf: cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
            //             accountType: cinerinoapi.factory.paymentMethodType.PrepaidCard
            //         }
            //     });

            const searchPointAccountsResult =
                await personOwnershipInfoService.search<cinerinoapi.factory.ownershipInfo.AccountGoodType.Account>({
                    id: req.params.id,
                    typeOfGood: {
                        typeOf: cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
                        accountType: 'Point'
                    }
                });

            // coinAccounts = searchCoinAccountsResult.data;
            pointAccounts = searchPointAccountsResult.data;

            res.json([...coinAccounts, ...pointAccounts]);
        } catch (error) {
            next(error);
        }
    }
);

export default peopleRouter;
