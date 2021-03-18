const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env.json");

const User = require("../models/user");

module.exports = (admin) => async (request, response, next) => {
  let token;
  if (
    //Check if bearer token exists
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ")
  ) {
    //Get bearer token
    token = request.headers.authorization.split("Bearer ")[1];
  } else {
    //console.error("No token found");
    return response.status(403).json({ error: "Unauthoraized" });
  }

  let auth_token;

  jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
    auth_token = decodedToken;
  });

  //If token is not succesfully decoded
  if (!auth_token) return response.status(403).json({ error: "Unauthoraized" });

  let user;

  try {
    //Check if user exists
    user = await User.findOne({ email: auth_token.email })
      .select(["-password"])
      .orFail();
  } catch (error) {
    return response.status(500).json({ error });
  }

  //If user doesnt exist send error response
  if (!user) return response.status(403).json({ error: "Unauthoraized" });

  //If using as admin authorization middleware. check if user is admin
  if (admin === "admin") {
    if (user.role !== "admin") {
      return response.status(403).json({ error: "Unauthoraized" });
    }
  }

  request.user = user;

  return next();
};

/* Use of middleware 

    None - Route accessible for all users including unregistered
    auth() - Route accessible for all registered and logged in users
    auth("admin") - Route accessible to all logged in administrators

*/
