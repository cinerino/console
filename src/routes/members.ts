/**
 * プロジェクトメンバールーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
// import { NO_CONTENT } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const membersRouter = express.Router();

/**
 * プロジェクトメンバー検索
 */
membersRouter.get(
    '',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const personService = new cinerinoapi.service.Person({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchConditions = {
                // limit: req.query.limit,
                // page: req.query.page
            };
            if (req.query.format === 'datatable') {
                const searchResult = await personService.fetch({
                    uri: '/members',
                    method: 'GET',
                    // tslint:disable-next-line:no-magic-numbers
                    expectedStatusCodes: [200]
                })
                    .then(async (response) => {
                        const totalCount = response.headers.get('X-Total-Count');

                        return {
                            totalCount: totalCount,
                            data: await response.json()
                        };
                    });

                // const searchResult = await memberService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchResult.totalCount,
                    recordsFiltered: searchResult.totalCount,
                    data: searchResult.data
                });
            } else {
                res.render('members/index', {
                    moment: moment,
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

export default membersRouter;
