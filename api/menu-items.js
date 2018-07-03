const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {
    $menuItemId: menuItemId
  };
  db.get(sql, values, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menu_id';
  const values = {$menu_id: req.params.menuId}
  db.all(sql, values, (err, menuItems) => {
    res.status(200).json({menuItems: menuItems});
  });
});

menuItemsRouter.post('/', (req, res, next) => {
  const newMenuItem = req.body.menuItem;
  const name = newMenuItem.name,
        description = newMenuItem.description,
        inventory = newMenuItem.inventory,
        price = newMenuItem.price;
  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menu_id: req.params.menuId
  }
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        (err, menuItem) => {
          res.status(201).json({menuItem: menuItem});
        });
    }
  });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const updateMenuItem = req.body.menuItem;
  const name = updateMenuItem.name,
        description = updateMenuItem.description,
        inventory = updateMenuItem.inventory,
        price = updateMenuItem.price;
  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: req.params.menuItemId
  }
  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (err, menuItem) => {
          res.status(200).json({menuItem: menuItem});
        });
    }
  })
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {$menuItemId: req.params.menuItemId};

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
