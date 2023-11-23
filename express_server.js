const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// Set ejs as the view engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true })); // convert the request body from a Buffer into string
app.use(cookieParser());

// a function that returns a string of 6 random alphanumeric characters
// implemeneted in order to simulate generating a "unique" Short URL id
const generateRandomString = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  // iterate through the string and pick 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

// an object to keep track of all the URLs and their shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// a global object to store and access the users in the app
const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// render information about all URLs and their shortened forms
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// render a page to create new short URLs
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// the id-longURL key-value pair are saved to the urlDatabase when a POST request to /urls is received
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// render information about a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

// a route that updates a URL resource
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// any request to "/u/:id" is redirected to its longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    // handle the case where the short URL does not exist in the database
    res.send("Short URL not found");
  }
});

// add POST route to remove URLs
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// set a cookie named username to the value submitted in the request body via the login form
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// the /logout endpoint clears the user_id cookie and redirects the user back to the /urls page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// render registration form
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("user_registration", templateVars);
});

//a POST route for /register adds new user object to global users object, sets user_id cookie
app.post("/register", (req, res) => {
  // generate an id
  const id = generateRandomString();
  // get the values from user inputs
  const { email, password } = req.body;
  //add new user object
  users[id] = { id, email, password };
  // set user_id cookie
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
