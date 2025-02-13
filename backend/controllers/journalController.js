import { Journal } from "../models/journalSchema.js";
import { User } from "../models/userSchema.js";
import upload from "../config/cloudinary.js";
import cloudinary from "cloudinary";

// Create a journal entry
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

      // Create and save the new journal entry
      const newJournalEntry = await Journal.create({
        notes,
        imageUrl,
        user: req.user.userId,
        recipeId,
        recipeName,
      });

      // Add the new journal entry's id to user's journal (1-n relationship)
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

// Delete a journal entry
export const deleteJournalEntry = async (req, res) => {
  try {
    const { journalEntryId } = req.params;
    const journalEntry = await Journal.findById(journalEntryId);
    if (!journalEntry)
      return res.status(404).json({ msg: "Journal Entry not found!" });

    const imageUrl = journalEntry.imageUrl;
    let imagePublicId = null;

    // access cloudinary's image's public_id (<folder/public_id>) from https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/folder/<public_id>.<format>

    if (imageUrl) {
      const imageUrlParts = imageUrl.split("/upload/").at(-1).split("/");
      if (imageUrlParts.length > 1) {
        imageUrlParts.shift(); // remove the v<version>
        const publicId = imageUrlParts.join("/").split(".")[0];
        imagePublicId = publicId;
      }
    }

    if (journalEntry.user.toString() !== req.user.userId.toString())
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this journal entry!" });

    if (imagePublicId) await cloudinary.uploader.destroy(imagePublicId);

    await journalEntry.deleteOne();
    return res.status(200).json({ msg: "Journal Entry successfully deleted." });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error deleting user's journal entry. Please try again later.",
    });
  }
};

// Fetch all journal entries from the logged-in user
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
