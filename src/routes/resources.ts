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
                    if (req.project.settings.cognito !== undefined) {
                        let userPoolId = req.query.userPoolId;
                        if (userPoolId === undefined) {
                            userPoolId = req.project.settings.cognito.customerUserPool.id;
                        }

                        if (/-/.test(req.params.resourceId)) {
                            res.redirect(`/projects/${req.project.id}/userPools/${userPoolId}/people/${req.params.resourceId}`);
                        } else {
                            res.redirect(`/projects/${req.project.id}/userPools/${userPoolId}/clients/${req.params.resourceId}`);
                        }
                    } else {
                        throw new Error('Cognito settings undefined');
                    }

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
