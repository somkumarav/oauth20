import express from 'express';
import sessions from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';

import './googleAuth';
import { db } from './db';

dotenv.config();
const app = express();

// MiddleWare
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(
  sessions({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done: any) => {
  return done(null, user.id);
});
passport.deserializeUser(async (id: string, done: any) => {
  const userRef = db.collection('User').doc(id);
  const doc = await (await userRef.get()).data();

  return done(null, doc);
});

// Routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000');
  }
);

app.get('/isauth', (req, res) => {
  if (req.user) {
    console.log('true');
    res.send(true);
  }
  console.log('false');
  res.send(false);
});

app.get('/getuser', (req, res) => {
  res.send(req.user);
});

app.get('/auth/logout', (req, res) => {
  if (req.user) {
    console.log('logout user');
    req.logout();
    res.send('done');
  }
});

function ensureAuthenticated(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.isAuthenticated()) return next();
  else res.redirect('http://localhost:3000/login');
}

app.listen(process.env.port || 4000, () => {
  console.log('server started');
});
