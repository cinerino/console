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
 * 認可ルーター
 */
const createDebug = require("debug");
const express = require("express");
// import { ACCEPTED, CREATED } from 'http-status';
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const TimelineFactory = require("../factory/timeline");
const debug = createDebug('cinerino-console:routes');
const authorizationsRouter = express.Router();
/**
 * 検索
 */
authorizationsRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const authorizationService = new cinerinoapi.service.Authorization({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { validFrom: cinerinoapi.factory.sortType.Descending },
            codes: (req.query.codes !== undefined && req.query.codes !== '')
                ? req.query.codes.split(',')
                    .map((v) => v.trim())
                : undefined,
            validFrom: (req.query.validRange !== undefined && req.query.validRange !== '')
                ? moment(req.query.validRange.split(' - ')[0])
                    .toDate()
                : undefined,
            validThrough: (req.query.validRange !== undefined && req.query.validRange !== '')
                ? moment(req.query.validRange.split(' - ')[1])
                    .toDate()
                : undefined,
            object: {
                typeOfs: (req.query.object !== undefined
                    && req.query.object.typeOfs !== undefined
                    && req.query.object.typeOfs !== '')
                    ? req.query.object.typeOfs.split(',')
                        .map((v) => v.trim())
                    : undefined,
                ids: (req.query.object !== undefined
                    && req.query.object.ids !== undefined
                    && req.query.object.ids !== '')
                    ? req.query.object.ids.split(',')
                        .map((v) => v.trim())
                    : undefined,
                typeOfGood: {
                    typeOfs: (req.query.object !== undefined
                        && req.query.object.typeOfGood !== undefined
                        && req.query.object.typeOfGood.typeOfs !== undefined
                        && req.query.object.typeOfGood.typeOfs !== '')
                        ? req.query.object.typeOfGood.typeOfs.split(',')
                            .map((v) => v.trim())
                        : undefined,
                    ids: (req.query.object !== undefined
                        && req.query.object.typeOfGood !== undefined
                        && req.query.object.typeOfGood.ids !== undefined
                        && req.query.object.typeOfGood.ids !== '')
                        ? req.query.object.typeOfGood.ids.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            }
        };
        if (req.query.format === 'datatable') {
            const searchResult = yield authorizationService.search(searchConditions);
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
            res.render('authorizations/index', {
                moment: moment,
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
authorizationsRouter.all('/:id', 
// tslint:disable-next-line:max-func-body-length
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = undefined;
        const actionService = new cinerinoapi.service.Action({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const authorizationService = new cinerinoapi.service.Authorization({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchAuthorizationsResult = yield authorizationService.search({
            limit: 1,
            id: { $in: [req.params.id] }
        });
        const authorization = searchAuthorizationsResult.data.shift();
        if (authorization === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('Authorization');
        }
        // アクション
        const actionsOnAuthorizations = [];
        const timelines = [];
        try {
            // コード発行
            const searchAuthorizeActionsResult = yield actionService.search({
                limit: 100,
                sort: { startDate: cinerinoapi.factory.sortType.Ascending },
                typeOf: cinerinoapi.factory.actionType.AuthorizeAction,
                result: {
                    typeOf: { $in: ['Authorization'] },
                    id: { $in: [authorization.id] }
                }
            });
            actionsOnAuthorizations.push(...searchAuthorizeActionsResult.data);
            timelines.push(...actionsOnAuthorizations.map((a) => {
                return TimelineFactory.createFromAction({
                    project: req.project,
                    action: a
                });
            }));
        }
        catch (error) {
            // no op
        }
        res.render('authorizations/show', {
            moment: moment,
            message: message,
            authorization: authorization,
            timelines: timelines
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = authorizationsRouter;
