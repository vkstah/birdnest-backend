import express from "express";
import { CONFIG } from "./config";

export const startExpress = () => {
  const app = express();

  app.get("/", (req, res) => res.send("Nothing to see here. 😜"));

  return app.listen(CONFIG.PORT, () =>
    console.log(`App listening on port ${CONFIG.PORT}!`)
  );
};
