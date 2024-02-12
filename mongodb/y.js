// Profile Schema
const profileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    trim: true,
    default: () => {
      return generateRandomString(8);
    },
  },
  dob: {
    type: Date,
    validate: {
      validator: function (date) {
        // Add custom date validation logic if needed
        return date <= new Date();
      },
      message: "Date of birth cannot be in the future.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Prevent updating createdAt
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["parent", "medical personnel", "management"],
    required: true,
  },
});

// Child Schema
const childSchema = new Schema({
  parentProfile: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  weight: Number,
  height: Number,
  blood_group: String,
  genotype: String,
  allergies: [String],
  disabilities: [String],
  img: String, // img link
  birth_cert_img: String, // birth certificate img link
  parent_id_img: String, // parent ID image link
  medical_document: String, // medical document link
});

// User Schema
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
