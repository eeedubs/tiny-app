var express = require("express");
var app = express();
var PORT = 8010; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

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

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// passing the urls from urlDatabase to the urls_index.ejs file

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// this route must be before the GET /urls:id route, otherwise the :id placeholder
// will match the string "new" 

// app.use(function(err, req, res, next){
//   // we may use properties of the error object
//   // here and next(err) appropriately, or if
//   // we possibly recovered from the error, simply next().
//   res.render('500', {
//       status: err.status || 500
//     , error: err
//   });
// });

app.get("/urls/:id", (req, res) => { // :id could be named anything
  let id = req.params.id; // get the id from the requirement parameters
  let templateVars = { // templateVars gets rendered to urls_show.ejs
    shortURL: id,
    longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  // if (!shortURL){
  //   res.render(err: Error )
  // }
  let longURL = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]){
    res.redirect("/urls")
  } else {
    res.redirect(301, longURL);
  }
});


app.post("/urls", (req, res) => {
  const response = generateRandomString(); // assigns a constant to the randomly generated string
  console.log(req.body);  // debug statement to see POST parameters; posting the long URL
  urlDatabase[response] = req.body.longURL;   // add a key-value pair to the urlDatabase
  res.redirect(301, 'http://localhost:8010/urls/'); // Respond with the random string
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});