const express = require('express');

const {isLoggendIn, isNotLoggedIn } = require('./middlewares');
const {Post, User}= require('../models')
const router = express.Router();

router.use((req, res, next)=>{
    res.locals.user = req.user;
    res.locals.followerCount = req.user?req.user.Followers.length:0;
    res.locals.followingCount = req.user?req.user.Followings.length:0;
    res.locals.followerIdList = req.user?req.user.Followings.map(f=>f.id):[];
    
    next();
});

router.get("/profile", (req, res, next)=>{
    res.render('profile',{title:"내정보 - NodeBird"});
})


router.get("/join", (req, res, next)=>{
    res.render('join', {title:"회원가입 - NodeBird"});
})

router.get("/hashtag", async (req, res, next)=>{
    const query = req.query.hashtag;
    if(!query){
        return res.redirect('/');
    }
    try{
        const hashtag = await Hashtag.findOne({where:{title:query}});
        let posts = [];
        if(hashtag){
            posts = await hashtag.getPosts({include:[{model:User}]});
        }

        return res.render('main',{
            title:`${query} | NodeBird`,
            twits:posts,
        })
    }catch(err){
        console.error(err);
        return next(err);
    }
})
router.get("/", (req, res, next)=>{
    try{
        
        const posts = Post.findAll({
            include:{
                model:User,
                attributes:['id','nick']
            },
            order:[['createdAt', 'DESC']]
        });
        // const twits = [posts];
        res.render('main',{
            title:'NodeBird',
            twits:posts,
            user:req.user
        });
    }catch(e){
        console.error(e);
        next(e);
    }

});

module.exports = router;
