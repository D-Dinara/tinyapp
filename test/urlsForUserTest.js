const { assert } = require('chai');
const urlsForUser = require('../helpers/urlsForUser');

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i3BoP4: {
    longURL: "https://www.abc.ca",
    userID: "ab1c23",
  },
};

describe('urlsForUser', function() {
  it('should return URLs that belong to the user', function() {
    const userURLs = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedURLs = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
    };
    assert.deepEqual(userURLs, expectedURLs);
  });
  it("should return an empty object if user id doesn't exist", function() {
    const userURLs = urlsForUser("aaaaaa", testUrlDatabase);
    const expectedURLs = {};
    assert.deepEqual(userURLs, expectedURLs);
  });

});