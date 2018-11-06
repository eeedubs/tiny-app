var express = require("express");
var app = express();
var PORT = 8080;
var cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: "session",
  keys: ["userID"]
}))

app.set("view engine", "ejs");

// GLOBAL VARIABLES:

var urlDatabase = {
  // "b2xVn2": {
  //   "link": "http://www.lighthouselabs.ca", 
  //   "id": ""
  // },
  // "9sm5xK": {
  //   "link": "http://www.google.com", 
  //   "id": ""
  // }
}

const users = {
  // "userRandomID": {
  //   id: "userRandomID", 
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // "user2RandomID": {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-fun"
  // }
}

// FUNCTIONS:

function generateRandomString() {
  let r = Math.random().toString(36).substring(2, 8);
  return r;
}
// for the /register page: assigns a new user ID

function getCookie(userID){
  var cookie;
  for (var key in users){
    if (users[key].id === userID){
      cookie = users[key].id;
    }
  }
  return cookie;
}
// for evaluating cookies: if the cookie value of the user matches the ID of a user in the system,
// the user can access the content/features

function getUserID (email, password){
  var userID = "";
  for (var key in users){
    if (users[key].email === email && (bcrypt.compareSync(password, users[key].password))){
      userID = key;
    }
  }
  return userID;
}
// for the /login page: get's the user's ID according to the entered email and password

function checkEmail(email){
  var foundEmail;
  for (var key in users){
    if (users[key].email === email){
      foundEmail = users[key].email;
    }
  }
  return foundEmail;
}
// for the POST /register page: checks if a user's e-mail is already in the system

function getEmail(id){
  var userEmail;
  for (var key in users){
    if (users[key].id === id){
      userEmail = users[key].email;
    }
  }
  return userEmail;
}
// for the GET /urls/new, /urls/:id, and /urls pages, gets the user's email based on their ID

function validateUser(email, password){
  var validate = false;
  for (var key in users){
    if((users[key].email === email) && (bcrypt.compareSync(password, users[key].password))){
      validate = true;
    }
  }
  return validate;
}
// for the POST /login page: evaluates if the user's email and password match a user in the system (value)

function getLongURL(shortURL){
  var longURL;
  for (var key in urlDatabase){
    if (key === shortURL){
      // console.log("function getLongURL(shortURL): got the long URL");
      longURL = urlDatabase[key].link;
    }
  }
  return longURL;
}
// gets the long URL based on the short URL

function shortURLsForUser(id){
  var userURLs = [];
  for (var url in urlDatabase){
    if (urlDatabase[url].id === id){
      userURLs.push(url);
      // console.log("function shortURLsForUser(id): " + userURLs);
    }
  }
  return userURLs;
}
// returns an array of the short URLs that the user created

function longURLsForUser(id){
  var userURLs = [];
  for (var url in urlDatabase){
    if (urlDatabase[url].id === id){
      userURLs.push(urlDatabase[url].link);
      // console.log("function longURLsForUser(id): " + userURLs);
    }
  }
  return userURLs;
}
// returns an array of the short URLs that the user created



// GET REQUESTS:

app.get("/", (req, res) => { //adds "/" to the end of the localhost URL
  if (req.session.user_id === getCookie(req.session.user_id)){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
}); 
// index page


app.get("/urls.json", (req, res) => { // adds "/urls.json" to the end of the localhost URL
  res.json(urlDatabase);
});
// converts the JSON data from the urlDatabase variable

app.get("/login", (req, res) => {
  res.render("urls_login");
});
// Login page

app.get("/not_permitted", (req, res) => {
  res.render("urls_not_permitted");
})
// Not permitted page

app.get("/register", (req, res) => {
  res.render("urls_register");
});
// Register page

app.get("/urls/new", (req, res) => {
  if (req.session.user_id === getCookie(req.session.user_id)){ 
    // console.log("app.get '/urls/new': Cookie matched a user in the database."); 
    const value = req.session.user_id;
    const email = getEmail(value);
    let templateVars = {
      "userID": value,
      "email": email
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
// Add URL page (/urls/new)

app.get("/urls/:id", (req, res) => { 
  var shortURL = req.params.id; 
  // get the id from the requirement parameters
  // console.log("app.get '/urls/:id' " + shortURL);
  var longURL = getLongURL(shortURL);
  if (req.session.user_id === getCookie(req.session.user_id)){  
    if (!longURL){
      res.status(400);
      res.send("400 Bad Request Error: The short URL that you requested does not exist.");
    } else { 
      const value = req.session.user_id;
      const email = getEmail(value);
      let templateVars = {
        "shortURLs": shortURL,
        "longURLs": longURL,
        "userID": value,
        "email": email
      };
      res.render("urls_show", templateVars)
    }
  } else {
    res.redirect("/not_permitted");
  }
});
// Edit URL page (/urls/:id)


app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = getLongURL(shortURL);
  if (!urlDatabase[shortURL]){
    // if there is no shortURL in the URL database
    res.status(400);
    res.send("400 bad Request Error: The shortened URL that you requested does not exist");
  } else {
    res.redirect(301, longURL); 
    // else, redirect to the URL
  }
});
// handles linking: attachs the shortURL to localhost:8010/u/


app.get("/urls", (req, res) => { // reads the /urls page
  if (req.session.user_id === getCookie(req.session.user_id)){  
    let value = req.session.user_id; 
    let shortURLs = shortURLsForUser(value);
    let longURLs = longURLsForUser(value);
    let email = getEmail(value);
    let templateVars = { 
      // let template vars contain the urls and the username
      "longURLs": longURLs,
      "shortURLs": shortURLs,
      "userID": value,
      "email": email
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});


// POST METHODS BELOW

app.post("/urls", (req, res) => {
  const response = generateRandomString();
  // assigns a constant to the randomly generated string
  const longURL = req.body.longURL;
  if (req.session.user_id === getCookie(req.session.user_id)){
    const userID = req.session.user_id;
    urlDatabase[response] = {
      "link": longURL,
      "id": userID
    }
    res.redirect("/urls");
  } else if (!req.session.user_login){
    res.redirect("/login");
  }
})


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (req.session.user_id === getCookie(req.session.user_id)){
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.redirect('/not_permitted');
  }
});
// handles DELETE: deletes an item from the urlDatabase


app.post("/urls/:id/update", (req, res) => {
  const linkID = req.params.id;
  // acquires the id from the url string (shortURL)
  const newURL = req.body.updateURL;
  // acquires the new url from the user's input
  if (req.session.user_id === getCookie(req.session.user_id)){
    // if the user's ID is attached to the link within the URL database
    var userID = req.session.user_id;
    if (urlDatabase[linkID].id === userID){
      urlDatabase[linkID].link = newURL;
      res.redirect('/urls');
    }
  } else {
    res.redirect("/not_permitted");
  }
})
// handles EDIT: editing the longURL to which a short ID routes.



app.post("/login", (req, res) => {
  const loginEmail = req.body.email.toString();
  // gets the login email
  const loginPass = req.body.password.toString();
  // gets the login password
  const userID = getUserID(loginEmail, loginPass);
  if (loginEmail){
    if (loginPass){
      if (validateUser(loginEmail, loginPass)){
        // console.log("Logged in with " + loginEmail);
        req.session.user_id = userID;
        res.redirect("/urls");
      } else {
        res.status(400);
        res.send("400 Bad Request Error: Cannot find a user with the email and/or password provided.");
      }
    } else {
      res.status(400);
      res.send("400 Bad Request Error: Missing the user's password.");
    }
  } else {
    res.status(400);
    res.send("400 Bad Request Error: Missing the user's email.");
  }
});
// Handles LOGIN: logging in and storing the username



app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
})
// Handles LOGOUT: logging out and clearing the cookie


app.post("/register", (req, res) => {
  const randomID = "user" + Math.random().toString(36).substring(2, 8);
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPass, 10);
  if (!userEmail && !userPass){
    // if no user and password, return error
    res.status(400);
    res.send("400 Bad Request Error: Missing email address and password.")
  } else if (!userEmail){
    // if no email, return error
    res.status(400);
    res.send("400 Bad Request Error: Email address is missing.");
  } else if (!userPass){
    // if no password, return error
    res.status(400);
    res.send("400 Bad Request Error: Password is missing.");
  } else {
    // if email and password were entered, continue
    for (var user in users){
      if (userEmail === checkEmail(userEmail)){
        res.status(400);
        res.send("400 Bad Request Error: User's email address is already in use.");
      }
    }
    users[randomID] = {
      "id": randomID,
      "email": userEmail,
      "password": hashedPassword
    };
    req.session.user_id = randomID;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});