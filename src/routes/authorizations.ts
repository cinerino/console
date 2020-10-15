/**
 * 認可ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
// import { ACCEPTED, CREATED } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

import * as TimelineFactory from '../factory/timeline';

const debug = createDebug('cinerino-console:routes');
const authorizationsRouter = express.Router();

/**
 * 検索
 */
authorizationsRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity
    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const authorizationService = new cinerinoapi.service.Authorization({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const searchConditions: cinerinoapi.factory.authorization.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { validFrom: cinerinoapi.factory.sortType.Descending },
                codes: (req.query.codes !== undefined && req.query.codes !== '')
                    ? (<string>req.query.codes).split(',')
                        .map((v) => v.trim())
                    : undefined,
                validFrom: (req.query.validRange !== undefined && req.query.validRange !== '')
                    ? moment(req.query.validRange.split(' - ')[0])
                        .toDate()
                    : undefined,
                validThrough: (req.query.validRange !== undefined && req.query.validRange !== '')
                    ? moment(req.query.validRange.split(' - ')[1])
                        .toDate()
                    : undefined,
                object: {
                    typeOfs: (req.query.object !== undefined
                        && req.query.object.typeOfs !== undefined
                        && req.query.object.typeOfs !== '')
                        ? (<string>req.query.object.typeOfs).split(',')
                            .map((v) => v.trim())
                        : undefined,
                    ids: (req.query.object !== undefined
                        && req.query.object.ids !== undefined
                        && req.query.object.ids !== '')
                        ? (<string>req.query.object.ids).split(',')
                            .map((v) => v.trim())
                        : undefined,
                    typeOfGood: {
                        typeOfs: (req.query.object !== undefined
                            && req.query.object.typeOfGood !== undefined
                            && req.query.object.typeOfGood.typeOfs !== undefined
                            && req.query.object.typeOfGood.typeOfs !== '')
                            ? (<string>req.query.object.typeOfGood.typeOfs).split(',')
                                .map((v) => v.trim())
                            : undefined,
                        ids: (req.query.object !== undefined
                            && req.query.object.typeOfGood !== undefined
                            && req.query.object.typeOfGood.ids !== undefined
                            && req.query.object.typeOfGood.ids !== '')
                            ? (<string>req.query.object.typeOfGood.ids).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                }
            };

            if (req.query.format === 'datatable') {
                const searchResult = await authorizationService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                    data: searchResult.data
                });
            } else {
                res.render('authorizations/index', {
                    moment: moment,
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

authorizationsRouter.all(
    '/:id',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const message = undefined;

            const actionService = new cinerinoapi.service.Action({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const authorizationService = new cinerinoapi.service.Authorization({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const searchAuthorizationsResult = await authorizationService.search({
                limit: 1,
                id: { $in: [req.params.id] }
            });
            const authorization = searchAuthorizationsResult.data.shift();
            if (authorization === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('Authorization');
            }

            // アクション
            const actionsOnAuthorizations: cinerinoapi.factory.action.IAction<cinerinoapi.factory.action.IAttributes<any, any, any>>[] = [];
            const timelines: TimelineFactory.ITimeline[] = [];

            try {
                // コード発行
                const searchAuthorizeActionsResult = await actionService.search({
                    limit: 100,
                    sort: { startDate: cinerinoapi.factory.sortType.Ascending },
                    typeOf: cinerinoapi.factory.actionType.AuthorizeAction,
                    result: {
                        typeOf: { $in: ['Authorization'] },
                        id: { $in: [(<any>authorization).id] }
                    }
                });
                actionsOnAuthorizations.push(...searchAuthorizeActionsResult.data);

                timelines.push(...actionsOnAuthorizations.map((a) => {
                    return TimelineFactory.createFromAction({
                        project: req.project,
                        action: a
                    });
                }));
            } catch (error) {
                // no op
            }

            res.render('authorizations/show', {
                moment: moment,
                message: message,
                authorization: authorization,
                timelines: timelines
            });
        } catch (error) {
            next(error);
        }
    }
);

export default authorizationsRouter;
