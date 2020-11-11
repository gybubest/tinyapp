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

module.exports = { generateRandomString, fetchID, checkEmail, checkPassword };