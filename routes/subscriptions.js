const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const OpenApiValidator = require('express-openapi-validator');
const PoetrySystemJWT = require('../jwt');
const User = require('../db/models/User');

const apiSpec = path.join(__dirname, 'subscriptions.yaml');
const poetryJwt = new PoetrySystemJWT();

router.use(
    OpenApiValidator.middleware({
        apiSpec,
        validateRequests: true,
    })
);

router.post('/stripe-webhook', async (req, res) => {
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );
        const dataObject = event.data.object;
        const user = User.findOne({ customerId: dataObject.metadata.customer }).exec();
        switch (event.type) {
            case 'invoice.paid':
                await user.setSubscription(dataObject);
                break;
            case 'invoice.payment_failed':
                await user.setSubscriptionNull();
                break;
            case 'customer.subscription.deleted':
                await user.deleteCustomer();
                break;
            default:
                res.status(500).json({ eventType: event.type });
        }
        res.sendStatus(200);
    } catch (error) {
        return res.sendStatus(400);
    }
});

router.post('/create-subscription', poetryJwt.middleware, async (req, res) => {
    try {
        await User.findOne({ customerId: req.body.customerId, username: req.jwt.username }).exec();
        await stripe.paymentMethods.attach(req.body.paymentMethodId, {
            customer: req.body.customerId
        });
        await stripe.customers.update(req.body.customerId, {
            invoice_settings: {
                default_payment_method: req.body.paymentMethodId
            }
        });
        const prices = await stripe.prices.list({ product: req.body.productId });
        const priceId = prices.data[0].id;
        const subscription = await stripe.subscriptions.create({
            customer: req.body.customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent']
        });
        res.status(200).send(subscription);
    } catch (error) {
        res.status(402).json({ error: error.message });
    }
});

router.post('/retry-invoice', poetryJwt.middleware, async (req, res) => {
    try {
        await stripe.paymentMethods.attach(req.body.paymentMethodId, {
            customer: req.body.customerId
        });
        await stripe.customers.update(req.body.customerId,{
            invoice_settings: {
                default_payment_method: req.body.paymentMethodId
            }
        });
        const invoice = stripe.invoices.retrieve(req.body.invoiceId, {
            expand: ['payment_intent']
        });
        res.send(invoice);
    } catch (error) {
        res.status(402).send({ error: error.message });
    }
});

router.post('/cancel-subscription', poetryJwt.middleware, async (req, res) => {
    try {
        const user = User.findOne({ username: req.jwt.username, subscriptionId: req.body.subscriptionId }).exec();         
        const deletedSubscription = await stripe.subscriptions.del(req.body.subscriptionId);
        await user.setSubscriptionNull();
        res.send(deletedSubscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
