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
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

// an object to keep track of all the URLs and their shortened forms
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// render information about all URLs and their shortened forms
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  // check if user is logged in
  if (users[userID]) {
    const templateVars = {
      urls: urlDatabase,
      user: users[userID]
    };
    res.render("urls_index", templateVars);
    // if not logged in show the page with an error message
  } else {
    const templateVars = {
      user: null
    };
    res.status(404).render("urls_error", templateVars);
  }
});

// render a page to create new short URLs
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID]
  };
  // check if user is logged in
  // if logged in show the page to create a new short URL
  if (users[userID]) {
    res.render("urls_new", templateVars);
    // if not logged in show the login form
  } else {
    res.redirect("/login");
  }
});

// POST request to /urls saves the id-longURL key-value pair to the urlDatabase
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  // check if user is logged in
  if (users[userID]) {
    // generate short URL id
    const id = generateRandomString();
    // get user input and save to urlDatabase
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID
    };
    res.redirect(`/urls/${id}`);
    // if not logged in show a message
  } else {
    res.status(403).send("You need to login to be able to shorten URLs\n");
  }
});

// render information about a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

// a route that updates a URL resource
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// any request to "/u/:id" is redirected to its longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    // handle the case where the short URL does not exist in the database
    res.status(404).send("Short URL not found\n");
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
    return res.status(400).send("Email and password cannot be empty\n");
  }

  const user = getUserByEmail(email); // find user in the users object
  // check if user exists
  if (!user) {
    return res.status(403).send("Email is not registered\n");
  } else {
    // check if the password match
    if (password !== user.password) {
      return res.status(403).send("Password is invalid\n");
    }
    // set user_id cookie
    res.cookie("user_id", user.userID);
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
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID]
  };
  // check if user is logged in
  if (users[userID]) {
    res.redirect("/urls");
    // if not logged in show the registration form
  } else {
    res.render("user_registration", templateVars);
  }
});

// POST route for /register adds new user object to global users object, sets user_id cookie
app.post("/register", (req, res) => {
  
  // get values from user inputs
  const { email, password } = req.body;

  // check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty\n");
  }

  // check if the email is already registered
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already registered\n");
  }
  
  // generate user id
  const userID = generateRandomString();

  // add new user object
  users[userID] = { userID, email, password };

  // set user_id cookie
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// render login form
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID]
  };
  // check if user is logged in
  if (users[userID]) {
    res.redirect("/urls");
    // if not logged in show the login form
  } else {
    res.render("user_login", templateVars);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
