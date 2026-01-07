export const getIntent = (msg) => {
  msg = msg.toLowerCase();

  if (msg.includes("available") || msg.includes("free"))
    return "AVAILABILITY";

  if (msg.includes("price") || msg.includes("cost"))
    return "PRICING";

  if (msg.includes("most booked") || msg.includes("popular"))
    return "POPULAR";

  if (msg.includes("cancel"))
    return "CANCEL";

  return "UNKNOWN";
};
