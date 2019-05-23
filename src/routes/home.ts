/**
 * ホームルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
// import * as moment from 'moment';

const projects: any[] = (process.env.PROJECTS !== undefined) ? JSON.parse(process.env.PROJECTS) : [];

// const debug = createDebug('cinerino-console:routes');
const homeRouter = express.Router();

homeRouter.get(
    '/',
    async (_, res, next) => {
        try {
            res.render('dashboard', {
                layout: 'layouts/dashboard',
                message: 'Welcome to Cinerino Console!',
                projects: projects
            });
        } catch (error) {
            next(error);
        }
    });

export default homeRouter;
