const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Store = require('./models/store.model');

dotenv.config();

const sampleStores = [
  {
    name: "Jan Aushadhi Kendra - Connaught Place",
    address: "Shop No. 12, Ground Floor, Inner Circle",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    phone: "011-23456789",
    location: {
      type: "Point",
      coordinates: [77.2197, 28.6328] // [lng, lat]
    }
  },
  {
    name: "Jan Aushadhi Kendra - AIIMS",
    address: "Near Gate No. 2, AIIMS Campus",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110029",
    phone: "011-98765432",
    location: {
      type: "Point",
      coordinates: [77.2100, 28.5672]
    }
  },
  {
    name: "Jan Aushadhi Kendra - Lajpat Nagar",
    address: "B-24, Central Market",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110024",
    phone: "011-55443322",
    location: {
      type: "Point",
      coordinates: [77.2433, 28.5677]
    }
  },
  {
    name: "Jan Aushadhi Kendra - Rohini",
    address: "Sector 7, Pocket G-24",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110085",
    phone: "011-11223344",
    location: {
      type: "Point",
      coordinates: [77.1130, 28.7056]
    }
  }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medclear');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await Store.deleteMany({});
    console.log('Existing stores removed');

    await Store.insertMany(sampleStores);
    console.log('Sample stores seeded successfully');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
