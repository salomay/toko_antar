var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    controller = require('./controllerAdmin');

var cookieParser = require('cookie-parser');

var dotenv = require('dotenv');
dotenv.config();

var cors = require('cors')
const multer = require('multer');

const storage = multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,'./uploads');
        },
        filename:function(req,file,cb){
            cb(null,new Date().getTime() + file.originalname);
        }
    });

const fileFilter = (req,file,cb) =>{
    if(file.mimetype === 'image/png' ||
       file.mimetype === 'image/jpg' ||  
       file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}




app.use(bodyParser.urlencoded({ limit:'10mb',extended: false }));
app.use(bodyParser.json({ limit:'10mb',extended: false }));

app.use(cookieParser());
app.use(function (req, res, next) {

    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', 'content-type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // console.log(req.body)
    next();
  });

app.use(multer({storage:storage,fileFilter:fileFilter}).array('attachment[]'));

var routes = require('./routes');
routes(app);

app.listen(port);
console.log('RESTful API server started on: ' + port);