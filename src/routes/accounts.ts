/**
 * 口座ルーター
 */
import * as cinerinoapi from '@cinerino/api-nodejs-client';
// import * as createDebug from 'debug';
import * as express from 'express';

// const debug = createDebug('cinerino-console:routes:account');
const accountsRouter = express.Router();

/**
 * 口座検索
 */
accountsRouter.get(
    '',
    async (req, res, next) => {
        try {
            const consoleUrl = <string>process.env.PECORINO_CONSOLE_URL;

            res.render('accounts/index', {
                query: req.query,
                consoleUrl: consoleUrl
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 口座に対する転送アクション検索
 */
accountsRouter.get(
    '/actions/MoneyTransfer',
    async (req, res, next) => {
        try {
            const accountService = new cinerinoapi.service.Account({
                endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
                auth: req.user.authClient
            });

            const searchConditions:
                cinerinoapi.factory.pecorino.action.transfer.moneyTransfer.ISearchConditions<cinerinoapi.factory.accountType> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: cinerinoapi.factory.pecorino.sortType.Descending },
                accountType: req.query.accountType,
                accountNumber: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                    <string>req.query.accountNumber :
                    undefined
            };

            if (req.query.format === 'datatable') {
                const { totalCount, data } = await accountService.searchMoneyTransferActions(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: totalCount,
                    recordsFiltered: totalCount,
                    data: data
                });
            } else {
                res.render('accounts/actions/moneyTransfer/index', {
                    query: req.query
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 口座詳細
 */
accountsRouter.get(
    '/:accountType/:accountNumber',
    async (req, res, next) => {
        try {
            const consoleUrl = <string>process.env.PECORINO_CONSOLE_URL;

            const redirect =
                `${consoleUrl}/projects/${req.project.id}/accounts/${req.params.accountType}/${req.params.accountNumber}`;

            res.redirect(redirect);
        } catch (error) {
            next(error);
        }
    }
);

export default accountsRouter;
