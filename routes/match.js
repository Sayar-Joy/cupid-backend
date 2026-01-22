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
// Hardcoded sticker lists for each major (since frontend has the actual files)
const STICKER_LISTS = {
  Architecture: [
    "/stickers/Architecture/sticker.webp",
    "/stickers/Architecture/sticker 2.webp",
    "/stickers/Architecture/sticker 3.webp",
    "/stickers/Architecture/sticker 4.webp",
    "/stickers/Architecture/sticker 5.webp",
    "/stickers/Architecture/sticker 6.webp",
  ],
  Civil: [
    "/stickers/Civil/sticker.webp",
    "/stickers/Civil/sticker 2.webp",
    "/stickers/Civil/sticker 3.webp",
    "/stickers/Civil/sticker 4.webp",
    "/stickers/Civil/sticker 5.webp",
    "/stickers/Civil/sticker 6.webp",
    "/stickers/Civil/sticker 7.webp",
    "/stickers/Civil/sticker 8.webp",
  ],
  Mechanical: [
    "/stickers/Mechanical/sticker.webp",
    "/stickers/Mechanical/sticker 2.webp",
    "/stickers/Mechanical/sticker 3.webp",
    "/stickers/Mechanical/sticker 4.webp",
    "/stickers/Mechanical/sticker 5.webp",
    "/stickers/Mechanical/sticker 6.webp",
    "/stickers/Mechanical/sticker 7.webp",
    "/stickers/Mechanical/sticker 8.webp",
    "/stickers/Mechanical/sticker 9.webp",
  ],
  EC: [
    "/stickers/EC/sticker.webp",
    "/stickers/EC/sticker 2.webp",
    "/stickers/EC/sticker 3.webp",
    "/stickers/EC/sticker 4.webp",
    "/stickers/EC/sticker 5.webp",
    "/stickers/EC/sticker 6.webp",
    "/stickers/EC/sticker 7.webp",
    "/stickers/EC/sticker 8.webp",
  ],
  EP: [
    "/stickers/EP/sticker.webp",
    "/stickers/EP/sticker 2.webp",
    "/stickers/EP/sticker 3.webp",
    "/stickers/EP/sticker 4.webp",
    "/stickers/EP/sticker 5.webp",
    "/stickers/EP/sticker 6.webp",
    "/stickers/EP/sticker 7.webp",
    "/stickers/EP/sticker 8.webp",
  ],
  CEIT: [
    "/stickers/CEIT/sticker.webp",
    "/stickers/CEIT/sticker 2.webp",
    "/stickers/CEIT/sticker 3.webp",
    "/stickers/CEIT/sticker 4.webp",
    "/stickers/CEIT/sticker 5.webp",
    "/stickers/CEIT/sticker 6.webp",
    "/stickers/CEIT/sticker 7.webp",
    "/stickers/CEIT/sticker 8.webp",
    "/stickers/CEIT/sticker 9.webp",
  ],
  MC: ["/stickers/MC/sticker1.svg"],
  Petroleum: [
    "/stickers/Petroleum/sticker.webp",
    "/stickers/Petroleum/sticker 2.webp",
    "/stickers/Petroleum/sticker 3.webp",
    "/stickers/Petroleum/sticker 4.webp",
    "/stickers/Petroleum/sticker 5.webp",
    "/stickers/Petroleum/sticker 6.webp",
    "/stickers/Petroleum/sticker 7.webp",
    "/stickers/Petroleum/sticker 8.webp",
  ],
  Chemical: [
    "/stickers/Chemical/sticker.webp",
    "/stickers/Chemical/sticker 2.webp",
    "/stickers/Chemical/sticker 3.webp",
    "/stickers/Chemical/sticker 4.webp",
    "/stickers/Chemical/sticker 5.webp",
    "/stickers/Chemical/sticker 6.webp",
    "/stickers/Chemical/sticker 7.webp",
    "/stickers/Chemical/sticker 8.webp",
    "/stickers/Chemical/sticker 9.webp",
  ],
};

// Get all stickers from a major
const getAllStickers = (major) => {
  return STICKER_LISTS[major] || [];
};

const getRandomSticker = (major, previousStickers = []) => {
  const imageFiles = STICKER_LISTS[major] || [];

  if (imageFiles.length === 0) {
    return `/stickers/${major}/placeholder.png`;
  }

  // Filter out previously shown stickers
  const unshownStickers = imageFiles.filter(
    (url) => !previousStickers.includes(url),
  );

  // If all stickers have been shown, reset and allow all again
  const availableStickers =
    unshownStickers.length === 0 ? imageFiles : unshownStickers;

  const randomIndex = Math.floor(Math.random() * availableStickers.length);
  return availableStickers[randomIndex];
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
