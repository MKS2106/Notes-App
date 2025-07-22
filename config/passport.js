import passport from "passport";
import GitHubStrategy from "passport-github2";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
console.log(process.env.GITHUB_CLIENT_ID);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    // This is the "verify" callback
    async (accessToken, refreshToken, profile, done) => {
      try {
        // The "profile" object contains the user's GitHub information
        const existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) {
          // If user already exists, pass them to the next middleware
          return done(null, existingUser);
        }

        console.log("PROFILE: ",profile);
        
        // If it's a new user, create a record in our database
        const newUser = new User({
          githubId: profile.id,
          username: profile.username,
          // Some providers return an array of emails
          email: profile.email ? profile.email : 'test@test.com', 
        //   email: profile.email ? profile.email : profile.emails[0]?.value, 
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    },
  ),
);

// Parses the user obj and store the user id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Finds the user based on the id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;