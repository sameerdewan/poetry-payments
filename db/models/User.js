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
    customerId: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
    subscription: {
        type: mongoose.SchemaTypes.String,
        enum: [null, 'Basic', 'Professional', 'Business', 'Unlimited'],
        default: null
    },
    subscriptionId: {
        type: mongoose.SchemaTypes.String,
        default: null
    },
    monthToDatePings: {
        type: mongoose.SchemaTypes.Number,
        default: 0
    }
});

userSchema.methods.createCustomer = async function() {
    const customer = await stripe.customers.create({
        email: this.email,
        name: this.username,
        metadata: {
            username: this.username,
            email: this.email
        }
    });
    await mongoose.model('User').findOneAndUpdate(
        { username: this.username, email: this.email },
        { $set: { customerId: customer.id } }
    ).exec();
    return customer.id;
}

userSchema.methods.retrieveCustomer = async function() {
    const customer = await stripe.customers.retrieve(this.customerId);
    return customer;
}

userSchema.methods.deleteCustomer = async function() {
    const deleted = await stripe.customers.del(this.customerId);
    return deleted;
}

userSchema.methods.setSubscriptionNull = async function() {
    await mongoose.model('User').findOneAndUpdate(
        { username: this.username, email: this.email },
        { $set: { subscription: null, subscriptionId: null } }
    ).exec();
}

userSchema.methods.setSubscription = async function(dataObject) {
    const productId = dataObject.items.data[0].price.product;
    const product = await stripe.products.retrieve(productId);
    await mongoose.model('User').findOneAndUpdate(
        { username: this.username, email: this.email },
        { $set: { subscription: product.name, subscriptionId: dataObject.id } }
    ).exec();
}

const User = mongoose.model('User', userSchema);

module.exports = User;
