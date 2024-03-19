const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers.js');
const { generateRandomURL } = require('./helpers.js');
const { urlsForUser } = require('./helpers.js');
const { urlDatabase } = require('./helpers.js');
const { users } = require('./helpers.js');
const bodyParser = require("body-parser");
//const session = require("express-session");
const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


const validateLoginInput = function (email, password) {
  return email.trim() !== '' && password.trim() !== '';
};


const getUserById = function (userID) {
  return users[userID] || null;
};

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomURL();

  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.userID }; 
});


app.get("/urls", (req, res) => {
  const user = getUserById(req.session.userID);
  const userUrls = urlsForUser(req.session.userID);
  const templateVars = {
    user: user,
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session && req.session.userID) {
    return res.redirect("/urls");
  }

  const user = res.locals.user; 

  res.render("login", { user: user }); 
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.session.userID) {
    return res.redirect("/urls");
  }

  res.render("register");
});

app.use((req, res, next) => {
  res.locals.user = getUserById(req.session.userID);
  next();
});

app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    return res.status(401).send("You need to be logged in to create new URLs. <a href='/login'>Login</a>");
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomURL();

  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.userID};

  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if (!validateLoginInput(email, password)) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("User already exists. Please choose a different email.");
  }

  const userID = generateRandomURL();

  const hashedPassword = bcrypt.hashSync(password, 10); 

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };

  req.session.userID = userID;

  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const shortURLToUpdate = req.params.id;
  const newLongURL = req.body.newLongURL;

  urlDatabase[shortURLToUpdate].longURL = newLongURL;

  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (!user) {
    return res.status(403).send("You must be logged in to delete this URL.");
  }

  if (url.userID !== req.session.userID) {
    return res.status(403).send("You do not have permission to access this URL.");
  }

  const shortURLToDelete = req.params.id;
  delete urlDatabase[shortURLToDelete];

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const user = getUserByEmail(email, users);

  if (!validateLoginInput(email, password)) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  if (!user) {
    return res.status(403).send("User not found.");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid password.");
  }

  req.session.user_id = userID;

  if (req.session && req.session.userID) {
    return res.redirect("/urls");
  }

  res.render("login", { user: user });
});

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  const urls = {};

  for (const shortURL in urlDatabase) {
    urls[shortURL] = {
      longURL: urlDatabase[shortURL].longURL,
      userID: urlDatabase[shortURL].userID
    };
  }

  res.json(urls);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const user = getUserById(req.session.userID);

  if (!user) {
    return res.send("<p>Please <a href='/login'>login</a> or <a href='/register'>register</a> to access this page.</p>");
  }

  const userUrls = urlsForUser(req.session.userID);

  const templateVars = {
    user: user,
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/NOTEXISTS", (req, res) => {
  res.status(404).send("URL not found.");
});

app.get("/urls/new", (req, res) => {
  if (!req.session.userID) {
    return res.redirect("/login");
  }

  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const user = getUserById(req.session.userID);
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  if (!user) {
    return res.status(403).send("You must be logged in to edit this URL.");
  }

  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== req.session.userID) {
    return res.status(403).send("You do not have permission to access this URL.");
  }

  const templateVars = { id: shortURL, longURL: url.longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found. <a href='/urls'>Go back to URLs</a>");
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});