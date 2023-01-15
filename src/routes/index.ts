import { Router } from "express";
import { handleDrones } from "./drones";
import { handleViolators } from "./violators";

export const router = Router();

router.get("/violators", handleViolators);
router.get("/drones", handleDrones);
