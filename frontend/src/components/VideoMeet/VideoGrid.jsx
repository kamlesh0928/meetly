import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MicOffIcon from "@mui/icons-material/MicOff";

export default function VideoGrid({
  showChatModal,
  localVideoRef,
  hasLocalVideo,
  hasLocalAudio,
  username,
  videos,
}) {
  return (
    <div
      className={`flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto bg-gray-900 ${
        showChatModal ? "pr-96" : ""
      }`}
    >
      {/* Local Video */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {!hasLocalVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <AccountCircleIcon
              style={{ fontSize: 100 }}
              className="text-gray-500"
            />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm">
          You ({username})
        </div>
        {!hasLocalAudio && (
          <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
            <MicOffIcon fontSize="small" />
          </div>
        )}
      </div>

      {/* Remote Videos */}
      {videos.map((video, index) => (
        <div
          key={index}
          className="relative bg-black rounded-lg overflow-hidden shadow-lg"
        >
          {video.stream && video.hasVideo ? (
            <video
              srcObject={video.stream}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <AccountCircleIcon
                style={{ fontSize: 100 }}
                className="text-gray-500"
              />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm">
            Participant
          </div>
          {!video.hasAudio && (
            <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
              <MicOffIcon fontSize="small" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
