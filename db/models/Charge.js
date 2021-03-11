const mongoose = require('mongoose');
require('mongoose-type-email');

const chargeSchema = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    customerId: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    chargeId: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    receipt_url: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    amount: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    created: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    statement_descriptor_suffix: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

const Charge = mongoose.model('Charge', chargeSchema);

module.exports = Charge;
