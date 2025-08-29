import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useUser } from "@clerk/clerk-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import PeopleIcon from "@mui/icons-material/People";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeet() {
  const { user } = useUser();
  const username =
    user?.fullName || sessionStorage.getItem("guestName") || "Guest";

  const { meetingId } = useParams();
  const location = useLocation();
  const { meetingName } = location.state || {};
  const navigate = useNavigate();

  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const connectionsRef = useRef({});
  const chatContainerRef = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState(0);
  const [message, setMessage] = useState("");
  const [participantsCount, setParticipantsCount] = useState(1);
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const [hasLocalAudio, setHasLocalAudio] = useState(false);
  const [videos, setVideos] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [participantsAnchorEl, setParticipantsAnchorEl] = useState(null);
  const [participants, setParticipants] = useState([username]); // Dummy list, enhance with real data if available

  const getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Error stopping previous stream:", error);
    }

    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    setHasLocalVideo(stream.getVideoTracks().length > 0);
    setHasLocalAudio(stream.getAudioTracks().length > 0);

    Object.keys(connectionsRef.current).forEach((id) => {
      if (id === socketIdRef.current) return;
      if (window.localStream) {
        connectionsRef.current[id].addStream(window.localStream);
      }
      connectionsRef.current[id]
        .createOffer()
        .then((description) => {
          connectionsRef.current[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({
                  sdp: connectionsRef.current[id].localDescription,
                })
              );
            })
            .catch((error) =>
              console.error("Error setting local description:", error)
            );
        })
        .catch((error) => console.error("Error creating offer:", error));
    });
  };

  const getDisplayMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Error stopping previous stream:", error);
    }

    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    setHasLocalVideo(stream.getVideoTracks().length > 0);
    setHasLocalAudio(stream.getAudioTracks().length > 0);

    Object.keys(connectionsRef.current).forEach((id) => {
      if (id === socketIdRef.current) return;
      if (window.localStream) {
        connectionsRef.current[id].addStream(window.localStream);
      }
      connectionsRef.current[id]
        .createOffer()
        .then((description) => {
          connectionsRef.current[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({
                  sdp: connectionsRef.current[id].localDescription,
                })
              );
            })
            .catch((error) =>
              console.error("Error setting local description:", error)
            );
        })
        .catch((error) => console.error("Error creating offer:", error));
    });

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreenEnabled(false);
        try {
          if (localVideoRef.current && localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject
              .getTracks()
              .forEach((t) => t.stop());
          }
        } catch (error) {
          console.error("Error stopping tracks:", error);
        }
        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }
        setHasLocalVideo(false);
        setHasLocalAudio(false);
        getUserMedia();
      };
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    if (!connectionsRef.current[fromId]) {
      connectionsRef.current[fromId] = new RTCPeerConnection(
        peerConfigConnections
      );
      connectionsRef.current[fromId].onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit(
            "signal",
            fromId,
            JSON.stringify({ ice: event.candidate })
          );
        }
      };
      connectionsRef.current[fromId].onaddstream = (event) => {
        const stream = event.stream;
        if (!stream) return;
        const hasVideo = stream.getVideoTracks().length > 0;
        const hasAudio = stream.getAudioTracks().length > 0;
        console.log(
          `Received stream from ${fromId}: video=${hasVideo}, audio=${hasAudio}`
        );
        setVideos((prevVideos) => {
          const videoExists = prevVideos.find((v) => v.socketId === fromId);
          if (videoExists) {
            return prevVideos.map((v) =>
              v.socketId === fromId ? { ...v, stream, hasVideo, hasAudio } : v
            );
          } else {
            return [
              ...prevVideos,
              {
                socketId: fromId,
                stream,
                hasVideo,
                hasAudio,
                autoplay: true,
                playsInline: true,
              },
            ];
          }
        });
      };
    }

    const signal = JSON.parse(message);
    if (signal.sdp) {
      connectionsRef.current[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connectionsRef.current[fromId]
              .createAnswer()
              .then((description) => {
                connectionsRef.current[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connectionsRef.current[fromId].localDescription,
                      })
                    );
                  })
                  .catch((error) =>
                    console.error("Error setting local description:", error)
                  );
              })
              .catch((error) => console.error("Error creating answer:", error));
          }
        })
        .catch((error) =>
          console.error("Error setting remote description:", error)
        );
    }
    if (signal.ice) {
      connectionsRef.current[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((error) => console.error("Error adding ICE candidate:", error));
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(SERVER_URL, { secure: false });
    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      console.log(`Connected with socket ID: ${socketIdRef.current}`);
      socketRef.current.emit("join-call", window.location.href);
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("user-joined", (id, clients) => {
      console.log(`User-joined event: ID=${id}, Clients=${clients.join(", ")}`);
      setParticipantsCount(clients.length);

      clients.forEach((socketListId) => {
        if (socketListId === socketIdRef.current) return;

        if (!connectionsRef.current[socketListId]) {
          connectionsRef.current[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          connectionsRef.current[socketListId].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };
          connectionsRef.current[socketListId].onaddstream = (event) => {
            const stream = event.stream;
            if (!stream) return;
            const hasVideo = stream.getVideoTracks().length > 0;
            const hasAudio = stream.getAudioTracks().length > 0;
            console.log(
              `New stream from ${socketListId}: video=${hasVideo}, audio=${hasAudio}`
            );
            setVideos((prevVideos) => {
              const videoExists = prevVideos.find(
                (v) => v.socketId === socketListId
              );
              if (videoExists) {
                return prevVideos.map((v) =>
                  v.socketId === socketListId
                    ? { ...v, stream, hasVideo, hasAudio }
                    : v
                );
              } else {
                return [
                  ...prevVideos,
                  {
                    socketId: socketListId,
                    stream,
                    hasVideo,
                    hasAudio,
                    autoplay: true,
                    playsInline: true,
                  },
                ];
              }
            });
          };

          if (window.localStream) {
            connectionsRef.current[socketListId].addStream(window.localStream);
            connectionsRef.current[socketListId]
              .createOffer()
              .then((description) => {
                connectionsRef.current[socketListId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      socketListId,
                      JSON.stringify({
                        sdp: connectionsRef.current[socketListId]
                          .localDescription,
                      })
                    );
                  })
                  .catch((error) =>
                    console.error("Error setting local description:", error)
                  );
              })
              .catch((error) => console.error("Error creating offer:", error));
          }
        }
      });
    });

    socketRef.current.on("user-left", (id) => {
      console.log(`User-left event: ID=${id}`);
      if (connectionsRef.current[id]) {
        connectionsRef.current[id].close();
        delete connectionsRef.current[id];
      }
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video.socketId !== id)
      );
      setParticipantsCount((count) => Math.max(count - 1, 1));
    });

    socketRef.current.on("chat-message", addMessage);
  };

  const getUserMedia = async () => {
    const video = videoEnabled && videoAvailable;
    const audio = audioEnabled && audioAvailable;
    if (video || audio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video,
          audio,
        });
        getUserMediaSuccess(stream);
      } catch (error) {
        console.error("Error getting user media:", error);
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          if (video) setVideoAvailable(false);
          if (audio) setAudioAvailable(false);
        }
        setVideoEnabled((prev) => (video ? false : prev));
        setAudioEnabled((prev) => (audio ? false : prev));
      }
    } else {
      try {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          localVideoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
      } catch (error) {
        console.error("Error stopping tracks:", error);
      }
      setHasLocalVideo(false);
      setHasLocalAudio(false);
    }
  };

  const getDisplayMedia = async () => {
    if (screenEnabled && screenAvailable) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        getDisplayMediaSuccess(stream);
      } catch (error) {
        console.error("Error getting display media:", error);
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setScreenAvailable(false);
        }
        setScreenEnabled(false);
      }
    }
  };

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideoToggle = () => {
    if (!videoEnabled && !videoAvailable) return;
    setVideoEnabled(!videoEnabled);
  };

  const handleAudioToggle = () => {
    if (!audioEnabled && !audioAvailable) return;
    setAudioEnabled(!audioEnabled);
  };

  const handleScreenToggle = () => {
    if (!screenEnabled && !screenAvailable) return;
    setScreenEnabled(!screenEnabled);
  };

  const handleEndCall = () => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
    Object.keys(connectionsRef.current).forEach((id) => {
      if (connectionsRef.current[id]) {
        connectionsRef.current[id].close();
      }
    });
    connectionsRef.current = {};
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/meeting");
  };

  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setSnackbarMessage("Meeting link copied to clipboard!");
      setSnackbarOpen(true);
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleParticipantsClick = (event) => {
    setParticipantsAnchorEl(event.currentTarget);
  };

  const handleParticipantsClose = () => {
    setParticipantsAnchorEl(null);
  };

  const openParticipants = Boolean(participantsAnchorEl);

  const openChat = () => {
    setShowChatModal(true);
    setNewMessages(0);
  };

  const closeChat = () => {
    setShowChatModal(false);
  };

  const handleMessageChange = (e) => setMessage(e.target.value);

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender, data, socketIdSender, timestamp: new Date() },
    ]);
    if (socketIdSender !== socketIdRef.current && !showChatModal) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  useEffect(() => {
    connectToSocketServer();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.keys(connectionsRef.current).forEach((id) => {
        if (connectionsRef.current[id]) {
          connectionsRef.current[id].close();
        }
      });
      connectionsRef.current = {};
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    getUserMedia();
  }, [videoEnabled, audioEnabled]);

  useEffect(() => {
    getDisplayMedia();
  }, [screenEnabled]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-gray-800 shadow-md">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold tracking-tight">
            {meetingName || "Meeting"}
          </span>
          <span className="text-sm text-gray-300">ID: {meetingId || ""}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleInvite}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
          >
            <ShareIcon fontSize="small" />
            <span className="text-sm">Invite</span>
          </button>
          <Tooltip title="View participants" arrow>
            <button
              onClick={handleParticipantsClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            >
              <PeopleIcon fontSize="small" />
              <span className="text-sm">{participantsCount}</span>
            </button>
          </Tooltip>
          <Popover
            open={openParticipants}
            anchorEl={participantsAnchorEl}
            onClose={handleParticipantsClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <List dense>
              {participants.map((participant, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary={participant} />
                </ListItem>
              ))}
            </List>
          </Popover>
          <button
            onClick={openChat}
            className="relative px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            {newMessages > 0 ? <MarkChatUnreadIcon /> : <ChatBubbleIcon />}
            {newMessages > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full px-1">
                {newMessages}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto bg-gray-900">
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

      {/* Controls */}
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

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed right-0 top-16 bottom-20 w-96 bg-gray-800 shadow-lg flex flex-col rounded-l-lg">
          <div className="flex justify-between items-center p-4 bg-gray-700 rounded-tl-lg">
            <span className="font-semibold text-lg">Chat</span>
            <button
              onClick={closeChat}
              className="text-gray-300 hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-900"
          >
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.socketIdSender === socketIdRef.current
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {msg.sender}{" "}
                      <span className="text-xs">
                        ({formatTimestamp(msg.timestamp)})
                      </span>
                    </span>
                  </div>
                  <span
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      msg.socketIdSender === socketIdRef.current
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {msg.data}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center">No messages yet</div>
            )}
          </div>
          <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* Snackbar for invite */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
