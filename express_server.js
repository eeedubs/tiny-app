var express = require("express");
var app = express();
var PORT = 8010; // default port 8080
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
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
    password: "dishwasher-fun"
  }
}

function generateRandomString() {
  let r = Math.random().toString(36).substring(2, 8);
  return r;
}
// takes a random number to a string and takes the first 6

app.get("/", (req, res) => { //adds "/" to the end of the localhost URL
  res.send("Hello! Welcome to the homepage");
}); 
// index page

app.get("/urls.json", (req, res) => { // adds "/urls.json" to the end of the localhost URL
  res.json(urlDatabase);
});
// converts the JSON data from the urlDatabase variable

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// sends the text in HTML format to the page 

app.get("/register", (req, res) => {
  if (req.cookies){
    const value = req.cookies["user_id"];
    let templateVars = {
      "userID": value
    };
    res.render("urls_register", templateVars);
  } else {
    res.render("urls_register");
  }
});

app.get("/login", (req, res) => {
  if (req.cookies){
    const value = req.cookies["user_id"];
    let templateVars = {
      "userID": value
    };
    res.render("urls_login", templateVars);
  } else {
    res.render("urls_login");
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies){
    const value = req.cookies["user_id"];
    let templateVars = {
      userID: value
    };
    res.render("urls_new", templateVars);
  } else {
  res.render("urls_new");
  }
});
// renders to urls_new
// this route must be before the GET /urls:id route, otherwise the :id placeholder
// will match the string "new" 

app.get("/urls/:id", (req, res) => { // :id could be named anything
  let id = req.params.id; // get the id from the requirement parameters
  if (req.cookies){
    console.log("cookie was acquired");
    const value = req.cookies["user_id"];
    console.log(value);
    let templateVars = {
      "shortURL": id,
      "longURL": urlDatabase[id],
      "userID": value
    };
    res.render("urls_show", templateVars)
  } else {
    console.log("cookie was not acquired");
    let templateVars = { // templateVars gets rendered to urls_show.ejs
      "shortURL": id,
      "longURL": urlDatabase[id],
      "userID": ""
    };
    res.render("urls_show", templateVars);
  }
});
// 

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL; // self explanatory
  let longURL = urlDatabase[shortURL]; // ""
  if (!urlDatabase[shortURL]){ // if there is no shortURL in the URL database
    res.redirect("/urls") // redirect to the URL index
  } else {  // else 
    res.redirect(301, longURL); // redirect to the URL
  }
});
// handles the LINKING: attachs the shortURL to localhost:8010/u/

app.get("/urls", (req, res) => { // reads the /urls page
  if(req.cookies){  // if the cookies are acquired
    const value = req.cookies["user_id"]; // assign the cookies to a variable
    console.log(value); 
    let templateVars = { // let template vars contain the urls and the username
      urls: urlDatabase,
      userID: value
    };
    res.render("urls_index", templateVars);
  } else{
    let templateVars = { 
      urls: urlDatabase,
      userID: ""
    };
    res.render("urls_index", templateVars);
  }
});
// Reads the /urls page: 

// POST METHODS BELOW

app.post("/urls", (req, res) => {
  const response = generateRandomString(); // assigns a constant to the randomly generated string
  const longURL = req.body.longURL;
  urlDatabase[response] = longURL;   // add a key-value pair to the urlDatabase
  console.log("Added key-value pair { " + response + ": " + longURL + " } to the urlDatabase.")
  res.redirect(301, '/urls'); // Respond with the random string
});
// handles ADD: adds a new item to the urlDatabase

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  console.log("Deleted " + id + " from urlDatabase");
  res.redirect('/urls');
});
// handles DELETE: deletes an item from the urlDatabase

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id; // acquires the id from the url string (shortURL)
  const newURL = req.body.updateURL; 
  // acquires the element "updateURL" from the urls index (localhost:8010/urls)
  urlDatabase[id] = newURL;
  // change the shortURL key in urlDatabase to equal the new long URL (updateURL)
  console.log("Changed " + id + " to direct to " + newURL);
  res.redirect('/urls/' + id);
})
// handles EDIT: editing the longURL to which a short ID routes.

function validateUser(email, password){
  var foundUser;
  for(var key in users){
    if(users[key].email === email && users[key].password === password){
      foundUser = users[key];
    }
  }
  return foundUser;
}

function validateEmail(email){
  var foundEmail;
  for (var key in users){
    if (users[key].email === email){
      foundEmail = users[key].email;
    }
  }
  return foundEmail;
}
// Confirms if the email was found (true if string includes email, false otherwise)

function validatePass(password){
  var foundPass; 
  for (var key in users){
    if (users[key].password === password){
      foundPass = users[key].password;
    }
  }
  return foundPass;
}
// Confirms if the password was found (true if string includes password, false otherwise)

app.post("/login", (req, res) => {
  let loginEmail = req.body.email; // gets the login email
  let loginPass = req.body.password; // gets the login password
  var checkEmail = validateEmail(loginEmail); // true or false
  var checkPass = validatePass(loginPass); // true or false
  var userID = validateUser(loginEmail, loginPass);
  var id = false;
  if (loginEmail){ // if the email has been entered
    if (loginPass){ // if the password has been entered
      if (checkEmail){
        if (checkPass){
          console.log("Logged in with " + loginEmail);
          res.cookie('user_id', userID);
          res.redirect('/urls');
        } else {
          res.status(400); // bad password
          res.send("400 Bad Request Error: The password entered does not match the email.");
        }
      } else { // bad email
        res.status(400);
        res.send("400 Bad Request Error: This email is not in our records.");
      }
    } else {
      res.status(400);
      res.send("400 Bad Request Error: Missing the user's password.");
    }
  } else {
    res.status(400);
    res.send("400 Bad Request Error: Missing the user's email.");
  }
})

// Handles LOGIN: logging in and storing the username 

app.post("/logout", (req, res) => {
  console.log("Logged out");
  res.clearCookie('user_id');
  res.redirect('/urls');
})
// Handles LOGOUT: logging out and clearing the cookie

app.post("/register", (req, res) => {
  console.log("Registering a new user.");
  const randomID = "user" + Math.random().toString(36).substring(2, 8);
  const userEmail = req.body.email;
  const userPass = req.body.password;
  // console.log(users[randomID].email);
  if (!userEmail && !userPass){
    res.status(400);
    res.send("400 Bad Request Error: Missing email address and password.")
  } else if (!userEmail){
    res.status(400);
    res.send("400 Bad Request Error: Email address is missing.");
  } else if (!userPass){
    res.status(400);
    res.send("400 Bad Request Error: Password is missing.");
  } else {
    for (var user in users){
      if (userEmail == users[user].email){
        res.status(400);
        res.send("400 Bad Request Error: User's email address is already in use.");
      }
    } 
    users[randomID] = {
      "id": randomID,
      "email": userEmail,
      "password": userPass
    };
    console.log("after user registration ;",users);
    //console.log("userID: " + JSON.stringify(users[randomID]));
    // console.log("userID: " + JSON.stringify(users));
    res.cookie('user_id', randomID);
    res.redirect('/urls');
  }
});
// Posts the new randomized user ID, along with their e-mail and password, 
// to a new key-value pair in the users object

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});