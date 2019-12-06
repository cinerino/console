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
 * インボイスルーター
 */
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const invoicesRouter = express.Router();
/**
 * インボイス検索
 */
invoicesRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const invoiceService = new cinerinoapi.service.Invoice({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        let identifiers;
        if (req.query.customer !== undefined) {
            if (Array.isArray(req.query.customer.userPoolClients)) {
                identifiers = req.query.customer.userPoolClients.map((userPoolClient) => {
                    return {
                        name: 'clientId',
                        value: userPoolClient
                    };
                });
            }
            if (req.query.customer.identifiers !== '') {
                const splitted = req.query.customer.identifiers.split(':');
                if (splitted.length > 1) {
                    identifiers = [
                        {
                            name: splitted[0],
                            value: splitted[1]
                        }
                    ];
                }
            }
        }
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { createdAt: cinerinoapi.factory.sortType.Descending },
            customer: {
                ids: (req.query.customer !== undefined
                    && req.query.customer.ids !== undefined
                    && req.query.customer.ids !== '')
                    ? req.query.customer.ids.split(',')
                        .map((v) => v.trim())
                    : undefined,
                identifiers: identifiers,
                email: (req.query.customer !== undefined && req.query.customer.email !== '')
                    ? req.query.customer.email
                    : undefined,
                telephone: (req.query.customer !== undefined && req.query.customer.telephone !== '')
                    ? req.query.customer.telephone
                    : undefined
            },
            referencesOrder: {
                orderNumbers: (req.query.referencesOrder !== undefined
                    && req.query.referencesOrder.orderNumbers !== undefined
                    && req.query.referencesOrder.orderNumbers !== '')
                    ? req.query.referencesOrder.orderNumbers.split(',')
                        .map((v) => v.trim())
                    : undefined
            },
            paymentStatuses: (req.query.paymentStatuses !== undefined)
                ? req.query.paymentStatuses
                : undefined,
            createdFrom: (req.query.createdAtRange !== undefined && req.query.createdAtRange !== '')
                ? moment(req.query.createdAtRange.split(' - ')[0])
                    .toDate()
                : moment()
                    .add(-1, 'day')
                    .toDate(),
            createdThrough: (req.query.createdAtRange !== undefined && req.query.createdAtRange !== '')
                ? moment(req.query.createdAtRange.split(' - ')[1])
                    .toDate()
                : moment()
                    .toDate(),
            confirmationNumbers: (req.query.confirmationNumbers !== undefined && req.query.confirmationNumbers !== '')
                ? req.query.confirmationNumbers.split(',')
                    .map((v) => v.trim())
                : undefined,
            paymentMethods: (req.query.paymentMethods !== undefined)
                ? req.query.paymentMethods
                : undefined,
            paymentMethodIds: (req.query.paymentMethodIds !== undefined
                && req.query.paymentMethodIds !== '')
                ? req.query.paymentMethodIds.split(',')
                    .map((v) => v.trim())
                : undefined
        };
        if (req.query.format === 'datatable') {
            const searchOrdersResult = yield invoiceService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchOrdersResult.totalCount,
                recordsFiltered: searchOrdersResult.totalCount,
                data: searchOrdersResult.data
            });
        }
        else {
            res.render('invoices/index', {
                moment: moment,
                searchConditions: searchConditions,
                PaymentStatusType: cinerinoapi.factory.paymentStatusType,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = invoicesRouter;
