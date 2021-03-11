const mongoose = require('mongoose');
require('mongoose-type-email');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const invoiceSchema = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    invoiceId: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    amount: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    jobHash: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    status: {
        type: mongoose.SchemaTypes.String,
        enum: ['unpaid', 'paid', 'started', 'completed', 'failed'],
        default: 'unpaid'
    }
});

invoiceSchema.methods.create = async function({ username, amount, jobHash }) {
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
            username,
            jobHash
        }
    });
    const invoice = new this({
        username: paymentIntent.metadata.username,
        invoiceId: paymentIntent.id,
        amount: paymentIntent.amount,
        jobHash: paymentIntent.metadata.jobHash
    });
    await invoice.save();
}

invoiceSchema.methods.retrieve = async function() {
    const invoice = await stripe.paymentIntents.retrieve(this.invoiceId);
    return invoice;
}

invoiceSchema.methods.setStatus = async function(status) {
    await mongoose.model('Invoice').findOneAndUpdate(
        { invoiceId: this.invoiceId, username: this.username },
        { $set: { status } }
    ).exec();
}

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
