/**
 * 会員プログラムルーター
 */
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

const programMembershipsRouter = express.Router();

programMembershipsRouter.get(
    '',
    async (req, res, next) => {
        try {
            const programMembershipService = new cinerinoapi.service.ProgramMembership({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions: any = {
                ...req.query,
                limit: req.query.limit,
                page: req.query.page
            };

            if (req.query.format === 'datatable') {
                const searchResult = await programMembershipService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                    data: searchResult.data
                });
            } else {
                res.render('programMemberships/index', {
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

programMembershipsRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            const message = undefined;

            const programMembershipService = new cinerinoapi.service.ProgramMembership({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchProgramMembershipsResult = await programMembershipService.search({ id: req.params.id });
            const programMembership = searchProgramMembershipsResult.data.shift();
            if (programMembership === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('ProgramMembership');
            }

            res.render('programMemberships/edit', {
                message: message,
                programMembership: programMembership
            });
        } catch (error) {
            next(error);
        }
    }
);

export default programMembershipsRouter;
