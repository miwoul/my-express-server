import { Router } from 'express';
import passport from 'passport';
// import bcrypt from 'bcryptjs';
// import { users } from '../users.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/authUtils.js';


const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log("유저정보");
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    req.logIn(user,{ session: false }, (err) => {
      if (err) {
        return next(err);
      }
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;

      return res
        .status(200)
        .json({ accessToken, refreshToken });
    });
  })(req, res, next);
});
router.post('/rfresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  try{
    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, 'kitri_secret2', (err, decoded) => {
      if (err) return res.sendStatus(403);

      const accessToken =generateAccessToken(user);
      return res.json({ accessToken });
    })
} catch(err){
  return res.sendStatus(500);
}
})

router.get('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  try{
    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(403);

    user.refreshToken = null;
    await user.save();

    res.status(200).json({message : "logout complete"});
} catch(err){
  return res.sendStatus(500);
}
});

router.post('/join', async (req, res) => {
  const { username, age, password } = req.body;
  try{
    const user = await User.findOne({username})
    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const newUser = new User({ username, age, password})
    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new Error('User save operation failed');
    }
    res.status(201).json({ message: 'User joined successfully' });
  }catch (err){
    res.status(500).send('Internal server error');
  }
});

router.put('/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ username : req.user.username })
    if (!user || (oldPassword != user.password)) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    user.password = newPassword;
    const savedUser = await user.save();
    if (!savedUser) {
      throw new Error('User save operation failed');
    }
    res.status(200).json({ message: 'Password changed successfully' });
  } catch(err) {
    res.status(500).send('Internal server error');
  }
});

router.delete('/delete-account', async (req, res) => {
  try {
    const user = await User.findOne({ username : req.user.username })
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    await User.deleteOne({username : req.user.username})
    // req.logOut();
    res.status(200).json({ message: 'User Deleted successfully' });
  } catch(err) {
    res.status(500).send('Internal server error');
  }

  // const index = users.findIndex(user => user.id === req.session.passport.user);
  // if (index === -1) {
  //   return res.status(404).json({ message: 'Account not found' });
  // }
  // users.splice(index, 1);
  // req.logout();
  // res.status(200).json({ message: 'Account deleted successfully' });
});

export default router;
