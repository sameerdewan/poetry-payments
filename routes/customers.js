const router = require('express').Router();
const PoetrySystemJWT = require('../jwt');

const apiSpec = path.join(__dirname, 'customers.yaml');
const poetryJWT = new PoetrySystemJWT();

router.use(
    OpenApiValidator.middleware({
        apiSpec,
        validateRequests: true,
    })
);

router.post('/create', poetryJWT.middleware, async (req, res) => {
    try {
        const { username } = req.jwt;

    } catch (error) {

    }
});

module.exports = router;
