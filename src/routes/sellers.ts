/**
 * 販売者ルーター
 */
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const sellersRouter = express.Router();

/**
 * 販売者検索
 */
sellersRouter.get(
    '',
    async (req, res, next) => {
        try {
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchConditions: cinerinoapi.factory.seller.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                name: req.query.name
            };
            if (req.query.format === 'datatable') {
                const searchResult = await sellerService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                    data: searchResult.data
                });
            } else {
                res.render('sellers/index', {
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 販売者編集
 */
sellersRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            // let message;
            // let attributes: cinerinoapi.factory.seller.IAttributes<cinerinoapi.factory.organizationType> | undefined;

            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

            const sellerService = new cinerinoapi.service.Seller({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const seller = await sellerService.findById({ id: req.params.id });

            // if (req.method === 'DELETE') {
            // } else if (req.method === 'POST') {
            // }

            res.render('sellers/edit', {
                message: undefined,
                seller: seller,
                OrganizationType: cinerinoapi.factory.chevre.organizationType,
                PlaceType: { Online: 'Online', Store: 'Store' },
                WebAPIIdentifier: cinerinoapi.factory.service.webAPI.Identifier,
                project: project
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 劇場の注文検索
 */
sellersRouter.get(
    '/:id/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment()
                    .add(-1, 'day')
                    .toDate(),
                orderDateThrough: new Date(),
                seller: {
                    ids: [req.params.id]
                }
            });

            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    }
);

export default sellersRouter;
