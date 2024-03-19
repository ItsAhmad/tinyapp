function getUserByEmail(email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return undefined;
};

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



module.exports = {
  getUserByEmail,
  generateRandomURL,
  urlsForUser
};

