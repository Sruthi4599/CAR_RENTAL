import imageKit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
export const changeRoleToOwner = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user.roles.includes("owner")) {
        user.roles.push("owner");
        await user.save();
    }

    res.json({
        success: true,
        message: "Owner access enabled"
    });
};


//API TO LIST CAR

// API TO LIST CAR
export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;

        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        if (!imageFile) {
            return res.json({
                success: false,
                message: "Car image is required"
            });
        }

        // upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        });

        // optimization through imagekit
        const optimizedImageURL = imageKit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' },
                { quality: 'auto' },
                { format: 'webp' }
            ]
        });

        const image = optimizedImageURL;

        // 🔥 FIX IS HERE
        await Car.create({
            ...car,
            owner: _id,
            image,
            isAvailable: true   // ✅ VERY IMPORTANT
        });

        res.json({ success: true, message: "Car Added" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to list owner cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id })
        res.json({ success: true, cars })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API to toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id })
        const { carId } = req.body;
        const car = await Car.findById(carId)

        //checking is car belongs to user
        if (car.owner.toString() !== _id.toString()) {
            res.json({ success: false, message: "Unauthorized" })
        }
        car.isAvailable = !car.isAvailable;

        await car.save()
        res.json({ success: true, message: "Availability toggled" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
//API TO DELETE CAR
export const deletecar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        const car = await Car.findById(carId);

        // ✅ CHECK CAR EXISTS
        if (!car) {
            return res.json({
                success: false,
                message: "Car not found"
            });
        }

        // ✅ CHECK OWNER
        if (car.owner.toString() !== _id.toString()) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        // ✅ PROPER DELETE (BEST PRACTICE)
        await Car.findByIdAndDelete(carId);

        res.json({
            success: true,
            message: "Car deleted successfully"
        });

    } catch (error) {
        console.error("Delete car error:", error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

//API TO GET DASHBOARD DATA

export const getDashboardData = async (req, res) => {
    try {
        // Logged in owner
        const ownerId = req.user._id;
        console.log("Dashboard owner:", ownerId);

        // 1️⃣ Total cars
        const totalCars = await Car.countDocuments({ owner: ownerId });

        // 2️⃣ Total bookings for cars owned by this owner
        const totalBookings = await Booking.countDocuments({ owner: ownerId });

        // 3️⃣ Pending bookings
        const pendingBookings = await Booking.countDocuments({
            owner: ownerId,
            status: "pending"
        });

        // 4️⃣ Completed bookings
        const completedBookings = await Booking.countDocuments({
            owner: ownerId,
            status: "confirmed"
        });

        // 5️⃣ Recent bookings (latest 5)
        const recentBookings = await Booking.find({ owner: ownerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("car");

        // 6️⃣ Monthly Revenue
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const monthlyBookings = await Booking.find({
            owner: ownerId,
            status: "confirmed",
            createdAt: { $gte: startOfMonth }
        });

        let monthlyRevenue = 0;
        monthlyBookings.forEach(b => {
            monthlyRevenue += b.price;
        });

        return res.json({
            success: true,
            dashboardData: {
                totalCars,
                totalBookings,
                pendingBookings,
                completedBookings,
                recentBookings,
                monthlyRevenue
            }
        });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};


//API to update user image

export const updateUserImage = async (req, res) => {
    try {
        const { _id, role } = req.user;

        const imageFile = req.file;
        //upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })
        //optimizatio through imagekoit
        var optimizedImageURL = imageKit.url({
            path: response.filePath,
            transformation: [
                { width: '400' },
                { quality: 'auto' }, //auto compression
                { format: 'webp' } //convert to  modern format
            ]
        });

        const image = optimizedImageURL;

        await User.findByIdAndUpdate(_id, { image });
        res.json({ success: true, message: "Image updated" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
