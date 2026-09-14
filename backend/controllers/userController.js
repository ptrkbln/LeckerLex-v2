import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";
import { generateToken } from "../middleware/jwt.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/jwt.js";
import upload from "../config/cloudinary.js";
import cloudinary from "cloudinary";

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
        msg: "Shopping list items must be objects with item property as a string and completed property as a boolean.",
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

export const getUsersFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    return res.status(200).json({ data: user.favorites });
  } catch (error) {
    next(error);
  }
};

export const updateUsersFavorites = async (req, res, next) => {
  try {
    const { favorites } = req.body;
    if (!Array.isArray(favorites))
      return res
        .status(400)
        .json({ msg: "Favorites List should be an array." });

    if (
      !shoppingList.every(
        (item) =>
          item &&
          typeof item.ingredient === "string" &&
          typeof item.completed === "boolean",
      )
    ) {
      return res.status(400).json({
        msg: "Shopping list items must be objects with item property as a string and completed property as a boolean.",
      });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $set: { favorites },
    });

    return res
      .status(200)
      .json({ msg: "User's favorites successfully updated." });
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

/* export const updateUsersOwnRecipes = async (req, res, next) => {
  try {
    const { ownRecipes } = req.body;
    if (!Array.isArray(favorites))
      return res
        .status(400)
        .json({ msg: "Created Recipes List should be an array." });

    await User.findByIdAndUpdate(req.user.userId, {
      $set: { ownRecipes },
    });

    return res
      .status(200)
      .json({ msg: "User's Created Recipes List successfully updated." });
  } catch (error) {
    next(error);
  }
}; */

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

      // Parse values that are arrays/objects
      let parsedIngredients;
      let parsedPreparationSteps;
      let parsedDiet;
      let parsedNutritionPer100g;
      let parsedNutritionPerServing;
      // FormData sends arrays/objects as JSON strings.
      // Catch JSON.parse error if invalid/non-JSON data is sent and return 400 instead of letting it become a 500 server error.      try {
      try {
        parsedIngredients = ingredients ? JSON.parse(ingredients) : undefined;
        parsedPreparationSteps = preparationSteps
          ? JSON.parse(preparationSteps)
          : undefined;
        parsedDiet = diet ? JSON.parse(diet) : undefined;
        parsedNutritionPer100g = nutritionPer100g
          ? JSON.parse(nutritionPer100g)
          : undefined;
        parsedNutritionPerServing = nutritionPerServing
          ? JSON.parse(nutritionPerServing)
          : undefined;
      } catch (error) {
        return res.status(400).json({
          msg: "Invalid data format. Ingredients, preparation steps, and diet must be valid JSON arrays, while nutrition must be a valid JSON object.",
        });
      }

      if (
        parsedNutritionPer100g &&
        (typeof parsedNutritionPer100g !== "object" ||
          Array.isArray(parsedNutritionPer100g))
      ) {
        return res.status(400).json({
          msg: "Nutrition per 100g should be an object.",
        });
      }
      if (
        parsedNutritionPerServing &&
        (typeof parsedNutritionPerServing !== "object" ||
          Array.isArray(parsedNutritionPerServing))
      ) {
        return res.status(400).json({
          msg: "Nutrition per serving should be an object.",
        });
      }

      // Transform strings into numbers
      const formattedServingsAmount = servingsAmount
        ? Number(servingsAmount)
        : undefined;
      const formattedPreparationTime = preparationTime
        ? Number(preparationTime)
        : undefined;
      const formattedServingPortion = servingPortion
        ? Number(servingPortion)
        : undefined;
      const formattedNutritionPer100g = parsedNutritionPer100g
        ? {
            calories: parsedNutritionPer100g.calories
              ? Number(parsedNutritionPer100g.calories)
              : undefined,
            fat: parsedNutritionPer100g.fat
              ? Number(parsedNutritionPer100g.fat)
              : undefined,
            saturatedFat: parsedNutritionPer100g.saturatedFat
              ? Number(parsedNutritionPer100g.saturatedFat)
              : undefined,
            carbohydrates: parsedNutritionPer100g.carbohydrates
              ? Number(parsedNutritionPer100g.carbohydrates)
              : undefined,
            sugar: parsedNutritionPer100g.sugar
              ? Number(parsedNutritionPer100g.sugar)
              : undefined,
            protein: parsedNutritionPer100g.protein
              ? Number(parsedNutritionPer100g.protein)
              : undefined,
            sodium: parsedNutritionPer100g.sodium
              ? Number(parsedNutritionPer100g.sodium)
              : undefined,
          }
        : undefined;
      const formattedNutritionPerServing = parsedNutritionPerServing
        ? {
            calories: parsedNutritionPerServing.calories
              ? Number(parsedNutritionPerServing.calories)
              : undefined,
            fat: parsedNutritionPerServing.fat
              ? Number(parsedNutritionPerServing.fat)
              : undefined,
            saturatedFat: parsedNutritionPerServing.saturatedFat
              ? Number(parsedNutritionPerServing.saturatedFat)
              : undefined,
            carbohydrates: parsedNutritionPerServing.carbohydrates
              ? Number(parsedNutritionPerServing.carbohydrates)
              : undefined,
            sugar: parsedNutritionPerServing.sugar
              ? Number(parsedNutritionPerServing.sugar)
              : undefined,
            protein: parsedNutritionPerServing.protein
              ? Number(parsedNutritionPerServing.protein)
              : undefined,
            sodium: parsedNutritionPerServing.sodium
              ? Number(parsedNutritionPerServing.sodium)
              : undefined,
          }
        : undefined;

      // Format validation
      if (typeof title !== "string")
        return res.status(400).json({
          msg: "Title should be a string",
        });
      if (!Array.isArray(parsedIngredients))
        return res.status(400).json({
          msg: "Ingredients should be an array.",
        });
      if (!Array.isArray(parsedPreparationSteps))
        return res.status(400).json({
          msg: "Preparation steps should be an array",
        });
      if (
        formattedServingsAmount !== undefined &&
        (!Number.isInteger(formattedServingsAmount) ||
          formattedServingsAmount <= 0)
      ) {
        return res.status(400).json({
          msg: "Servings should be a positive whole number.",
        });
      }
      if (
        formattedPreparationTime !== undefined &&
        (!Number.isInteger(formattedPreparationTime) ||
          formattedPreparationTime <= 0)
      ) {
        return res.status(400).json({
          msg: "Total time should be a positive whole number.",
        });
      }
      if (
        formattedServingPortion !== undefined &&
        (Number.isNaN(formattedServingPortion) || formattedServingPortion <= 0)
      ) {
        return res.status(400).json({
          msg: "Serving portion should be a positive number.",
        });
      }
      if (parsedDiet && !Array.isArray(parsedDiet))
        return res.status(400).json({
          msg: "Diet should be an array.",
        });
      if (
        formattedNutritionPer100g &&
        Object.values(formattedNutritionPer100g).some(
          (value) => value !== undefined && (Number.isNaN(value) || value < 0),
        )
      ) {
        return res.status(400).json({
          msg: "Nutrition per 100g values should be valid numbers of 0 or more.",
        });
      }
      if (
        formattedNutritionPerServing &&
        Object.values(formattedNutritionPerServing).some(
          (value) => value !== undefined && (Number.isNaN(value) || value < 0),
        )
      ) {
        return res.status(400).json({
          msg: "Nutrition per serving values should be valid numbers of 0 or more.",
        });
      }

      if (
        !title.trim() ||
        !parsedIngredients ||
        parsedIngredients.length === 0 ||
        !parsedPreparationSteps ||
        parsedPreparationSteps.length === 0
      ) {
        return res.status(400).json({ msg: "Missing mandatory form inputs" });
      }

      user.ownRecipes.push({
        title,
        ingredients: parsedIngredients,
        preparationSteps: parsedPreparationSteps,
        servingsAmount: formattedServingsAmount,
        preparationTime: formattedPreparationTime,
        servingPortion: formattedServingPortion,
        diet: parsedDiet,
        nutritionPer100g: formattedNutritionPer100g,
        nutritionPerServing: formattedNutritionPerServing,
        image,
      });

      await user.save();
      res.status(201).json({ msg: "Recipe successfully created." });
    } catch (error) {
      next(error);
    }
  },
];

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
