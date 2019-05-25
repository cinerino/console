/**
 * アプリケーション固有の型定義
 */
import * as cinerino from '@cinerino/api-nodejs-client';
import * as express from 'express';

export interface ISettings {
    id: string;
    API_ENDPOINT: string;
    CHEVRE_BACKEND_ENDPOINT: string;
    PECORINO_CONSOLE_ENDPOINT: string;
}

import User from '../user';
declare global {
    namespace Express {
        // tslint:disable-next-line:interface-name
        export interface Request {
            user: User;
            project: cinerino.factory.project.IProject & {
                settings: ISettings;
            };
        }
    }
}
