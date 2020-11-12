const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env.json");

const User = require("../models/user");

module.exports = async (request, response, next) => {
  let token;
  if (
    //Check if bearer token exists
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ")
  ) {
    //Get bearer token
    token = request.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return response.status(403).json({ error: "Unauthoraized" });
  }

  let auth_token;

  jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
    auth_token = decodedToken;
  });

  //If token is not succesfully decoded
  if (!auth_token) return response.status(403).json({ error: "Unauthoraized" });

  //Check if user exists
  const user = await User.findOne({ email: auth_token.email });

  if (!user) return response.status(403).json({ error: "Unauthoraized" });

  request.user = user;

  return next();
};
