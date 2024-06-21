import dotenv from "dotenv";
import connectDB from "./src/configs/db.js";
import app from "./src/server.js";



const PORT = process.env.PORT || 5000;


dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});

(async () => {
    try {
      await connectDB(); 
      console.log("Database connected successfully.");
  
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    } catch (error) {
      console.error("Error starting server:", error);
      process.exit(1); 
    }
  })();
