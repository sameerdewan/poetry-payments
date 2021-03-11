const router = require('express').Router();
const PoetrySystemJWT = require('../jwt');

const apiSpec = path.join(__dirname, 'paymentGateway.yaml');
const poetryJWT = new PoetrySystemJWT();

router.use(
    OpenApiValidator.middleware({
        apiSpec,
        validateRequests: true,
    })
);



module.exports = router;
