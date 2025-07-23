import React from "react";
import UserProfile from "../components/user/UserProfile.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
