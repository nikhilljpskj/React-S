const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'psp_india',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Server!');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      res.status(200).json({ success: true, message: 'Login successful', data: results });
    }
  );
});

app.post('/reg', async (req, res) => {
  try {
    const { firstname, lastname, username, password, avatar, type } = req.body;

    const existingUser = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (error, results) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO users (firstname, lastname, username, password, avatar, type) VALUES (?, ?, ?, ?, ?, ?)',
        [firstname, lastname, username, password, avatar, type],
        (error) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.get('/users', (req, res) => {
  const query = 'SELECT * FROM users';

  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// Delete a user by ID
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.sendStatus(204); // Success - No Content
    }
  });
});

app.post('/customer', async (req, res) => {
  try {
    const { name, address, cperson, contact, status } = req.body;

    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO customer_list (name, address, cperson, contact, status) VALUES (?, ?, ?, ?, ?)',
        [name, address, cperson, contact, status === 'Active' ? 1 : 0],
        (error) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });

    res.status(201).json({ success: true, message: 'Customer data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/customer_list', (req, res) => {
  connection.query('SELECT * FROM customer_list', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      res.status(200).json({ success: true, data: results });
    }
  });
});

// ... Existing code ...

app.get('/customer_list/:customerId', (req, res) => {
  const { customerId } = req.params;

  connection.query('SELECT * FROM customer_list WHERE id = ?', [customerId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ success: false, message: 'Customer data not found' });
      } else {
        const customerData = results[0];
        res.status(200).json({ success: true, data: customerData });
      }
    }
  });
});

// ... Remaining code ...


app.post('/supplier', async (req, res) => {
  try {
    const { name, address, cperson, contact, status } = req.body;

    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO supplier_list (name, address, cperson, contact, status) VALUES (?, ?, ?, ?, ?)',
        [name, address, cperson, contact, status === 'Active' ? 1 : 0],
        (error) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });

    res.status(201).json({ success: true, message: 'Supplier data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/supplier_list', (req, res) => {
  connection.query('SELECT * FROM supplier_list', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});


// Assuming you have the necessary imports and setup for Express.js and Sequelize
app.post('/save_item', async (req, res) => {
  try {
    const { supplierId, name, description, cost, status } = req.body;

    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO item_list (name, description, supplier_id, cost, status) VALUES (?, ?, ?, ?, ?)',
        [name, description, supplierId, cost, status === 'Active' ? 1 : 0],
        (error) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });

    res.status(201).json({ success: true, message: 'Item data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/item_list', (req, res) => {
  connection.query(
    'SELECT item_list.*, supplier_list.name AS supplier_name FROM item_list INNER JOIN supplier_list ON item_list.supplier_id = supplier_list.id',
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      } else {
        res.status(200).json(results);
      }
    }
  );
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
