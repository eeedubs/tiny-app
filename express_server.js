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

app.get("/urls/new", (req, res) => {
  if (req.cookies){
    const value = req.cookies["username"];
    res.render("urls_new", value);
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
    const value = req.cookies["username"];
    let templateVars = {
      shortURL: id,
      longURL: urlDatabase[id],
      username: value
    };
    res.render("urls_show", templateVars)
  } else {
    let templateVars = { // templateVars gets rendered to urls_show.ejs
      shortURL: id,
      longURL: urlDatabase[id],
      username: ""
    };
    res.render("urls_show", templateVars);
  }
});
// 

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]){
    res.redirect("/urls")
  } else {
    res.redirect(301, longURL);
  }
});
// handles the LINKING: attachs the shortURL to localhost:8010/u/

app.get("/urls", (req, res) => {
  if(req.cookies){
    const value = req.cookies["username"];
    let templateVars = { 
      urls: urlDatabase,
      username: value
    };
    res.render("urls_index", templateVars);
  } else{
    let templateVars = { 
      urls: urlDatabase,
      username: ""
    };
    res.render("urls_index", templateVars);
  }
});
// passing the urls from urlDatabase to the urls_index.ejs file

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

app.post("/login", (req, res) => {
  const value = req.body.username;
  res.cookie('username', value);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  console.log("clearing cookie");
  res.clearCookie('username');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});