const app = require('./app.js')
app.listen(app.get('port'),()=>{
    console.log(app.get('port')+" 번 포트 open")
})