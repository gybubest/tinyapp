const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6)
};

const checkEmail = function(email, database) {
  for (const user in database) {
    if (database[user]['email'] === email) {
      return true;
    }
  }
};

const checkPassword = function(password, database) {
  for (const user in database) {
    if (database[user]['password'] === password) {
      return true;
    }
  }
};

const fetchID = function(email, database) {
  for (const user in database) {
    if (database[user]['email'] === email) {
      return database[user]['id'];
    }
  }
};

const urlsForUser = function(id, database) {
  let result = {};
  for (const shortURL in database) {
    const url = database[shortURL];
    if (url['user_id'] === id) {
      result[shortURL] = url['longURL'];
    }
  }
  return result;
};

module.exports = { generateRandomString, checkEmail, checkPassword, fetchID, urlsForUser };