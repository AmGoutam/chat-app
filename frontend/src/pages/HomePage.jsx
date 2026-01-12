import { useSelector } from "react-redux";
import { memo } from "react";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";


const MemoizedSidebar = memo(Sidebar);
const MemoizedNoChatSelected = memo(NoChatSelected);
const MemoizedChatContainer = memo(ChatContainer);

const HomePage = () => {
  const selectedUser = useSelector((state) => state.chat.selectedUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300/30 to-base-200 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/3 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/2 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="flex items-center justify-center pt-16 sm:pt-20 px-2 sm:px-4 pb-4 relative z-10">
        <div className="bg-base-100/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl shadow-base-300/50 w-full max-w-7xl h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] border border-base-300/50 animate-fadeIn overflow-hidden">
          <div className="flex h-full">
            <MemoizedSidebar />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
              {!selectedUser ? (
                <MemoizedNoChatSelected />
              ) : (
                <MemoizedChatContainer />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations - Preserved exactly as requested */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 15s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default HomePage;