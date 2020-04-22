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
 * 会員プログラムルーター
 */
const express = require("express");
const cinerinoapi = require("../cinerinoapi");
const programMembershipsRouter = express.Router();
programMembershipsRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const programMembershipService = new cinerinoapi.service.ProgramMembership({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = Object.assign(Object.assign({}, req.query), { limit: req.query.limit, page: req.query.page });
        if (req.query.format === 'datatable') {
            const searchResult = yield programMembershipService.search(searchConditions);
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
            res.render('programMemberships/index', {
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
programMembershipsRouter.all('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = undefined;
        const programMembershipService = new cinerinoapi.service.ProgramMembership({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchProgramMembershipsResult = yield programMembershipService.search({ id: req.params.id });
        const programMembership = searchProgramMembershipsResult.data.shift();
        if (programMembership === undefined) {
            throw new cinerinoapi.factory.errors.NotFound('ProgramMembership');
        }
        res.render('programMemberships/edit', {
            message: message,
            programMembership: programMembership
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = programMembershipsRouter;
