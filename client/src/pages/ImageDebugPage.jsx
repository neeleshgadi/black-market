import React, { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUtils";

const ImageDebugPage = () => {
  const [alienData, setAlienData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testImageUrl, setTestImageUrl] = useState(
    "/uploads/alien-1753208301575-823007842.png"
  );

  useEffect(() => {
    // Fetch a single alien to test with
    const fetchAlien = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/aliens`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.aliens && data.aliens.length > 0) {
          setAlienData(data.aliens[0]);
        } else {
          setError("No aliens found in database");
        }
      } catch (err) {
        console.error("Error fetching alien:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlien();
  }, []);

  // Process the image URL
  const processedImageUrl = getImageUrl(testImageUrl);
  const alienImageUrl = alienData ? getImageUrl(alienData.image) : null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Image Debug Page</h1>

      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Image</h2>
        <div className="mb-4">
          <p className="text-sm mb-1">
            Original URL:{" "}
            <code className="bg-gray-700 px-2 py-1 rounded">
              {testImageUrl}
            </code>
          </p>
          <p className="text-sm mb-1">
            Processed URL:{" "}
            <code className="bg-gray-700 px-2 py-1 rounded">
              {processedImageUrl}
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Direct IMG tag</h3>
            <img
              src={processedImageUrl}
              alt="Test alien"
              className="w-full h-64 object-contain bg-gray-900 rounded"
              onError={(e) => {
                console.error("Direct image load error");
                e.target.src = "/placeholder-alien.svg";
              }}
            />
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2">
              Image with absolute URL
            </h3>
            <img
              src={`http://localhost:5000${testImageUrl}`}
              alt="Test alien absolute"
              className="w-full h-64 object-contain bg-gray-900 rounded"
              onError={(e) => {
                console.error("Absolute image load error");
                e.target.src = "/placeholder-alien.svg";
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading alien data...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : alienData ? (
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Alien from Database</h2>
          <div className="mb-4">
            <p className="text-sm mb-1">Name: {alienData.name}</p>
            <p className="text-sm mb-1">
              Original Image URL:{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">
                {alienData.image}
              </code>
            </p>
            <p className="text-sm mb-1">
              Processed Image URL:{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">
                {alienImageUrl}
              </code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                Alien Image (processed URL)
              </h3>
              <img
                src={alienImageUrl}
                alt={alienData.name}
                className="w-full h-64 object-contain bg-gray-900 rounded"
                onError={(e) => {
                  console.error("Alien image load error");
                  e.target.src = "/placeholder-alien.svg";
                }}
              />
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                Alien Image (direct from DB)
              </h3>
              <img
                src={`http://localhost:5000${alienData.image}`}
                alt={alienData.name}
                className="w-full h-64 object-contain bg-gray-900 rounded"
                onError={(e) => {
                  console.error("Direct alien image load error");
                  e.target.src = "/placeholder-alien.svg";
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p>No alien data found</p>
      )}

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Network Test</h2>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => {
            try {
              const response = await fetch(
                `http://localhost:5000${testImageUrl}`
              );
              if (response.ok) {
                alert(`Image fetch successful! Status: ${response.status}`);
              } else {
                alert(`Image fetch failed! Status: ${response.status}`);
              }
            } catch (err) {
              alert(`Network error: ${err.message}`);
            }
          }}
        >
          Test Image Network Request
        </button>
      </div>
    </div>
  );
};

export default ImageDebugPage;
