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
 * 販売者ルーター
 */
const express = require("express");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const sellersRouter = express.Router();
/**
 * 販売者検索
 */
sellersRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            name: req.query.name
        };
        if (req.query.format === 'datatable') {
            const searchResult = yield sellerService.search(searchConditions);
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
            res.render('sellers/index', {
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 販売者編集
 */
sellersRouter.all('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let message;
        // let attributes: cinerinoapi.factory.seller.IAttributes<cinerinoapi.factory.organizationType> | undefined;
        const projectService = new cinerinoapi.service.Project({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        const sellerService = new cinerinoapi.service.Seller({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const seller = yield sellerService.findById({ id: req.params.id });
        // if (req.method === 'DELETE') {
        // } else if (req.method === 'POST') {
        // }
        res.render('sellers/edit', {
            message: undefined,
            seller: seller,
            PaymentMethodType: cinerinoapi.factory.paymentMethodType,
            OrganizationType: cinerinoapi.factory.chevre.organizationType,
            PlaceType: { Online: 'Online', Store: 'Store' },
            WebAPIIdentifier: cinerinoapi.factory.service.webAPI.Identifier,
            project: project
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 劇場の注文検索
 */
sellersRouter.get('/:id/orders', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                .add(-1, 'day')
                .toDate(),
            orderDateThrough: new Date(),
            seller: {
                ids: [req.params.id]
            }
        });
        res.json(searchOrdersResult);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = sellersRouter;
