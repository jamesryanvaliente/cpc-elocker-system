const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// const tenantRouter = require('./routes/tenantRoute');
// app.use('/api', tenantRouter);

// const adminRouter = require('./routes/adminRoute');
// // const { pool } = require('./database/connection');
// app.use('/api', adminRouter);

const usersRouter = require('./routes/usersRoute');
app.use('/', usersRouter);

const lockerRouter = require('./routes/lockerRoute');
app.use('/locker', lockerRouter);

app.use('/uploads', express.static('uploads'));

module.exports = app;