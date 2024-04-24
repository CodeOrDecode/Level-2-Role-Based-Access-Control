const mongoose = require("mongoose")

const Decideschema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
})

const Decidemodel = mongoose.model("user", Decideschema);
module.exports = Decidemodel