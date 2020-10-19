/**
 * インボイスルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const invoicesRouter = express.Router();

/**
 * インボイス検索
 */
invoicesRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const invoiceService = new cinerinoapi.service.Invoice({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            let identifiers: cinerinoapi.factory.person.IIdentifier | undefined;

            if (req.query.customer !== undefined) {
                if (Array.isArray(req.query.customer.userPoolClients)) {
                    identifiers = req.query.customer.userPoolClients.map((userPoolClient: string) => {
                        return {
                            name: 'clientId',
                            value: userPoolClient
                        };
                    });
                }

                if (req.query.customer.identifiers !== '') {
                    const splitted = (<string>req.query.customer.identifiers).split(':');
                    if (splitted.length > 1) {
                        identifiers = [
                            {
                                name: splitted[0],
                                value: splitted[1]
                            }
                        ];
                    }
                }
            }

            const searchConditions: cinerinoapi.factory.invoice.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { createdAt: cinerinoapi.factory.sortType.Descending },
                customer: {
                    ids: (req.query.customer !== undefined
                        && req.query.customer.ids !== undefined
                        && req.query.customer.ids !== '')
                        ? (<string>req.query.customer.ids).split(',')
                            .map((v) => v.trim())
                        : undefined,
                    identifiers: identifiers,
                    email: (req.query.customer !== undefined && req.query.customer.email !== '')
                        ? req.query.customer.email
                        : undefined,
                    telephone: (req.query.customer !== undefined && req.query.customer.telephone !== '')
                        ? req.query.customer.telephone
                        : undefined
                },
                referencesOrder: {
                    orderNumbers: (req.query.referencesOrder !== undefined
                        && req.query.referencesOrder.orderNumbers !== undefined
                        && req.query.referencesOrder.orderNumbers !== '')
                        ? (<string>req.query.referencesOrder.orderNumbers).split(',')
                            .map((v) => v.trim())
                        : undefined
                },
                paymentStatuses: (req.query.paymentStatuses !== undefined)
                    ? req.query.paymentStatuses
                    : undefined,
                createdFrom: (req.query.createdAtRange !== undefined && req.query.createdAtRange !== '')
                    ? moment(req.query.createdAtRange.split(' - ')[0])
                        .toDate()
                    : moment()
                        .add(-1, 'day')
                        .toDate(),
                createdThrough: (req.query.createdAtRange !== undefined && req.query.createdAtRange !== '')
                    ? moment(req.query.createdAtRange.split(' - ')[1])
                        .toDate()
                    : moment()
                        .toDate(),
                confirmationNumbers: (req.query.confirmationNumbers !== undefined && req.query.confirmationNumbers !== '')
                    ? (<string>req.query.confirmationNumbers).split(',')
                        .map((v) => v.trim())
                    : undefined,
                paymentMethods: (req.query.paymentMethods !== undefined)
                    ? req.query.paymentMethods
                    : undefined,
                paymentMethodIds: (req.query.paymentMethodIds !== undefined
                    && req.query.paymentMethodIds !== '')
                    ? (<string>req.query.paymentMethodIds).split(',')
                        .map((v) => v.trim())
                    : undefined
            };

            if (req.query.format === 'datatable') {
                const searchResult = await invoiceService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                    data: searchResult.data
                });
            } else {
                const categoryCodeService = new cinerinoapi.service.CategoryCode({
                    endpoint: req.project.settings.API_ENDPOINT,
                    auth: req.user.authClient,
                    project: { id: req.project.id }
                });
                const searchPaymentMethodTypesResult = await categoryCodeService.search({
                    inCodeSet: { identifier: { $eq: cinerinoapi.factory.chevre.categoryCode.CategorySetIdentifier.PaymentMethodType } }
                });

                res.render('invoices/index', {
                    moment: moment,
                    searchConditions: searchConditions,
                    PaymentStatusType: cinerinoapi.factory.paymentStatusType,
                    paymentMethodTypes: searchPaymentMethodTypesResult.data
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

export default invoicesRouter;
