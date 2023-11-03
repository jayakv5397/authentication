//jshint esversion:6
import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/userDB");


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });


const User = new mongoose.model("User", userSchema);

app.get('/',(req,res)=>{
    res.render('home.ejs');
})

app.get('/register',(req,res)=>{
    res.render('register.ejs');
});

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/logout',(req,res)=>{
    res.render('home');
})

app.post('/register',(req,res)=>{
    console.log(req.body);
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save().then(
        (result) => {
            res.render('secrets') 
        },
        (error) => {
            console.log(error); // Log an error
        }   
    );
    
});


app.post("/login",(req,res)=>{

    const username = req.body.username;
    const password = req.body.password;
    console.log(username,password);

    User.findOne({email: username}).then(
        
        (result) => {
            if(password === result.password){ res.render('secrets')}
            else{res.redirect("login")};
        },
        (error) => {
            console.log(error); // Log an error
        }   
    );
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });