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
 * プロダクトルーター
 */
// import * as createDebug from 'debug';
const express = require("express");
const cinerinoapi = require("../cinerinoapi");
// const debug = createDebug('cinerino-console:routes');
const productsRouter = express.Router();
/**
 * 検索
 */
productsRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const productService = new cinerinoapi.service.Product({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const searchConditions = Object.assign({ limit: req.query.limit, page: req.query.page, typeOf: {
                $eq: (typeof ((_b = (_a = req.query) === null || _a === void 0 ? void 0 : _a.typeOf) === null || _b === void 0 ? void 0 : _b.$eq) === 'string' && req.query.typeOf.$eq.length > 0)
                    ? req.query.typeOf.$eq
                    : undefined
            } }, {
            identifier: (typeof req.query.identifier === 'string' && req.query.identifier.length > 0)
                ? { $eq: req.query.identifier }
                : undefined
        });
        if (req.query.format === 'datatable') {
            const { data } = yield productService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                // recordsTotal: searchOrdersResult.totalCount,
                recordsFiltered: (data.length === Number(searchConditions.limit))
                    ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                    : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(data.length),
                data: data
            });
        }
        else {
            res.render('products', {
                searchConditions: searchConditions,
                ProductType: cinerinoapi.factory.chevre.product.ProductType
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = productsRouter;
