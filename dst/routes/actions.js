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
 * アクションルーター
 */
const createDebug = require("debug");
const express = require("express");
// import { ACCEPTED, CREATED } from 'http-status';
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const actionsRouter = express.Router();
/**
 * 検索
 */
actionsRouter.get('', 
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
    try {
        debug('req.query:', req.query);
        const actionService = new cinerinoapi.service.Action({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { startDate: cinerinoapi.factory.sortType.Descending },
            typeOf: (typeof req.query.typeOf === 'string' && req.query.typeOf.length > 0)
                ? req.query.typeOf
                : undefined,
            actionStatusTypes: (typeof req.query.actionStatusType === 'string' && req.query.actionStatusType.length > 0)
                ? [req.query.actionStatusType]
                : undefined,
            startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[0])
                    .toDate()
                : undefined,
            startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                ? moment(req.query.startRange.split(' - ')[1])
                    .toDate()
                : undefined,
            agent: {
                typeOf: {
                    $in: (typeof ((_b = (_a = req.query.agent) === null || _a === void 0 ? void 0 : _a.typeOf) === null || _b === void 0 ? void 0 : _b.$in) === 'string' && req.query.agent.typeOf.$in.length > 0)
                        ? req.query.agent.typeOf.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                id: {
                    $in: (typeof ((_d = (_c = req.query.agent) === null || _c === void 0 ? void 0 : _c.id) === null || _d === void 0 ? void 0 : _d.$in) === 'string' && req.query.agent.id.$in.length > 0)
                        ? req.query.agent.id.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            object: {
                typeOf: {
                    $in: (typeof ((_f = (_e = req.query.object) === null || _e === void 0 ? void 0 : _e.typeOf) === null || _f === void 0 ? void 0 : _f.$in) === 'string' && req.query.object.typeOf.$in.length > 0)
                        ? req.query.object.typeOf.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                id: {
                    $in: (typeof ((_h = (_g = req.query.object) === null || _g === void 0 ? void 0 : _g.id) === null || _h === void 0 ? void 0 : _h.$in) === 'string' && req.query.object.id.$in.length > 0)
                        ? req.query.object.id.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                orderNumber: {
                    $in: (typeof ((_k = (_j = req.query.object) === null || _j === void 0 ? void 0 : _j.orderNumber) === null || _k === void 0 ? void 0 : _k.$in) === 'string' && req.query.object.orderNumber.$in.length > 0)
                        ? req.query.object.orderNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                paymentMethod: {
                    $eq: (typeof ((_m = (_l = req.query.object) === null || _l === void 0 ? void 0 : _l.paymentMethod) === null || _m === void 0 ? void 0 : _m.$eq) === 'string'
                        && req.query.object.paymentMethod.$eq.length > 0)
                        ? req.query.object.paymentMethod.$eq
                        : undefined
                },
                paymentMethodId: {
                    $eq: (typeof ((_p = (_o = req.query.object) === null || _o === void 0 ? void 0 : _o.paymentMethodId) === null || _p === void 0 ? void 0 : _p.$eq) === 'string'
                        && req.query.object.paymentMethodId.$eq.length > 0)
                        ? req.query.object.paymentMethodId.$eq
                        : undefined
                },
                event: {
                    id: {
                        $in: (typeof ((_s = (_r = (_q = req.query.object) === null || _q === void 0 ? void 0 : _q.event) === null || _r === void 0 ? void 0 : _r.id) === null || _s === void 0 ? void 0 : _s.$in) === 'string' && req.query.object.event.id.$in.length > 0)
                            ? req.query.object.event.id.$in.split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                acceptedOffer: {
                    ticketedSeat: {
                        seatNumber: {
                            $in: (typeof ((_w = (_v = (_u = (_t = req.query.object) === null || _t === void 0 ? void 0 : _t.acceptedOffer) === null || _u === void 0 ? void 0 : _u.ticketedSeat) === null || _v === void 0 ? void 0 : _v.seatNumber) === null || _w === void 0 ? void 0 : _w.$in) === 'string'
                                && req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in.length > 0)
                                ? req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in.split(',')
                                    .map((v) => v.trim())
                                : undefined
                        }
                    }
                }
            },
            purpose: {
                typeOf: {
                    $in: (typeof ((_y = (_x = req.query.purpose) === null || _x === void 0 ? void 0 : _x.typeOf) === null || _y === void 0 ? void 0 : _y.$in) === 'string' && req.query.purpose.typeOf.$in.length > 0)
                        ? req.query.purpose.typeOf.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                id: {
                    $in: (typeof ((_0 = (_z = req.query.purpose) === null || _z === void 0 ? void 0 : _z.id) === null || _0 === void 0 ? void 0 : _0.$in) === 'string' && req.query.purpose.id.$in.length > 0)
                        ? req.query.purpose.id.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                orderNumber: {
                    $in: (typeof ((_2 = (_1 = req.query.purpose) === null || _1 === void 0 ? void 0 : _1.orderNumber) === null || _2 === void 0 ? void 0 : _2.$in) === 'string' && req.query.purpose.orderNumber.$in.length > 0)
                        ? req.query.purpose.orderNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            result: {
                typeOf: {
                    $in: (typeof ((_4 = (_3 = req.query.result) === null || _3 === void 0 ? void 0 : _3.typeOf) === null || _4 === void 0 ? void 0 : _4.$in) === 'string' && req.query.result.typeOf.$in.length > 0)
                        ? req.query.result.typeOf.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                id: {
                    $in: (typeof ((_6 = (_5 = req.query.result) === null || _5 === void 0 ? void 0 : _5.id) === null || _6 === void 0 ? void 0 : _6.$in) === 'string' && req.query.result.id.$in.length > 0)
                        ? req.query.result.id.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                orderNumber: {
                    $in: (typeof ((_8 = (_7 = req.query.result) === null || _7 === void 0 ? void 0 : _7.orderNumber) === null || _8 === void 0 ? void 0 : _8.$in) === 'string' && req.query.result.orderNumber.$in.length > 0)
                        ? req.query.result.orderNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            fromLocation: {
                accountNumber: {
                    $in: (typeof ((_10 = (_9 = req.query.fromLocation) === null || _9 === void 0 ? void 0 : _9.accountNumber) === null || _10 === void 0 ? void 0 : _10.$in) === 'string'
                        && req.query.fromLocation.accountNumber.$in.length > 0)
                        ? req.query.fromLocation.accountNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            toLocation: {
                accountNumber: {
                    $in: (typeof ((_12 = (_11 = req.query.toLocation) === null || _11 === void 0 ? void 0 : _11.accountNumber) === null || _12 === void 0 ? void 0 : _12.$in) === 'string'
                        && req.query.toLocation.accountNumber.$in.length > 0)
                        ? req.query.toLocation.accountNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            }
        };
        if (req.query.format === 'datatable') {
            debug('searching actions...', searchConditions);
            const searchResult = yield actionService.search(searchConditions);
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
            res.render('actions/index', {
                moment: moment,
                searchConditions: searchConditions,
                ActionStatusType: cinerinoapi.factory.actionStatusType,
                ActionType: cinerinoapi.factory.actionType
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = actionsRouter;
