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
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const searchConditions: cinerinoapi.factory.action.ISearchConditions<any> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: cinerinoapi.factory.sortType.Descending },
                typeOf: (req.query.typeOf !== undefined && req.query.typeOf !== '')
                    ? <string>req.query.typeOf
                    : undefined,
                actionStatusTypes: (req.query.actionStatusTypes !== undefined)
                    ? req.query.actionStatusTypes
                    : undefined,
                startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[0])
                        .toDate()
                    : undefined,
                startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[1])
                        .toDate()
                    : undefined,
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
                    },
                    orderNumber: {
                        $in: (req.query.object !== undefined
                            && req.query.object.orderNumber !== undefined
                            && req.query.object.orderNumber.$in !== undefined
                            && req.query.object.orderNumber.$in !== '')
                            ? (<string>req.query.object.orderNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    paymentMethod: {
                        paymentMethodId: {
                            $in: (req.query.object !== undefined
                                && req.query.object.paymentMethod !== undefined
                                && req.query.object.paymentMethod.paymentMethodId !== undefined
                                && req.query.object.paymentMethod.paymentMethodId.$in !== undefined
                                && req.query.object.paymentMethod.paymentMethodId.$in !== '')
                                ? (<string>req.query.object.paymentMethod.paymentMethodId.$in).split(',')
                                    .map((v) => v.trim())
                                : undefined
                        }
                    },
                    event: {
                        id: {
                            $in: (req.query.object !== undefined
                                && req.query.object.event !== undefined
                                && req.query.object.event.id !== undefined
                                && req.query.object.event.id.$in !== undefined
                                && req.query.object.event.id.$in !== '')
                                ? (<string>req.query.object.event.id.$in).split(',')
                                    .map((v) => v.trim())
                                : undefined
                        }
                    },
                    acceptedOffer: {
                        ticketedSeat: {
                            seatNumber: {
                                $in: (req.query.object !== undefined
                                    && req.query.object.acceptedOffer !== undefined
                                    && req.query.object.acceptedOffer.ticketedSeat !== undefined
                                    && req.query.object.acceptedOffer.ticketedSeat.seatNumber !== undefined
                                    && req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in !== undefined
                                    && req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in !== '')
                                    ? (<string>req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in).split(',')
                                        .map((v) => v.trim())
                                    : undefined
                            }
                        }
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
                    },
                    orderNumber: {
                        $in: (req.query.purpose !== undefined
                            && req.query.purpose.orderNumber !== undefined
                            && req.query.purpose.orderNumber.$in !== undefined
                            && req.query.purpose.orderNumber.$in !== '')
                            ? (<string>req.query.purpose.orderNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                result: {
                    typeOf: {
                        $in: (req.query.result !== undefined
                            && req.query.result.typeOf !== undefined
                            && req.query.result.typeOf.$in !== undefined
                            && req.query.result.typeOf.$in !== '')
                            ? (<string>req.query.result.typeOf.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    id: {
                        $in: (req.query.result !== undefined
                            && req.query.result.id !== undefined
                            && req.query.result.id.$in !== undefined
                            && req.query.result.id.$in !== '')
                            ? (<string>req.query.result.id.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    orderNumber: {
                        $in: (req.query.result !== undefined
                            && req.query.result.orderNumber !== undefined
                            && req.query.result.orderNumber.$in !== undefined
                            && req.query.result.orderNumber.$in !== '')
                            ? (<string>req.query.result.orderNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                fromLocation: {
                    accountNumber: {
                        $in: (req.query.fromLocation !== undefined
                            && req.query.fromLocation.accountNumber !== undefined
                            && req.query.fromLocation.accountNumber.$in !== undefined
                            && req.query.fromLocation.accountNumber.$in !== '')
                            ? (<string>req.query.fromLocation.accountNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                toLocation: {
                    accountNumber: {
                        $in: (req.query.toLocation !== undefined
                            && req.query.toLocation.accountNumber !== undefined
                            && req.query.toLocation.accountNumber.$in !== undefined
                            && req.query.toLocation.accountNumber.$in !== '')
                            ? (<string>req.query.toLocation.accountNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                }
            };

            if (req.query.format === 'datatable') {
                debug('searching actions...', searchConditions);
                const searchResult = await actionService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                    data: searchResult.data
                });
            } else {
                res.render('actions/index', {
                    moment: moment,
                    searchConditions: searchConditions,
                    ActionStatusType: cinerinoapi.factory.actionStatusType,
                    ActionType: cinerinoapi.factory.actionType
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

export default actionsRouter;
