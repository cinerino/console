/**
 * ホームルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
// import * as moment from 'moment';

// const debug = createDebug('cinerino-console:routes');
const homeRouter = express.Router();

homeRouter.get(
    '/',
    async (_, res, next) => {
        try {
            const projects = [{
                typeOf: 'Project',
                id: process.env.PROJECT_ID
            }];

            res.render('dashboard', {
                message: 'Welcome to Cinerino Console!',
                projects: projects
            });
        } catch (error) {
            next(error);
        }
    });

export default homeRouter;
