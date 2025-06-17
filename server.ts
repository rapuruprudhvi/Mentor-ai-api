import * as dotenv from 'dotenv';
import { AppDataSource } from './src/config/database';
import { createApp } from './src/app';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();
