import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useUser } from "@clerk/clerk-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/VideoMeet/Header";
import VideoGrid from "../components/VideoMeet/VideoGrid";
import Controls from "../components/VideoMeet/Controls";
import ChatModal from "../components/VideoMeet/ChatModal";
import SnackbarAlert from "../components/VideoMeet/SnackbarAlert";
import axios from "axios";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeet() {
  const { user, isSignedIn } = useUser();
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
  const [participants, setParticipants] = useState([username]);

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
    socketRef.current = io.connect(VITE_SERVER_URL, { secure: false });
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

  const handleEndCall = async () => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }

      if (isSignedIn) {
        try {
          const response = await axios.post(
            `${VITE_SERVER_URL}/api/end-meeting`,
            {
              email: user.emailAddresses[0].emailAddress,
              meetingCode: meetingId,
            }
          );

          if (response.status === 200) {
            console.log("Meeting ended successfully");
          }
        } catch (error) {
          console.log("Error in ending meeting:", error);
        }
      } else {
        const payload = sessionStorage.getItem("meetings") || [];
        const updatedMeetings = JSON.parse(payload).map((meeting) =>
          meeting.meetingCode === meetingId
            ? { ...meeting, endTime: new Date(), isEnded: true }
            : meeting
        );
        sessionStorage.setItem("meetings", JSON.stringify(updatedMeetings));
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

  const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
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

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Header
        meetingName={meetingName}
        meetingId={meetingId}
        handleInvite={handleInvite}
        participantsCount={participantsCount}
        handleParticipantsClick={handleParticipantsClick}
        participantsAnchorEl={participantsAnchorEl}
        handleParticipantsClose={handleParticipantsClose}
        openParticipants={openParticipants}
        participants={participants}
        openChat={openChat}
        newMessages={newMessages}
      />
      <VideoGrid
        showChatModal={showChatModal}
        localVideoRef={localVideoRef}
        hasLocalVideo={hasLocalVideo}
        hasLocalAudio={hasLocalAudio}
        username={username}
        videos={videos}
      />
      <Controls
        audioAvailable={audioAvailable}
        audioEnabled={audioEnabled}
        handleAudioToggle={handleAudioToggle}
        videoAvailable={videoAvailable}
        videoEnabled={videoEnabled}
        handleVideoToggle={handleVideoToggle}
        screenAvailable={screenAvailable}
        screenEnabled={screenEnabled}
        handleScreenToggle={handleScreenToggle}
        handleEndCall={handleEndCall}
      />
      <ChatModal
        showChatModal={showChatModal}
        closeChat={closeChat}
        chatContainerRef={chatContainerRef}
        messages={messages}
        socketIdRef={socketIdRef}
        formatTimestamp={formatTimestamp}
        message={message}
        handleMessageChange={handleMessageChange}
        sendMessage={sendMessage}
      />
      <SnackbarAlert
        snackbarOpen={snackbarOpen}
        handleSnackbarClose={handleSnackbarClose}
        snackbarMessage={snackbarMessage}
      />
    </div>
  );
}
