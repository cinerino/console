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
            endpoint: process.env.API_ENDPOINT,
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
                    : undefined
            }
        };
        if (req.query.format === 'datatable') {
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
exports.default = ownershipInfosRouter;
