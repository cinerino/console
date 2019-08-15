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
 * 口座ルーター
 */
// import * as createDebug from 'debug';
const express = require("express");
// const debug = createDebug('cinerino-console:routes:account');
const accountsRouter = express.Router();
/**
 * 口座詳細
 */
accountsRouter.get('/:accountType/:accountNumber', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const redirect = `${req.project.settings.PECORINO_CONSOLE_ENDPOINT}/accounts/${req.params.accountType}/${req.params.accountNumber}`;
        res.redirect(redirect);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 口座検索
 */
// accountsRouter.get(
//     '/',
//     async (req, res, next) => {
//         try {
//             const accountService = new cinerinoapi.service.Account({
//                 endpoint: req.project.settings.API_ENDPOINT,
//                 auth: req.user.authClient
//             });
//             debug('searching accounts...', req.query);
//             const accounts = await accountService.search({
//                 accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
//                     [req.query.accountNumber] :
//                     [],
//                 statuses: [],
//                 name: req.query.name,
//                 limit: 100
//             });
//             res.render('accounts/index', {
//                 query: req.query,
//                 accounts: accounts
//             });
//         } catch (error) {
//             next(error);
//         }
//     });
/**
 * 口座に対する転送アクション検索
 */
// accountsRouter.get(
//     '/:accountNumber/actions/MoneyTransfer',
//     async (req, res, next) => {
//         try {
//             const accountService = new cinerinoapi.service.Account({
//                 endpoint: req.project.settings.API_ENDPOINT,
//                 auth: req.user.authClient
//             });
//             const actions = await accountService.searchMoneyTransferActions({ accountNumber: req.params.accountNumber });
//             res.render('accounts/actions/moneyTransfer', {
//                 accountNumber: req.params.accountNumber,
//                 actions: actions
//             });
//         } catch (error) {
//             next(error);
//         }
//     });
exports.default = accountsRouter;
