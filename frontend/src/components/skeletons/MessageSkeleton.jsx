import { memo } from "react"; // Added memo for optimization

const MessageSkeleton = () => {
  // Create an array of 6 items to simulate a conversation history
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 bg-gradient-to-b from-base-100 to-base-200">
      {skeletonMessages.map((_, idx) => {
        const isStart = idx % 2 === 0;

        return (
          <div
            key={idx}
            className={`chat ${isStart ? "chat-start" : "chat-end"} animate-pulse-custom`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Avatar Skeleton */}
            <div className="chat-image avatar">
              <div className="size-10 rounded-full overflow-hidden ring-2 ring-primary/10">
                <div className="skeleton-item w-full h-full rounded-full" />
              </div>
            </div>

            {/* Chat Header (Name/Time) Skeleton */}
            <div className="chat-header mb-1 flex gap-2">
              <div className="skeleton-item h-3 w-16 rounded-full" />
              <div className="skeleton-item h-3 w-12 rounded-full" />
            </div>

            {/* Chat Bubble Skeleton */}
            <div className="chat-bubble bg-transparent p-0">
              <div
                className={`skeleton-item rounded-2xl shadow-lg relative overflow-hidden ${isStart ? "rounded-tl-md" : "rounded-tr-md"
                  }`}
                style={{
                  width: `${150 + (idx * 30) % 100}px`,
                  height: `${60 + (idx * 15) % 40}px`
                }}
              >
                {/* Shimmer Effect Overlay */}
                <div className="shimmer-overlay absolute inset-0">
                  <div className="shimmer"></div>
                </div>
              </div>
            </div>

            {/* Random: Add image skeleton for some messages */}
            {idx % 3 === 0 && (
              <div className="chat-bubble bg-transparent p-0 mt-2">
                <div
                  className={`skeleton-item w-40 h-32 rounded-xl shadow-md relative overflow-hidden ${isStart ? "rounded-tl-md" : "rounded-tr-md"
                    }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-base-content/20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="shimmer-overlay absolute inset-0">
                    <div className="shimmer"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Typing Indicator Skeleton */}
      <div className="chat chat-start">
        <div className="chat-image avatar">
          <div className="size-10 rounded-full overflow-hidden ring-2 ring-primary/10">
            <div className="skeleton-item w-full h-full rounded-full" />
          </div>
        </div>

        <div className="chat-bubble bg-base-200/80 backdrop-blur-sm">
          <div className="flex gap-1.5 py-1">
            <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* OPTIMIZATION: Use transform for shimmer to avoid layout thrashing */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .shimmer-overlay {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
          animation: shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Use custom pulse to avoid standard opacity transition which can be heavy */
        @keyframes pulse-custom {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-pulse-custom {
          animation: pulse-custom 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }

        .skeleton-item {
          position: relative;
          background: linear-gradient(
            90deg,
            oklch(var(--b3)) 0%,
            oklch(var(--b2)) 50%,
            oklch(var(--b3)) 100%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default memo(MessageSkeleton); // Export memoized to prevent re-renders