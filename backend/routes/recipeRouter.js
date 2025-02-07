import { Router } from "express";
import * as recipe from "../controllers/recipeController.js";
import { searchLimiter } from "../middleware/rateLimiter.js";

const recipeRouter = Router();

recipeRouter.get("/recipes", searchLimiter, recipe.searchRecipesAndDetails);

export default recipeRouter;
