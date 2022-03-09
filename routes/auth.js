const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user')

const router = express.Router();


// 회원가입
router.post('/join',isNotLoggedIn, async(req, res, next)=>{ //isNotLoggedIn 이미 로그인한 사람 체크 / 로그인 안한 사람을 찾을수 있게 middleware에 있는 
    const {email, nick, password} = req.body;
    try{
        //  가입한 이력 확인
        const exUser = await User.findOne({where:{email}});
        if(exUser){
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);// 12는 얼마나 복잡하게 할지
        User.create({
            email,
            nick,
            password:hash
        });
        res.redirect('/');

    }catch(error){
        console.error(error);
        return next(error);
    }
});


router.post('/login', isNotLoggedIn, (req, res, next)=>{
    // login전에 deserialize를 안 돌았기 때문에 req.user가 비어있음
    passport.authenticate('local', (authError,user, info)=>{
        if(authError){
            console.log(authError);
            next(authError);
        }

        if(!user){
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError)=>{
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }//세션 쿠키를 브라우저로 보냄 connect-sid
            return res.redirect('/')
        });
    })(req, res,next);
});

router.get('/logout',(req, res)=>{
    //req.user 사용자 정보가 들어가 있을꺼임
    req.logout();//서버에서 세션 쿠키를 지움
    req.session.destroy();
    res.redirect("/");
})

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao',{
    failureRedirect:'/'
}),(req, res)=>{
    res.redirect('/')
});


module.exports = router;
