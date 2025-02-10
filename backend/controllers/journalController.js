import { Journal } from "../models/journalSchema.js";
import { User } from "../models/userSchema.js";
import upload from "../config/cloudinary.js";

export const createJournalEntry = [
  upload.single("imageUrl"), // middleware to handle imageUpload
  async (req, res, next) => {
    try {
      const { notes, recipeId, recipeName } = req.body;
      if (!req.file)
        return res
          .status(400)
          .json({ msg: "File is required or is too large" });

      const imageUrl = req.file.path; // cloudinary URL for the uploaded image

      // TODO const {recipeId} = req.query ?

      // Create and save the new review
      const newJournalEntry = await Journal.create({
        notes,
        imageUrl,
        user: req.user.userId,
        recipeId,
        recipeName,
      });

      // Add the new review's id to user's reviews (1-n relationship)
      await User.findByIdAndUpdate(req.user.userId, {
        $addToSet: { journal: newJournalEntry._id },
      });

      res
        .status(201)
        .json({ msg: "Journal entry successfully saved", newJournalEntry });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
];

// Fetch all reviews from the logged-in user
export const getAllUserJournalEntries = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    const allUserJournalEntries = await Journal.find({
      _id: { $in: user.journal },
    });

    if (allUserJournalEntries.length === 0) return res.status(204).end();

    return res.status(200).json(allUserJournalEntries);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
