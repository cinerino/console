"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 所有権ルーター
 */
const createDebug = require("debug");
const express = require("express");
// import { ACCEPTED, CREATED } from 'http-status';
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const TimelineFactory = require("../factory/timeline");
const debug = createDebug('cinerino-console:routes');
const ownershipInfosRouter = express.Router();
/**
 * 検索
 */
ownershipInfosRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const ownershipInfoService = new cinerinoapi.service.OwnershipInfo({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { ownedFrom: cinerinoapi.factory.sortType.Descending },
            ownedBy: {
                // typeOf: cinerinoapi.factory.personType.Person,
                id: (req.query.ownedBy !== undefined && req.query.ownedBy.id !== undefined && req.query.ownedBy.id !== '')
                    ? req.query.ownedBy.id
                    : undefined
            },
            ids: (req.query.ids !== undefined && req.query.ids !== '')
                ? req.query.ids.split(',')
                    .map((v) => v.trim())
                : undefined,
            ownedFrom: (req.query.ownedRange !== undefined && req.query.ownedRange !== '')
                ? moment(req.query.ownedRange.split(' - ')[0])
                    .toDate()
                : moment()
                    .add(-1, 'day')
                    .toDate(),
            ownedThrough: (req.query.ownedRange !== undefined && req.query.ownedRange !== '')
                ? moment(req.query.ownedRange.split(' - ')[1])
                    .toDate()
                : moment()
                    .toDate(),
            typeOfGood: {
                typeOf: (req.query.typeOfGood !== undefined
                    && req.query.typeOfGood.typeOf !== undefined
                    && req.query.typeOfGood.typeOf !== '')
                    ? req.query.typeOfGood.typeOf
                    : undefined,
                ids: (req.query.typeOfGood !== undefined
                    && req.query.typeOfGood.ids !== undefined
                    && req.query.typeOfGood.ids !== '')
                    ? req.query.typeOfGood.ids.split(',')
                        .map((v) => v.trim())
                    : undefined,
                accountNumbers: (req.query.typeOfGood !== undefined
                    && req.query.typeOfGood.accountNumbers !== undefined
                    && req.query.typeOfGood.accountNumbers !== '')
                    ? req.query.typeOfGood.accountNumbers.split(',')
                        .map((v) => v.trim())
                    : undefined
            }
        };
        if (req.query.format === 'datatable') {
            debug('searching ownershipInfos...', searchConditions);
            const searchOrdersResult = yield ownershipInfoService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchOrdersResult.totalCount,
                recordsFiltered: searchOrdersResult.totalCount,
                data: searchOrdersResult.data
            });
        }
        else {
            res.render('ownershipInfos/index', {
                moment: moment,
                searchConditions: searchConditions,
                OrderStatus: cinerinoapi.factory.orderStatus,
                GoodTypeChoices: [
                    cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
                    cinerinoapi.factory.chevre.reservationType.EventReservation,
                    'ProgramMembership'
                ]
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
ownershipInfosRouter.all('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const message = undefined;
        const actionService = new cinerinoapi.service.Action({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const authorizationService = new cinerinoapi.service.Authorization({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const ownershipInfoService = new cinerinoapi.service.OwnershipInfo({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchOwnershipInfosResult = yield ownershipInfoService.search({
            limit: 1,
            ids: [req.params.id]
        });
        const ownershipInfo = searchOwnershipInfosResult.data.shift();
        if (ownershipInfo === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('OwnershipInfo');
        }
        // アクション
        const actionsOnOwnershipInfos = [];
        const timelines = [];
        try {
            // コード発行(チェックイン)
            const searchAuthorizationsResult = yield authorizationService.search({
                limit: 100,
                sort: { validFrom: cinerinoapi.factory.sortType.Ascending },
                object: {
                    typeOfs: [ownershipInfo.typeOf],
                    ids: [ownershipInfo.id]
                }
            });
            actionsOnOwnershipInfos.push(...searchAuthorizationsResult.data.map((authorization) => {
                return {
                    project: authorization.project,
                    id: 'unknown',
                    typeOf: cinerinoapi.factory.actionType.AuthorizeAction,
                    agent: {},
                    object: authorization.object,
                    startDate: authorization.validFrom,
                    endDate: authorization.validFrom,
                    actionStatus: cinerinoapi.factory.actionStatusType.CompletedActionStatus,
                    result: {
                        code: authorization.code
                    }
                };
            }));
            // トークンチェック(入場)
            const searchActionsResult = yield actionService.search({
                limit: 100,
                sort: { startDate: cinerinoapi.factory.sortType.Ascending },
                typeOf: cinerinoapi.factory.actionType.CheckAction,
                result: {
                    typeOf: { $in: [ownershipInfo.typeOf] },
                    id: { $in: [ownershipInfo.id] }
                }
            });
            actionsOnOwnershipInfos.push(...searchActionsResult.data);
            timelines.push(...actionsOnOwnershipInfos.map((a) => {
                return TimelineFactory.createFromAction({
                    project: req.project,
                    action: a
                });
            }));
        }
        catch (error) {
            // no op
        }
        res.render('ownershipInfos/edit', {
            message: message,
            ownershipInfo: ownershipInfo,
            timelines: timelines
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = ownershipInfosRouter;
