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
 * 認可ルーター
 */
const createDebug = require("debug");
const express = require("express");
// import { ACCEPTED, CREATED } from 'http-status';
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const authorizationsRouter = express.Router();
/**
 * 検索
 */
authorizationsRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const authorizationService = new cinerinoapi.service.Authorization({
            endpoint: req.project.settings.API_ENDPOINT,
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
                : moment()
                    .add(-1, 'day')
                    .toDate(),
            validThrough: (req.query.validRange !== undefined && req.query.validRange !== '')
                ? moment(req.query.validRange.split(' - ')[1])
                    .toDate()
                : moment()
                    .toDate(),
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
            const searchOrdersResult = yield authorizationService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchOrdersResult.totalCount,
                recordsFiltered: searchOrdersResult.totalCount,
                data: searchOrdersResult.data
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
exports.default = authorizationsRouter;
