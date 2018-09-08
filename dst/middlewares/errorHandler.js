"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * エラーハンドラーミドルウェア
 */
const createDebug = require("debug");
const http_status_1 = require("http-status");
const debug = createDebug('cinerino-console:middlewares');
exports.default = (err, __, res, next) => {
    debug('errorHandler', err);
    if (res.headersSent) {
        next(err);
        return;
    }
    // エラーオブジェクトの場合は、キャッチされた例外でクライント依存のエラーの可能性が高い
    if (err instanceof Error) {
        res.status(http_status_1.BAD_REQUEST).json({
            errors: [
                {
                    title: err.name,
                    detail: err.message
                }
            ]
        });
    }
    else {
        res.status(http_status_1.INTERNAL_SERVER_ERROR).json({
            errors: [
                {
                    title: 'internal server error',
                    detail: 'an unexpected error occurred.'
                }
            ]
        });
    }
};
