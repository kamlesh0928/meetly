import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";

export default function Hero() {
  const [meetingName, setMeetingName] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const [meetingNameError, setMeetingNameError] = useState("");
  const [meetingCodeError, setMeetingCodeError] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();

  const displayName = user?.fullName || sessionStorage.getItem("guestName") || "Guest";

  // Determine subtitle based on sign-in status
  const subtitle = user
    ? "Start a new meeting or join an existing one"
    : "Join an existing meeting or sign in to create a new one";

  // Generate a 6-character lowercase alphabetic meeting code
  const generateMeetingCode = () => {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    let code = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  const handleCreateMeeting = () => {
    if (meetingName.trim() && meetingName.length < 3) {
      setMeetingNameError("Meeting name must be at least 3 characters long");
      return;
    }
    setMeetingNameError("");
    const meetingCode = generateMeetingCode();
    sessionStorage.setItem("meetingCode", meetingCode);
    navigate(`/meeting/${meetingCode}`, {
      state: { meetingCode: meetingCode, meetingName },
    });
  };

  const handleJoinMeeting = () => {
    if (!meetingCode.trim()) {
      setMeetingCodeError("Please enter a meeting code");
      return;
    }
    if (meetingCode.trim().length !== 6) {
      setMeetingCodeError("Meeting code must be exactly 6 characters");
      return;
    }
    setMeetingCodeError("");
    navigate(`/meeting/${meetingCode}`);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          Welcome, {displayName}!
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* Meeting Cards */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10">
          {/* Create Meeting Card or Sign-In Prompt */}
          <SignedIn>
            <div className="w-full sm:w-[28rem] bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-center items-center bg-[#DBEAFE] rounded-full w-12 h-12 mx-auto">
                <i className="fa-solid fa-plus text-2xl text-[#2563EB] flex justify-center items-center"></i>
              </div>
              <div className="mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                  Create Meeting
                </h2>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Start a new meeting and invite others to join
                </p>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="meeting-name"
                  className="block text-sm font-medium text-gray-600 text-center"
                >
                  Meeting Name (Optional)
                </label>
                <input
                  id="meeting-name"
                  type="text"
                  value={meetingName}
                  onChange={(e) => {
                    setMeetingName(e.target.value);
                    setMeetingNameError("");
                  }}
                  placeholder="e.g., Team Standup, Project Review"
                  className={`w-full mt-2 p-3 border ${
                    meetingNameError ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2661EA] transition duration-200`}
                  aria-invalid={meetingNameError ? "true" : "false"}
                  aria-describedby={
                    meetingNameError ? "meeting-name-error" : undefined
                  }
                />
                {meetingNameError && (
                  <p
                    id="meeting-name-error"
                    className="mt-2 text-sm text-red-600 text-center"
                  >
                    {meetingNameError}
                  </p>
                )}
                <button
                  onClick={handleCreateMeeting}
                  className="mt-4 w-full p-3 bg-[#2661EA] text-white font-medium rounded-lg transition-all duration-300 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2 transform hover:scale-105"
                  aria-label="Start a new meeting"
                >
                  Start Meeting Now
                </button>
              </div>
            </div>
          </SignedIn>
          <SignedOut>
            <div className="w-full sm:w-[28rem] bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-center items-center bg-[#DBEAFE] rounded-full w-12 h-12 mx-auto">
                <i className="fa-solid fa-plus text-2xl text-[#2563EB] flex justify-center items-center"></i>
              </div>
              <div className="mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                  Create Meeting
                </h2>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Sign in to create a new meeting
                </p>
              </div>
              <div className="mt-4">
                <SignInButton>
                  <button
                    className="w-full p-3 bg-[#2661EA] text-white font-medium rounded-lg transition-all duration-300 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2 transform hover:scale-105"
                    aria-label="Sign in to create a meeting"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>

          {/* Join Meeting Card */}
          <div className="w-full sm:w-[28rem] bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-center items-center bg-[#D1FAE5] rounded-full w-12 h-12 mx-auto">
              <i className="fa-solid fa-user-group text-2xl text-[#059669] flex justify-center items-center"></i>
            </div>
            <div className="mt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                Join Meeting
              </h2>
              <p className="mt-2 text-base text-gray-600 text-center">
                Enter a 6-character meeting code to join an existing meeting
              </p>
            </div>
            <div className="mt-4">
              <label
                htmlFor="meeting-code"
                className="block text-sm font-medium text-gray-600 text-center"
              >
                Meeting Code
              </label>
              <input
                id="meeting-code"
                type="text"
                value={meetingCode}
                onChange={(e) => {
                  setMeetingCode(e.target.value);
                  setMeetingCodeError("");
                }}
                placeholder="e.g., abcdef"
                className={`w-full mt-2 p-3 border ${
                  meetingCodeError ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2661EA] transition duration-200`}
                aria-invalid={meetingCodeError ? "true" : "false"}
                aria-describedby={
                  meetingCodeError ? "meeting-code-error" : undefined
                }
              />
              {meetingCodeError && (
                <p
                  id="meeting-code-error"
                  className="mt-2 text-sm text-red-600 text-center"
                  role="alert"
                >
                  {meetingCodeError}
                </p>
              )}
              <button
                onClick={handleJoinMeeting}
                className="mt-4 w-full p-3 bg-[#059669] text-white font-medium rounded-lg transition-all duration-300 hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:ring-offset-2 transform hover:scale-105"
                aria-label="Join an existing meeting"
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="mt-6 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2"
          aria-label="Go back to home page"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
