import mongoose from "mongoose";

let dbConnection;
const connectToDb = (cb) => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((client) => {
      dbConnection = client;
      return cb();
    })
    .catch((err) => {
      console.error(err);
      return cb(err);
    });
};

export default connectToDb;

export const getDb = () => dbConnection;
