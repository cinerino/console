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
                if (typeof p.settings.API_ENDPOINT !== 'string') {
                    p.settings.API_ENDPOINT = process.env.API_ENDPOINT;
                }

                try {
                    const projectService = new cinerinoapi.service.Project({
                        endpoint: p.settings.API_ENDPOINT,
                        auth: req.user.authClient
                    });

                    let project: cinerinoapi.factory.project.IProject | undefined;

                    return new Promise<cinerinoapi.factory.project.IProject>(async (resolve, reject) => {
                        setTimeout(
                            async () => {
                                if (project === undefined) {
                                    reject(new Error('Couldn\'t get project details'));
                                }
                            },
                            // tslint:disable-next-line:no-magic-numbers
                            5000
                        );

                        project = await projectService.findById({ id: p.id });

                        resolve(project);
                    });
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
