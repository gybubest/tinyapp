const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const { generateRandomString, checkEmail, authenticateUser, fetchUserID, urlsForUser } = require("./helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['N0secrets?', '2hackerS!'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
app.use(cookieParser());

const urlDatabase = {
  // ***FORMAT***
  // "shortURL": { longURL: "http://www.lighthouselabs.ca", user_id: "userRandomID" }
};

const users = {
  // ***FORMAT***
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // }
};

const urlAnalytics = {
  // ***FORMAT***
  // "shortURL": {
  //   count: 0,
  //   uniqueCount: 0,
  //   visitorID: [time1, time2...]
  // }
};

app.get("/", (req, res) => {
  const userID = req.session['user_id'];
  if (!userID) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session['user_id'];
  if (!userID) {
    return res.redirect("/login");
  }

  const urlsByUserID = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: urlsByUserID,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

//GET Route to create a new short URL
app.get("/urls/new", (req, res) => {
  const userID = req.session['user_id'];
  if (!userID) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

//POST Route to receive the long URL
app.post("/urls", (req, res) => {
  const newLongURL = req.body.longURL;
  const newShortURL = generateRandomString();
  const userID = req.session['user_id'];

  if (userID !== undefined) {
    urlDatabase[newShortURL] = {
      longURL: newLongURL,
      user_id: userID
    };
  }
  res.redirect(`/urls/${newShortURL}`);
});

//Redirect to the shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params['shortURL'];
  const shortURLInfo = urlDatabase[shortURL];
  if (shortURLInfo === undefined) {
    return res.sendStatus(404);
  }

  const userID = req.session['user_id'];
  if (shortURLInfo[['user_id']] !== userID) {
    return res.sendStatus(401);
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: shortURLInfo['longURL'],
    user: users[userID],
    urlAnalytics: urlAnalytics[shortURL]
  };
  res.render("urls_show", templateVars);
});

//Redirect to the longURL page by Short URLs
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params['shortURL'];
  if (urlDatabase[shortURL] === undefined) {
    return res.sendStatus(404);
  }
  let history = urlAnalytics[shortURL];
  if (history === undefined) {
    history = {
      count: 0,
      uniqueCount: 0
    };
    urlAnalytics[shortURL] = history;
  }
  history.count += 1;

  const time = new Date().toLocaleString();
  let visitorID = req.cookies['visitor_id'];

  if (visitorID === undefined) {
    visitorID = generateRandomString();
    res.cookie('visitor_id', visitorID);
  }
  if (history[visitorID] === undefined) {
    history.uniqueCount += 1;
    history[visitorID] = [];
  }
  history[visitorID].push(time);
    
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

//DELETE route that removes a URL resource
app.delete("/urls/:shortURL", (req, res) => {
  const userID = req.session['user_id'];
  if (!userID) {
    return res.redirect("/login");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//PUT route that updates the longURL on the shortURL page
app.put("/urls/:shortURL", (req, res) => {
  const userID = req.session['user_id'];
  if (!userID) {
    return res.redirect("/login");
  }

  const shortURL = req.params['shortURL'];
  const longURL = req.body['longURL'];
  urlDatabase[shortURL]['longURL'] = longURL;
  res.redirect("/urls");
});

//GET to /login
app.get("/login", (req, res) => {
  const userID = req.session['user_id'];
  if (userID) {
    return res.redirect("/urls");
  }
  res.render("login");
});

//POST to /login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (authenticateUser(userEmail, userPassword, users)) {
    const userID = fetchUserID(userEmail, users);
    req.session.user_id = userID;
    return res.redirect("/urls");
  }
  res.sendStatus(403);
});

//POST to /logout endpoint
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//GET Route to registration
app.get("/register", (req, res) => {
  const userID = req.session['user_id'];
  if (userID) {
    return res.redirect("/urls");
  }
  res.render("register");
});

//POST /register endpoint
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.sendStatus(400);
  }

  if (checkEmail(req.body.email, users)) {
    return res.sendStatus(400);
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, saltRounds)
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});