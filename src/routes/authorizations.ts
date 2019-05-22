/**
 * 認可ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
// import { ACCEPTED, CREATED } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

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
                endpoint: <string>process.env.API_ENDPOINT,
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
                    : moment()
                        .add(-1, 'day')
                        .toDate(),
                validThrough: (req.query.validRange !== undefined && req.query.validRange !== '')
                    ? moment(req.query.validRange.split(' - ')[1])
                        .toDate()
                    : moment()
                        .toDate(),
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
                const searchOrdersResult = await authorizationService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: searchOrdersResult.totalCount,
                    data: searchOrdersResult.data
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

export default authorizationsRouter;
