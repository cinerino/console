/**
 * 口座ルーター
 */
import * as cinerinoapi from '@cinerino/api-nodejs-client';
// import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

// const debug = createDebug('cinerino-console:routes:account');
const accountsRouter = express.Router();

/**
 * 口座検索
 */
accountsRouter.get(
    '',
    async (req, res, next) => {
        try {
            const accountService = new cinerinoapi.service.Account({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });

            const searchConditions: cinerinoapi.factory.pecorino.account.ISearchConditions<cinerinoapi.factory.accountType> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { openDate: cinerinoapi.factory.pecorino.sortType.Descending },
                accountType: req.query.accountType,
                accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                    [req.query.accountNumber] :
                    [],
                statuses: [],
                name: req.query.name
            };
            if (req.query.format === 'datatable') {
                const { totalCount, data } = await accountService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: totalCount,
                    recordsFiltered: totalCount,
                    data: data
                });
            } else {
                res.render('accounts/index', {
                    query: req.query
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

accountsRouter.get(
    '/coin',
    async (_, res, next) => {
        try {
            res.render('accounts/coin/index', {
                moment: moment
            });
        } catch (error) {
            next(error);
        }
    }
);

accountsRouter.get(
    '/point',
    async (_, res, next) => {
        try {
            res.render('accounts/point/index', {
                moment: moment
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
                endpoint: req.project.settings.API_ENDPOINT,
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
            const redirect =
                `${req.project.settings.PECORINO_CONSOLE_ENDPOINT}/accounts/${req.params.accountType}/${req.params.accountNumber}`;

            res.redirect(redirect);
        } catch (error) {
            next(error);
        }
    }
);

export default accountsRouter;
