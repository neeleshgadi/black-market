import mongoose from "mongoose";

const alienSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Alien name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    faction: {
      type: String,
      required: [true, "Faction is required"],
      trim: true,
      maxlength: [50, "Faction cannot exceed 50 characters"],
    },
    planet: {
      type: String,
      required: [true, "Planet is required"],
      trim: true,
      maxlength: [50, "Planet cannot exceed 50 characters"],
    },
    rarity: {
      type: String,
      required: [true, "Rarity is required"],
      enum: {
        values: ["Common", "Rare", "Epic", "Legendary"],
        message: "Rarity must be Common, Rare, Epic, or Legendary",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Price must be a valid positive number",
      },
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: function (value) {
          // Accept both full URLs and local file paths
          const isUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
          const isLocalPath = /^\/uploads\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(
            value
          );
          return isUrl || isLocalPath;
        },
        message:
          "Image must be a valid URL or local path ending with jpg, jpeg, png, gif, or webp",
      },
    },
    backstory: {
      type: String,
      trim: true,
      maxlength: [2000, "Backstory cannot exceed 6000 characters"],
    },
    abilities: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Each ability cannot exceed 100 characters"],
      },
    ],
    clothingStyle: {
      type: String,
      trim: true,
      maxlength: [100, "Clothing style cannot exceed 100 characters"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filtering performance
alienSchema.index({ name: "text", faction: "text", planet: "text" });
alienSchema.index({ faction: 1 });
alienSchema.index({ planet: 1 });
alienSchema.index({ rarity: 1 });
alienSchema.index({ price: 1 });
alienSchema.index({ featured: 1 });
alienSchema.index({ inStock: 1 });
alienSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
alienSchema.index({ faction: 1, rarity: 1 });
alienSchema.index({ planet: 1, rarity: 1 });
alienSchema.index({ price: 1, rarity: 1 });
alienSchema.index({ featured: 1, inStock: 1 });
alienSchema.index({ inStock: 1, price: 1 });
alienSchema.index({ rarity: 1, price: 1, inStock: 1 });

const Alien = mongoose.model("Alien", alienSchema);

export default Alien;
