/**
 * ホームルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
// import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';
// const debug = createDebug('cinerino-console:routes');
const homeRouter = express.Router();

homeRouter.get(
    '/',
    async (req, res, next) => {
        try {
            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const userPool = await userPoolService.findById({
                userPoolId: <string>process.env.DEFAULT_COGNITO_USER_POOL_ID
            });
            const searchUserPoolClientsResult = await userPoolService.searchClients({ userPoolId: <string>userPool.Id });

            res.render('index', {
                message: 'Welcome to Cinerino Console!',
                userPool: userPool,
                userPoolClients: searchUserPoolClientsResult.data
            });
        } catch (error) {
            next(error);
        }
    });

export default homeRouter;
