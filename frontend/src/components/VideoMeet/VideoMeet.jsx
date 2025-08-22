import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useUser } from "@clerk/clerk-react";
import { useParams, useLocation } from "react-router-dom";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";

// Share Screen: import ScreenShareIcon from '@mui/icons-material/ScreenShare';
// Share Screen off: import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
// If user ka mic band hai tab uske video wale part pe ye show karenge: import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
// If user ka camera band hai tab ye show karenge uske video ki jagah: import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const SERVER_URL = import.meta.env.SERVER_URL;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideomMeet() {
  const { user } = useUser();
  const username =
    user?.fullName || sessionStorage.getItem("guestName") || "Guest";

  const meetingCode = useParams();

  const location = useLocation();
  const { meetingName } = location.state || "";

  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailabel, setAudioAvailabel] = useState(true);
  let [screenAvailabel, setScreenAvailabel] = useState();

  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState(true);
  let [messages, setMesaages] = useState([]);
  let [newMessages, setNewMessages] = useState(9);
  let [message, setMessage] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  let getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailabel(true);
      } else {
        setAudioAvailabel(false);
      }

      if (navigator.mediaDevices.getUserMedia) {
        setScreenAvailabel(true);
      } else {
        setScreenAvailabel(false);
      }

      if (videoAvailable || audioAvailabel) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailabel,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((error) => console.log(error));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (error) {
            console.log(error);
          }

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((error) => console.log(error));
            });
          }
        })
    );
  };

  let getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((error) => console.log(error));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (error) {
            console.log(error);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((error) => console.log(error));
                })
                .catch((error) => console.log(error));
            }
          })
          .catch((error) => console.log(error));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((error) => console.log(error));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(SERVER_URL, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) => {
                  return video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video;
                });

                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stram: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;

                return updatedVideos;
              });
            }
          };

          if (id === socketIdRef.current) {
            for (let id2 in connections) {
              if (id2 === socketIdRef.current) {
                continue;
              }

              try {
                connections[id2].addStream(window.localStream);
              } catch (error) {
                console.log(error);
              }

              connections[id2].createOffer().then((description) => {
                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({ sdp: connections[id2].localDescription })
                    );
                  })
                  .catch((error) => console.log(error));
              });
            }
          }
        });
      });
    });
  };

  let getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailabel)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stram) => {})
        .catch((error) => console.log(error));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((error) => console.log(error));
      }
    }
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailabel);
    connectToSocketServer();
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);

    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }
  };

  let openChat = () => {
    setShowModal(true);
    setNewMessages(0);
  };

  let closeChat = () => {
    setShowModal(false);
  };

  let handelMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMesaages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: adta },
    ]);

    if (socketIdSender !== socketIdRef.current) {
      setMesaages((prevMessages) => prevMessages + 1);
    }
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let connect = () => {
    getMedia();
  };

  useEffect(() => {
    getPermissions();
  });

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  return (
    <div className="h-[100vh]">
      <div className="h-1[0vh] flex items-center justify-between py-4 bg-[#1E2836]">
        {/* Left side: Meeting details */}
        <div className="pl-5">
          <span className="text-lg font-semibold text-white tracking-tight">
            Meeting {meetingName || ""}
          </span>
          <span className="pl-5 text-md text-[#D1D5DB]">
            ID: {meetingCode?.meetingId || ""}
          </span>
        </div>

        {/* Right side: Buttons */}
        <div className="mr-5 flex space-x-3 pr-5 gap-2 text-white font-md">
          <span className="px-3 flex justify-center gap-2 items-center rounded-lg hover:bg-[#374151]">
            <i className="fa-solid fa-arrow-up-from-bracket"></i> Invite
          </span>
          <span className="px-3 flex justify-center items-center gap-2 rounded-lg hover:bg-[#374151]">
            <i className="fa-solid fa-users"></i> 9
          </span>
          <span className="px-3 flex justify-center items-center rounded-lg hover:bg-[#374151]">
            {newMessages === 0 ? <ChatBubbleIcon /> : <MarkChatUnreadIcon />}
          </span>
        </div>
      </div>

      <div className="h-[70vh]">
        <span>Hello Videos</span>
      </div>

      <div className="h-[20vh] flex gap-5 justify-center items-center text-2xl text-white bg-[#1E2836]">
        <span onClick={handleAudio}>
          {audio ? (
            <i className="fa-solid fa-microphone"></i>
          ) : (
            <i className="fa-solid fa-microphone-slash text-red-600"></i>
          )}
        </span>
        <span onClick={handleVideo}>
          {video ? (
            <i className="fa-solid fa-video"></i>
          ) : (
            <i className="fa-solid fa-video-slash text-red-600"></i>
          )}
        </span>
        <span onClick={handleScreen}>
          {showModal ? (
            <ScreenShareIcon className="text-green-600" />
          ) : (
            <StopScreenShareIcon className="text-red-600" />
          )}
        </span>
        <span className="text-white bg-red-600" onClick={handleEndCall}>
          <CallEndIcon />
        </span>
      </div>
    </div>
  );
}
