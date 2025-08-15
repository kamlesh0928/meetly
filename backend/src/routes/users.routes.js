import { Router } from "express";

const router = Router();

// Auth routes
router.post("/login", loginUser);
router.post("/register", registerUser);

// Activity routes
router.post("/activities", addActivity); // POST /activities to add a new activity
router.get("/activities", getAllActivities); // GET /activities to fetch all activities

export default router;
