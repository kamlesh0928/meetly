import React from "react";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

export default function Controls({
  audioAvailable,
  audioEnabled,
  handleAudioToggle,
  videoAvailable,
  videoEnabled,
  handleVideoToggle,
  screenAvailable,
  screenEnabled,
  handleScreenToggle,
  handleEndCall,
}) {
  return (
    <div className="h-20 flex justify-center items-center space-x-6 bg-gray-800 shadow-md">
      <button
        onClick={handleAudioToggle}
        disabled={!audioAvailable && !audioEnabled}
        className={`p-3 rounded-full transition ${
          audioEnabled
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-red-600 hover:bg-red-500"
        } ${
          !audioAvailable && !audioEnabled
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        {audioEnabled ? (
          <MicIcon fontSize="large" />
        ) : (
          <MicOffIcon fontSize="large" />
        )}
      </button>
      <button
        onClick={handleVideoToggle}
        disabled={!videoAvailable && !videoEnabled}
        className={`p-3 rounded-full transition ${
          videoEnabled
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-red-600 hover:bg-red-500"
        } ${
          !videoAvailable && !videoEnabled
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        {videoEnabled ? (
          <VideocamIcon fontSize="large" />
        ) : (
          <VideocamOffIcon fontSize="large" />
        )}
      </button>
      <button
        onClick={handleScreenToggle}
        disabled={!screenAvailable && !screenEnabled}
        className={`p-3 rounded-full transition ${
          screenEnabled
            ? "bg-green-600 hover:bg-green-500"
            : "bg-gray-700 hover:bg-gray-600"
        } ${
          !screenAvailable && !screenEnabled
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        {screenEnabled ? (
          <StopScreenShareIcon fontSize="large" />
        ) : (
          <ScreenShareIcon fontSize="large" />
        )}
      </button>
      <button
        onClick={handleEndCall}
        className="p-3 rounded-full bg-red-600 hover:bg-red-500 transition"
      >
        <CallEndIcon fontSize="large" />
      </button>
    </div>
  );
}
