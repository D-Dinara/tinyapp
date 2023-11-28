const { assert } = require('chai');
const generateRandomString = require('../helpers/generateRandomString');

describe('generateRandomString', () => {
  it('should return a string', () => {
    const randomString = generateRandomString();
    assert.isString(randomString);
  });

  it('should return a string of length 6', () => {
    const randomString = generateRandomString();
    assert.lengthOf(randomString, 6);
  });
});