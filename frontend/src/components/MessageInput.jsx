import { useRef, useState, useEffect, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../store/thunks/chatThunks";
import { Image, Send, X, Smile, Reply } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

const MessageInput = ({ replyingTo, setReplyingTo }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingEventRef = useRef(0); 
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  const dispatch = useDispatch();

  // OPTIMIZATION: Fallback to empty objects to prevent 'undefined' crashes
  const { socket, authUser } = useSelector((state) => state.auth || {});
  const { selectedUser } = useSelector((state) => state.chat || {});
  const { theme } = useSelector((state) => state.theme || {});

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- MEMOIZED HANDLERS ---
  const handleEmojiClick = useCallback((emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // BUG FIX: Ensure socket is connected before emitting
    if (!socket?.connected || !selectedUser) return;

    const now = Date.now();
    // Throttling: only send 'typing' every 3 seconds to save bandwidth
    if (now - lastTypingEventRef.current > 3000) {
      socket.emit("typing", {
        senderId: authUser?._id,
        receiverId: selectedUser?._id
      });
      lastTypingEventRef.current = now;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket?.connected) {
        socket.emit("stopTyping", {
          senderId: authUser?._id,
          receiverId: selectedUser?._id
        });
      }
      lastTypingEventRef.current = 0; 
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      setShowEmojiPicker(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // BUG FIX: Safe check for socket connection before emit
      if (socket?.connected) {
        socket.emit("stopTyping", {
          senderId: authUser?._id,
          receiverId: selectedUser?._id
        });
      }

      // Unwrap the thunk to catch internal errors properly
      await dispatch(
        sendMessage({
          text: text.trim(),
          image: imagePreview,
          replyTo: replyingTo?._id || null
        })
      ).unwrap();

      setText("");
      setImagePreview(null);
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Message failed to send");
      console.error("Failed to send message:", error);
    }
  };

  const canSend = text.trim() || imagePreview;

  return (
    <div className="p-3 sm:p-4 md:p-5 w-full relative border-t border-base-300/50 bg-gradient-to-t from-base-200/80 to-base-100/50 backdrop-blur-md">
      {/* Emoji Picker container */}
      {showEmojiPicker && (
        <div
          className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 z-50 shadow-2xl rounded-2xl overflow-hidden animate-scale-in border border-base-300/50 backdrop-blur-sm"
          ref={pickerRef}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={theme === "dark" || theme === "coffee" || theme === "luxury" ? "dark" : "light"}
            autoFocusSearch={false}
            width={280}
            height={350}
          />
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 flex items-center justify-between bg-base-200/80 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border-l-4 border-primary shadow-md animate-slide-in-up">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1">
            <div className="bg-primary/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Reply size={14} className="sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="text-xs sm:text-sm truncate flex-1 min-w-0">
              <span className="font-bold text-primary mr-1 block text-[10px] sm:text-xs">Replying to:</span>
              <span className="opacity-80 truncate block">{replyingTo.text || "📷 Photo attachment"}</span>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="btn btn-ghost btn-xs btn-circle hover:bg-error/20 hover:text-error transition-all ml-2"
            type="button"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 animate-slide-in-up">
          <div className="relative inline-block group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-xl border-2 border-primary/30 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-error text-error-content flex items-center justify-center hover:scale-110 shadow-lg"
              type="button"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex gap-1.5 sm:gap-2 items-center flex-shrink-0">
          <button
            type="button"
            className={`btn btn-circle btn-sm border-none ${
              showEmojiPicker ? "text-primary bg-primary/15" : "btn-ghost text-base-content/60"
            }`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={18} className="sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            className={`btn btn-circle btn-sm border-none ${
              imagePreview ? "text-success bg-success/15" : "btn-ghost text-base-content/60"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className={`flex-1 relative min-w-0 ${isFocused ? 'scale-[1.01]' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            className={`w-full input input-bordered rounded-2xl input-sm sm:input-md bg-base-200/50 backdrop-blur-sm transition-all duration-300 ${
              isFocused ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 shadow-lg' : ''
            }`}
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className={`btn btn-circle btn-sm sm:btn-md flex-shrink-0 transition-all duration-300 shadow-lg ${
            canSend ? 'btn-primary hover:scale-110' : 'btn-disabled opacity-40'
          }`}
        >
          <Send size={16} className="sm:w-5 sm:h-5" />
        </button>
      </form>

      {/* Inline styles for custom animations */}
      <style jsx>{`
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-slide-in-up { animation: slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        input:focus { outline: none; }
      `}</style>
    </div>
  );
};

export default memo(MessageInput);