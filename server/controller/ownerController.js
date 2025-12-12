import imageKit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" })
        res.json({ success: true, message: "Now you can list cars" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//API TO LIST CAR

export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;
        //upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })
        //optimizatio through imagekoit
        var optimizedImageURL = imageKit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' },
                { quality: 'auto' }, //auto compression
                { format: 'webp' } //convert to  modern format
            ]
        });

        const image = optimizedImageURL;
        await Car.create({ ...car, owner: _id, image })

        res.json({ success: true, message: "Car Added" })
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

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
        const car = await Car.findById(carId)

        //checking is car belongs to user
        if (car.owner.toString() !== _id.toString()) {
            res.json({ success: false, message: "Unauthorized" })
        }
        car.owner = null;
        car.isAvailable = false;

        await car.save()
        res.json({ success: true, message: "Car Removed" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

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

export const updateUserImage=async(req,res)=>{
    try {
        const {_id,role}=req.user;

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

        await User.findByIdAndUpdate(_id,{image});
        res.json({success:true,message:"Image updated"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}