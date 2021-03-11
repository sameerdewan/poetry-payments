const mongoose = require('mongoose');
require('mongoose-type-email');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const userSchema = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true,
        min: [3, 'Username is too short'],
        max: [20, 'Username is too long']
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true,
        min: [5, 'Password is too short']
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        unique: true,
        required: true
    },
    validated: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    validationCode: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    credit: {
        type: mongoose.SchemaTypes.Number,
        default: 0
    },
    customerId: {
        type: mongoose.SchemaTypes.String,
        default: null
    }
});

userSchema.methods.createCustomer = async function(stripeToken) {
    const customer = await stripe.customers.create({
        email: this.email,
        source: stripeToken
    });
    await mongoose.model('User').findOneAndUpdate(
        { username: this.username },
        { $set: { customerId: customer.id } }
    ).exec();
}

userSchema.methods.chargeCustomer = async function({ description, amount, statement_descriptor_suffix }) {
    const charge = await stripe.charges.create({
        amount,
        description,
        statement_descriptor_suffix,
        currency: 'usd',
        customer: this.customerId,
        receipt_email: this.email,
        metadata: {
            username: this.username,
            email: this.email,
            customerId: this.customerId
        }
    });
    await mongoose.model('User').findOneAndUpdate(
        { username: this.username, customId: this.customerId },
        { $set: { credit: amount } }
    ).exec();
    return charge;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
