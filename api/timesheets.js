const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (err, timesheet) => {
    if (err) {
      next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Timesheet WHERE employee_id = $employeeId`;
  const values = {$employeeId: req.params.employeeId};
  db.all(sql, values, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({timesheets: timesheets})
    }
  })
});

timesheetsRouter.post('/', (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  const hours = newTimesheet.hours,
        rate = newTimesheet.rate,
        date = newTimesheet.date;
  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }
  const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)`;
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employee_id: req.params.employeeId
  };
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        (err, timesheet) => {
          res.status(201).json({timesheet: timesheet})
        })
    }
  })
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const updateTimesheet = req.body.timesheet;
  const hours = updateTimesheet.hours,
        rate = updateTimesheet.rate,
        date = updateTimesheet.date;
  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.employee_id = $employee_id`;
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employee_id: req.params.employeeId
  }
  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        (err, timesheet) => {
          res.status(200).json({timesheet: timesheet});
        }
      )
    }
  })
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: req.params.timesheetId};

  db.run(sql, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  })
});


module.exports = timesheetsRouter;
