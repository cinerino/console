/**
 * エラーハンドラーミドルウェア
 */
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status';

const debug = createDebug('cinerino-console:middlewares');
export default (err: any, __: Request, res: Response, next: NextFunction) => {
    debug('errorHandler', err);
    if (res.headersSent) {
        next(err);

        return;
    }

    // エラーオブジェクトの場合は、キャッチされた例外でクライント依存のエラーの可能性が高い
    if (err instanceof Error) {
        res.status(BAD_REQUEST).json({
            errors: [
                {
                    title: err.name,
                    detail: err.message
                }
            ]
        });
    } else {
        res.status(INTERNAL_SERVER_ERROR).json({
            errors: [
                {
                    title: 'internal server error',
                    detail: 'an unexpected error occurred.'
                }
            ]
        });
    }
};
