/**
 * 所有権ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
// import { ACCEPTED, CREATED } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

import * as TimelineFactory from '../factory/timeline';

const debug = createDebug('cinerino-console:routes');
const ownershipInfosRouter = express.Router();

/**
 * 検索
 */
ownershipInfosRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity
    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const ownershipInfoService = new cinerinoapi.service.OwnershipInfo({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const searchConditions: cinerinoapi.factory.ownershipInfo.ISearchConditions<cinerinoapi.factory.ownershipInfo.IGoodType> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { ownedFrom: cinerinoapi.factory.sortType.Descending },
                ownedBy: {
                    // typeOf: cinerinoapi.factory.personType.Person,
                    id: (req.query.ownedBy !== undefined && req.query.ownedBy.id !== undefined && req.query.ownedBy.id !== '')
                        ? req.query.ownedBy.id
                        : undefined
                },
                ids: (req.query.ids !== undefined && req.query.ids !== '')
                    ? (<string>req.query.ids).split(',')
                        .map((v) => v.trim())
                    : undefined,
                ownedFrom: (req.query.ownedRange !== undefined && req.query.ownedRange !== '')
                    ? moment(req.query.ownedRange.split(' - ')[0])
                        .toDate()
                    : moment()
                        .add(-1, 'day')
                        .toDate(),
                ownedThrough: (req.query.ownedRange !== undefined && req.query.ownedRange !== '')
                    ? moment(req.query.ownedRange.split(' - ')[1])
                        .toDate()
                    : moment()
                        .toDate(),
                typeOfGood: {
                    typeOf: (req.query.typeOfGood !== undefined
                        && req.query.typeOfGood.typeOf !== undefined
                        && req.query.typeOfGood.typeOf !== '')
                        ? req.query.typeOfGood.typeOf
                        : undefined,
                    ids: (req.query.typeOfGood !== undefined
                        && req.query.typeOfGood.ids !== undefined
                        && req.query.typeOfGood.ids !== '')
                        ? (<string>req.query.typeOfGood.ids).split(',')
                            .map((v) => v.trim())
                        : undefined,
                    accountNumbers: (req.query.typeOfGood !== undefined
                        && req.query.typeOfGood.accountNumbers !== undefined
                        && req.query.typeOfGood.accountNumbers !== '')
                        ? (<string>req.query.typeOfGood.accountNumbers).split(',')
                            .map((v) => v.trim())
                        : undefined
                }
            };

            if (req.query.format === 'datatable') {
                debug('searching ownershipInfos...', searchConditions);
                const searchOrdersResult = await ownershipInfoService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: searchOrdersResult.totalCount,
                    data: searchOrdersResult.data
                });
            } else {
                res.render('ownershipInfos/index', {
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

ownershipInfosRouter.all(
    '/:id',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const message = undefined;

            const actionService = new cinerinoapi.service.Action({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const ownershipInfoService = new cinerinoapi.service.OwnershipInfo({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchOwnershipInfosResult = await ownershipInfoService.search({
                limit: 1,
                ids: [req.params.id]
            });
            const ownershipInfo = searchOwnershipInfosResult.data.shift();
            if (ownershipInfo === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('OwnershipInfo');
            }

            // アクション
            const actionsOnOwnershipInfos: cinerinoapi.factory.action.IAction<cinerinoapi.factory.action.IAttributes<any, any, any>>[] = [];
            let timelines: TimelineFactory.ITimeline[] = [];
            const ownedFrom = moment(ownershipInfo.ownedFrom)
                .toDate();

            try {
                // resultが所有権
                const searchSendActionsResult = await actionService.search({
                    limit: 100,
                    sort: { startDate: cinerinoapi.factory.sortType.Ascending },
                    startFrom: ownedFrom,
                    // typeOf: cinerinoapi.factory.actionType.CheckAction,
                    // typeOf: cinerinoapi.factory.actionType.ReturnAction,
                    // typeOf: cinerinoapi.factory.actionType.SendAction,
                    result: {
                        typeOf: { $in: [ownershipInfo.typeOf] },
                        id: { $in: [ownershipInfo.id] }
                    }
                });
                actionsOnOwnershipInfos.push(...searchSendActionsResult.data);

                // objectが所有権
                const searchAuthorizeActionsResult = await actionService.search({
                    limit: 100,
                    sort: { startDate: cinerinoapi.factory.sortType.Ascending },
                    startFrom: ownedFrom,
                    // typeOf: cinerinoapi.factory.actionType.AuthorizeAction,
                    object: {
                        typeOf: { $in: [ownershipInfo.typeOf] },
                        id: { $in: [ownershipInfo.id] }
                    }
                });
                actionsOnOwnershipInfos.push(...searchAuthorizeActionsResult.data);

                timelines.push(...actionsOnOwnershipInfos.map((a) => {
                    return TimelineFactory.createFromAction({
                        project: req.project,
                        action: a
                    });
                }));
            } catch (error) {
                // no op
            }

            timelines = timelines.sort((a, b) => Number(a.startDate > b.startDate));

            res.render('ownershipInfos/edit', {
                moment: moment,
                message: message,
                ownershipInfo: ownershipInfo,
                timelines: timelines
            });
        } catch (error) {
            next(error);
        }
    }
);

export default ownershipInfosRouter;
