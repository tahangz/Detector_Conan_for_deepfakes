const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Add user from payload
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}
