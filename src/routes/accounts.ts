/**
 * 口座ルーター
 */
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
 * 口座詳細
 */
accountsRouter.get(
    '/:accountNumber',
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
