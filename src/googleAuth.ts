import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from './db';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, cb) => {
      try {
        const { sub, name, email, picture } = profile._json;
        const userRef = db.collection('User').doc(sub);
        const doc = await userRef.get();
        if (!doc.exists) {
          // Create one
          const newUser = {
            id: sub,
            email,
            name,
            picture,
          };
          await db.collection('User').doc(sub).set(newUser);
          cb(null, newUser);
        }
        const newUser = doc.data();
        cb(null, newUser);
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);
