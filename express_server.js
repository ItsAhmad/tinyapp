const bcrypt = require("bcryptjs");

function generateRandomURL() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomURL = '';

  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * characters.length);
    randomURL += characters.charAt(random);
  }

  return randomURL;
}

const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

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
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomURL();

  urlDatabase[shortURL] = { longURL: longURL, userID: userID };

  //res.redirect("/urls/:id");
});

app.get("/urls", (req, res) => {
  const user = getUserById(req.session.useriD);
  const templateVars = {
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.useriD) {
    return res.redirect("/urls");
  }

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

  urlDatabase[shortURL] = { longURL: longURL, userID: userID };

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

  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password

  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };

  req.session.user_id = userId;

  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const shortURLToUpdate = req.params.id;
  const newLongURL = req.body.newLongURL;

  urlDatabase[shortURLToUpdate].longURL = newLongURL;

  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  const shortURLToDelete = req.params.id;
  delete urlDatabase[shortURLToDelete];

  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (!user) {
    return res.status(401).send("You must be logged in to delete this URL.");
  }

  if (url.userID !== req.session.userID) {
    return res.status(403).send("You do not have permission to access this URL.");
  }

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

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid password.");
  }

  req.session.user_id = user.id;

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");

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
    return res.status(401).send("You must be logged in to edit this URL.");
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
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found. <a href='/urls'>Go back to URLs</a>");
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});