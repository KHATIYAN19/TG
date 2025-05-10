import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/dbConnection.js';
import BookingRoute from './routes/Booking.js'
import TimeSlotRoute from './routes/TimeSlot.js'
import userRoute from "./routes/User.js"
import reviewRoute from "./routes/Review.js"
import contactRoute from "./routes/Contact.js"
import blogRoute from "./routes/Blog.js"
import portfolioRoute from "./routes/Portfolio.js"
import  AffiliateRoute  from './routes/Affiliate.js';
dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/booking',BookingRoute);
app.use('/time', TimeSlotRoute);
app.use('/admin',userRoute);

app.use("/admin/reviews",reviewRoute);

app.use("/messages",contactRoute);
app.use("/blogs",blogRoute);
app.use("/portfolio",portfolioRoute);
app.use("/affiliate",AffiliateRoute);
app.get('/', (req, res) => res.send('Booking API Running Successfully!'));
app.use((req, res, next) => {
    res.status(404).json({ message: 'Resource not found on this server.' });
});
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
