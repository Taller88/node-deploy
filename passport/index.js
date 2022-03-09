const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

// pas
module.exports = () => {
    passport.serializeUser((user, done)=>{
        done(null, user.id);// auth.js 에서 req.login에서 옴 / 세션에 id만 저장
    });
    // {connect.sid : "세션에 해당하는 쿠키값"}
    passport.deserializeUser((id,done)=>{
        User.findOne({
            where:{id},
            include:[{
                model:User,
                attributes:['id','nick'],
                as:'Followers'
            },{
                model:User,
                attributes:['id','nick'],
                as:'Followings'
            }]
        
        })
            .then(user => done(null,user))// req.user로 접근 가능하게 함 , req.isAuthenticated() <- 로그인 시 true
            .catch(err => done(err))
    });
    local();
    kakao();
}