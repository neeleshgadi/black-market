import React, { useState, useEffect } from "react";
import { createAlien, updateAlien } from "../../services/adminService";

const AlienForm = ({ alien, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    faction: "",
    planet: "",
    rarity: "Common",
    price: "",
    backstory: "",
    abilities: [""],
    clothingStyle: "",
    featured: false,
    inStock: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!alien;

  useEffect(() => {
    if (alien) {
      setFormData({
        name: alien.name || "",
        faction: alien.faction || "",
        planet: alien.planet || "",
        rarity: alien.rarity || "Common",
        price: alien.price?.toString() || "",
        backstory: alien.backstory || "",
        abilities: alien.abilities?.length > 0 ? alien.abilities : [""],
        clothingStyle: alien.clothingStyle || "",
        featured: alien.featured || false,
        inStock: alien.inStock !== undefined ? alien.inStock : true,
      });
      setImagePreview(alien.image || "");
    }
  }, [alien]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAbilityChange = (index, value) => {
    const newAbilities = [...formData.abilities];
    newAbilities[index] = value;
    setFormData((prev) => ({ ...prev, abilities: newAbilities }));
  };

  const addAbility = () => {
    setFormData((prev) => ({
      ...prev,
      abilities: [...prev.abilities, ""],
    }));
  };

  const removeAbility = (index) => {
    if (formData.abilities.length > 1) {
      const newAbilities = formData.abilities.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, abilities: newAbilities }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare form data
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        abilities: formData.abilities.filter(
          (ability) => ability.trim() !== ""
        ),
      };

      if (imageFile) {
        submitData.image = imageFile;
      }

      if (isEditing) {
        await updateAlien(alien._id, submitData);
      } else {
        await createAlien(submitData);
      }

      onSuccess();
    } catch (err) {
      setError(
        err.error?.message ||
          `Failed to ${isEditing ? "update" : "create"} alien`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          {isEditing ? "Edit Alien" : "Add New Alien"}
        </h1>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Faction *
                  </label>
                  <input
                    type="text"
                    name="faction"
                    value={formData.faction}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Planet *
                  </label>
                  <input
                    type="text"
                    name="planet"
                    value={formData.planet}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Rarity *
                    </label>
                    <select
                      name="rarity"
                      value={formData.rarity}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Clothing Style
                  </label>
                  <input
                    type="text"
                    name="clothingStyle"
                    value={formData.clothingStyle}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-400">Featured</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="mr-2 rounded"
                    />
                    <span className="text-gray-400">In Stock</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Abilities */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Abilities</h2>

              <div className="space-y-3">
                {formData.abilities.map((ability, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={ability}
                      onChange={(e) =>
                        handleAbilityChange(index, e.target.value)
                      }
                      placeholder={`Ability ${index + 1}`}
                      className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {formData.abilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAbility(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addAbility}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-600"
                >
                  Add Ability
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Image</h2>

              <div className="space-y-4">
                {imagePreview && (
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <p className="text-gray-400 text-sm">
                  Upload an image for the alien card. Recommended size:
                  400x400px
                </p>
              </div>
            </div>

            {/* Backstory */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Backstory</h2>

              <textarea
                name="backstory"
                value={formData.backstory}
                onChange={handleInputChange}
                rows={8}
                placeholder="Enter the alien's backstory..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Alien"
              : "Create Alien"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlienForm;
