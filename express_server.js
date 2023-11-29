const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const methodOverride = require('method-override');
const generateRandomString = require('./helpers/generateRandomString');
const getUserByEmail = require('./helpers/getUserByEmail');
const urlsForUser =  require('./helpers/urlsForUser');
const app = express();
const PORT = 8080; // default port 8080

// Set ejs as the view engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true })); // convert the request body from a Buffer into string

// use cokkie-session middleware to encrypt cookies
app.use(cookieSession({
  name: 'session',
  keys: ["somelongsecretkey987654321"],
}));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

// a global object to store and access the users in the app
const users = {};

// an object to keep track of all the URLs and their shortened forms.
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    visitCount: 0,
    uniqueVisitors:[]
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visitCount: 0,
    uniqueVisitors:[]
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// render information about user's URLs and their shortened forms
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  // check if user is logged in
  if (userID) {
    const templateVars = {
      // show only the user's urls
      urls: urlsForUser(userID, urlDatabase),
      user: users[userID]
    };
    res.render("urls_index", templateVars);
    // if not logged in show the page with an error message
  } else {
    const templateVars = {
      user: null
    };
    res.status(403).render("urls_error", templateVars);
  }
});

// render a page to create new short URLs
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  // check if user is logged in
  // if logged in show the page to create a new short URL
  if (userID) {
    res.render("urls_new", templateVars);
    // if not logged in show the login form
  } else {
    res.redirect("/login");
  }
});

// POST request to /urls saves the id-longURL key-value pair to the urlDatabase
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  // check if user is logged in
  if (userID) {
    // generate short URL id
    const id = generateRandomString();
    // get user input and save to urlDatabase
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID,
      visitCount: 0,
      uniqueVisitors:[]
    };
    res.redirect(`/urls/${id}`);
    // if not logged in show a message
  } else {
    res.status(401).send("You need to login to be able to shorten URLs\n");
  }
});

// render information about a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  // store URLs for this user in urls object
  const urls = urlsForUser(userID, urlDatabase);
  // check if user is logged in and the short URL belongs to this user
  if (userID && urls[req.params.id]) {
    const templateVars = {
      id: req.params.id,
      longURL: urls[req.params.id].longURL,
      user: users[userID],
      visitCount: urlDatabase[req.params.id].visitCount,
      uniqueVisitors: urlDatabase[req.params.id].uniqueVisitors,
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send("You don't have permission to access this page\n");
  }
});

// a route that updates a URL resource
app.put("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  // store URLs for this user in urls object
  const urls = urlsForUser(userID, urlDatabase);

  // check if user is logged in
  if (!userID) {
    return res.status(403).send("You need to login or register to access this page\n");
  }

  // check if the url exists in the global database
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("The URL does not exist\n");
  }

  // check if the short URL belongs to this user
  if (!urls[req.params.id]) {
    return res.status(403).send("You don't have permission to edit this URL\n");
  }

  // update the long URL
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// any request to "/u/:id" is redirected to its longURL
app.get("/u/:id", (req, res) => {
  let shortURL = urlDatabase[req.params.id];
  // Check if the short URL exists in the database
  if (!shortURL) {
    return res.status(404).send("Short URL not found\n");
  }
  
  const longURL = shortURL.longURL;
  // Check if the long URL exists in the database
  if (!longURL) {
    return res.status(404).send("Long URL not found\n");
  }

  let visitorID;
  // check if user is logged in or has already visited the URL (cookie was assigned)
  if (req.session.user_id) {
    visitorID = req.session.user_id;
  } else {
    // if the user is unique, generate an id
    visitorID = generateRandomString();
    // set user_id cookie
    req.session.user_id = visitorID;
  }
  // check if the visitor already exists in the uniqueVisitors array
  if (!shortURL.uniqueVisitors.includes(visitorID)) {
    shortURL.uniqueVisitors.push(visitorID);
  }

  shortURL.visitCount++;
  res.redirect(longURL);
});

// add POST route to remove URLs
app.delete("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  // store URLs for this user in urls object
  const urls = urlsForUser(userID, urlDatabase);

  // check if user is logged in
  if (!userID) {
    return res.status(403).send("You need to be logged in to perform this action\n");
  }

  // check if the url exists in the global database
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("The URL does not exist\n");
  }

  // check if the short URL belongs to this user
  if (!urls[req.params.id]) {
    return res.status(403).send("You don't have permission to delete this URL\n");
  }
  // delete the url
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


// render login form
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  // check if user is logged in
  if (userID) {
    res.redirect("/urls");
    // if not logged in show the login form
  } else {
    res.render("user_login", templateVars);
  }
});

// set a cookie user_id to the value submitted in the request body via the login form
app.post("/login", (req, res) => {
  // get values from user inputs
  const { email, password } = req.body;

  // check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Please provide an email AND password\n");
  }

  const user = getUserByEmail(email, users); // find user in the users object
  // check if user exists
  if (!user) {
    return res.status(403).send("Email is not registered\n");
  } else {
    // check if the password match
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(403).send("Password is invalid\n");
    }
    // set user_id cookie
    req.session.user_id = user.userID;
  }
  
  res.redirect("/urls");
});

// the /logout endpoint clears the user_id cookie and redirects the user back to the /urls page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// render registration form
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  // check if user is logged in
  if (userID) {
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
  const hashedPassword = bcrypt.hashSync(password, 10);

  // check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty\n");
  }

  // check if the email is already registered
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already registered\n");
  }
  
  // generate user id
  const userID = generateRandomString();

  // add new user object
  users[userID] = { userID, email, password: hashedPassword };

  // set user_id cookie
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
