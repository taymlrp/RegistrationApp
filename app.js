const express = require('express');
const mysql = require('mysql2');

//******** TODO: Insert code to import 'express-session' *********//
const session = require("express-session");

const flash = require('connect-flash');

const app = express();

// Database connection
const db = mysql.createConnection({
    host: 'mysql-tayml.alwaysdata.net',
    user: 'tayml',
    password: 'Pzcc9t6r24',
    database: 'tayml_supermarket'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

//******** TODO: Insert code for Session Middleware below ********//
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialiized: true,
    cookie: {maxAge:1000*60*60*24*7}
}));

app.use(flash());

// Setting up EJS
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user, messages: req.flash('success')});
});

app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});



//******** TODO: Create a middleware function validateRegistration ********//
const validateRegistration = (req, res, next)=>{
    const {username, email, password,address, contact} = req.body;
    if(!username|| !email || !password ||!address ||!contact){
        return res.status(400).send("All fields are req");
    }
    if (password.length < 6){
        req.flash("error", "Password shd be 6 or more char");
        req.flash("formData", req.body);
        return res.redirect("/register");
    }
    next();
};

const checkAuthenticated = (req, res, next) =>{
    if (req.session.user){
        return next();
    }else{
        req.flash("error", "Pls log in to view this resource");
        res.redirect("/login");
    }
}

const checkAdmin = (req, res, next) => {
    if (req.session.user.role === "admin"){
        return next();
    }else{ 
        req.flash("error", "Access denied");
        res.redirect("/dashboard");
    }
}

//******** TODO: Integrate validateRegistration into the register route. ********//
app.post('/register', validateRegistration, (req, res) => {

    const { username, email, password, address, contact, role } = req.body;

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    db.query(sql, [username, email, password, address, contact, role], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
});

//******** TODO: Insert code for login routes to render login page below ********//
app.get("/login", (req,res) => {
    res.render("login", {
        messages: req.flash("success"),
        errors: req.flash("error")
    });
}); 


//******** TODO: Insert code for login routes for form submission below ********//
app.post("/login", (req, res)=>{
    const {email, password}= req.body;

    if (!email || !password){
        req.flash("error", "All fields are required");
        return res.redirect("/login");
    }
    const sql = "SELECT * FROM users WHERE email =? AND password=SHA1(?)";
    db.query(sql, [email, password], (err, results)=>{
        if (err){
            throw err;
        }
        if (results.length>0){
            req.session.user = results[0];
            req.flash("success", "Login success");
            res.redirect("/dashboard");
        }else{
            req.flash("error", "Invalid email or password");
            res.redirect("/login");
        }
    })
})

//* Add for dashboard */
app.get("/dashboard", checkAuthenticated, (req, res)=>{
    res.render("dashboard", {user: req.session.user});
});

app.get("/admin", checkAdmin, (req, res)=>{
    res.render("admin", {user: req.session.user});
});

//******** TODO: Insert code for logout route ********//
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})
// Starting the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
