function generateRandomURL() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomURL = '';

  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * characters.length);
    randomURL += characters.charAt(random);
  }

  return randomURL;
}

const validateLoginInput = function (email, password) {
  return email.trim() !== '' && password.trim() !== '';
};


const getUserByEmail = function (email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const getUserById = function (userId) {
  return users[userId] || null;
};

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomURL();

  urlDatabase[shortURL] = longURL;

  //res.redirect("/urls/:id");
});

app.get("/urls", (req, res) => {
  const user = getUserById(req.session.user_id);
  const templateVars = {
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.use((req, res, next) => {
  res.locals.user = getUserById(req.session.user_id);
  next();
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomURL();

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if (!validateLoginInput(email, password)) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  if (getUserByEmail(email)) {
    return res.status(400).send("User already exists. Please choose a different email.");
  }

  const userId = generateRandomURL();

  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };

  req.session.user_id = userId;

  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const shortURLToUpdate = req.params.id;
  const newLongURL = req.body.newLongURL;

  urlDatabase[shortURLToUpdate] = newLongURL;

  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  const shortURLToDelete = req.params.id;
  delete urlDatabase[shortURLToDelete];

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if (!validateLoginInput(email, password)) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  const user = getUserByEmail(email);

  if (!user) {
    return res.status(403).send("User not found.");
  }

  if (user.password !== password) {
    return res.status(403).send("Invalid password.");
  }

  req.session.user_id = user.id;

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const user = getUserById(req.session.user_id);
  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});