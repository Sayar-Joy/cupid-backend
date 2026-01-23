const express = require("express");
const router = express.Router();
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

// Major probabilities (must sum to 100)
const MAJOR_PROBABILITIES = {
  Civil: 16,
  Mechanical: 15,
  CEIT: 14,
  EP: 13,
  EC: 12,
  Architecture: 9,
  MC: 8,
  Petroleum: 7,
  Chemical: 6,
};

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

// Weighted random match logic with exclusion of previous matches
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

  // Calculate total weight for available majors
  const totalWeight = availableMajors.reduce(
    (sum, major) => sum + (MAJOR_PROBABILITIES[major] || 1),
    0
  );

  // Generate random number between 0 and total weight
  const random = Math.random() * totalWeight;

  // Select major based on weighted probability
  let cumulativeWeight = 0;
  for (const major of availableMajors) {
    cumulativeWeight += MAJOR_PROBABILITIES[major] || 1;
    if (random < cumulativeWeight) {
      return major;
    }
  }

  // Fallback (should never reach here)
  return availableMajors[availableMajors.length - 1];
};

// Sticker counts for each major (frontend has the actual files)
const STICKER_COUNTS = {
  Architecture: 6,
  Civil: 8,
  Mechanical: 9,
  EC: 8,
  EP: 8,
  CEIT: 9,
  MC: 9,
  Petroleum: 8,
  Chemical: 9,
};

// Get all sticker IDs for a major
const getAllStickerIds = (major) => {
  const count = STICKER_COUNTS[major] || 0;
  const ids = [];

  for (let i = 1; i <= count; i++) {
    if (i === 1) {
      ids.push("sticker");
    } else {
      ids.push(`sticker ${i}`);
    }
  }
  return ids;
};

// Get random sticker ID from major
const getRandomStickerId = (major, previousStickerIds = []) => {
  const stickerIds = getAllStickerIds(major);

  if (stickerIds.length === 0) {
    return "placeholder";
  }

  // Filter out previously shown sticker IDs
  const unshownIds = stickerIds.filter(
    (id) => !previousStickerIds.includes(id),
  );

  // If all stickers have been shown, reset and allow all again
  const availableIds = unshownIds.length === 0 ? stickerIds : unshownIds;

  const randomIndex = Math.floor(Math.random() * availableIds.length);
  return availableIds[randomIndex];
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

    // Get random sticker ID, excluding previous sticker IDs
    const stickerId = getRandomStickerId(matched_major, previousStickers || []);

    // Get all sticker IDs for the matched major (for slot animation)
    const allStickerIds = getAllStickerIds(matched_major);

    // Don't save to database yet - only when user confirms with "I like this one"

    // Return match result
    res.json({
      matched_major,
      sticker_id: stickerId,
      all_sticker_ids: allStickerIds,
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
    const { name, major, matched_major, sticker_id } = req.body;

    // Validate input
    if (!name || !major || !matched_major || !sticker_id) {
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
      sticker: sticker_id,
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
