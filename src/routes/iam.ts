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
 * IAMロール検索
 */
iamRouter.get(
    '/roles',
    async (req, res, next) => {
        try {
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                roleName: (req.query.roleName !== undefined
                    && typeof req.query.roleName.$eq === 'string'
                    && req.query.roleName.$eq.length > 0)
                    ? { $eq: req.query.roleName.$eq }
                    : undefined
            };

            if (req.query.format === 'datatable') {
                const searchResult = await iamService.searchRoles(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchResult.totalCount,
                    recordsFiltered: searchResult.totalCount,
                    data: searchResult.data
                });
            } else {
                res.render('iam/roles/index', {
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
 * IAMメンバー検索
 */
iamRouter.get(
    '/members',
    async (req, res, next) => {
        try {
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const searchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                member: {
                    typeOf: (req.query.member !== undefined
                        && req.query.member.typeOf !== undefined
                        && typeof req.query.member.typeOf.$eq === 'string'
                        && req.query.member.typeOf.$eq.length > 0)
                        ? { $eq: req.query.member.typeOf.$eq }
                        : undefined
                }
            };

            if (req.query.format === 'datatable') {
                const searchResult = await iamService.searchMembers(searchConditions);

                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchResult.totalCount,
                    recordsFiltered: searchResult.totalCount,
                    data: searchResult.data
                });
            } else {
                res.render('iam/members/index', {
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
 * IAMメンバー追加
 */
iamRouter.all(
    '/members/new',
    async (req, res, next) => {
        try {
            let message;
            let attributes: any;

            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchRolesResult = await iamService.searchRoles({ limit: 100 });

            if (req.method === 'POST') {
                try {
                    attributes = createAttributesFromBody({ req: req });

                    const iamMember = await iamService.fetch({
                        uri: '/iam/members',
                        method: 'POST',
                        // tslint:disable-next-line:no-magic-numbers
                        expectedStatusCodes: [201],
                        body: attributes
                    })
                        .then(async (response) => {
                            return response.json();
                        });

                    req.flash('message', 'IAMメンバーを作成しました');
                    res.redirect(`/projects/${req.project.id}/iam/members/${iamMember.member.id}`);

                    return;
                } catch (error) {
                    debug(error);
                    message = error.message;
                }
            }

            res.render('iam/members/new', {
                message: message,
                attributes: attributes,
                roles: searchRolesResult.data
            });
        } catch (error) {
            next(error);
        }
    }
);

function createAttributesFromBody(params: {
    req: express.Request;
}): any {
    const body = params.req.body;

    return {
        member: {
            applicationCategory: (body.member !== undefined && body.member !== null)
                ? body.member.applicationCategory : '',
            typeOf: (body.member !== undefined && body.member !== null)
                ? body.member.typeOf : '',
            id: (body.member !== undefined && body.member !== null)
                ? body.member.id : '',
            hasRole: [{ roleName: body.roleName }]
        }
    };
}

/**
 * IAMメンバー(me)
 */
iamRouter.all(
    '/members/me',
    async (req, res, next) => {
        try {
            let message = '';

            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const member = await iamService.findMemberById({ id: 'me' });
            const profile = await iamService.getMemberProfile({ id: 'me' });

            if (req.method === 'DELETE') {
                // 何もしない
                res.status(NO_CONTENT)
                    .end();

                return;
            } else if (req.method === 'POST') {
                try {
                    // 何もしない
                    res.status(NO_CONTENT)
                        .end();

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            res.render('iam/members/show', {
                message: message,
                moment: moment,
                member: member,
                profile: profile
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * IAMメンバー
 */
iamRouter.all(
    '/members/:id',
    async (req, res, next) => {
        try {
            let message = '';

            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const member = await iamService.findMemberById({ id: req.params.id });

            if (req.method === 'DELETE') {
                await iamService.fetch({
                    uri: `/iam/members/${req.params.id}`,
                    method: 'DELETE',
                    // tslint:disable-next-line:no-magic-numbers
                    expectedStatusCodes: [204]
                });

                res.status(NO_CONTENT)
                    .end();

                return;
            } else if (req.method === 'POST') {
                try {
                    // 何もしない
                    res.status(NO_CONTENT)
                        .end();

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            if ((<any>member.member.typeOf) === cinerinoapi.factory.creativeWorkType.WebApplication) {
                res.redirect(`/projects/${req.project.id}/applications/${member.member.id}`);

                return;
            }

            const profile = await iamService.getMemberProfile({ id: req.params.id });

            res.render('iam/members/show', {
                message: message,
                moment: moment,
                member: member,
                profile: profile
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * IAMメンバー注文検索
 */
iamRouter.get(
    '/members/:id/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment(req.query.orderDateFrom)
                    .toDate(),
                orderDateThrough: moment(req.query.orderDateThrough)
                    .toDate(),
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
 * IAMユーザー検索
 */
iamRouter.get(
    '/users',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
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
                auth: req.user.authClient,
                project: { id: req.project.id }
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
                auth: req.user.authClient,
                project: { id: req.project.id }
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
