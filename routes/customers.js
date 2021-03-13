const router = require('express').Router();
const OpenApiValidator = require('express-openapi-validator');
const path = require('path');
const PoetrySystemJWT = require('../jwt');
const User = require('../db/models/User');

const apiSpec = path.join(__dirname, 'customers.yaml');
const poetryJWT = new PoetrySystemJWT();

router.use(
    OpenApiValidator.middleware({
        apiSpec,
        validateRequests: true,
    })
);

router.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
});

router.post('/create', poetryJWT.middleware, async (req, res) => {
    try {
        const { username } = req.jwt;
        const user = await User.findOne({ username }).exec();
        const customerId = await user.createCustomer();
        res.status(200).json({ customerId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
