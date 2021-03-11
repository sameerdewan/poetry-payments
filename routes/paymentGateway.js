const router = require('express').Router();
const PoetrySystemJWT = require('../jwt');
const Invoice = require('../db/models/Invoice');

const apiSpec = path.join(__dirname, 'paymentGateway.yaml');
const poetryJWT = new PoetrySystemJWT();

router.use(
    OpenApiValidator.middleware({
        apiSpec,
        validateRequests: true,
    })
);

router.post('/create', poetryJWT.middleware, async (req, res) => {
    try {
        const { username } = req.jwt.username;

    } catch (error) {

    }
});

module.exports = router;
