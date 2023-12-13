const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    active: String,
    status: String,
    // Add other fields as needed
});

const UserDB = mongoose.model("User", userSchema);

module.exports = UserDB;
