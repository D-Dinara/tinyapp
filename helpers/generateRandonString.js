// a function that returns a string of 6 random alphanumeric characters
// implemeneted in order to simulate generating a "unique" Short URL id and user id
const generateRandomString = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  // iterate through the string and pick 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

module.exports = generateRandomString;