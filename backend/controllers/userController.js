import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";
import { generateToken } from "../middleware/jwt.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/jwt.js";

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
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({
        msg: "This email address is already in use. Please try a different email.",
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
        <h2 style="color: #333; text-align: center;">Welcome to LeckerLex!</h2>
        <p style="font-size: 16px; color: #555;">Hi ${newUser.name},</p>
        <p style="font-size: 16px; color: #555;">
          Thank you for registering on LeckerLex! To get started, we just need to verify your email address. 
          Please click the button below to confirm your account:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a 
            href="${process.env.FRONTEND_BASE_URL}/home/email-verify/${token}" 
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
          }/home/email-verify/${token}"  style="color: #4CAF50;">${
        process.env.FRONTEND_BASE_URL
      }/home/email-verify/${token}</a>
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
      ${process.env.FRONTEND_BASE_URL}/home/email-verify/${token}
      
      If you didn't sign up for LeckerLex, please ignore this email.
  
      Best regards,
      The LeckerLex Team
    `,
    };

    // Send the verification email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending verification email", error);
        res.status(500).json({ msg: "Error sending verification email" });
      } else {
        console.log("Email sent:", info.response);
        res.status(201).json({
          msg: "User created. Verification email has been sent",
        });
      }
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ msg: "An unexpected error occurred. Please try again later." });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const token = req.params.token; // Extract token from URL params

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token via JWT_SECRET
    console.log("Decoded token:", decoded); // Log decoded token

    // Find the user associated with the verification token
    // const user = await User.findOne({ validationToken: token });

    const updatedUser = await User.findOneAndUpdate(
      { validationToken: token },
      { isEmailValidated: true, validationToken: null }
    );

    // user.isEmailValidated = true; // Set the user's emailVerified field to true
    // user.validationToken = null; // Remove the registration token
    // await user.save({ validateBeforeSave: false }); // to skip validating the password after it has been hashed (this leads to errors)

    console.log("Updated User:", updatedUser);
    return res.status(200).json({
      msg: "Email successfully verified",
      /* isEmailValidated: user.isEmailValidated, */
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ msg: "Verification token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ msg: "Invalid token" });
    } else {
      return res.status(500).json({ msg: "Internal server error" });
    }
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

    if (!user) return res.status(404).json({ msg: "User not found" }); // TODO is this not managed by authenticate?

    const isAuthenticated = await user.authenticate(password); // Compare the clear-text password from req.body with the hashed one in the database

    if (!isAuthenticated)
      return res.status(401).json({ msg: "Incorrect credentials" });

    // If email-address was not verified, reject login attempt
    if (!user.isEmailValidated)
      return res.status(401).json({
        msg: "Unverified email-address: email-address must be verified to log in",
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

    shoppingList = shoppingList.map((item) => item.trim().toLowerCase());

    if (action === "add") {
      // Add items from RecipeDetails page
      await User.findByIdAndUpdate(req.user.userId, {
        $addToSet: { shoppingList: { $each: shoppingList } }, // addToSet prevents adding duplicate items
      });
    } else if (action === "replace") {
      // Replace the shopping list from MyShoppingList page
      await User.findByIdAndUpdate(req.user.userId, {
        $set: { shoppingList },
      });
    } else {
      // Invalid action
      return res.status(400).json({ msg: "Invalid action specified" });
    }
    res.status(200).json({ msg: `User's shopping list successfully updated.` });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Error updating user document. Please try again later." });
  }
};

export const getUsersShoppingList = async (req, res) => {
  try {
    const user = await User.findOne(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const shoppingList = user.shoppingList;
    /* if (shoppingList.length < 1)
      return res.status(200).json({ msg: "Your shopping list is empty." }); */

    return res.status(200).json(shoppingList);
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching user's shopping list. Please try again later.",
    });
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
