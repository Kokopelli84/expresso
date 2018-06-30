const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items.js')

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

module.exports = menusRouter;
