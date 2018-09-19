/**
 * 注文ルーター
 */
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const userPoolsRouter = express.Router();
userPoolsRouter.get(
    '/:userPoolId',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const userPool = await userPoolService.findById({
                userPoolId: req.params.userPoolId
            });
            const searchUserPoolClientsResult = await userPoolService.searchClients({ userPoolId: req.params.userPoolId });
            res.render('userPools/show', {
                moment: moment,
                userPool: userPool,
                userPoolClients: searchUserPoolClientsResult.data
            });
        } catch (error) {
            next(error);
        }
    }
);
userPoolsRouter.get(
    '/:userPoolId/clients/:clientId',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const userPoolClient = await userPoolService.findClientById({
                userPoolId: req.params.userPoolId,
                clientId: req.params.clientId
            });
            res.render('userPools/clients/show', {
                moment: moment,
                userPoolClient: userPoolClient
            });
        } catch (error) {
            next(error);
        }
    }
);
export default userPoolsRouter;
