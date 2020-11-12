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
                typeOf: (typeof req.query.typeOf === 'string' && req.query.typeOf.length > 0)
                    ? req.query.typeOf
                    : undefined,
                actionStatusTypes: (typeof req.query.actionStatusType === 'string' && req.query.actionStatusType.length > 0)
                    ? [req.query.actionStatusType]
                    : undefined,
                startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[0])
                        .toDate()
                    : undefined,
                startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[1])
                        .toDate()
                    : undefined,
                agent: {
                    typeOf: {
                        $in: (typeof req.query.agent?.typeOf?.$in === 'string' && req.query.agent.typeOf.$in.length > 0)
                            ? (<string>req.query.agent.typeOf.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    id: {
                        $in: (typeof req.query.agent?.id?.$in === 'string' && req.query.agent.id.$in.length > 0)
                            ? (<string>req.query.agent.id.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                object: {
                    typeOf: {
                        $in: (typeof req.query.object?.typeOf?.$in === 'string' && req.query.object.typeOf.$in.length > 0)
                            ? (<string>req.query.object.typeOf.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    id: {
                        $in: (typeof req.query.object?.id?.$in === 'string' && req.query.object.id.$in.length > 0)
                            ? (<string>req.query.object.id.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    orderNumber: {
                        $in: (typeof req.query.object?.orderNumber?.$in === 'string' && req.query.object.orderNumber.$in.length > 0)
                            ? (<string>req.query.object.orderNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    paymentMethod: {
                        $eq: (typeof req.query.object?.paymentMethod?.$eq === 'string'
                            && req.query.object.paymentMethod.$eq.length > 0)
                            ? req.query.object.paymentMethod.$eq
                            : undefined
                    },
                    paymentMethodId: {
                        $eq: (typeof req.query.object?.paymentMethodId?.$eq === 'string'
                            && req.query.object.paymentMethodId.$eq.length > 0)
                            ? req.query.object.paymentMethodId.$eq
                            : undefined
                    },
                    event: {
                        id: {
                            $in: (typeof req.query.object?.event?.id?.$in === 'string' && req.query.object.event.id.$in.length > 0)
                                ? (<string>req.query.object.event.id.$in).split(',')
                                    .map((v) => v.trim())
                                : undefined
                        }
                    },
                    acceptedOffer: {
                        ticketedSeat: {
                            seatNumber: {
                                $in: (typeof req.query.object?.acceptedOffer?.ticketedSeat?.seatNumber?.$in === 'string'
                                    && req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in.length > 0)
                                    ? (<string>req.query.object.acceptedOffer.ticketedSeat.seatNumber.$in).split(',')
                                        .map((v) => v.trim())
                                    : undefined
                            }
                        }
                    }
                },
                purpose: {
                    typeOf: {
                        $in: (typeof req.query.purpose?.typeOf?.$in === 'string' && req.query.purpose.typeOf.$in.length > 0)
                            ? (<string>req.query.purpose.typeOf.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    id: {
                        $in: (typeof req.query.purpose?.id?.$in === 'string' && req.query.purpose.id.$in.length > 0)
                            ? (<string>req.query.purpose.id.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    orderNumber: {
                        $in: (typeof req.query.purpose?.orderNumber?.$in === 'string' && req.query.purpose.orderNumber.$in.length > 0)
                            ? (<string>req.query.purpose.orderNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                result: {
                    typeOf: {
                        $in: (typeof req.query.result?.typeOf?.$in === 'string' && req.query.result.typeOf.$in.length > 0)
                            ? (<string>req.query.result.typeOf.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    id: {
                        $in: (typeof req.query.result?.id?.$in === 'string' && req.query.result.id.$in.length > 0)
                            ? (<string>req.query.result.id.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    },
                    orderNumber: {
                        $in: (typeof req.query.result?.orderNumber?.$in === 'string' && req.query.result.orderNumber.$in.length > 0)
                            ? (<string>req.query.result.orderNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                fromLocation: {
                    accountNumber: {
                        $in: (typeof req.query.fromLocation?.accountNumber?.$in === 'string'
                            && req.query.fromLocation.accountNumber.$in.length > 0)
                            ? (<string>req.query.fromLocation.accountNumber.$in).split(',')
                                .map((v) => v.trim())
                            : undefined
                    }
                },
                toLocation: {
                    accountNumber: {
                        $in: (typeof req.query.toLocation?.accountNumber?.$in === 'string'
                            && req.query.toLocation.accountNumber.$in.length > 0)
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
