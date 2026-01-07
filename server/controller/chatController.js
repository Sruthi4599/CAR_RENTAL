import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

/* ---------- Helper for keyword matching ---------- */
const hasAny = (msg, keywords) =>
  keywords.some(word => msg.includes(word));

export const handleChat = async (req, res) => {
  try {
    const message = req.body.message.toLowerCase().trim();

    /* ================= GREETINGS ================= */
    if (hasAny(message, ["hi", "hello", "hey"])) {
      return res.json({
        reply: `Hello 👋 Welcome to CarRental!
I can help you with booking cars, prices, cancellation, refunds, and app usage.

👉 Just type HELP to see what you can ask.`,
      });
    }

    /* ================= HOW THE APP WORKS ================= */
    if (hasAny(message, ["how does the app work", "app work", "how it works"])) {
      return res.json({
        reply: `
📱 How the CarRental app works:

1️⃣ Choose location & dates
2️⃣ Browse available cars
3️⃣ Book and pay online
4️⃣ Manage bookings from Dashboard
5️⃣ Pickup & return car as scheduled
        `.trim(),
      });
    }

    /* ================= HOW TO BOOK A CAR ================= */
    if (hasAny(message, [
      "how to book",
      "book a car",
      "booking process",
      "rent a car",
    ])) {
      return res.json({
        reply: `
🚗 How to book a car:

1️⃣ Select pickup location
2️⃣ Choose pickup & return dates
3️⃣ Browse available cars
4️⃣ Click "Book Now"
5️⃣ Complete payment
6️⃣ Booking confirmation appears in Dashboard
        `.trim(),
      });
    }

    /* ================= AVAILABLE CARS (CITY) ================= */
    if (message.includes("in ")) {
      const location = message.split("in ")[1];

      const cars = await Car.find({
        location: { $regex: location, $options: "i" },
        isAvailable: true,
      });

      if (!cars.length) {
        return res.json({
          reply: `No available cars found in ${location}.`,
        });
      }

      return res.json({
        reply: `🚗 Cars available in ${location}: ${cars
          .map(c => `${c.brand} ${c.model}`)
          .join(", ")}`,
      });
    }

    /* ================= AVAILABLE CARS (GENERAL) ================= */
    if (hasAny(message, ["available", "available cars", "show cars"])) {
      const cars = await Car.find({ isAvailable: true }).limit(5);

      if (!cars.length) {
        return res.json({ reply: "Currently no cars are available." });
      }

      return res.json({
        reply: `🚗 Available cars: ${cars
          .map(c => `${c.brand} ${c.model} (${c.location})`)
          .join(", ")}`,
      });
    }

    /* ================= PRICE / COST ================= */
    if (hasAny(message, [
      "price",
      "cost",
      "money",
      "charges",
      "payment",
      "fare",
      "extra",
    ])) {
      return res.json({
        reply: `
💰 Pricing details:

• Price is shown per day for each car
• Total cost depends on rental duration
• Extra charges may apply for late return or damage
• Final price is shown before payment
        `.trim(),
      });
    }

    /* ================= WHERE TO SEE BOOKINGS ================= */
    if (hasAny(message, [
      "my bookings",
      "where can i see my bookings",
      "view bookings",
      "booking history",
    ])) {
      return res.json({
        reply: `
📂 Where to see your bookings:

1️⃣ Open Dashboard
2️⃣ Go to "My Bookings"
3️⃣ View active & past bookings
        `.trim(),
      });
    }

    /* ================= EXTEND BOOKING ================= */
    if (hasAny(message, [
      "extend booking",
      "extend duration",
      "extend car",
      "increase days",
      "change return date",
    ])) {
      return res.json({
        reply: `
⏳ How to extend your booking:

1️⃣ Open Dashboard
2️⃣ Go to "My Bookings"
3️⃣ Select active booking
4️⃣ Click "Extend Duration"
5️⃣ Choose new return date
6️⃣ Pay additional amount (if required)

⚠️ Extension depends on car availability.
        `.trim(),
      });
    }

    /* ================= CANCEL BOOKING ================= */
    if (hasAny(message, [
      "cancel",
      "cancel booking",
      "cancel car",
      "booking cancellation",
    ])) {
      return res.json({
        reply: `
❌ How to cancel a booking:

1️⃣ Open Dashboard
2️⃣ Go to "My Bookings"
3️⃣ Select the booking
4️⃣ Click "Cancel Booking"
        `.trim(),
      });
    }

    /* ================= REFUND POLICY ================= */
    if (hasAny(message, [
      "refund",
      "refund policy",
      "money back",
    ])) {
      return res.json({
        reply: `
🔁 Refund policy:

• Full refund if cancelled 24+ hours before pickup
• Partial refund if cancelled within 24 hours
• No refund after pickup time
• Refund processed in 5–7 working days
        `.trim(),
      });
    }

    /* ================= HELP ================= */
    if (hasAny(message, ["help", "support"])) {
      return res.json({
        reply: `
You can ask:
• How to book a car
• Price / cost details
• Cancel booking
• Refund policy
• Cars in your city
• Extend booking
• Where to see bookings
• How the app works
        `.trim(),
      });
    }

    /* ================= FALLBACK ================= */
    return res.json({
      reply:
        "Sorry, I can help only with car rental related questions. Type HELP to see supported questions.",
    });

  } catch (err) {
    console.error("Rule-based chatbot error:", err);
    res.status(500).json({
      reply: "Something went wrong. Please try again.",
    });
  }
};
