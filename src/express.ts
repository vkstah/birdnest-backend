import express from "express";
import { CONFIG } from "./config";

export const startExpress = () => {
  const app = express();

  return app.listen(CONFIG.port, () =>
    console.log(`App listening on port ${CONFIG.port}!`)
  );
};
