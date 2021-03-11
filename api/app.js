const express = require('express');
const app = express();
const customers = require('../routes/customers');
const subscriptions = require('../routes/subscriptions');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/customers', customers);
app.use('/api/subscriptions', subscriptions);

module.exports = app;
