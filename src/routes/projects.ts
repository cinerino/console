/**
 * プロジェクトルーター
 */
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

const projectsRouter = express.Router();

projectsRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            const message: string = '';
            const projectService = new cinerinoapi.service.Project({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

            res.render('projects/edit', {
                message: message,
                project: project
            });
        } catch (error) {
            next(error);
        }
    }
);

export default projectsRouter;
