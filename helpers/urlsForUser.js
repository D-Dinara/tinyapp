
// the function urlsForUser takes in a user ID and URLs databse and returns URLs from the database that belong to this user
const urlsForUser = (id, database) => {
  // define URLs object to store user's URLs
  const URLs = {};
  // iterate through the database keys
  for (const urlID in database) {
    // check if id matches userID in the database
    if (id === database[urlID].userID) {
      // store user's URLs in the URLs object
      URLs[urlID] = database[urlID];
    }
  }
  return URLs;
};

module.exports = urlsForUser;