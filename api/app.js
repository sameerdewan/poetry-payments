const express = require('express');
const app = express();
const customers = require('../routes/customers');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/customers', customers);

module.exports = app;
