import { Router } from "express";
import {
  getAllMeetings,
  addMeeting,
  endMeeting,
  rejoinMeeting,
  deleteMeeting,
  deleteAllMeetings,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/get-meetings", getAllMeetings);

router.post("/add-meeting", addMeeting);
router.post("/end-meeting", endMeeting);
router.post("/rejoin-meeting", rejoinMeeting);

router.delete("/delete-meeting", deleteMeeting);
router.delete("/delete-all-meetings", deleteAllMeetings);

export default router;
