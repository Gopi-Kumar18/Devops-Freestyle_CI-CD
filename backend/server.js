// backend/server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import convertRoutes from './routes/convertRoutes.js';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import helmet from "helmet";

dotenv.config();

const app = express();
 
app.use(cors());                                              //middleware - 1
app.use(helmet());                                           //middleware - 2     

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,                               // 15 min
  max: 15,
  message: "Too many requests, please try again later."
});
app.use(limiter);                                         //middleware - 3        

app.use(express.json());                                 //middleware - 4

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB\n'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/', convertRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}\n\n`);
});








































































// // backend/server.js
// import dotenv from "dotenv";
// import express from 'express';
// import cors from 'cors';
// import convertRoutes from './routes/convertRoutes.js';
// import mongoose from 'mongoose';
// // import helmet from "helmet";

// dotenv.config();


// const app = express();

// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGODB_URI)
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// app.use('/', convertRoutes);

// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


