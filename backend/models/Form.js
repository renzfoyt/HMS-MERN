import mongoose from "mongoose";

// contact form schema
const contactFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, 
  email: {
    type: String,
    required: true,
  },
  mobileNum: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "handled"],
    default: "pending",
},
},
  { timestamps: true } 
);

export const ContactForm = mongoose.model("ContactForm", contactFormSchema);


//book appointment form schema
const bookingFormSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  preferredDate: {
    type: Date,
    required: true,
  },
  preferredTime: {
    type: String,
    required: true,
    },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  mobileNum: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    },
  message: {
    type: String,
    required: false,
    },    
  status: {
    type: String,
    enum: ["pending", "handled"],
    default: "pending",
},
},
  { timestamps: true } 
);

export const BookingForm = mongoose.model("BookingForm", bookingFormSchema);
