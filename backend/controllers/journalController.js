import { Journal } from "../models/journalSchema.js";
import { User } from "../models/userSchema.js";
import upload from "../config/cloudinary.js";
import cloudinary from "cloudinary";

export const createJournalEntry = [
  upload.single("imageUrl"), // multer middleware to handle image upload to cloudinary
  async (req, res, next) => {
    try {
      // multipart form with req.body (journal entry data) and req.file (image upload)
      const { notes, recipeId, recipeName } = req.body;
      if (!notes || !recipeId || !recipeName) {
        return res
          .status(400)
          .json({ msg: "Missing required journal entry information." });
      }

      if (!req.file) {
        return res.status(400).json({ msg: "Image is required." });
      }

      const imageUrl = req.file.path; // cloudinary URL of the uploaded image

      // TODO const {recipeId} = req.query ?

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

export const deleteJournalEntry = async (req, res, next) => {
  try {
    const { journalEntryId } = req.params;
    const journalEntry = await Journal.findById(journalEntryId);
    if (!journalEntry)
      return res.status(404).json({ msg: "Journal entry not found!" });

    if (journalEntry.user.toString() !== req.user.userId.toString())
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this journal entry!" });

    const imageUrl = journalEntry.imageUrl;
    let imagePublicId = null;
    // Cloudinary requires image's public_id (not the URL) to delete it
    // public_id (<folder/public_id>) comes from
    // url (https://res.cloudinary.com/<cloud_name>/image/upload/<version>/folder/<public_id>.<format>)
    if (imageUrl) {
      const imageUrlParts = imageUrl.split("/upload/").at(-1).split("/");
      if (imageUrlParts.length > 1) {
        imageUrlParts.shift(); // remove the <version>
        const publicId = imageUrlParts.join("/").split(".")[0];
        imagePublicId = publicId;
      }
    }
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
    }

    // Remove also the deleted journal entry reference from the user's journal field array
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { journal: journalEntryId },
    });
    await journalEntry.deleteOne();
    return res.status(200).json({ msg: "Journal entry successfully deleted." });
  } catch {
    next();
  }
};

export const getAllUserJournalEntries = async (req, res, next) => {
  try {
    const allUserJournalEntries = await Journal.find({
      user: req.user.userId,
    });

    // Returns an empty array even if no entries are found
    return res.status(200).json({ data: allUserJournalEntries });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
