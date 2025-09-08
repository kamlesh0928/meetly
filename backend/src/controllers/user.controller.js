import { User } from "../models/user.model.js";

export const addMeeting = async (req, res) => {
  try {
    const { email, meetingCode, meetingName, isHost } = req.body;

    const newMeeting = {
      meetingCode,
      meetingName,
      isHost,
      startTime: new Date(),
      date: new Date().toISOString().split("T")[0],
      endTime: null,
    };

    const user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({
        email,
        meetings: [newMeeting],
      });
      await newUser.save();
    } else {
      user.meetings.push(newMeeting);
      await user.save();
    }

    return res
      .status(201)
      .json({ message: "Meeting created successfully", meeting: newMeeting });
  } catch (error) {
    console.log("Error in creating meeting:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const endMeeting = async (req, res) => {
  try {
    const { email, meetingCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const meeting = user.meetings;

    for (let i = 0; i < meeting.length; i++) {
      if (meeting[i].meetingCode === meetingCode) {
        meeting[i].endTime = new Date();
        meeting[i].date = meeting[i].startTime.toISOString().split("T")[0];

        const durationMs = meeting[i].endTime - meeting[i].startTime;
        const minutes = Math.floor(durationMs / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        meeting[i].duration = {
          hours,
          minutes: remainingMinutes,
          totalMinutes: minutes,
        };

        user.markModified("meetings");
        await user.save();
        break;
      }
    }

    return res.status(200).json({ message: "Meeting ended successfully" });
  } catch (error) {
    console.log("Error in ending meeting:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejoinMeeting = async (req, res) => {
  try {
    const { email, meetingCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const meeting = user.meetings;

    for (let i = 0; i < meeting.length; i++) {
      if (meeting[i].meetingCode === meetingCode) {
        meeting[i].startTime = new Date();
        meeting[i].endTime = null;
        meeting[i].duration = null;
        user.markModified("meetings");
        await user.save();
        break;
      }
    }

    return res.status(200).json({ message: "Rejoined meeting successfully" });
  } catch (error) {
    console.log("Error in rejoining meeting:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllMeetings = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ meetings: user.meetings });
  } catch (error) {
    console.log("Error in getting all meetings:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { email, meetingCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.meetings = user.meetings.filter(
      (meeting) => meeting.meetingCode !== meetingCode
    );
    await user.save();
    return res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.log("Error in deleting meeting:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAllMeetings = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.meetings = [];
    await user.save();
    return res
      .status(200)
      .json({ message: "All meetings deleted successfully" });
  } catch (error) {
    console.log("Error in deleting all meetings:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
