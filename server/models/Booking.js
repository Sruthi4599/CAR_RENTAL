import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true
    },

    pickupDate: {
      type: Date,
      required: true
    },

    returnDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.pickupDate;
        },
        message: "Return date must be after pickup date"
      }
    },
    customerDetails: {
      fullName: {
        type: String,
        required: true,
        trim: true
      },
      age: {
        type: Number,
        required: true,
        min: 18
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
      },
      location: {
        type: String,
        required: true,
        trim: true
      }

    },

    price: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed"
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "REFUNDED"],
      default: "PAID"
    },

    refundAmount: {
      type: Number,
      default: 0
    },

    extensionPayment: {
      type: Number,
      default: 0
    },

    cancelledBy: {
      type: String,
      enum: ["USER", "OWNER"],
      default: null
    },

    cancelledAt: Date
  },
  { timestamps: true }
);

/* 🔐 INDEX for fast overlap checks (DO NOT REMOVE) */
bookingSchema.index({ car: 1, pickupDate: 1, returnDate: 1 });

export default mongoose.model("Booking", bookingSchema);
