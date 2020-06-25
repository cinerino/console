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
    var _a, _b, _c, _d;
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
            typeOf: (req.query.typeOf !== undefined && req.query.typeOf !== '')
                ? req.query.typeOf
                : undefined,
            actionStatusTypes: (req.query.actionStatusTypes !== undefined)
                ? req.query.actionStatusTypes
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
                    $in: (req.query.object !== undefined
                        && req.query.object.typeOf !== undefined
                        && req.query.object.typeOf.$in !== undefined
                        && req.query.object.typeOf.$in !== '')
                        ? req.query.object.typeOf.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                id: {
                    $in: (req.query.object !== undefined
                        && req.query.object.id !== undefined
                        && req.query.object.id.$in !== undefined
                        && req.query.object.id.$in !== '')
                        ? req.query.object.id.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                orderNumber: {
                    $in: (req.query.object !== undefined
                        && req.query.object.orderNumber !== undefined
                        && req.query.object.orderNumber.$in !== undefined
                        && req.query.object.orderNumber.$in !== '')
                        ? req.query.object.orderNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                paymentMethod: {
                    paymentMethodId: {
                        $in: (req.query.object !== undefined
                            && req.query.object.paymentMethod !== undefined
                            && req.query.object.paymentMethod.paymentMethodId !== undefined
                            && req.query.object.paymentMethod.paymentMethodId.$in !== undefined
                            && req.query.object.paymentMethod.paymentMethodId.$in !== '')
                            ? req.query.object.paymentMethod.paymentMethodId.$in.split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                event: {
                    id: {
                        $in: (req.query.object !== undefined
                            && req.query.object.event !== undefined
                            && req.query.object.event.id !== undefined
                            && req.query.object.event.id.$in !== undefined
                            && req.query.object.event.id.$in !== '')
                            ? req.query.object.event.id.$in.split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                acceptedOffer: {
                    ticketedSeat: {
                        seatNumber: {
                            $in: (req.query.object !== undefined
                                && req.query.object.acceptedOffer !== undefined
                                && req.query.object.acceptedOffer.ticketedSeat !== undefined
                                && req.query.object.acceptedOffer.ticketedSeat.seatNumber !== undefined
                                && req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in !== undefined
                                && req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in !== '')
                                ? req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in.split(',')
                                    .map((v) => v.trim())
                                : undefined
                        }
                    }
                }
            },
            purpose: {
                typeOf: {
                    $in: (req.query.purpose !== undefined
                        && req.query.purpose.typeOf !== undefined
                        && req.query.purpose.typeOf.$in !== undefined
                        && req.query.purpose.typeOf.$in !== '')
                        ? req.query.purpose.typeOf.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                id: {
                    $in: (req.query.purpose !== undefined
                        && req.query.purpose.id !== undefined
                        && req.query.purpose.id.$in !== undefined
                        && req.query.purpose.id.$in !== '')
                        ? req.query.purpose.id.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                orderNumber: {
                    $in: (req.query.purpose !== undefined
                        && req.query.purpose.orderNumber !== undefined
                        && req.query.purpose.orderNumber.$in !== undefined
                        && req.query.purpose.orderNumber.$in !== '')
                        ? req.query.purpose.orderNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            result: {
                typeOf: {
                    $in: (req.query.result !== undefined
                        && req.query.result.typeOf !== undefined
                        && req.query.result.typeOf.$in !== undefined
                        && req.query.result.typeOf.$in !== '')
                        ? req.query.result.typeOf.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                id: {
                    $in: (req.query.result !== undefined
                        && req.query.result.id !== undefined
                        && req.query.result.id.$in !== undefined
                        && req.query.result.id.$in !== '')
                        ? req.query.result.id.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                orderNumber: {
                    $in: (req.query.result !== undefined
                        && req.query.result.orderNumber !== undefined
                        && req.query.result.orderNumber.$in !== undefined
                        && req.query.result.orderNumber.$in !== '')
                        ? req.query.result.orderNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            fromLocation: {
                accountNumber: {
                    $in: (req.query.fromLocation !== undefined
                        && req.query.fromLocation.accountNumber !== undefined
                        && req.query.fromLocation.accountNumber.$in !== undefined
                        && req.query.fromLocation.accountNumber.$in !== '')
                        ? req.query.fromLocation.accountNumber.$in.split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            },
            toLocation: {
                accountNumber: {
                    $in: (req.query.toLocation !== undefined
                        && req.query.toLocation.accountNumber !== undefined
                        && req.query.toLocation.accountNumber.$in !== undefined
                        && req.query.toLocation.accountNumber.$in !== '')
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
