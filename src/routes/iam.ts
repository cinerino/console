/**
 * IAMルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import { NO_CONTENT } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const iamRouter = express.Router();

/**
 * IAMユーザー検索
 */
iamRouter.get(
    '/users',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
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
                const searchResult = await iamService.searchUsers(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchResult.totalCount,
                    recordsFiltered: searchResult.totalCount,
                    data: searchResult.data
                });
            } else {
                res.render('iam/users/index', {
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
 * IAMユーザー編集
 */
iamRouter.all(
    '/users/:id',
    async (req, res, next) => {
        try {
            let message = '';
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const user = await iamService.findUserById({ id: req.params.id });

            if (req.method === 'DELETE') {
                // 何もしない
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
                        ...req.body,
                        additionalProperty: additionalProperty
                    };

                    await iamService.updateUserProfile({
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

            res.render('iam/users/show', {
                message: message,
                moment: moment,
                user: user
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ユーザー注文検索
 */
iamRouter.get(
    '/users/:id/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment()
                    .add(-1, 'months')
                    .toDate(),
                orderDateThrough: new Date(),
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

export default iamRouter;
