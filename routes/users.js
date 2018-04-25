
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const dataSource = require('datasource-node');

const router = express.Router();

// create application/json parser
const jsonParser = bodyParser.json();

let settings = {
  rowHeaders: true,
  colHeaders: true,
  columnSorting: true,
  contextMenu: true,
  manualColumnMove: true,
  manualRowMove: true,
  sortIndicator: true,
  filters: true,
  dropdownMenu: true,
  mergeCells: true,
  manualRowResize: true,
  manualColumnResize: true
};

let colOrder = [];

let db = new sqlite3.Database('./database.db', ((data) => {
  if (data === null) {
    // initialize database
    db.serialize(() => {
      db.run('CREATE TABLE IF NOT EXISTS `settings` (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, key TEXT, value TEXT)');
      db.run('CREATE TABLE IF NOT EXISTS `data` (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, first_name TEXT, last_name TEXT, age INTEGER, sex TEXT, phone TEXT)');
      db.run('CREATE TABLE IF NOT EXISTS `cellMeta` (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, rowId TEXT, colId TEXT, meta TEXT)');
      db.run('CREATE TABLE IF NOT EXISTS `rowOrder` (id INTEGER, sort_order INTEGER)');
      db.run('CREATE TABLE IF NOT EXISTS `sizes` (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, colId TEXT, rowId INTEGER, size INTEGER)');
      db.run('CREATE TABLE IF NOT EXISTS `mergedCells` (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
        'parent_row_id INTEGER, parent_col_id TEXT, cell_row_id INTEGER, cell_col_id TEXT)');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS SETTINGS_INDEX ON settings (id)');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS SETTINGS_INDEX ON data (phone)');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS USER_INDEX ON cellMeta (rowId, colId)');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS ROW_INDEX on rowOrder (id)');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS MERGED_INDEX on mergedCells (cell_row_id, cell_col_id)');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS COLUMN_SIZE_INDEX on sizes (colId)');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS ROW_SIZE_INDEX on sizes (rowId)');
    });
  }
  // initailize settings
  db.serialize(() => {
    let stmt = db.prepare('INSERT INTO `settings` (`key`, `value`) VALUES (?, ?)');
    stmt.run('settings', JSON.stringify(settings), (err) => { if (err) { console.warn(err); }; });
    stmt.finalize();
  });
  // initailize dummy data
  db.serialize(() => {
    db.all('SELECT * FROM `data` LIMIT 1', (err, rows) => {
      if (rows.length === 0) {
        let stmt = db.prepare('INSERT INTO `data` (`first_name`, `last_name`,`age`,`sex`,`phone`) VALUES (?, ?, ?, ?, ?)');
        stmt.run('John', 'Smith', '10', 'male', '+435564656');
        stmt.run('Kasia', 'Sandwich', '18', 'female', '+4325324');
        stmt.run('Jane', 'Walker', '60', 'female', '+43553456');
        stmt.run('Rafal', 'Ek', '34', 'male', '+4354324234');
        stmt.run('Kam', 'Dobrz', '20', 'male', '+435223122');
        stmt.finalize();
        initRowOrder();
      }
    });
  });
  // initialize col names
  db.serialize(() => {
    db.all('SELECT sql FROM sqlite_master WHERE tbl_name = \'data\' AND type = \'table\'', (err, rows) => {
      let regExp = /([a-z0-9_]{1,20}) [A-Z]+[,]{0,1}/g;
      let match;
      // eslint-disable-next-line no-cond-assign
      while (match = regExp.exec(rows[0].sql)) {
        colOrder.push(match[0].split(' ')[0]);
      }
    });
  });
  // initialize row order
  function initRowOrder() {
    db.serialize(() => {
      db.all('SELECT * FROM `rowOrder` LIMIT 1', (err, rows) => {
        if (rows.length === 0) {
          db.all('SELECT * FROM `data`', (errData, rowsData) => {
            let stmt = db.prepare('INSERT INTO `rowOrder` (`id`, `sort_order`) VALUES (?, ?)');
            for (let i = 0; i < rowsData.length; i++) {
              stmt.run(rowsData[i].id, i + 1);
            }
            stmt.finalize();
          });
        }
      });
    });
  }

}));

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.UpdatedData}} req.body
 */
router.post('/cell', jsonParser, (req, res) => {
  let { changes } = req.body;

  for (let i = 0; i < changes.length; i++) {
    let { row, meta } = changes[i];

    db.run(`UPDATE \`data\` SET ${changes[i].column} = '${changes[i].newValue}' WHERE id = '${row}'`);

    let data = [changes[i].row, changes[i].column, JSON.stringify(meta)];
    db.run('INSERT INTO `cellMeta` (\'rowId\', \'colId\', \'meta\') VALUES (?, ?, ?)', data, (err) => {
      if (err) {
        let update = [];
        update.push(data[2]);
        update.push(data[0]);
        update.push(data[1]);
        db.run('UPDATE `cellMeta` SET meta=? WHERE rowId=? AND colId=?', update, (errCell) => {
          if (errCell) { console.error(errCell.message); }
        });
      }
    });
  }

  res.json({ data: 'ok' });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.CreatedRow}} req.body
 */
router.put('/row', jsonParser, (req, res) => {
  db.serialize(() => {
    let stmt = db.prepare('INSERT INTO `data` (`first_name`, `last_name`,`age`,`sex`,`phone`) VALUES (\'\', \'\', \'\', \'\', \'\')');
    stmt.run(function (error) {
      if (!error) {
        db.get('SELECT * from `data` where id= ?', this.lastID, (errorData, row) => {
          db.all('SELECT MAX(sort_order) FROM `rowOrder`', (errorMax, rowOrder) => {
            let position = parseInt(rowOrder[0]['MAX(sort_order)'], 10) + 1;
            db.run(`INSERT INTO \`rowOrder\` (id, sort_order) VALUES ('${row.id}', '${position}')`);
          });
          res.json({ data: row, id: row.id });
        });
      }
    });
    stmt.finalize();
  });
});

router.delete('/row', jsonParser, (req, res) => {
  let removedRows = req.body;
  for (let i = 0; i < removedRows.length; i++) {
    db.run(`DELETE FROM \`data\` WHERE id = '${removedRows[i]}'`, (err) => {
      if (err) { console.error(err.message); }
    });
  }
  res.json({ data: 'ok' });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.RowMoved}} req.body
 */
router.post('/row/move', jsonParser, (req, res) => {
  let rowMove = req.body;
  let { rowsMoved, target } = rowMove;

  let stmt = db.prepare('UPDATE `rowOrder` SET sort_order=? WHERE id=? ');
  db.serialize(() => {
    db.all('SELECT * FROM `rowOrder` ORDER BY sort_order ASC', (err, rows) => {
      let filtered = [];
      for (let i = 0; i < rowsMoved.length; i++) {
        let founded = (rows.find((row) => row.id === rowsMoved[i]));
        filtered = rows.filter((row) => row.id !== rowsMoved[i]);
        if (founded.sort_order < target) {
          filtered.splice(target - 1, 0, founded);
        } else {
          filtered.splice(target + i, 0, founded);
        }
        rows = filtered;
      }
      for (let j = 0; j < rows.length; j++) {
        rows[j].sort_order = j + 1;
        stmt.run(rows[j].sort_order, rows[j].id);
      }
      stmt.finalize();
    });
    res.json({ data: 'ok' });
  });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.RowResized}} req.body
 */
router.post('/row/resize', jsonParser, (req, res) => {
  let resize = req.body;
  db.serialize(() => {
    let stmt = db.prepare(`INSERT OR REPLACE INTO \`sizes\` (rowId, size ) VALUES ('${resize.row}', '${resize.size}')`);
    stmt.run((err) => {
      if (!err) {
        res.json({ data: 'ok' });
      }
    });
  });
});

let numOfDynamicColumns = 0;

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.CreatedColumn}} req.body
 */
router.put('/column', jsonParser, (req, res) => {
  let createCol = req.body;
  numOfDynamicColumns++;
  colOrder.splice(createCol.index, 0, `dynamic_${numOfDynamicColumns}`);
  db.serialize(() => {
    let stmt = db.prepare(`ALTER TABLE \`data\` ADD COLUMN dynamic_${numOfDynamicColumns} TEXT`);
    stmt.run((err) => {
      stmt.finalize();
      if (!err) {
        res.json({ name: `dynamic_${numOfDynamicColumns}` });
      }
    });
  });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.MergedCells}} req.body
 */

router.post('/cell/merge', jsonParser, (req, res) => {
  let mergedData = req.body;
  let { mergedParent, mergedCells } = mergedData;
  let stmt = db.prepare('INSERT INTO `mergedCells` (parent_row_id, parent_col_id, cell_row_id, cell_col_id) VALUES (?, ?, ?, ?)');
  for (let i = 0; i < mergedCells.length; i++) {
    stmt.run(mergedParent.row, mergedParent.column, mergedCells[i].row, mergedCells[i].column);
  }
  stmt.finalize();
  res.json({ data: 'ok' });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.UnmergedCells}} req.body
 */
router.post('/cell/unmerge', jsonParser, (req, res) => {
  let unmergedData = req.body;
  let { mergedParent, mergedCells } = unmergedData;

  let stmt = db.prepare('DELETE FROM `mergedCells` WHERE parent_row_id = ? AND parent_col_id = ? AND cell_row_id = ? AND cell_col_id = ?');
  for (let i = 0; i < mergedCells.length; i++) {
    stmt.run(mergedParent.row, mergedParent.column, mergedCells[i].row, mergedCells[i].column);
  }
  stmt.finalize();
  res.json({ data: 'ok' });
});

/**
* @param {{e.RequestHandler}} jsonParser
* @param {{dataSource.CellMeta}} req.query
*/
router.post('/cell/meta', jsonParser, (req, res) => {
  let cellMeta = req.body;
  db.serialize(() => {
    let tmp = {};

    tmp[cellMeta.key] = cellMeta.value;
    db.run(`INSERT INTO 'cellMeta' (rowId, colId, meta) VALUES ('${cellMeta.row}', '${cellMeta.column}', '${JSON.stringify(tmp)}')`, (error) => {
      if (error) {
        db.all(`SELECT meta FROM 'cellMeta' WHERE colId = '${cellMeta.column}' AND rowId = '${cellMeta.row}'`, (err, row) => {
          if (!err) {
            tmp = JSON.parse(row[0].meta);
            tmp[cellMeta.key] = cellMeta.value;
            db.run(`UPDATE 'cellMeta' SET meta = '${JSON.stringify(tmp)}' WHERE colId = '${cellMeta.column}' AND rowId = '${cellMeta.row}'`);
          }
        });
      }
    });
    res.json({ data: 'ok' });
  });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.ResizedColumn}} req.query
 */
router.post('/column/resize', jsonParser, (req, res) => {
  let resize = req.body;
  db.serialize(() => {
    let stmt = db.prepare(`INSERT OR REPLACE INTO \`sizes\` (colId, size ) VALUES ('${resize.column}', '${resize.size}')`);
    stmt.run((err) => {
      if (!err) {
        res.json({ data: 'ok' });
      }
    });
  });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.SearchParams}} req.query
 */
router.post('/data', jsonParser, (req, res) => {
  let queryBuilder = new dataSource.QueryBuilder(req.body, 'data');
  let dataQuery = queryBuilder.buildQuery('SELECT data.* FROM `data` JOIN rowOrder ON data.id = rowOrder.id');
  let cellQuery = queryBuilder.buildQuery('SELECT cellMeta.* FROM `cellMeta` JOIN data ON data.id = cellMeta.rowId', false);

  db.all(dataQuery, (err, rows) => {
    db.all(cellQuery, (error, meta) => {
      res.json({
        data: rows, meta, colOrder, rowId: 'id'
      });
    });
  });
});

/**
 * @param {{e.RequestHandler}} jsonParser
 * @param {{dataSource.ColumnMoved}} req.body
 */
router.post('/column/move', jsonParser, (req, res) => {
  let colMoved = req.body;

  let columns = colMoved.columnNames;
  let position = colMoved.target;

  let begin = colOrder
    .slice(0, position)
    .filter((x) => columns.indexOf(x) === -1);
  let end = colOrder.slice(position).filter((x) => columns.indexOf(x) === -1);

  colOrder = begin;
  colOrder = colOrder.concat(columns);
  colOrder = colOrder.concat(end);

  res.json({ data: colOrder });
});

router.get('/settings', jsonParser, (req, res) => {
  let colTypes = [];
  db.serialize(() => {
    db.all('SELECT sql FROM sqlite_master WHERE tbl_name = \'data\' AND type = \'table\'', (err, rows) => {
      let regExp = /([a-z0-9_]{1,20}) [A-Z]+[,]{0,1}/g;
      let match;
      // eslint-disable-next-line no-cond-assign
      while (match = regExp.exec(rows[0].sql)) {
        let type = match[0].split(' ')[1].replace(/,\s*$/, '');
        if (type === 'INTEGER' || type === 'INT') {
          type = 'NUMERIC';
        }
        colTypes.push({ type: type.toLowerCase() });
      }
      Object.assign(settings, { columns: colTypes });
      res.json({ data: settings });
    });
  });
});

router.get('/', (req, res) => {
  res.render('index');
});

router.delete('/column', jsonParser, (req, res) => {
  let colRemoved = req.body;
  for (let i = 0; i < colRemoved.length; i++) {
    colOrder = colOrder.filter((item) => item !== colRemoved[i]);
  }
  let columnsString = '';
  for (let i = 0; i < colOrder.length; i++) {
    columnsString += colOrder[i];
    if (i !== colOrder.length - 1) {
      columnsString += ', ';
    }
  }
  db.serialize(() => {
    db.run(`CREATE TABLE data_temp AS SELECT ${columnsString} FROM data`, (err) => {
      if (!err) {
        db.run('DROP TABLE `data`', (dropError) => {
          if (!dropError) {
            db.run('ALTER TABLE `data_temp` RENAME TO `data`', (alterError) => {
              if (!alterError) {
                res.json({ data: 'ok' });
              }
            });
          }
        });
      }
    });
  });
});

module.exports = router;
