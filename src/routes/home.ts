/**
 * ホームルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
// import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const projectsFromEnvironment: any[] = (process.env.PROJECTS !== undefined) ? JSON.parse(process.env.PROJECTS) : [];

// const debug = createDebug('cinerino-console:routes');
const homeRouter = express.Router();

homeRouter.get(
    '/',
    async (req, res, next) => {
        try {
            const projects = await Promise.all(projectsFromEnvironment.map(async (p) => {
                try {
                    const projectService = new cinerinoapi.service.Project({
                        endpoint: p.settings.API_ENDPOINT,
                        auth: req.user.authClient
                    });

                    return projectService.findById({ id: p.id });
                } catch (error) {
                    return p;
                }
            }));

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
