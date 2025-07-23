import express from "express";
import session from "express-session";
import cors from "cors";

const app = express();

// Enable CORS with credentials
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session middleware
app.use(
  session({
    secret: "debug-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    name: "debug_session",
  })
);

// Body parsing middleware
app.use(express.json());

// Debug route to log session
app.get("/api/debug-session", (req, res) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("Cookies:", req.headers.cookie);

  // Set a value in the session
  if (!req.session.visits) {
    req.session.visits = 0;
  }
  req.session.visits++;

  res.json({
    sessionID: req.sessionID,
    visits: req.session.visits,
    session: req.session,
  });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
});
