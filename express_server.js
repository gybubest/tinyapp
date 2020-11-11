const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { generateRandomString, fetchID, checkEmail, checkPassword } = require("./helper");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
     id: "user3RandomID", 
     email: "user3@example.com", 
     password: "123"
   }
}

app.get("/", (req, res) => {
  res.send("Hello!");
}); 

app.get("/urls", (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: users[user] };
  res.render("urls_index", templateVars);
});

//Add a GET Route to Show the URL Submission Form
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users['user_id'] };
  res.render("urls_new", templateVars);
});

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const newLongURL = req.body.longURL;
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = newLongURL;
  //Redirect to the shortURL page After Form Submission
  res.redirect(`/urls/${newShortURL}`);
});

//Redirect to the shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users['user_id'] };
  res.render("urls_show", templateVars);
});

//Redirect to the longURL page by Short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Add a POST route that removes a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Add a POST route that updates the longURL after submission on the shortURL page
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//GET to /login
app.get("/login", (req, res) => {
  res.render("login");
});

//POST to /login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (checkEmail(userEmail, users)) {
    if (checkPassword(userPassword, users)) {
      const userID = fetchID(userEmail, users);
      res.cookie("user_id", userID);
      return res.redirect("/urls");
    }
  }
  return res.sendStatus(403);
});

//POST to /logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//GET Route to registration
app.get("/register", (req, res) => {
  res.render("register");
});

//POST /register endpoint
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.sendStatus(400);
  }
  if (checkEmail(req.body.email, users)) {
    return res.sendStatus(400);
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID, 
      email: req.body.email, 
      password: req.body.password
    }
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});