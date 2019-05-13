"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * プロジェクトルーター
 */
const express = require("express");
const cinerinoapi = require("../cinerinoapi");
const projectsRouter = express.Router();
projectsRouter.all('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const message = '';
        const projectService = new cinerinoapi.service.Project({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        res.render('projects/edit', {
            message: message,
            project: project
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = projectsRouter;
