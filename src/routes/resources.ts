/**
 * 汎用リソースルーター
 */
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

const resourcesRouter = express.Router();

resourcesRouter.get(
    '/:resourceType/:resourceId',
    async (req, res, next) => {
        try {
            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

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

                // アプリケーション
                case 'WebApplication':
                    res.redirect(`/projects/${req.project.id}/applications/${req.params.resourceId}`);

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
                        } else {
                            res.redirect(`/projects/${req.project.id}/applications/${req.params.resourceId}`);
                        }
                    } else {
                        throw new Error('Cognito settings undefined');
                    }

                    break;

                // 会員プログラム
                case cinerinoapi.factory.programMembership.ProgramMembershipType.ProgramMembership:
                    res.redirect(`/projects/${req.project.id}/programMemberships/${req.params.resourceId}`);
                    break;

                // 口座
                case cinerinoapi.factory.pecorino.account.TypeOf.Account:
                    let accountType = 'Point';
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
        } catch (error) {
            next(error);
        }
    }
);

export default resourcesRouter;
