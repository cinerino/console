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
 * タスクルーター
 */
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const moment = require("moment");
const cinerinoapi = require("../cinerinoapi");
const debug = createDebug('cinerino-console:routes');
const tasksRouter = express.Router();
/**
 * タスク検索
 */
tasksRouter.get('', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('req.query:', req.query);
        const taskService = new cinerinoapi.service.Task({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const taskNameChoices = Object.values(cinerinoapi.factory.taskName);
        const taskStatusChoices = [
            cinerinoapi.factory.taskStatus.Aborted,
            cinerinoapi.factory.taskStatus.Executed,
            cinerinoapi.factory.taskStatus.Ready,
            cinerinoapi.factory.taskStatus.Running
        ];
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { runsAt: cinerinoapi.factory.sortType.Descending },
            name: (req.query.name !== '')
                ? req.query.name
                : undefined,
            statuses: (req.query.statuses !== undefined) ? req.query.statuses : undefined,
            runsFrom: (req.query.runsRange !== undefined && req.query.runsRange !== '')
                ? moment(req.query.runsRange.split(' - ')[0])
                    .toDate()
                : undefined,
            runsThrough: (req.query.runsRange !== undefined && req.query.runsRange !== '')
                ? moment(req.query.runsRange.split(' - ')[1])
                    .toDate()
                : undefined
        };
        if (req.query.format === 'datatable') {
            const searchResult = yield taskService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                // recordsTotal: searchOrdersResult.totalCount,
                recordsFiltered: (searchResult.data.length === Number(searchConditions.limit))
                    ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                    : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(searchResult.data.length),
                data: searchResult.data
            });
        }
        else {
            res.render('tasks/index', {
                moment: moment,
                searchConditions: searchConditions,
                taskNameChoices: taskNameChoices,
                taskStatusChoices: taskStatusChoices
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
tasksRouter.all('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = undefined;
        const taskService = new cinerinoapi.service.Task({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const task = yield taskService.findById({
            name: req.query.name,
            id: req.params.id
        });
        res.render('tasks/show', {
            message: message,
            task: task
        });
    }
    catch (error) {
        next(error);
    }
}));
tasksRouter.post('/:id/retry', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskService = new cinerinoapi.service.Task({
            endpoint: `${req.project.settings.API_ENDPOINT}/projects/${req.project.id}`,
            auth: req.user.authClient
        });
        const task = yield taskService.findById({
            name: req.query.name,
            id: req.params.id
        });
        const newTaskAttributes = {
            data: task.data,
            executionResults: [],
            name: task.name,
            numberOfTried: 0,
            project: task.project,
            remainingNumberOfTries: 1,
            runsAt: new Date(),
            status: cinerinoapi.factory.taskStatus.Ready
        };
        const newTask = yield taskService.create(newTaskAttributes);
        res.status(http_status_1.CREATED)
            .json(newTask);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = tasksRouter;
