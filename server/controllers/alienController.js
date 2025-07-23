import Alien from "../models/Alien.js";
import { validationResult } from "express-validator";

// Get all aliens with search, filtering, and pagination
export const getAliens = async (req, res) => {
  try {
    console.log("🔍 Getting aliens - query params:", req.query);
    console.log("🔍 Raw page param:", req.query.page);
    console.log("🔍 Raw limit param:", req.query.limit);

    const {
      page = 1,
      limit = 12,
      search,
      faction,
      planet,
      rarity,
      minPrice,
      maxPrice,
      featured,
      inStock,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query object
    const query = {};

    // Text search across name, faction, and planet
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { faction: { $regex: search, $options: "i" } },
        { planet: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by faction
    if (faction) {
      query.faction = { $regex: faction, $options: "i" };
    }

    // Filter by planet
    if (planet) {
      query.planet = { $regex: planet, $options: "i" };
    }

    // Filter by rarity
    if (rarity) {
      query.rarity = rarity;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Featured filter
    if (featured !== undefined) {
      query.featured = featured === "true";
    }

    // In stock filter
    if (inStock !== undefined) {
      query.inStock = inStock === "true";
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log("📄 Pagination details:");
    console.log("  - Page number:", pageNum);
    console.log("  - Limit:", limitNum);
    console.log("  - Skip:", skip);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("🔍 Final query:", JSON.stringify(query));
    console.log("🔍 Sort options:", sortOptions);

    // Execute query with pagination
    const [aliens, totalCount] = await Promise.all([
      Alien.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Alien.countDocuments(query),
    ]);

    console.log("👽 Found aliens:", aliens.length);
    console.log("📊 Total count:", totalCount);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        aliens,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching aliens:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch aliens",
        code: "FETCH_ERROR",
      },
    });
  }
};

// Get single alien by ID
export const getAlienById = async (req, res) => {
  try {
    const { id } = req.params;

    const alien = await Alien.findById(id);

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: alien,
    });
  } catch (error) {
    console.error("Error fetching alien:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid alien ID format",
          code: "INVALID_ID",
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch alien",
        code: "FETCH_ERROR",
      },
    });
  }
};

// Get related aliens (same faction or planet, excluding current alien)
export const getRelatedAliens = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const alien = await Alien.findById(id);

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    // Find related aliens by faction or planet, excluding the current alien
    const relatedAliens = await Alien.find({
      _id: { $ne: id },
      $or: [{ faction: alien.faction }, { planet: alien.planet }],
      inStock: true,
    })
      .limit(parseInt(limit))
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: relatedAliens,
    });
  } catch (error) {
    console.error("Error fetching related aliens:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid alien ID format",
          code: "INVALID_ID",
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch related aliens",
        code: "FETCH_ERROR",
      },
    });
  }
};

// Create new alien (Admin only)
export const createAlien = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        },
      });
    }

    const alienData = req.body;

    // Handle image upload if file was uploaded
    if (req.file) {
      alienData.image = `/uploads/${req.file.filename}`;
    }

    const alien = new Alien(alienData);
    await alien.save();

    res.status(201).json({
      success: true,
      data: alien,
      message: "Alien created successfully",
    });
  } catch (error) {
    console.error("Error creating alien:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create alien",
        code: "CREATE_ERROR",
      },
    });
  }
};

// Update alien (Admin only)
export const updateAlien = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        },
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Handle image upload if file was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const alien = await Alien.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: alien,
      message: "Alien updated successfully",
    });
  } catch (error) {
    console.error("Error updating alien:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid alien ID format",
          code: "INVALID_ID",
        },
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update alien",
        code: "UPDATE_ERROR",
      },
    });
  }
};

// Delete alien (Admin only)
export const deleteAlien = async (req, res) => {
  try {
    const { id } = req.params;

    const alien = await Alien.findByIdAndDelete(id);

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Alien deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alien:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid alien ID format",
          code: "INVALID_ID",
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to delete alien",
        code: "DELETE_ERROR",
      },
    });
  }
};

// Get featured aliens for homepage
export const getFeaturedAliens = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featuredAliens = await Alien.find({
      featured: true,
      inStock: true,
    })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: featuredAliens,
    });
  } catch (error) {
    console.error("Error fetching featured aliens:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch featured aliens",
        code: "FETCH_ERROR",
      },
    });
  }
};

// Get filter options (unique values for dropdowns)
export const getFilterOptions = async (req, res) => {
  try {
    const [factions, planets, rarities] = await Promise.all([
      Alien.distinct("faction"),
      Alien.distinct("planet"),
      Alien.distinct("rarity"),
    ]);

    // Get price range
    const priceRange = await Alien.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        factions: factions.sort(),
        planets: planets.sort(),
        rarities,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
      },
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch filter options",
        code: "FETCH_ERROR",
      },
    });
  }
};
