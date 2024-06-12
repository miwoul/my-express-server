import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';

const localStrategy = new LocalStrategy({ usernameField: 'username' },
  async (username, password, done) => {
    console.log(`유저 username, password : ${username}, ${password}`)
    const user = await User.findOne({username});
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    const isMatch = user.password == password;
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  }
);

export default localStrategy;
