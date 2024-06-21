import authRouter from "./auth.routes.js";
import groupRouter from "./group.routes.js";
import profileRouter from "./profile.routes.js";
import userRouter from "./user.routes.js";
import publicRouter from "./public.routes.js";
import informationRouter from "./info.routes.js";

/**
 * @route  Index Route
 * @desc   Used to mix multiple routes
 */
const routes = (app) => {
  app.use("/profile", publicRouter);
  app.use("/information", informationRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/profile", profileRouter);
  app.use("/api/v1/group", groupRouter);
};

export default routes;
