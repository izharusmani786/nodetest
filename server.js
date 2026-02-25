const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');
const mongoose = require('mongoose');

//console.log(process.env);

// MongoDB connection
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

process.on('handledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! Shutting down...');
  
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
  
    server.close(() => {
        process.exit(1);
    });
});
