import mongoose from 'mongoose';
import logger from '../logger';

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    logger.info('Connected to MongoDB successfully!');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
