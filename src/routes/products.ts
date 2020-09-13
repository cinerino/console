/**
 * プロダクトルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

// const debug = createDebug('cinerino-console:routes');
const productsRouter = express.Router();

/**
 * 検索
 */
productsRouter.get(
    '',
    async (req, res, next) => {
        try {
            const productService = new cinerinoapi.service.Product({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchConditions: any = {
                limit: req.query.limit,
                page: req.query.page,
                typeOf: {
                    $eq: (typeof req.query?.typeOf?.$eq === 'string' && req.query.typeOf.$eq.length > 0)
                        ? req.query.typeOf.$eq
                        : undefined
                },
                ...{
                    identifier: (typeof req.query.identifier === 'string' && req.query.identifier.length > 0)
                        ? { $eq: req.query.identifier }
                        : undefined
                }
            };

            if (req.query.format === 'datatable') {
                const { data } = await productService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: searchOrdersResult.totalCount,
                    recordsFiltered: (data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(data.length),
                    data: data
                });
            } else {
                res.render('products', {
                    searchConditions: searchConditions,
                    ProductType: cinerinoapi.factory.chevre.product.ProductType
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

export default productsRouter;
