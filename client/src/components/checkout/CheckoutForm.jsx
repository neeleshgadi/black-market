import React, { useState } from "react";

const CheckoutForm = ({ onSubmit, isProcessing, user }) => {
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
    paymentMethod: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const validateShippingAddress = () => {
    const newErrors = {};
    const { shippingAddress } = formData;

    if (!shippingAddress.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!shippingAddress.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingAddress.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code";
    }

    if (!shippingAddress.country.trim()) {
      newErrors.country = "Country is required";
    }

    return newErrors;
  };

  const validatePaymentMethod = () => {
    const newErrors = {};
    const { paymentMethod } = formData;

    if (!paymentMethod.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(paymentMethod.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (!paymentMethod.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentMethod.expiryDate)) {
      newErrors.expiryDate = "Please enter date in MM/YY format";
    } else {
      // Check if card is expired
      const [month, year] = paymentMethod.expiryDate.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiry < now) {
        newErrors.expiryDate = "Card has expired";
      }
    }

    if (!paymentMethod.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(paymentMethod.cvv)) {
      newErrors.cvv = "Please enter a valid 3 or 4-digit CVV";
    }

    if (!paymentMethod.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    return newErrors;
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCardNumberChange = (value) => {
    // Format card number with spaces
    const formatted = value
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
    handleInputChange("paymentMethod", "cardNumber", formatted);
  };

  const handleExpiryDateChange = (value) => {
    // Format expiry date as MM/YY
    let formatted = value.replace(/\D/g, "");
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + "/" + formatted.slice(2, 4);
    }
    handleInputChange("paymentMethod", "expiryDate", formatted);
  };

  const handleNextStep = () => {
    const shippingErrors = validateShippingAddress();
    if (Object.keys(shippingErrors).length > 0) {
      setErrors(shippingErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const paymentErrors = validatePaymentMethod();
    if (Object.keys(paymentErrors).length > 0) {
      setErrors(paymentErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= 1
                ? "bg-purple-600 border-purple-600 text-white"
                : "border-gray-600 text-gray-400"
            }`}
          >
            1
          </div>
          <div className="w-16 h-0.5 bg-gray-600 mx-2"></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= 2
                ? "bg-purple-600 border-purple-600 text-white"
                : "border-gray-600 text-gray-400"
            }`}
          >
            2
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          {currentStep === 1 ? "Shipping Information" : "Payment Information"}
        </h2>
        <p className="text-gray-400 text-sm mt-1">Step {currentStep} of 2</p>
      </div>

      <form
        onSubmit={
          currentStep === 1
            ? (e) => {
                e.preventDefault();
                handleNextStep();
              }
            : handleSubmit
        }
      >
        {currentStep === 1 ? (
          // Shipping Address Form
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.shippingAddress.street}
                onChange={(e) =>
                  handleInputChange("shippingAddress", "street", e.target.value)
                }
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.street ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="123 Main Street"
              />
              {errors.street && (
                <p className="text-red-400 text-sm mt-1">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress.city}
                  onChange={(e) =>
                    handleInputChange("shippingAddress", "city", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.city ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress.state}
                  onChange={(e) =>
                    handleInputChange(
                      "shippingAddress",
                      "state",
                      e.target.value
                    )
                  }
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.state ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="NY"
                />
                {errors.state && (
                  <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress.zipCode}
                  onChange={(e) =>
                    handleInputChange(
                      "shippingAddress",
                      "zipCode",
                      e.target.value
                    )
                  }
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.zipCode ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="10001"
                />
                {errors.zipCode && (
                  <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  value={formData.shippingAddress.country}
                  onChange={(e) =>
                    handleInputChange(
                      "shippingAddress",
                      "country",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">India</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all mt-6"
            >
              Continue to Payment
            </button>
          </div>
        ) : (
          // Payment Method Form
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cardholder Name *
              </label>
              <input
                type="text"
                value={formData.paymentMethod.cardholderName}
                onChange={(e) =>
                  handleInputChange(
                    "paymentMethod",
                    "cardholderName",
                    e.target.value
                  )
                }
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.cardholderName ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="John Doe"
              />
              {errors.cardholderName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.cardholderName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                value={formData.paymentMethod.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.cardNumber ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors.cardNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  value={formData.paymentMethod.expiryDate}
                  onChange={(e) => handleExpiryDateChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.expiryDate ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {errors.expiryDate && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  value={formData.paymentMethod.cvv}
                  onChange={(e) =>
                    handleInputChange(
                      "paymentMethod",
                      "cvv",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.cvv ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cvv && (
                  <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    Secure Payment
                  </p>
                  <p className="text-blue-300/80 text-xs mt-1">
                    Your payment information is encrypted and secure. We never
                    store your card details.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all border border-gray-600"
              >
                Back to Shipping
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Complete Order"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
