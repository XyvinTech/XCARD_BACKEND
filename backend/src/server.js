import express from "express";
import cors from "cors";
import logger from "morgan";
import routes from "./routes/index.js";






const app = express();
app.use(cors());


// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(logger("dev"));

routes(app);


export default app;
