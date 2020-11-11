const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6)
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
}); 

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

//Add a GET Route to Show the URL Submission Form
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies['username'] };
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
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

//Add an endpoint to handle a POST to /login
app.post("/login", (req, res) => {
  res.cookie("username", req.body['username']);
  res.redirect("/urls");
});

//Implement the /logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});