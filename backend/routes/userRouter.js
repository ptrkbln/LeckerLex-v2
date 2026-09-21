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
  .get("/shoppinglist", authenticate, user.getUsersShoppingList)
  .patch("/saved-recipes", authenticate, user.updateUsersSavedRecipes)
  .get("/saved-recipes", authenticate, user.getUsersSavedRecipes)
  .get("/own-recipes", authenticate, user.getUsersOwnRecipes)
  .post("/own-recipes", authenticate, user.createOwnRecipe)
  .patch("/own-recipes/:id", authenticate, user.updateOwnRecipe)
  .delete("/own-recipes/:id", authenticate, user.deleteOwnRecipe);

export default userRouter;
