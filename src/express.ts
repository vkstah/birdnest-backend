import express from "express";
import { CONFIG } from "./config";
import { router } from "./routes/";

export const startExpress = () => {
  const app = express();

  // Root path "/"
  app.get("/", (req, res) => res.send("Nothing to see here. 😜"));

  // Path used for health checking
  app.get("/health", (req, res) =>
    res.send("Everything appears to be in order! ✅")
  );

  // Routes defined in /routes
  app.use("/", router);

  return app.listen(CONFIG.PORT, () => console.log(`App listening!`));
};
