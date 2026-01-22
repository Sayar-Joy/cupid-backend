const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const User = require("../models/User");

// Available majors
const MAJORS = [
  "Architecture",
  "Civil",
  "Mechanical",
  "EC",
  "EP",
  "CEIT",
  "MC",
  "Petroleum",
  "Chemical",
];

// Personality descriptions for each major
const PERSONALITIES = {
  Architecture:
    "Creative, aesthetic-focused thinker with an eye for beauty and design",
  Civil: "Strong, reliable, and builds lasting foundations in relationships",
  Mechanical: "Practical problem-solver who keeps things running smoothly",
  EC: "Energetic communicator who connects people effortlessly",
  EP: "Powerful and dynamic, always bringing energy to the relationship",
  CEIT: "Smart, logical, tech-loving personality with innovative ideas",
  MC: "Expressive storyteller who brings creativity and meaning to life",
  Petroleum: "Deep thinker with valuable insights and resourcefulness",
  Chemical: "Perfect chemistry creator, mixing well with everyone",
};

// Random match logic with exclusion of previous matches
const getRandomMatch = (userMajor, previousMatches = []) => {
  // Start with all majors except user's own
  let availableMajors = MAJORS.filter((major) => major !== userMajor);

  // Exclude previously shown majors
  const unshownMajors = availableMajors.filter(
    (major) => !previousMatches.includes(major),
  );

  // If we've shown all majors, reset and allow all again
  if (unshownMajors.length === 0) {
    availableMajors = MAJORS.filter((major) => major !== userMajor);
  } else {
    availableMajors = unshownMajors;
  }

  const randomIndex = Math.floor(Math.random() * availableMajors.length);
  return availableMajors[randomIndex];
};

// Get random sticker from major's folder with exclusion of previous stickers
// Get all stickers from a major's folder
const getAllStickers = async (major) => {
  try {
    const stickerDir = path.join(__dirname, "..", "public", "stickers", major);
    const files = await fs.readdir(stickerDir);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file),
    );

    return imageFiles.map((file) => `/stickers/${major}/${file}`);
  } catch (error) {
    console.error(`Error getting all stickers for ${major}:`, error);
    return [];
  }
};

const getRandomSticker = async (major, previousStickers = []) => {
  try {
    const stickerDir = path.join(__dirname, "..", "public", "stickers", major);
    const files = await fs.readdir(stickerDir);
    let imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file),
    );

    if (imageFiles.length === 0) {
      throw new Error(`No stickers found for ${major}`);
    }

    // Filter out previously shown stickers
    const previousStickerNames = previousStickers
      .filter((url) => url.includes(`/stickers/${major}/`))
      .map((url) => url.split("/").pop());

    const unshownStickers = imageFiles.filter(
      (file) => !previousStickerNames.includes(file),
    );

    // If all stickers have been shown, reset and allow all again
    if (unshownStickers.length === 0) {
      // All stickers shown, reset to show all
      imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file),
      );
    } else {
      imageFiles = unshownStickers;
    }

    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    return `/stickers/${major}/${imageFiles[randomIndex]}`;
  } catch (error) {
    console.error(`Error getting sticker for ${major}:`, error);
    // Fallback to placeholder
    return `/stickers/${major}/placeholder.png`;
  }
};

// POST /api/match - Main matching endpoint
router.post("/match", async (req, res) => {
  try {
    const { name, major, previousMatches, previousStickers } = req.body;

    // Validate input
    if (!name || !major) {
      return res.status(400).json({
        error: "Name and major are required",
      });
    }

    if (!MAJORS.includes(major)) {
      return res.status(400).json({
        error: "Invalid major",
      });
    }

    // Generate random match, excluding previous matches
    const matched_major = getRandomMatch(major, previousMatches || []);

    // Get random sticker, excluding previous stickers
    const sticker = await getRandomSticker(
      matched_major,
      previousStickers || [],
    );

    // Get all stickers for the matched major (for slot animation)
    const allStickers = await getAllStickers(matched_major);

    // Don't save to database yet - only when user confirms with "I like this one"

    // Return match result
    res.json({
      matched_major,
      sticker_url: sticker,
      all_stickers: allStickers,
      personality_description: PERSONALITIES[matched_major],
      name,
    });
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({
      error: "An error occurred while processing your match",
    });
  }
});

// POST /api/confirm-match - Save confirmed match to database
router.post("/confirm-match", async (req, res) => {
  try {
    const { name, major, matched_major, sticker_url } = req.body;

    // Validate input
    if (!name || !major || !matched_major || !sticker_url) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (!MAJORS.includes(major) || !MAJORS.includes(matched_major)) {
      return res.status(400).json({
        error: "Invalid major",
      });
    }

    // Save confirmed match to database
    const user = new User({
      name,
      major,
      matched_major,
      sticker: sticker_url,
    });

    await user.save();

    // Return saved match
    res.json({
      message: "Match saved successfully",
      match: {
        name: user.name,
        major: user.major,
        matched_major: user.matched_major,
        sticker: user.sticker,
      },
    });
  } catch (error) {
    console.error("Confirm match error:", error);
    res.status(500).json({
      error: "An error occurred while saving your match",
    });
  }
});

module.exports = router;
