/**
 * アプリケーション固有の型定義
 */
import * as cinerino from '@cinerino/api-nodejs-client';
import * as express from 'express';

export interface ISettings {
    id: string;
    API_ENDPOINT: string;
    CHEVRE_BACKEND_ENDPOINT: string;
    ADMIN_COGNITO_USER_POOL_ID: string;
    DEFAULT_COGNITO_USER_POOL_ID: string;
    MVTK_COMPANY_CODE: string;
    PECORINO_CONSOLE_ENDPOINT: string;
    PROJECT_LOGO_URL: string;
    PROJECT_ORGANIZATION: string;
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
