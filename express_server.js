const express = require("express");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./helpers/generateRandomString');
const app = express();
const PORT = 8080; // default port 8080

// Set ejs as the view engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true })); // convert the request body from a Buffer into string
app.use(cookieParser());

// a global object to store and access the users in the app
const users = {};

// The function getUserByEmail takes in a user email and checks if the user exists in the users object
// It returns the user object or null if the user doesn't exist
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

// an object to keep track of all the URLs and their shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// render information about all URLs and their shortened forms
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

// render a page to create new short URLs
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

// POST request to /urls saves the id-longURL key-value pair to the urlDatabase
app.post("/urls", (req, res) => {
  // generate short URL id
  const id = generateRandomString();
  // get user input and save to urlDatabase
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// render information about a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userID]
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
    res.status(404).send("Short URL not found");
  }
});

// add POST route to remove URLs
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// set a cookie user_id to the value submitted in the request body via the login form
app.post("/login", (req, res) => {
  // get values from user inputs
  const { email, password } = req.body;

  // check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }

  const user = getUserByEmail(email); // find user in the users object
  // check if user exists
  if (!user) {
    return res.status(403).send("Email is not registered");
  } else {
    // check if the password match
    if (password !== user.password) {
      return res.status(403).send("Password is invalid");
    }
    // set user_id cookie
    res.cookie("user_id", user.userId);
  }
  
  res.redirect("/urls");
});

// the /logout endpoint clears the user_id cookie and redirects the user back to the /urls page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// render registration form
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId]
  };
  res.render("user_registration", templateVars);
});

// POST route for /register adds new user object to global users object, sets user_id cookie
app.post("/register", (req, res) => {
  
  // get values from user inputs
  const { email, password } = req.body;

  // check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }

  // check if the email is already registered
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already registered");
  }
  
  // generate user id
  const userId = generateRandomString();

  // add new user object
  users[userId] = { userId, email, password };

  // set user_id cookie
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

// render login form
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId]
  };
  res.render("user_login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
