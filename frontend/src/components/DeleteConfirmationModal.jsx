import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { memo, useEffect } from "react"; // Added memo and useEffect

/**
 * DeleteConfirmationModal: Optimized version with React Portals and Memoization.
 * Wrapping in memo prevents the modal logic from re-running every time the parent
 * component re-renders (e.g., when a user types in a search bar).
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  // --- OPTIMIZATION: Accessibility & Body Scroll Lock ---
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
      return () => (document.body.style.overflow = originalStyle);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Use React Portal to render modal at document body level
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0
      }}
    >
      {/* Backdrop - OPTIMIZATION: Hardware accelerated opacity */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, willChange: 'opacity' }}
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-base-100/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-auto animate-scale-in border border-base-300/50"
        style={{ 
          position: 'relative',
          zIndex: 10,
          margin: 'auto',
          overflow: 'visible'
        }}
      >
        {/* Close Button - Floating Top Right */}
        <button
          onClick={onClose}
          className="delete-modal-btn absolute w-9 h-9 rounded-full bg-base-200/90 hover:bg-base-300 text-base-content/70 hover:text-base-content transition-all duration-200 flex items-center justify-center group z-30 shadow-lg"
          style={{
            top: '-12px',
            right: '-12px'
          }}
          type="button"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-error/10 flex items-center justify-center animate-pulse-subtle ring-4 ring-error/5">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-error" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-3 text-base-content">
            {title || "Delete Message?"}
          </h3>
          
          {/* Message */}
          <p className="text-sm sm:text-base text-center text-base-content/60 mb-6 sm:mb-8 leading-relaxed px-2">
            {message || "This action cannot be undone. The message will be permanently deleted."}
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4">
            <button 
              onClick={onClose} 
              className="delete-modal-btn flex-1 px-5 py-3.5 rounded-xl bg-base-200/80 hover:bg-base-300 text-base-content font-semibold transition-all active:scale-95 text-sm sm:text-base shadow-md hover:shadow-lg"
              type="button"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }} 
              className="delete-modal-btn flex-1 px-5 py-3.5 rounded-xl bg-error hover:bg-error/90 text-white font-semibold transition-all active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* OPTIMIZATION: Use transform-gpu for better performance */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }

        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }

        .delete-modal-btn {
          position: relative;
          overflow: visible !important;
          transform: translateZ(0); /* Force GPU layer */
        }

        .delete-modal-btn::before,
        .delete-modal-btn::after { display: none !important; content: none !important; }

        .delete-modal-btn:focus { outline: none !important; }
        .delete-modal-btn:focus-visible {
          outline: 2px solid oklch(var(--p) / 0.4) !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default memo(DeleteConfirmationModal);