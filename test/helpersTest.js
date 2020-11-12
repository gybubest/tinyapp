const { assert } = require('chai');

const { fetchUserID } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('fetchUserID', function() {
  it('should return the user ID with valid email', function() {
    const userID = fetchUserID("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(userID, expectedOutput);
  });

  it('should return undefined with invalid email', function() {
    const userID = fetchUserID("user3@example.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(userID, expectedOutput);
  });
});