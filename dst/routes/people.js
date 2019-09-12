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
 * 会員ルーター
 */
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const peopleRouter = express.Router();
/**
 * 会員検索
 */
peopleRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity
(req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const personService = new cinerinoapi.service.Person({
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
            const searchResult = yield personService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchResult.totalCount,
                recordsFiltered: searchResult.totalCount,
                data: searchResult.data
            });
        }
        else {
            res.render('people/index', {
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
 * 会員編集
 */
peopleRouter.all('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let message = '';
        const personService = new cinerinoapi.service.Person({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const person = yield personService.findById({ id: req.params.id });
        if (req.method === 'DELETE') {
            const physically = req.body.physically === 'on';
            yield personService.deletById({ id: person.id, physically: physically });
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
                const profile = Object.assign({}, req.body, { additionalProperty: additionalProperty });
                yield personService.updateProfile(Object.assign({ id: req.params.id }, profile));
                req.flash('message', '更新しました');
                res.redirect(req.originalUrl);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        const creditCards = [];
        let coinAccounts = [];
        let pointAccounts = [];
        try {
            const searchCoinAccountsResult = yield personOwnershipInfoService.search({
                id: req.params.id,
                typeOfGood: {
                    typeOf: cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
                    accountType: cinerinoapi.factory.accountType.Coin
                }
            });
            const searchPointAccountsResult = yield personOwnershipInfoService.search({
                id: req.params.id,
                typeOfGood: {
                    typeOf: cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
                    accountType: cinerinoapi.factory.accountType.Point
                }
            });
            coinAccounts = searchCoinAccountsResult.data;
            pointAccounts = searchPointAccountsResult.data;
        }
        catch (error) {
            // no op
            debug(error);
            message = `所有権検索で問題が発生しました:${error.message}`;
        }
        res.render('people/show', {
            message: message,
            moment: moment,
            person: person,
            creditCards: creditCards,
            coinAccounts: coinAccounts,
            pointAccounts: pointAccounts
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員注文検索
 */
peopleRouter.get('/:id/orders', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const orderService = new cinerinoapi.service.Order({
            endpoint: req.project.settings.API_ENDPOINT,
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
/**
 * 予約検索
 */
peopleRouter.get('/:id/reservations', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchResult = yield personOwnershipInfoService.search({
            limit: req.query.limit,
            page: req.query.page,
            id: req.params.id,
            typeOfGood: {
                typeOf: cinerinoapi.factory.chevre.reservationType.EventReservation
            },
            ownedFrom: moment()
                .add(-1, 'month')
                .toDate(),
            ownedThrough: new Date()
        });
        debug(searchResult.totalCount, 'reservations found.');
        res.json(searchResult);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員プログラム検索
 */
peopleRouter.get('/:id/programMemberships', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchResult = yield personOwnershipInfoService.search({
            limit: req.query.limit,
            page: req.query.page,
            id: req.params.id,
            typeOfGood: {
                typeOf: 'ProgramMembership'
            },
            ownedFrom: moment()
                .add(-1, 'month')
                .toDate(),
            ownedThrough: new Date()
        });
        debug(searchResult.totalCount, 'programMemberships found.');
        res.json(searchResult);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * クレジットカード検索
 */
peopleRouter.get('/:id/creditCards', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const creditCards = yield personOwnershipInfoService.searchCreditCards({ id: req.params.id });
        res.json(creditCards);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * クレジットカード削除
 */
peopleRouter.delete('/:id/creditCards/:cardSeq', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personOwnershipInfoService = new cinerinoapi.service.person.OwnershipInfo({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        yield personOwnershipInfoService.deleteCreditCard({
            id: req.params.id,
            cardSeq: req.params.cardSeq
        });
        res.status(http_status_1.NO_CONTENT)
            .end();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = peopleRouter;
