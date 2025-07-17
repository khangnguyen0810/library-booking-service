require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'library',
    });

    console.log(`Database Connected: ${conn.connection.host}`);

    const rooms = await Room.find({});
    return rooms;
  } catch (error) {
    console.error('DB connection/fetch error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
