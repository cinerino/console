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
 * 汎用リソースルーター
 */
const express = require("express");
const cinerinoapi = require("../cinerinoapi");
const resourcesRouter = express.Router();
resourcesRouter.get('/:resourceType/:resourceId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectService = new cinerinoapi.service.Project({
            endpoint: req.project.settings.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        switch (req.params.resourceType) {
            // 注文
            case 'Order':
                res.redirect(`/projects/${req.project.id}/orders/${req.params.resourceId}`);
                break;
            // 取引
            case cinerinoapi.factory.transactionType.MoneyTransfer:
            case cinerinoapi.factory.transactionType.PlaceOrder:
            case cinerinoapi.factory.transactionType.ReturnOrder:
                res.redirect(`/projects/${req.project.id}/transactions/${req.params.resourceType}/${req.params.resourceId}`);
                break;
            // 販売者
            case cinerinoapi.factory.organizationType.Corporation:
            case cinerinoapi.factory.organizationType.MovieTheater:
                res.redirect(`/projects/${req.project.id}/sellers/${req.params.resourceId}`);
                break;
            // 人
            case cinerinoapi.factory.personType.Person:
                if (project.settings !== undefined && project.settings.cognito !== undefined) {
                    let userPoolId = req.query.userPoolId;
                    if (userPoolId === undefined) {
                        userPoolId = project.settings.cognito.customerUserPool.id;
                    }
                    if (/-/.test(req.params.resourceId)) {
                        res.redirect(`/projects/${req.project.id}/userPools/${userPoolId}/people/${req.params.resourceId}`);
                    }
                    else {
                        res.redirect(`/projects/${req.project.id}/userPools/${userPoolId}/clients/${req.params.resourceId}`);
                    }
                }
                else {
                    throw new Error('Cognito settings undefined');
                }
                break;
            // 会員プログラム
            case 'ProgramMembership':
                res.redirect(`/projects/${req.project.id}/programMemberships/${req.params.resourceId}`);
                break;
            // 口座
            case cinerinoapi.factory.pecorino.account.TypeOf.Account:
                let accountType = cinerinoapi.factory.accountType.Coin;
                if (typeof req.query.accountType === 'string' && req.query.accountType !== '') {
                    accountType = req.query.accountType;
                }
                res.redirect(`/projects/${req.project.id}/accounts/${accountType}/${req.params.resourceId}`);
                break;
            // 所有権
            case 'OwnershipInfo':
                res.redirect(`/projects/${req.project.id}/ownershipInfos/${req.params.resourceId}`);
                break;
            default:
                throw new Error(`Unknown resource type ${req.params.resourceType}`);
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = resourcesRouter;
