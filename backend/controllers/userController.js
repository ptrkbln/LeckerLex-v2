import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";
import { generateToken } from "../middleware/jwt.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/jwt.js";
import upload from "../config/cloudinary.js";
import cloudinary from "cloudinary";
import { validateOwnRecipeData } from "../utils/validateOwnRecipeData.js";
import { extractImagePublicId } from "../utils/extractImagePublicId.js";

// Setup to send emails from the app using nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS_NODEMAILER,
    pass: process.env.EMAIL_PASSWORD_NODEMAILER,
  },
});

// Register new user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(409).json({
        msg: "This email address is already in use.",
      });
    }

    // Create new user and generate verification token
    const newUser = new User({ name, email, password });
    const token = generateToken({ userId: newUser._id }); // Payload with user ID
    newUser.validationToken = token; // Store validation token in user's validationToken field
    await newUser.save();

    // Set up email options
    // TODO adapt to our new app name
    const mailOptions = {
      from: "LeckerLex",
      to: newUser.email,
      subject: "Confirm Your Registration - LeckerLex",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="text-align: center;">
          <span style="color: #4ade80;">Lecker</span><span style="color: #fdba74;">Lex</span>
        </h2>        
        <p style="font-size: 16px; color: #555;">Hi ${newUser.name},</p>
        <p style="font-size: 16px; color: #555;">
          Thank you for registering on LeckerLex! To get started, we just need to verify your email address. 
          Please click the button below to confirm your account:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a 
            href="${process.env.FRONTEND_BASE_URL}/home/verify-email/${token}" 
            style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; font-size: 16px; border-radius: 5px;"
          > 
            Verify Email
          </a>
        </div>
        <p style="font-size: 16px; color: #555;">
          Or, if the button doesn't work, you can copy and paste the following link into your browser:
        </p>
        <p style="font-size: 16px; color: #555; word-wrap: break-word;">
          <a href="${
            process.env.FRONTEND_BASE_URL
          }/home/verify-email/${token}"  style="color: #4CAF50;">${
            process.env.FRONTEND_BASE_URL
          }/home/verify-email/${token}</a>
        </p>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
          If you didn't sign up for LeckerLex, please ignore this email.
        </p>
        <p style="font-size: 14px; color: #999; text-align: center;">
          &copy; ${new Date().getFullYear()} LeckerLex. All rights reserved.
        </p>
      </div>
    `,
      text: `
      Welcome to LeckerLex, ${newUser.name}!
      Thank you for registering. Please verify your email address by clicking the link below:
      ${process.env.FRONTEND_BASE_URL}/home/verify-email/${token}
      
      If you didn't sign up for LeckerLex, please ignore this email.
  
      Best regards,
      The LeckerLex Team
    `,
    };

    // Send the verification email
    await transporter.sendMail(mailOptions);
    return res.status(201).json({
      msg: "User created & verification email sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEMail = async (req, res, next) => {
  try {
    const token = req.params.token; // Extract token from URL params

    jwt.verify(token, process.env.JWT_SECRET); // Verify token via JWT_SECRET
    // Find the user associated with the verification token
    const updatedUser = await User.findOneAndUpdate(
      { validationToken: token },
      { isEmailValidated: true, validationToken: null },
    );

    if (!updatedUser) {
      return res
        .status(400)
        .json({ msg: "Invalid or already used verification token." });
    }

    return res.status(200).json({
      msg: "Email successfully verified",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ msg: "Verification token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ msg: "Invalid verification token" });
    }
    next(error);
  }
};

// for verifying authentication status (used in frontend protected routes for logged-in users)
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token)
      return res.status(401).json({ msg: "Unauthorized: no token provided." });

    const decoded = verifyToken(token);

    if (!decoded)
      return res
        .status(403)
        .json({ msg: "Forbidden: Invalid or expired token." });

    res.status(200).json({ msg: "Authenticated" });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(401)
        .json({ msg: "The login information entered is incorrect." }); // TODO is this not managed by authenticate?

    const isAuthenticated = await user.authenticate(password); // Compare the clear-text password from req.body with the hashed one in the database

    if (!isAuthenticated)
      return res
        .status(401)
        .json({ msg: "The login information entered is incorrect." });

    // If email-address was not verified, reject login attempt
    if (!user.isEmailValidated)
      return res.status(403).json({
        msg: "Please verify your email address before signing in.",
      });

    // If login successful, generate authentication token and send in a cookie
    const token = generateToken({ userId: user._id }); // payload
    return res
      .status(200)
      .cookie("jwt", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day in miliseconds
      })
      .json({ msg: "Successfully signed in" });
  } catch (error) {
    next(error);
  }
};

export const updateUsersShoppingList = async (req, res, next) => {
  try {
    let { shoppingList, action } = req.body;
    if (!Array.isArray(shoppingList))
      return res.status(400).json({ msg: "Shopping List should be an array." });

    if (
      !shoppingList.every(
        (item) =>
          item &&
          typeof item.ingredient === "string" &&
          typeof item.completed === "boolean",
      )
    ) {
      return res.status(400).json({
        msg: "Shopping list items should be objects with item property as a string and completed property as a boolean.",
      });
    }

    if (action === "add") {
      // Add items from RecipeDetails page
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found." });
      }

      shoppingList.forEach((newItem) => {
        const existingItem = user.shoppingList.find(
          (entry) =>
            entry.ingredient === newItem.ingredient.trim().toLowerCase(),
        );
        if (existingItem) {
          existingItem.completed = false;
        } else {
          user.shoppingList.push({
            ingredient: newItem.ingredient.trim().toLowerCase(),
            completed: false,
          });
        }
      });

      await user.save();
    } else if (action === "replace") {
      // Replace the shopping list with items from MyShoppingList page
      await User.findByIdAndUpdate(req.user.userId, {
        $set: { shoppingList },
      });
    } else {
      return res.status(400).json({ msg: "Invalid action specified" });
    }

    return res
      .status(200)
      .json({ msg: "User's shopping list successfully updated." });
  } catch (error) {
    next(error);
  }
};

export const getUsersShoppingList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    return res.status(200).json({ data: user.shoppingList });
  } catch (error) {
    next(error);
  }
};

export const getUsersSavedRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    return res.status(200).json({ data: user.savedRecipes });
  } catch (error) {
    next(error);
  }
};

export const updateUsersSavedRecipes = async (req, res, next) => {
  try {
    const { savedRecipes } = req.body;
    if (!Array.isArray(savedRecipes))
      return res.status(400).json({ msg: "Saved recipes should be an array." });

    await User.findByIdAndUpdate(req.user.userId, {
      $set: { savedRecipes },
    });

    return res
      .status(200)
      .json({ msg: "User's saved recipes successfully updated." });
  } catch (error) {
    next(error);
  }
};

export const getUsersOwnRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    return res.status(200).json({ data: user.ownRecipes });
  } catch (error) {
    next(error);
  }
};

export const createOwnRecipe = [
  upload.single("imageUrl"),
  async (req, res, next) => {
    try {
      const {
        title,
        ingredients,
        preparationSteps,
        servingsAmount,
        preparationTime,
        servingPortion,
        diet,
        nutritionPer100g,
        nutritionPerServing,
      } = req.body;
      const image = req.file?.path;

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found." });
      }

      const recipeData = validateOwnRecipeData({
        title,
        ingredients,
        preparationSteps,
        servingsAmount,
        preparationTime,
        servingPortion,
        diet,
        nutritionPer100g,
        nutritionPerServing,
      });
      if (recipeData.error) {
        return res.status(400).json({ msg: recipeData.error });
      }

      user.ownRecipes.push({
        ...recipeData,
        image,
      });

      await user.save();
      res
        .status(201)
        .json({ msg: "Recipe successfully created.", data: user.ownRecipes });
    } catch (error) {
      next(error);
    }
  },
];

export const updateOwnRecipe = [
  upload.single("imageUrl"),
  async (req, res, next) => {
    try {
      const {
        title,
        ingredients,
        preparationSteps,
        servingsAmount,
        preparationTime,
        servingPortion,
        diet,
        nutritionPer100g,
        nutritionPerServing,
        existingImage,
      } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found." });
      }

      const { id } = req.params;
      const recipe = user.ownRecipes.id(id);
      if (!recipe) {
        return res.status(404).json({ msg: "Recipe not found." });
      }

      const recipeData = validateOwnRecipeData({
        title,
        ingredients,
        preparationSteps,
        servingsAmount,
        preparationTime,
        servingPortion,
        diet,
        nutritionPer100g,
        nutritionPerServing,
      });

      if (recipeData.error) {
        return res.status(400).json({ msg: recipeData.error });
      }

      recipe.set(recipeData);

      const image = req.file?.path;
      const imageUrl = recipe.image;
      const imagePublicId = extractImagePublicId(imageUrl);

      // 4 image update scenarios:
      // 1.) no new image uploaded + existing image removed in frontend + image exists in DB -> delete old image in Cloudinary and remove image from recipe
      if (!image && !existingImage && imageUrl) {
        if (imagePublicId) {
          await cloudinary.uploader.destroy(imagePublicId);
        }
        recipe.set({ image: undefined });
      }
      // 2.) new image uploaded + image exists in DB -> delete old image in Cloudinary and replace it with new image
      // 3.) new image uploaded + no image in DB -> set new image to recipe
      if (image) {
        if (imagePublicId) {
          await cloudinary.uploader.destroy(imagePublicId);
        }
        recipe.set({ image });
      }
      // 4.) no new image + existing image kept in frontend -> do nothing (keep current image in DB)

      await user.save();
      res
        .status(200)
        .json({ msg: "Recipe successfully updated.", data: user.ownRecipes });
    } catch (error) {
      next(error);
    }
  },
];

export const deleteOwnRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const recipe = user.ownRecipes.id(id);
    if (!recipe) {
      return res.status(404).json({ msg: "Recipe not found." });
    }

    const imageUrl = recipe.image;
    const imagePublicId = extractImagePublicId(imageUrl);
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
    }

    await recipe.deleteOne();
    await user.save();
    res.status(200).json({ msg: "Recipe deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("jwt", "", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(0), // expires immediately by setting to a past date
      })
      .json({ msg: "Successfully logged out." });
  } catch (error) {
    next(error);
  }
};
