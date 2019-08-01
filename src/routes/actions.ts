/**
 * アクションルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
// import { ACCEPTED, CREATED } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const actionsRouter = express.Router();

/**
 * 検索
 */
actionsRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const actionService = new cinerinoapi.service.Action({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });

            const searchConditions: cinerinoapi.factory.action.ISearchConditions<any> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: cinerinoapi.factory.sortType.Ascending },
                typeOf: (req.query.typeOf !== undefined && req.query.typeOf !== '')
                    ? <string>req.query.typeOf
                    : undefined,
                startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[0])
                        .toDate()
                    : moment()
                        .add(-1, 'day')
                        .toDate(),
                startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[1])
                        .toDate()
                    : moment()
                        .toDate(),
                object: {
                    typeOf: {
                        $in: (req.query.object !== undefined
                            && req.query.object.typeOf !== undefined
                            && req.query.object.typeOf.$in !== undefined
                            && req.query.object.typeOf.$in !== '')
                            ? (<string>req.query.object.typeOf.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    id: {
                        $in: (req.query.object !== undefined
                            && req.query.object.id !== undefined
                            && req.query.object.id.$in !== undefined
                            && req.query.object.id.$in !== '')
                            ? (<string>req.query.object.id.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                purpose: {
                    typeOf: {
                        $in: (req.query.purpose !== undefined
                            && req.query.purpose.typeOf !== undefined
                            && req.query.purpose.typeOf.$in !== undefined
                            && req.query.purpose.typeOf.$in !== '')
                            ? (<string>req.query.purpose.typeOf.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    id: {
                        $in: (req.query.purpose !== undefined
                            && req.query.purpose.id !== undefined
                            && req.query.purpose.id.$in !== undefined
                            && req.query.purpose.id.$in !== '')
                            ? (<string>req.query.purpose.id.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                }
            };

            if (req.query.format === 'datatable') {
                debug('searching actions...', searchConditions);
                const searchOrdersResult = await actionService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: searchOrdersResult.totalCount,
                    data: searchOrdersResult.data
                });
            } else {
                res.render('actions/index', {
                    moment: moment,
                    searchConditions: searchConditions,
                    OrderStatus: cinerinoapi.factory.orderStatus,
                    GoodTypeChoices: [
                        cinerinoapi.factory.ownershipInfo.AccountGoodType.Account,
                        cinerinoapi.factory.chevre.reservationType.EventReservation,
                        'ProgramMembership'
                    ]
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

export default actionsRouter;
