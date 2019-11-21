"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ホームルーター
 */
// import * as createDebug from 'debug';
const express = require("express");
// import * as moment from 'moment';
const cinerinoapi = require("../cinerinoapi");
const projectsFromEnvironment = (process.env.PROJECTS !== undefined) ? JSON.parse(process.env.PROJECTS) : [];
// const debug = createDebug('cinerino-console:routes');
const homeRouter = express.Router();
homeRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield Promise.all(projectsFromEnvironment.map((p) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const projectService = new cinerinoapi.service.Project({
                    endpoint: p.settings.API_ENDPOINT,
                    auth: req.user.authClient
                });
                let project;
                return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
                    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                        if (project === undefined) {
                            reject(new Error('Couldn\'t get project details'));
                        }
                    }), 
                    // tslint:disable-next-line:no-magic-numbers
                    5000);
                    project = yield projectService.findById({ id: p.id });
                    resolve(project);
                }));
            }
            catch (error) {
                return p;
            }
        })));
        res.render('dashboard', {
            layout: 'layouts/dashboard',
            message: 'Welcome to Cinerino Console!',
            projects: projects
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = homeRouter;
