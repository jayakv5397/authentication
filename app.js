//jshint esversion:6
import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport from 'passport';
import passportLocalMangoose from 'passport-local-mongoose';
// import encrypt from "mongoose-encryption";
// import md5 from "md5";
// import bcrypt from "bcrypt";

// const saltRounds = 10;

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'keyboard cat.',
    resave: false,
    saveUninitialized: false
  }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMangoose);

const User = new mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',(req,res)=>{
    res.render('home.ejs');
})

app.get('/register',(req,res)=>{
    res.render('register.ejs');
});

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/logout',(req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})

app.post('/register',(req,res)=>{
    console.log(req.body);

    User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect('/register')
         }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            })
         }
    
      });

    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //     newUser.save().then(
    //         (result) => {
    //             res.render('secrets') 
    //         },
    //         (error) => {
    //             console.log(error); // Log an error
    //         }   
    //     );
    // });

    
    
    
});


app.post("/login",(req,res)=>{

    const username = req.body.username;
    const password = req.body.password;

    

    console.log(username,password);

    const user = new User({
        username : username,
        password : password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            });
        }
    });

    // User.findOne({email: username}).then(
        
    //     (result) => {

    //         bcrypt.compare(password, result.password).then(function(output) {
    //             if (output===true) {
    //                 res.render('secrets')
    //             }
    //             else{
    //                 res.redirect("login")
    //             }
    //         });

    //     },
    //     (error) => {
    //         console.log(error); // Log an error
    //     }   
    // );
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });