/**
 * 取引ルーター
 */
// import * as cinerinoapi from '@cinerino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
// import * as moment from 'moment';

const debug = createDebug('cinerino-console:routes:account');
const transactionsRouter = express.Router();

/**
 * 取引検索
 */
transactionsRouter.get(
    '/',
    async (req, _, next) => {
        try {
            debug('searching transactions...', req.query);
            throw new Error('Not implemented');
        } catch (error) {
            next(error);
        }
    });

export default transactionsRouter;
