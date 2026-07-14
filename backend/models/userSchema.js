import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

// Define Schema for a user
// TODO validators
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name field is missing."],
      minlength: [3, "Name has fewer than 2 characters."],
      maxlength: [15, "Name exceeds 10 characters."],
      trim: true,
      match: [
        /^[a-zA-Z0-9_]{3,15}$/,
        "Name can only contain letters, digits, and underscores, and must be between 3 and 15 characters long.",
      ],
    },
    email: {
      type: String,
      required: [true, "Email field is missing."],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password field is missing."],
      minlength: [6, "Password must be at least 6 characters long."],
      trim: true,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-=_+])[A-Za-z\d@$!%*?&^#\-=_+]{6,}$/,
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&^#-=_+).",
      ],
    },
    journal: [
      // TODO reviews model (1-n)
      {
        type: Schema.Types.ObjectId, // Reference to reviews created by the user
        ref: "Journal",
      },
    ],
    favorites: {
      type: [
        {
          id: Number,
          title: String,
          image: String,
          servingsAmount: Number,
          servingPortion: { amount: Number, unit: String },
          ingredients: [
            {
              name: String,
              amount: Number,
              unit: String,
            },
          ],
          nutritionPer100g: {
            calories: Number,
            carbohydrates: Number,
            fat: Number,
            protein: Number,
            saturatedFat: Number,
            sodium: Number,
            sugar: Number,
          },
          preparationSteps: [String],
          preparationTime: Number,
          diet: {
            vegetarian: Boolean,
            vegan: Boolean,
            glutenFree: Boolean,
            dairyFree: Boolean,
          },
        },
      ],
      default: [],
    },
    shoppingList: {
      type: [
        {
          ingredient: String,
          completed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
    validationToken: String,
    isEmailValidated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// // Pre-save middleware to hash the user's password before saving it to the database
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      // only hash if the password has been modified
      const hash = await bcrypt.hash(this.password, 12);
      this.password = hash;
    }
    next();
  } catch (error) {
    next(error);
  }
  /* if (!this.isModified("password")) {
    return next(); // Skip hashing if the password field hasn't been modified
  }
  try {
    const saltRounds = 12;
    const hash = await bcrypt.hash(this.password, saltRounds);
    this.password = hash;
  } catch (error) {
    next(error);
  } */
});

// Custom method to validate the user's password during login
userSchema.methods.authenticate = async function (password) {
  // Compare the entered (clear-text) password with the stored hashed password
  return await bcrypt.compare(password, this.password);
};

// Custom method to modify the user object when converted to JSON -> remove password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = model("User", userSchema);
