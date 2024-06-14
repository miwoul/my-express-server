import jwt from 'jsonwebtoken';

export function generateAccessToken(user){
    return jwt.sign({id: user._id, username: user.username}, 'kitri_secrat', {
        expiresIn : '15s'
    })
}

export function generateRefreshToken(user){
    return jwt.sign({id: user._id, username: user.username}, 'kitri2_secrat', {
        expiresIn : '1h'
    })
}