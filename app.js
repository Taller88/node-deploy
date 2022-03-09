const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');
const passport  = require('passport');

dotenv.config(); //dotenv는 require마치고 <- process관련 정보



const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');



const {sequelize} = require('./models')
const passportConfig  = require('./passport');
const logger = require('./logger');

const app = express();
passportConfig();

app.set('port', process.env.PORT || 8001);//개발 8001, 배포는 80 or 443
app.set('view engine', 'html');
nunjucks.configure('views',{
    express:app,
    watch:true
})
sequelize.sync({force:false})
    .then(()=>{
        console.log("데이터베이스 연결 성공")
    })
    .catch((err)=>{
        console.error(err)
    })
if(process.env.NODE_ENV === 'production'){
    app.use(morgan('combined'))    
}else{
    app.use(morgan('dev'))

}
app.use(express.static(path.join(__dirname, 'public')))
app.use('/img',express.static(path.join(__dirname, 'uploads'))); // multer 이미지 

app.use(express.json())
app.use(express.urlencoded({extends:true}));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption ={
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false
    }
}
if(process.env.NODE_ENV ==='production'){
    sessionOption.proxy = true
}else{
    sessionOption.proxy = false

}
app.use(session(sessionOption))

// 다른 라우터보다 앞에 있어야함 
app.use(passport.initialize());
app.use(passport.session());
// passport .session이 시작될 때 deserialize가 실행됨

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post',postRouter);
app.use('/user',userRouter);


// 404 처리 미들웨어
app.use((req, res, next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    res.status = 404;
    logger.info('hello');
    logger.error(error.message);
    next(error);
})

//에러 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;