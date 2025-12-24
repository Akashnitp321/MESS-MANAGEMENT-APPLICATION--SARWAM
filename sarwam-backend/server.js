//env configuration
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import studentAuthRoutes from './Routes/studentAuth.js'; // adjust 'Routes' vs 'routes' to match your folder
import otpRoutes from './Routes/otp.js'; // <-- add back
import paymentRoutes from './Routes/PaymentRoutes.js'; // <-- new
import MenuRoutes from './Routes/MenuRoutes.js'
import StudentInfoRoutes from './Routes/StudentInfoRoutes.js'
import LeaveRoutes from './Routes/LeaveRoutes.js'

import connectToDB from "./connections/db.js";

const app = express();

//some middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // accept form submissions
app.use(cors()) // allow all origins (for production, set specific origin)

// normalize incoming URLs: remove accidental %20 / spaces so routes still match
app.use((req, res, next) => {
  const original = req.url;
  const cleaned = original.replace(/%20/g, '').replace(/\s+/g, '');
  if (cleaned !== original) {
    console.log('Normalized URL', original, '->', cleaned);
    req.url = cleaned;
  }
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body); 
  next();
});

const PORT = process.env.PORT || 3000;

//connection to database 
connectToDB();

//our rest api
app.use('/api/auth', studentAuthRoutes);
app.use('/api/otp', otpRoutes); // <-- add back
app.use('/api/payment', paymentRoutes); // <-- new
app.use('/api',MenuRoutes)
app.use('/api',StudentInfoRoutes)
app.use('/api',LeaveRoutes)

// return JSON 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// simple error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

//server LISTENING 
app.listen(PORT, () => {
  console.log(`server is listening on port number ${PORT}`);
});


