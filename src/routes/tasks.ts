/**
 * タスクルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import { CREATED } from 'http-status';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const tasksRouter = express.Router();

/**
 * タスク検索
 */
tasksRouter.get(
    '',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const taskService = new cinerinoapi.service.Task({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const taskNameChoices = Object.values(cinerinoapi.factory.taskName);
            const taskStatusChoices = [
                cinerinoapi.factory.taskStatus.Aborted,
                cinerinoapi.factory.taskStatus.Executed,
                cinerinoapi.factory.taskStatus.Ready,
                cinerinoapi.factory.taskStatus.Running
            ];
            const searchConditions: cinerinoapi.factory.task.ISearchConditions<cinerinoapi.factory.taskName> = {
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
                    : moment()
                        .add(-1, 'hour')
                        .toDate(),
                runsThrough: (req.query.runsRange !== undefined && req.query.runsRange !== '')
                    ? moment(req.query.runsRange.split(' - ')[1])
                        .toDate()
                    : moment()
                        .toDate()
            };

            if (req.query.format === 'datatable') {
                const searchResult = await taskService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchResult.totalCount,
                    recordsFiltered: searchResult.totalCount,
                    data: searchResult.data
                });
            } else {
                res.render('tasks/index', {
                    moment: moment,
                    searchConditions: searchConditions,
                    taskNameChoices: taskNameChoices,
                    taskStatusChoices: taskStatusChoices
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

tasksRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            const message = undefined;

            const taskService = new cinerinoapi.service.Task({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const task = await taskService.findById({
                name: req.query.name,
                id: req.params.id
            });

            res.render('tasks/show', {
                message: message,
                task: task
            });
        } catch (error) {
            next(error);
        }
    }
);

tasksRouter.post(
    '/:id/retry',
    async (req, res, next) => {
        try {
            const taskService = new cinerinoapi.service.Task({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const task = await taskService.findById({
                name: req.query.name,
                id: req.params.id
            });

            const newTaskAttributes: cinerinoapi.factory.task.IAttributes<any> = {
                data: task.data,
                executionResults: [],
                name: task.name,
                numberOfTried: 0,
                project: task.project,
                remainingNumberOfTries: 1,
                runsAt: new Date(),
                status: cinerinoapi.factory.taskStatus.Ready
            };
            const newTask = await taskService.create(newTaskAttributes);

            res.status(CREATED)
                .json(newTask);
        } catch (error) {
            next(error);
        }
    }
);

export default tasksRouter;
