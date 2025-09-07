import React from "react";
import PeopleIcon from "@mui/icons-material/People";
import ShareIcon from "@mui/icons-material/Share";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

export default function Header({
  meetingName,
  meetingId,
  handleInvite,
  participantsCount,
  handleParticipantsClick,
  participantsAnchorEl,
  handleParticipantsClose,
  openParticipants,
  participants,
  openChat,
  newMessages,
}) {
  return (
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
        <Tooltip title="Chat" arrow>
          <button
            onClick={openChat}
            className="relative p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            {newMessages > 0 ? <MarkChatUnreadIcon /> : <ChatBubbleIcon />}
            {newMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1.5 py-0.5 font-bold">
                {newMessages}
              </span>
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
