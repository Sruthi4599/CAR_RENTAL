import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: {
        type: [String],
        enum: ["user", "owner"],
        default: ["user"]
    },

    image: { type: String, default: '' },


}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User
