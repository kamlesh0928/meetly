import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  Users,
  Video,
  Trash2,
  ArrowLeft,
  MoreHorizontal,
  Play,
  Copy as CopyIcon,
} from "lucide-react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Hero() {
  const navigate = useNavigate();
  const [allMeetings, setAllMeetings] = useState([
    {
      meetingName: "Project",
      meetingId: "abcdef",
      createdAt: "2023-10-01T10:00:00Z",
      isEnded: true,
      totalParticipants: 5,
      duration: 30,
      endedAt: "2023-10-01T10:30:00Z",
      isHost: true,
    },
    {
      meetingName: "Project 2",
      meetingId: "abcddf",
      createdAt: "2024-10-01T10:00:00Z",
      isEnded: false,
      totalParticipants: 3,
      duration: 0,
      endedAt: null,
      isHost: false,
    },
  ]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleRejoinMeeting = (meetingId) => {
    navigate(`/meeting/${meetingId}`);
  };

  const handleCopyMeetingId = (meetingId) => {
    navigator.clipboard.writeText(meetingId);
    setSnackbarOpen(true);
  };

  const formatDuration = (minutes) => {
    if (minutes === 0 || !minutes) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm === "all") {
      setAllMeetings([]);
    } else {
      setAllMeetings((prev) =>
        prev.filter((m) => m.meetingId !== showDeleteConfirm)
      );
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Meetly
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meeting History
          </h1>
          <p className="text-gray-600">View and manage your past meetings</p>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <button
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/meeting")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>

          {allMeetings.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm("all")}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Meeting History List */}
        {allMeetings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No meeting history yet
            </h3>
            <p className="text-gray-600 mb-6">
              Your meeting history will appear here after you join or create
              meetings
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:bg-blue-700"
            >
              Start Your First Meeting
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {allMeetings.map((meeting) => {
              const status = meeting.isEnded ? "completed" : "ongoing";
              const role = meeting.isHost ? "host" : "participant";
              return (
                <div
                  key={meeting.meetingId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.meetingName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            status === "ongoing"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {status === "ongoing" ? "Ongoing" : "Completed"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            role === "host"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {role === "host" ? "Host" : "Participant"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(meeting.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {meeting.totalParticipants} participant
                            {meeting.totalParticipants !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Duration:{" "}
                            {status === "ongoing"
                              ? "Ongoing"
                              : formatDuration(meeting.duration)}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Meeting ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {meeting.meetingId}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => handleCopyMeetingId(meeting.meetingId)}
                      >
                        <CopyIcon className="w-5 h-5" />
                      </button>

                      {status === "ongoing" && (
                        <button
                          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          onClick={() => handleRejoinMeeting(meeting.meetingId)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Rejoin
                        </button>
                      )}

                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => setShowDeleteConfirm(meeting.meetingId)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {showDeleteConfirm === "all"
                    ? "Clear All History"
                    : "Delete Meeting"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {showDeleteConfirm === "all"
                    ? "Are you sure you want to clear all meeting history? This action cannot be undone."
                    : "Are you sure you want to delete this meeting from your history? This action cannot be undone."}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Meeting ID copied to clipboard
          </Alert>
        </Snackbar>
      </main>
    </div>
  );
}
