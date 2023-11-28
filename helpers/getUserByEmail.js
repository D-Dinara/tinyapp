// The function getUserByEmail takes in a user email and users database and checks if the user exists in the database
// It returns the user object or null if the user doesn't exist
const getUserByEmail = (email, database) => {
  for (const userID in database) {
    // compare emails
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return null;
};

module.exports = getUserByEmail;