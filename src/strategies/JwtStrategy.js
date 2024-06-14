import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

//jwt 추출방법지정, 비밀키 설정
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'kitri_secret'
}

//done : 인증결과처리
const jwtStrategy = new JwtStrategy(opts, async (jwt_payload, done) => {
    try{
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        }else{
            return done(null, false);
        }
    }catch (err) {
        return done(err, false);
    }
})

export default jwtStrategy;