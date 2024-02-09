import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, trim: true, required: true, unique: true },
  fullName: { type: String, required: true },
  password: {
    type: String,
    required: function () {
      // Password is required only if social authentication is not used
      return !this.authProvider;
    },
  },
  authProvider: { type: String, enum: ["google"] },

  createdAt: { type: Date, default: Date.now },
});

//check if user exist
userSchema.statics.userExist = async function (email) {
  try {
    const existingUser = await this.findOne({ email });

    return existingUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//create new user
userSchema.statics.createUser = async function (userData) {
  try {
    const user = await this.create(userData);
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//get user by id
userSchema.statics.getUserById = async function (id) {
  try {
    const user = await this.findOne({ _id: id });
    if (!user) throw { error: "No user with this id found" };
    return user;
  } catch (error) {
    throw error;
  }
};

//get user by email
userSchema.statics.getUserByEmail = async function (email) {
  try {
    const user = await this.findOne({ email });
    if (!user) throw { error: "No user with this email found" };
    return user;
  } catch (error) {
    throw error;
  }
};

const USER = mongoose.model("User", userSchema);

export default USER;
