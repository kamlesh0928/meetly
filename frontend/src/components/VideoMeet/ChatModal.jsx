import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

export default function ChatModal({
  showChatModal,
  closeChat,
  chatContainerRef,
  messages,
  socketIdRef,
  formatTimestamp,
  message,
  handleMessageChange,
  sendMessage,
}) {
  if (!showChatModal) return null;

  return (
    <div className="fixed right-0 top-16 bottom-20 w-96 bg-gray-800 shadow-lg flex flex-col rounded-l-lg">
      <div className="flex justify-between items-center p-4 bg-gray-700 rounded-tl-lg">
        <span className="font-semibold text-lg">Chat</span>
        <button onClick={closeChat} className="text-gray-300 hover:text-white">
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
  );
}
