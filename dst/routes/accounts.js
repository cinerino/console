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
 * 口座ルーター
 */
// import * as createDebug from 'debug';
const express = require("express");
const cinerinoapi = require("../cinerinoapi");
// const debug = createDebug('cinerino-console:routes:account');
const accountsRouter = express.Router();
/**
 * 口座検索
 */
accountsRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const consoleUrl = process.env.PECORINO_CONSOLE_URL;
        res.render('accounts/index', {
            query: req.query,
            consoleUrl: consoleUrl
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 口座に対する転送アクション検索
 */
accountsRouter.get('/actions/MoneyTransfer', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accountService = new cinerinoapi.service.Account({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { startDate: cinerinoapi.factory.pecorino.sortType.Descending },
            accountType: req.query.accountType,
            accountNumber: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                req.query.accountNumber :
                undefined
        };
        if (req.query.format === 'datatable') {
            const { totalCount, data } = yield accountService.searchMoneyTransferActions(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: totalCount,
                recordsFiltered: totalCount,
                data: data
            });
        }
        else {
            res.render('accounts/actions/moneyTransfer/index', {
                query: req.query
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 口座詳細
 */
accountsRouter.get('/:accountType/:accountNumber', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const consoleUrl = process.env.PECORINO_CONSOLE_URL;
        const redirect = `${consoleUrl}/projects/${req.project.id}/accounts/${req.params.accountType}/${req.params.accountNumber}`;
        res.redirect(redirect);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = accountsRouter;
