const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const User = require('../db/models/User');

router.post('/stripe-webhook', async (req, res) => {
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );
        const dataObject = event.data.object;
        const user = User.findOne({ customerId: dataObject.metadata.customer });
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

module.exports = router;
