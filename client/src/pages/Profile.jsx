import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Profile = () => {

  const { user, axios, fetchUser } = useAppContext();

  const [image, setImage] = useState(null);
  const [name, setName] = useState(user?.name || "");

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async () => {

    if (!image) {
      toast.error("Select image first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", image);

      const { data } = await axios.post(
        "/api/users/upload-image",
        formData
      );

      if (data.success) {
        toast.success("Profile Image Updated ✅");
        fetchUser();
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ================= UPDATE NAME ================= */
  const updateName = async () => {
    try {

      const { data } = await axios.put(
        "/api/users/update-profile",
        { name }
      );

      if (data.success) {
        toast.success("Name Updated ✅");
        fetchUser();
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-10 max-w-lg mx-auto">

      <h2 className="text-2xl font-semibold mb-6">
        My Profile
      </h2>

      {/* PROFILE BOX */}
      <div className="border rounded-xl p-6 shadow-md">

        {/* IMAGE SECTION */}
        <div className="flex flex-col items-center">

          <img
            src={user?.image}
            className="w-32 h-32 rounded-full object-cover border"
          />

          <div className="mt-4 w-full flex justify-center">
  <label className="w-56 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">

    <p className="text-sm text-gray-500">
      Choose Profile Image
    </p>

    <input
      type="file"
      onChange={(e) => setImage(e.target.files[0])}
      className="hidden"
    />

  </label>
</div>

          <button
            onClick={uploadImage}
            className="mt-3 bg-primary text-white px-5 py-2 rounded"
          >
            Upload Image
          </button>

        </div>

        {/* NAME EDIT SECTION */}
        <div className="mt-6">

          <label className="block mb-2 font-medium">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <button
            onClick={updateName}
            className="mt-3 bg-green-600 text-white px-5 py-2 rounded"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
};

export default Profile;