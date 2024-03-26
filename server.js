const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const coworkings = require('./routes/coworkings');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');
const users = require('./routes/users')

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//add cookie parser
app.use(cookieParser());

//Body parser
app.use(express.json());

//Sanitize
app.use(mongoSanitize());

//Set security headers (helmet)
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowsMs: 10*60*1000, //10mins
    max: 100 //sent 5 times
});
app.use(limiter);

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

//Mount routers 
app.use('/api/v1/coworkings', coworkings);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);
app.use('/api/v1/users', users);


const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(
        'Server running in ', 
        process.env.NODE_ENV, 
        'on ' + process.env.HOST + " :" + PORT
    )
);

const swaggerOptions={
    swaggerDefinition:{
        openapi:'3.0.0',
        info:{
              title:'Library API',
              version:'1.0.0',
            description:'A simple Wxpress Coworkingspace API'
        },
        servers:[
            {
                url: process.env.HOST + ':' + PORT + '/api/v1'
            }
        ],
    },
    apis:['./routes/*.js']
};

//Handle unhandled promise rejections
process.on('unhandledRejection', (err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});
