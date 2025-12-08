import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
import User from "../models/User.js";
const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
    })
    return bookings.length == 0
}



//API TO CHECK AVAILABILITY OF CARS FOR THE GIVEN DATE AND LOCATION
export const checkAvailabilityOfCar=async(req,res)=>{
    try {
        const {location,pickupDate,returnDate}=req.body
        //fetch all available cars by location
        const cars=await Car.find({location,isAvaliable:true})

        //check cars availability for the given data range ysing promise
        const availableCarsPromises=cars.map(async (car)=>{
            const isAvailable=await checkAvailability(car._id,pickupDate,returnDate)
            return {...car._doc,isAvailable:isAvailable}
        })
        let availableCars=await Promise.all(availableCarsPromises);
        availableCars=availableCars.filter(car=>car.isAvailable===true)
        res.json({success:true,availableCars})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
        
    }
}

//API TO CREATE BOOKING
export const createBooking=async(req,res)=>{
    try {
        const {_id}=req.user;
        const {car,pickupDate,returnDate}=req.body;
        const isAvailable=await checkAvailability(car,pickupDate,returnDate)
        if(!isAvailable){
            return res.json({success:false,message:"Car is not available"})
        }
        const carData=await Car.findById(car)

        //calculate pricde based on pickup and return Date
        const picked=new Date(pickupDate);
        const returned=new Date(returnDate);
        const noOfDays=Math.ceil((returned-picked)/(1000*60*60*24))
        const price=carData.pricePerDay*noOfDays
        await Booking.create({car,owner:carData.owner,user:_id,pickupDate,returnDate,price})
        res.json({success:true,message:"Booking created"})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to List User Bookings

export const getUserBookings=async(req,res)=>{
    try {
        const {_id}=req.user;
        const bookings=(await Booking.find({user:_id}).populate("car")).toSorted({createdAt:-1})
        res.json({success:true,bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to get Owner Bookings
export const getOwnerBookings=async(req,res)=>{
    try {
        if(req.user.role!=='owner'){
            res.json({success:false,message:"Unauthorized"})
        }
        const bookings=(await Booking.find({owner:req.user._id}).populate('car user').select("-user.password")).sort({createdAt:-1})
         res.json({success:true,bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}


//API TO CHANGE BOOKING STATUS
export const changeBookingStatus=async(req,res)=>{
    try {
        const {_id}=req.user;
        const {bookingId,status}=req.body;

        const booking=await Booking.findById(bookingId)
        if(booking.owner.toString()!==_id.toString()){
            return res.json({success:false,message:"Unauthorized"})
        }
        bookings.status=status;
        await booking.save();
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}