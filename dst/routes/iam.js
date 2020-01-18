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
 * IAMメンバー検索
 */
iamRouter.get('/members', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const searchRolesResult = yield iamService.searchRoles({ limit: 100 });
        if (req.method === 'POST') {
            try {
                attributes = createAttributesFromBody({ req: req });
                const iamMember = yield iamService.createMember(attributes);
                req.flash('message', 'IAMメンバーを作成しました');
                res.redirect(`/projects/${req.project.id}/iam/members/${iamMember.member.id}`);
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
    const hasRole = (Array.isArray(body.roleName))
        ? body.roleName
            .filter((r) => typeof r === 'string' && r.length > 0)
            .map((r) => {
            return {
                roleName: String(r)
            };
        })
        : [];
    return {
        member: {
            applicationCategory: (body.member !== undefined && body.member !== null)
                ? body.member.applicationCategory : '',
            typeOf: (body.member !== undefined && body.member !== null)
                ? body.member.typeOf : '',
            id: (body.member !== undefined && body.member !== null)
                ? body.member.id : '',
            hasRole: hasRole
        }
    };
}
/**
 * IAMメンバー(me)
 */
iamRouter.all('/members/me', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message = '';
        const iamService = new cinerinoapi.service.IAM({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const member = yield iamService.findMemberById({ member: { id: 'me' } });
        const profile = yield iamService.getMemberProfile({ member: { id: 'me' } });
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
 * IAMメンバー
 */
iamRouter.all('/members/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = '';
        const iamService = new cinerinoapi.service.IAM({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        if (req.method === 'DELETE') {
            yield iamService.deleteMember({
                member: { id: req.params.id }
            });
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        else if (req.method === 'PUT') {
            const attributes = createAttributesFromBody({ req: req });
            yield iamService.updateMember({
                member: {
                    id: req.params.id,
                    hasRole: attributes.member.hasRole
                }
            });
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        const member = yield iamService.findMemberById({ member: { id: req.params.id } });
        if (member.member.typeOf === cinerinoapi.factory.creativeWorkType.WebApplication) {
            res.redirect(`/projects/${req.project.id}/applications/${member.member.id}`);
            return;
        }
        const profile = yield iamService.getMemberProfile({ member: { id: req.params.id } });
        const searchRolesResult = yield iamService.searchRoles({ limit: 100 });
        res.render('iam/members/show', {
            message: message,
            moment: moment,
            member: member,
            profile: profile,
            roles: searchRolesResult.data
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * IAMメンバープロフィール更新
 */
iamRouter.put('/members/:id/profile', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const iamService = new cinerinoapi.service.IAM({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
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
        res.status(http_status_1.NO_CONTENT)
            .end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * IAMメンバー注文検索
 */
iamRouter.get('/members/:id/orders', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
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
        // let message = '';
        const iamService = new cinerinoapi.service.IAM({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        // const user = await iamService.findUserById({ id: req.params.id });
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
                // message = error.message;
            }
        }
        res.redirect(`/projects/${req.project.id}/iam/members/${req.params.id}`);
        // res.render('iam/users/show', {
        //     message: message,
        //     moment: moment,
        //     user: user
        // });
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
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
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
