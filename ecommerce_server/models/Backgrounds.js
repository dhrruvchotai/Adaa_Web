const mongoose = require("mongoose");

const bgSchema = new mongoose.Schema({
    URL: String,
    selected: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("backgrounds", bgSchema);