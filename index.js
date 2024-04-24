const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const Decidemodel = require("./deciderole")
const Bookmodel = require("./book")
require('dotenv').config()
const server = express();
server.use(express.json());
const PORT = 3004;


mongoose.connect("mongodb://127.0.0.1:27017/ggggg");

const authmiddleware = (req, res, next) => {
    let token = req.headers.token.split(" ")[1];
    jwt.verify(token, 'masai', (err, result) => {
        if (err) {
            return res.status(400).send("you are not allowed to access it");
        }
        else {
            req.user = result;
            next()
        }

    });
}


const authmiddleware2 = (roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(400).send("not allowed");
        }
    }
}


server.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    const user = await Decidemodel.findOne({ email: email });
    try {
        if (user) {
            return res.status(400).send("User already exist");
        }
        else {

            bcrypt.hash(password, 2, async (err, hassedpassword) => {
                let newUser = new Decidemodel({
                    name: name,
                    email: email,
                    role: role,
                    password: hassedpassword
                })
                await Decidemodel.create(newUser);
                return res.status(200).send("User is  created");
            });

        }

    } catch (error) {
        return res.status(400).send("error");
    }
})




server.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await Decidemodel.findOne({ email: email });


    try {
        if (!user) {
            return res.status(400).send("User not exist");
        }
        else {
            bcrypt.compare(password, user.password, async (err, result) => {
                if (result) {

                    const token = jwt.sign({ email: user.email, role: user.role }, 'masai', { expiresIn: '1h' });


                    return res.status(200).send({ message: "Login Successful", token: token });
                }
                else {
                    return res.status(400).send("Invalid Credentials");
                }
            });

        }


    } catch (error) {
        return res.status(400).send("error");
    }
})




server.post("/addbook", authmiddleware, authmiddleware2(["member"]), async (req, res) => {
    try {
        await Bookmodel.create(req.body);
        res.status(200).send("Book added");
    } catch (error) {
        console.log(error);
        res.status(404).send("error");
    }
})

server.get("/getbook", authmiddleware, authmiddleware2(["member","manager","admin"]), async (req, res) => {
    try {
        let data = await Bookmodel.find();
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(404).send("error");
    }
})



server.delete("/deletebook/:_id",authmiddleware, authmiddleware2(["member"]), async (req, res) => {
    try {
        await Bookmodel.deleteOne(req.params);
        res.status(200).send("Product deleted");
    } catch (error) {
        console.log(error);
        res.status(404).send("error");
    }
})

server.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`);
})