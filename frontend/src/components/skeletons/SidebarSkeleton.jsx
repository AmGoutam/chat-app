import { Users } from "lucide-react";
import { memo } from "react"; // Added memo for optimization

/**
 * SidebarSkeleton renders a loading placeholder for the user list.
 * OPTIMIZATION: Wrapped in memo() to prevent unnecessary re-calculations.
 */
const SidebarSkeleton = () => {
  // Create an array of 8 items once during render
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 xl:w-80 border-r border-base-300/50 flex flex-col transition-all duration-300 bg-gradient-to-b from-base-100 to-base-200/30">
      {/* Sidebar Header Skeleton */}
      <div className="border-b border-base-300/50 w-full p-4 lg:p-5 bg-base-100/50 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
            <Users className="size-5 text-primary" />
          </div>
          <span className="font-bold hidden lg:block text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Contacts
          </span>
        </div>

        {/* Search Input Skeleton */}
        <div className="hidden lg:block mb-4">
          <div className="skeleton-item h-9 w-full rounded-xl relative overflow-hidden">
            <div className="shimmer-overlay absolute inset-0">
              <div className="shimmer"></div>
            </div>
          </div>
        </div>

        {/* Filter Toggle Skeleton */}
        <div className="hidden lg:flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="skeleton-item size-4 rounded" />
            <div className="skeleton-item h-4 w-28 rounded-full" />
          </div>
          <div className="skeleton-item h-5 w-16 rounded-full bg-gradient-to-r from-success/20 to-success/10" />
        </div>
      </div>

      {/* Skeleton Contact List */}
      <div className="overflow-y-auto w-full py-2 flex-1">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="w-full p-3 lg:p-4 flex items-center gap-3 border-l-4 border-transparent animate-fadeInLeft"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Avatar Skeleton */}
            <div className="relative mx-auto lg:mx-0 flex-shrink-0">
              <div className="size-12 rounded-full border-2 border-base-300 shadow-md skeleton-item relative overflow-hidden">
                <div className="shimmer-overlay absolute inset-0">
                  <div className="shimmer"></div>
                </div>
              </div>

              {idx % 3 === 0 && (
                <span className="absolute bottom-0 right-0 size-3.5 bg-success/30 rounded-full ring-2 ring-base-100 animate-pulse" />
              )}
            </div>

            {/* User Details Skeleton */}
            <div className="hidden lg:flex flex-1 flex-col text-left min-w-0 gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="skeleton-item h-4 rounded-full relative overflow-hidden" style={{ width: `${100 + idx * 10}px` }}>
                  <div className="shimmer-overlay absolute inset-0">
                    <div className="shimmer"></div>
                  </div>
                </div>
                <div className="skeleton-item h-3 w-10 rounded-full" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="skeleton-item h-3 rounded-full relative overflow-hidden" style={{ width: `${80 + idx * 15}px` }}>
                  <div className="shimmer-overlay absolute inset-0">
                    <div className="shimmer"></div>
                  </div>
                </div>

                {idx % 4 === 0 && (
                  <div className="skeleton-item size-5 rounded-full bg-gradient-to-br from-primary/40 to-primary/20" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        /* OPTIMIZATION: Use transform for GPU acceleration */
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.4s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

        aside > div:last-child::-webkit-scrollbar { width: 6px; }
        aside > div:last-child::-webkit-scrollbar-track { background: transparent; }
        aside > div:last-child::-webkit-scrollbar-thumb {
          background: oklch(var(--b3));
          border-radius: 10px;
          transition: background 0.2s;
        }
      `}</style>
    </aside>
  );
};

export default memo(SidebarSkeleton);