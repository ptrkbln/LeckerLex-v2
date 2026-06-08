import { Router } from "express";
import * as user from "../controllers/userController.js";
import { authenticate } from "../middleware/jwt.js";

const userRouter = Router();

userRouter
  .post("/signup", user.registerUser)
  .get("/verify-email/:token", user.verifyEMail)
  .post("/login", user.loginUser)
  .post("/logout", user.logoutUser) // authenticate?
  .get("/verify-user", user.authenticateUser)
  .patch("/update-shoppinglist", authenticate, user.updateUsersShoppingList)
  .get("/shoppinglist", authenticate, user.getUsersShoppingList);

export default userRouter;
