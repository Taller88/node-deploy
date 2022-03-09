const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {isLoggedIn} = require('./middlewares')
const {Post,User}= require('../models')


const router = express.Router();

try{
    fs.readdirSync('uploads');
}catch(e){
    console.error('uploads 폴더 없어 uploads 폴더 생성');
    fs.mkdirSync('uploads');
}
// 이미지 업로드 용
const upload = multer({
    storage:multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'uploads/')
        },
        filename(req, file, cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname,ext)+Date.now()+ext)
        }
    }),
    limits:{fileSize:5*1024*1024}
})

// 이미지 업로드
router.post('/img', isLoggedIn, upload.single('img'),(req, res)=>{
    console.log(req.file);
    res.json({url:`/img/${req.file.filename}`});
});

// 게시글 업로드용
const upload2 = multer();

// 게시물 업로드
router.post('/', isLoggedIn, upload2.none(), async(req, res, next)=>{
    try{
        const post = await Post.create({
            content:req.body.content,
            img:req.body.url,
            UserId:req.user.id,
        });
        // const hashtags = req.body.content.match(/#[^\s#]+/g);
        // if(hashtags){
        //     const result = await Promise.all(
        //         hashtags.map(tag=>{
        //             return Hashtag.findOrCreate({
        //                 where:{title:tag.slice(1).toLowerCase()}
        //             })
        //         })
        //     );
        //     await post.addHashtags(result.map(r=>r[0]));
        // }
        res.redirect('/')
    }catch(e){
        console.error(e);
        next(e);
    }
})

module.exports = router;