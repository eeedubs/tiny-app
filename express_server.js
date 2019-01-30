const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method'));

app.use(cookieSession({
  name: "session",
  keys: ["userID"]
}))

app.set("view engine", "ejs");

// GLOBAL VARIABLES:

const urlDatabase = {
  // "b2xVn2": {
  //   "link": "http://www.lighthouselabs.ca", 
  //   "id": "",
  //   "views",
  //   "unique",
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
  let cookie;
  for (let key in users){
    if (users[key].id === userID){
      cookie = users[key].id;
    }
  }
  return cookie;
}

// for evaluating cookies: if the cookie value of the user matches the ID of a user in the system,
// the user can access the content/features

function getUserID (email, password){
  let userID;
  for (let key in users){
    if (users[key].email === email && (bcrypt.compareSync(password, users[key].password))){
      userID = key;
    }
  }
  return userID;
}
// for the /login page: get's the user's ID according to the entered email and password

function checkEmail(email){
  let foundEmail;
  for (let key in users){
    if (users[key].email === email){
      foundEmail = users[key].email;
    }
  }
  return foundEmail;
}
// for the POST /register page: checks if a user's e-mail is already in the system

function getEmail(id){
  let userEmail;
  for (let key in users){
    if (users[key].id === id){
      userEmail = users[key].email;
    }
  }
  return userEmail;
}
// for the GET /urls/new, /urls/:id, and /urls pages, gets the user's email based on their ID

function validateUser(email, password){
  let validate = false;
  for (let key in users){
    if((users[key].email === email) && (bcrypt.compareSync(password, users[key].password))){
      validate = true;
    }
  }
  return validate;
}
// for the POST /login page: evaluates if the user's email and password match a user in the system (value)

function isUniqueVisitor(userCookie){
  for (let url in urlDatabase){
    for (let cookie in urlDatabase[url].unique){
      if (urlDatabase[url].unique[cookie] == userCookie){
        return true;
      }
    }
  }
  return false;
}

function getLongURL(shortURL){
  let longURL;
  for (let key in urlDatabase){
    if (key === shortURL){
      // console.log("function getLongURL(shortURL): got the long URL");
      longURL = urlDatabase[key].link;
    }
  }
  return longURL;
}
// gets the long URL based on the short URL

function getViewCount(shortURL){
  let viewCount;
  for (let key in urlDatabase){
    if (key === shortURL){
      viewCount = urlDatabase[key].views;
    }
  }
  return viewCount;
}

function getViewsForUser(userCookie){
  let viewArray = [];
  for (let url in urlDatabase){
    if (urlDatabase[url].id === userCookie){
      viewArray.push(urlDatabase[url].views);
    }
  }
  return viewArray;
}

function getUniqueViewCount(shortURL){
  let uniqueCount;
  for (let url in urlDatabase){
    if (url === shortURL){
      uniqueCount = urlDatabase[url].unique.length;
    }
  }
  return uniqueCount;
}

function getUniqueViewsForUser(userCookie){
  let uniqueViews = [];
  for (let url in urlDatabase){
    if (urlDatabase[url].id === userCookie){
      uniqueViews.push(urlDatabase[url].unique.length);
    }
  }
  return uniqueViews;
}

function shortURLsForUser(id){
  let userURLs = [];
  for (let url in urlDatabase){
    if (urlDatabase[url].id === id){
      userURLs.push(url);
    }
  }
  return userURLs;
}
// returns an array of the short URLs that the user created

function longURLsForUser(id){
  let userURLs = [];
  for (let url in urlDatabase){
    if (urlDatabase[url].id === id){
      userURLs.push(urlDatabase[url].link);
    }
  }
  return userURLs;
}
// returns an array of the short URLs that the user created

// GET REQUESTS:

app.get("/", (req, res) => { //adds "/" to the end of the localhost URL
  let userID = req.session.user_id;
  if (userID === getCookie(userID)){
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
  let userID = req.session.user_id;
  if (userID === getCookie(userID)){ 
    let email = getEmail(userID);
    let templateVars = {
      userID,
      email
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
// Add URL page (/urls/new)

app.get("/urls/:id", (req, res) => { 
  let userID = req.session.user_id; 
  let shortURL = req.params.id;
  let longURL = getLongURL(shortURL);
  let viewCount = getViewCount(shortURL);
  let uniqueViewCount = getUniqueViewCount(shortURL);
  if (userID === getCookie(userID)){  
    if (!longURL){
      res.status(400);
      res.send("400 Bad Request Error: The short URL that you requested does not exist.");
    } else { 
      let email = getEmail(userID);
      let templateVars = {
        shortURL,
        longURL,
        viewCount,
        uniqueViewCount,
        userID,
        email
      };
      res.render("urls_show", templateVars)
    }
  } else {
    res.redirect("/not_permitted");
  }
});
// Edit URL page (/urls/:id)


app.route("/u/:shortURL").get(function(req, res){
  let shortURL = req.params.shortURL;
  let longURL = getLongURL(shortURL);
  let userID = req.session.user_id;
  let userCookie = getCookie(userID);
  if (!urlDatabase[shortURL]){
    // if there is no shortURL in the URL database
    res.status(400).send("400 Bad Request Error: The shortened URL that you requested does not exist");
  } else {
    urlDatabase[shortURL].views += 1;
    if (!isUniqueVisitor(userCookie)){
      urlDatabase[shortURL].unique.push(userCookie);
    } 
    res.redirect(301, longURL); 
    // else, redirect to the URL
  }
});
// handles linking: attachs the shortURL to localhost:8010/u/


app.get("/urls", (req, res) => { // reads the /urls page
  let userID = req.session.user_id; 
  if (userID === getCookie(userID)){  
    let viewCount = getViewsForUser(userID);
    let uniqueViews = getUniqueViewsForUser(userID);
    let shortURLs = shortURLsForUser(userID);
    let longURLs = longURLsForUser(userID);
    let email = getEmail(userID);
    let templateVars = { 
      // let template vars contain the urls and the username
      longURLs,
      shortURLs,
      userID: userID,
      viewCount,
      uniqueViews,
      email
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});


// POST METHODS BELOW

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  // assigns a constant to the randomly generated string
  let longURL = req.body.longURL;
  let userID = req.session.user_id;
  if (userID === getCookie(userID)){
    urlDatabase[shortURL] = {
      link: longURL,
      id: userID,
      views: 0,
      unique: []
    }
    res.redirect("/urls");
  } else if (!req.session.user_login){
    res.redirect("/login");
  }
})


app.delete("/urls/:id", (req, res) => {
  let id = req.params.id;
  let userID = req.session.user_id;
  if (req.session.user_id === getCookie(userID)){
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.redirect('/not_permitted');
  }
});
// handles DELETE: deletes an item from the urlDatabase


app.put("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  // acquires the id from the url string (shortURL)
  let newURL = req.body.updateURL;
  // acquires the new url from the user's input
  let userID = req.session.user_id;
  if (req.session.user_id === getCookie(userID)){
    // if the user's ID is attached to the link within the URL database
    if (urlDatabase[shortURL].id === userID){
      urlDatabase[shortURL].link = newURL;
      res.redirect('/urls');
    }
  } else {
    res.redirect("/not_permitted");
  }
})
// handles EDIT: editing the longURL to which a short ID routes.



app.post("/login", (req, res) => {
  let loginEmail = req.body.email.toString();
  // gets the login email
  let loginPass = req.body.password.toString();
  // gets the login password
  let userID = getUserID(loginEmail, loginPass);
  if (loginEmail){
    if (loginPass){
      if (validateUser(loginEmail, loginPass)){
        // console.log("Logged in with " + loginEmail);
        req.session.user_id = userID;
        res.redirect("/urls");
      } else {
        res.status(400).send("400 Bad Request Error: Cannot find a user with the email and/or password provided.");
      }
    } else {
      res.status(400).send("400 Bad Request Error: Missing the user's password.");
    }
  } else {
    res.status(400).send("400 Bad Request Error: Missing the user's email.");
  }
});
// Handles LOGIN: logging in and storing the username



app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
})
// Handles LOGOUT: logging out and clearing the cookie


app.post("/register", (req, res) => {
  let randomID = "user" + Math.random().toString(36).substring(2, 8);
  let userEmail = req.body.email;
  let userPass = req.body.password;
  let hashedPassword = bcrypt.hashSync(userPass, 10);
  if (!userEmail && !userPass){
    // if no user and password, return error
    res.status(400).send("400 Bad Request Error: Missing email address and password.")
  } else if (!userEmail){
    // if no email, return error
    res.status(400).send("400 Bad Request Error: Email address is missing.");
  } else if (!userPass){
    // if no password, return error
    res.status(400).send("400 Bad Request Error: Password is missing.");
  } else {
    // if email and password were entered, continue
    for (let user in users){
      if (userEmail === checkEmail(userEmail)){
        res.status(400).send("400 Bad Request Error: User's email address is already in use.");
      }
    }
    users[randomID] = {
      id: randomID,
      email: userEmail,
      password: hashedPassword
    };
    req.session.user_id = randomID;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});