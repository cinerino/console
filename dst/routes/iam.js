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
 * IAMルーター
 */
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const iamRouter = express.Router();
/**
 * IAMロール検索
 */
iamRouter.get('/roles', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iamService = new cinerinoapi.service.IAM({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
        // limit: req.query.limit,
        // page: req.query.page,
        };
        if (req.query.format === 'datatable') {
            const searchResult = yield iamService.searchRoles(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchResult.totalCount,
                recordsFiltered: searchResult.totalCount,
                data: searchResult.data
            });
        }
        else {
            res.render('iam/roles/index', {
                moment: moment,
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * プロジェクトメンバー検索
 */
iamRouter.get('/members', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iamService = new cinerinoapi.service.IAM({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
        // limit: req.query.limit,
        // page: req.query.page
        };
        if (req.query.format === 'datatable') {
            const searchResult = yield iamService.searchMembers(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchResult.totalCount,
                recordsFiltered: searchResult.totalCount,
                data: searchResult.data
            });
        }
        else {
            res.render('iam/members/index', {
                moment: moment,
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * IAMメンバー追加
 */
iamRouter.all('/members/new', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        let attributes;
        const iamService = new cinerinoapi.service.IAM({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchRolesResult = yield iamService.searchRoles({ limit: 100 });
        if (req.method === 'POST') {
            try {
                attributes = createAttributesFromBody({ req: req });
                const iamMember = yield iamService.fetch({
                    uri: '/iam/members',
                    method: 'POST',
                    // tslint:disable-next-line:no-magic-numbers
                    expectedStatusCodes: [201],
                    body: attributes
                })
                    .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                    return response.json();
                }));
                req.flash('message', 'IAMメンバーを作成しました');
                res.redirect(`/projects/${req.project.id}/members/${iamMember.member.id}`);
                return;
            }
            catch (error) {
                debug(error);
                message = error.message;
            }
        }
        res.render('iam/members/new', {
            message: message,
            attributes: attributes,
            roles: searchRolesResult.data
        });
    }
    catch (error) {
        next(error);
    }
}));
function createAttributesFromBody(params) {
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
 * プロジェクトメンバー(me)
 */
iamRouter.all('/members/me', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message = '';
        const iamService = new cinerinoapi.service.IAM({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const member = yield iamService.findMemberById({ id: 'me' });
        const profile = yield iamService.getMemberProfile({ id: 'me' });
        if (req.method === 'DELETE') {
            // 何もしない
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        else if (req.method === 'POST') {
            try {
                // 何もしない
                res.status(http_status_1.NO_CONTENT)
                    .end();
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('iam/members/show', {
            message: message,
            moment: moment,
            member: member,
            profile: profile
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * プロジェクトメンバー(me)
 */
iamRouter.all('/members/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message = '';
        const iamService = new cinerinoapi.service.IAM({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const member = yield iamService.findMemberById({ id: req.params.id });
        if (member.typeOf === cinerinoapi.factory.creativeWorkType.WebApplication) {
            res.redirect(`/projects/${req.project.id}/applications/${member.id}`);
            return;
        }
        const profile = yield iamService.getMemberProfile({ id: req.params.id });
        if (req.method === 'DELETE') {
            // 何もしない
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        else if (req.method === 'POST') {
            try {
                // 何もしない
                res.status(http_status_1.NO_CONTENT)
                    .end();
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('iam/members/show', {
            message: message,
            moment: moment,
            member: member,
            profile: profile
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * プロジェクトメンバー注文検索
 */
iamRouter.get('/members/:id/orders', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchOrdersResult = yield orderService.search({
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
    }
    catch (error) {
        next(error);
    }
}));
/**
 * IAMユーザー検索
 */
iamRouter.get('/users', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const iamService = new cinerinoapi.service.IAM({
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
            const searchResult = yield iamService.searchUsers(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchResult.totalCount,
                recordsFiltered: searchResult.totalCount,
                data: searchResult.data
            });
        }
        else {
            res.render('iam/users/index', {
                moment: moment,
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * IAMユーザー編集
 */
iamRouter.all('/users/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message = '';
        const iamService = new cinerinoapi.service.IAM({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const user = yield iamService.findUserById({ id: req.params.id });
        if (req.method === 'DELETE') {
            // 何もしない
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        else if (req.method === 'POST') {
            try {
                // 管理者としてプロフィール更新の場合、メールアドレスを認証済にセット
                const additionalProperty = (Array.isArray(req.body.additionalProperty))
                    ? req.body.additionalProperty
                    : [];
                additionalProperty.push({
                    name: 'email_verified',
                    value: 'true'
                });
                const profile = Object.assign(Object.assign({}, req.body), { additionalProperty: additionalProperty });
                yield iamService.updateUserProfile(Object.assign({ id: req.params.id }, profile));
                req.flash('message', '更新しました');
                res.redirect(req.originalUrl);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('iam/users/show', {
            message: message,
            moment: moment,
            user: user
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ユーザー注文検索
 */
iamRouter.get('/users/:id/orders', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                .add(-1, 'months')
                .toDate(),
            orderDateThrough: new Date(),
            customer: {
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
exports.default = iamRouter;
