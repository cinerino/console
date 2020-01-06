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
 * プロジェクトメンバールーター
 */
const createDebug = require("debug");
const express = require("express");
// import { NO_CONTENT } from 'http-status';
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const membersRouter = express.Router();
/**
 * プロジェクトメンバー検索
 */
membersRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const personService = new cinerinoapi.service.Person({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
        // limit: req.query.limit,
        // page: req.query.page
        };
        if (req.query.format === 'datatable') {
            const searchResult = yield personService.fetch({
                uri: '/members',
                method: 'GET',
                // tslint:disable-next-line:no-magic-numbers
                expectedStatusCodes: [200]
            })
                .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                const totalCount = response.headers.get('X-Total-Count');
                return {
                    totalCount: totalCount,
                    data: yield response.json()
                };
            }));
            // const searchResult = await memberService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: searchResult.totalCount,
                recordsFiltered: searchResult.totalCount,
                data: searchResult.data
            });
        }
        else {
            res.render('members/index', {
                moment: moment,
                searchConditions: searchConditions
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = membersRouter;
