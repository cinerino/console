/**
 * ホームルーター
 */
// import * as cinerinoapi from '@cinerino/api-nodejs-client';
// import * as createDebug from 'debug';
import * as express from 'express';
// import * as moment from 'moment';

// const debug = createDebug('cinerino-console:routes');
const homeRouter = express.Router();

homeRouter.get(
    '/',
    async (__, res, next) => {
        try {
            const orders: any[] = [];

            res.render('index', {
                message: 'Welcome to Cinerino Console!',
                orders: orders
                // movieTheaters: movieTheaters,
                // globalTelemetries: globalTelemetries,
                // sellerTelemetries: sellerTelemetries,
                // globalFlowTelemetries: globalFlowTelemetries,
                // sellerFlowTelemetries: sellerFlowTelemetries
            });
        } catch (error) {
            next(error);
        }
    });

export default homeRouter;
