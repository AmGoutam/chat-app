import { useEffect, useRef, useState, useCallback, memo } from "react"; // Added memo and useCallback
import { useDispatch, useSelector } from "react-redux";
import { 
  getMessages, deleteMessageThunk, markAsSeenThunk, 
  forwardMessageThunk, editMessageThunk 
} from "../store/thunks/chatThunks";
import { formatMessageTime } from "../lib/utils";
import { 
  Trash2, Check, CheckCheck, Smile, Pencil, X, Save, 
  Reply, Download, Forward, Camera, Loader2 
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { updateMessageReactions, updateMessage, addMessage } from "../store/slices/chatSlice";

/**
 * ChatContainer: Displays conversation between users.
 * OPTIMIZATION: Wrapped in memo to prevent parent-driven re-renders.
 */
const ChatContainer = () => {
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);
  const pickerRef = useRef(null);
  const editFileInputRef = useRef(null);

  // --- OPTIMIZATION: Destructured selectors to reduce dependency surface ---
  const { messages, isMessagesLoading, selectedUser, typingUsers, searchTerm, users } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editImagePreview, setEditImagePreview] = useState(null); 
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [activeImage, setActiveImage] = useState(null); 
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
      dispatch(markAsSeenThunk(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.senderId === selectedUser?._id && !lastMessage.isSeen) {
      dispatch(markAsSeenThunk(selectedUser._id));
    }
  }, [messages, selectedUser?._id, dispatch]);

  useEffect(() => {
    if (messageEndRef.current && (messages.length > 0 || typingUsers.length > 0)) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, typingUsers.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- OPTIMIZATION: Memoized Handlers ---
  const handleDeleteMessage = useCallback((messageId) => {
    setDeleteConfirm(messageId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      dispatch(deleteMessageThunk(deleteConfirm));
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, dispatch]);

  const handleReaction = useCallback(async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      dispatch(updateMessageReactions({ messageId, reactions: res.data }));
      setShowEmojiPicker(null);
    } catch (error) {
      toast.error("Failed to add reaction");
    }
  }, [dispatch]);

  const handleEditClick = useCallback((message) => {
    setEditingMessageId(message._id);
    setEditText(message.text || "");
    setEditImagePreview(null);
  }, []);

  const handleEditImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    const reader = new FileReader();
    reader.onloadend = () => setEditImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleSaveEdit = useCallback(async (messageId) => {
    if (!editText.trim() && !editImagePreview) return;
    const resultAction = await dispatch(editMessageThunk({ messageId, text: editText, image: editImagePreview }));
    if (editMessageThunk.fulfilled.match(resultAction)) {
      dispatch(updateMessage(resultAction.payload)); 
      setEditingMessageId(null);
      setEditImagePreview(null); 
      toast.success("Message updated");
    } else {
      toast.error(resultAction.payload || "Failed to update message");
    }
  }, [editText, editImagePreview, dispatch]);

  const handleForwardSelection = useCallback(async (receiverId) => {
    if (!forwardingMessage) return;
    try {
      const resultAction = await dispatch(forwardMessageThunk({ messageId: forwardingMessage._id, receiverId }));
      if (forwardMessageThunk.fulfilled.match(resultAction)) {
        if (receiverId === selectedUser?._id) dispatch(addMessage(resultAction.payload));
        toast.success("Message forwarded!");
      } else { 
        toast.error("Failed to forward message"); 
      }
    } catch (error) { 
      toast.error("Failed to forward message");
    } finally { 
      setForwardingMessage(null); 
    }
  }, [forwardingMessage, selectedUser?._id, dispatch]);

  const scrollToOriginalMessage = useCallback((replyToId) => {
    const element = document.getElementById(`msg-${replyToId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-message");
      setTimeout(() => element.classList.remove("highlight-message"), 2000);
    }
  }, []);

  const downloadImage = useCallback(async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl; 
      link.download = `chat-image-${Date.now()}.jpg`;
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); 
      toast.success("Image downloaded");
    } catch (error) { 
      toast.error("Download failed"); 
    }
  }, []);

  const filteredMessages = messages.filter((message) => {
    if (!searchTerm) return true;
    return message.text?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-base-100 via-base-200/30 to-base-100 relative">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4 animate-fade-in-up">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-full border-3 border-base-300/30"></div>
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary border-r-primary/60 animate-spin-smooth"></div>
              <div className="absolute inset-2 sm:inset-3 rounded-full bg-gradient-to-br from-primary/10 to-transparent animate-pulse-elegant"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary/70 animate-spin-slow" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-center space-y-1.5 animate-fade-in-delayed">
              <p className="text-sm sm:text-base font-medium text-base-content/80">Loading messages...</p>
              <p className="text-xs sm:text-sm text-base-content/50">Just a moment</p>
            </div>
          </div>
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-base-100 via-base-200/20 to-base-100 relative">
      <ChatHeader />

      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, oklch(var(--bc)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-reverse" />
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-5 scroll-smooth relative z-10 message-container">
        {filteredMessages.map((message, index) => {
          const isMe = message.senderId === authUser._id;
          const isEditing = editingMessageId === message._id;
          const showAvatar = index === 0 || filteredMessages[index - 1].senderId !== message.senderId;

          return (
            <div
              key={message._id}
              id={`msg-${message._id}`}
              className={`chat ${isMe ? "chat-end" : "chat-start"} group animate-message-slide-in`}
              style={{ animationDelay: `${Math.min(index * 0.03, 0.2)}s` }}
            >
              {showAvatar && (
                <div className="chat-image avatar">
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 animate-pulse-slow" />
                    <div className="relative w-full h-full rounded-full border-2 border-base-300/40 overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 group-hover:ring-4 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                      <img src={isMe ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"} alt="profile pic" className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </div>
              )}

              <div className="chat-header mb-1.5 flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <time className="text-[10px] sm:text-xs text-base-content/50 font-medium tracking-wide">{formatMessageTime(message.createdAt)}</time>
                {isMe && (
                  <div className="flex items-center ml-1">
                    {message.isSeen ? <CheckCheck size={13} className="sm:w-3.5 sm:h-3.5 text-primary animate-check-bounce" title="Seen" /> : <Check size={13} className="sm:w-3.5 sm:h-3.5 text-base-content/40 animate-fade-in" title="Sent" />}
                  </div>
                )}
              </div>

              <div
                onDoubleClick={() => !isEditing && handleReaction(message._id, "❤️")}
                className={`chat-bubble flex flex-col gap-2.5 p-3 sm:p-3.5 md:p-4 shadow-lg backdrop-blur-sm relative select-none cursor-pointer transition-all duration-300 hover:shadow-2xl group-hover:scale-[1.02] ${
                  isMe ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-content hover:brightness-105 shadow-primary/10" : "bg-base-200/70 backdrop-blur-md text-base-content hover:bg-base-200/80 border border-base-300/30"
                } ${!showAvatar ? (isMe ? "rounded-tr-md" : "rounded-tl-md") : ""}`}
              >
                {!isEditing && (
                  <div className={`absolute top-2 ${isMe ? "-left-[4.5rem] sm:-left-20 md:-left-24" : "-right-[4.5rem] sm:-right-20 md:-right-24"} opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-1.5 z-30`}>
                    <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(message._id); }} className="action-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-100/95 backdrop-blur-lg border border-base-300/50 text-base-content hover:bg-primary hover:text-primary-content hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-md"><Smile size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setReplyingTo(message); }} className="action-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-100/95 backdrop-blur-lg border border-base-300/50 text-base-content hover:bg-primary hover:text-primary-content hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-md"><Reply size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setForwardingMessage(message); }} className="action-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-100/95 backdrop-blur-lg border border-base-300/50 text-base-content hover:bg-primary hover:text-primary-content hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-md"><Forward size={16} /></button>
                    {isMe && <button onClick={(e) => { e.stopPropagation(); handleEditClick(message); }} className="action-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-100/95 backdrop-blur-lg border border-base-300/50 text-base-content hover:bg-primary hover:text-primary-content hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-md"><Pencil size={15} /></button>}
                  </div>
                )}

                {showEmojiPicker === message._id && (
                  <div className={`fixed z-[9999] ${isMe ? "right-3 sm:right-4" : "left-3 sm:left-4"} shadow-2xl rounded-2xl overflow-hidden animate-scale-bounce border-2 border-base-300/60`} ref={pickerRef} style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    <EmojiPicker onEmojiClick={(emojiData) => handleReaction(message._id, emojiData.emoji)} theme="auto" width={280} height={350} previewConfig={{ showPreview: false }} />
                  </div>
                )}

                {message.replyTo && !isEditing && (
                  <div onClick={(e) => { e.stopPropagation(); scrollToOriginalMessage(message.replyTo._id); }} className="bg-black/10 backdrop-blur-sm p-2.5 rounded-lg border-l-4 border-primary/70 text-xs cursor-pointer hover:bg-black/20 transition-all">
                    <p className="font-semibold text-[10px] mb-1.5 opacity-70 uppercase">Replying to</p>
                    <p className="truncate opacity-90">{message.replyTo.text || "📷 Photo attachment"}</p>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-3 min-w-[220px] sm:min-w-[260px] md:min-w-[300px] animate-fade-in">
                    {(editImagePreview || message.image) && (
                      <div className="relative group/editimg w-fit">
                        <img src={editImagePreview || message.image} className="max-w-[160px] rounded-xl border-2 border-primary/30 shadow-lg" alt="Edit preview" />
                        <button onClick={() => editFileInputRef.current.click()} className="action-btn absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/editimg:opacity-100 rounded-xl"><Camera className="text-white w-8 h-8 animate-pulse" /></button>
                      </div>
                    )}
                    <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={handleEditImageChange} />
                    <textarea className="textarea textarea-bordered bg-base-100/70 backdrop-blur-md w-full p-3.5 resize-none focus:ring-2 focus:ring-primary/50 rounded-xl" value={editText} onChange={(e) => setEditText(e.target.value)} rows="3" autoFocus />
                    <div className="flex justify-end gap-2.5">
                      <button onClick={() => { setEditingMessageId(null); setEditImagePreview(null); }} className="action-btn px-4 py-2.5 rounded-xl text-error bg-error/5 hover:bg-error/15 font-semibold transition-all"><X size={16} /><span>Cancel</span></button>
                      <button onClick={() => handleSaveEdit(message._id)} className="action-btn px-4 py-2.5 rounded-xl bg-primary text-primary-content font-semibold transition-all shadow-md"><Save size={16} /><span>Save</span></button>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.image && <div className="relative group/img overflow-hidden rounded-xl"><img src={message.image} alt="Attachment" className="max-w-[220px] sm:max-w-[260px] rounded-xl cursor-zoom-in transition-transform duration-300 group-hover/img:scale-105 shadow-lg border border-base-content/5" onClick={(e) => { e.stopPropagation(); setActiveImage(message.image); }} /></div>}
                    {message.text && <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed break-words whitespace-pre-wrap tracking-wide">{message.text}</p>}
                    {message.isEdited && <span className="text-[9px] sm:text-[10px] opacity-40 ml-1 italic font-light">(edited)</span>}
                  </>
                )}

                {!isEditing && message.reactions?.length > 0 && (
                  <div className={`absolute -bottom-6 sm:-bottom-7 ${isMe ? "right-2" : "left-2"} flex flex-wrap gap-1.5 z-20 animate-scale-bounce`}>
                    {Object.entries(message.reactions.reduce((acc, curr) => { acc[curr.emoji] = (acc[curr.emoji] || 0) + 1; return acc; }, {})).map(([emoji, count]) => (
                      <div key={emoji} className="flex items-center gap-1.5 bg-base-100/90 backdrop-blur-md border-2 border-primary/20 px-2.5 py-1 rounded-full shadow-lg text-xs hover:scale-110 transition-all cursor-pointer"><span className="text-sm">{emoji}</span>{count > 1 && <span className="font-bold opacity-70">{count}</span>}</div>
                    ))}
                  </div>
                )}
              </div>

              {isMe && !isEditing && (
                <div className="chat-footer opacity-0 group-hover:opacity-100 mt-4 ml-2 transition-all duration-300">
                  <button onClick={() => handleDeleteMessage(message._id)} className="action-btn text-error/80 hover:text-error flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg active:scale-95"><Trash2 size={13} /><span>Delete</span></button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
      <DeleteConfirmationModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={confirmDelete} title="Delete Message?" message="This action cannot be undone. The message will be permanently deleted." />

      {forwardingMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in-fast">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" onClick={() => setForwardingMessage(null)} />
          <div className="relative bg-base-100/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full animate-scale-bounce border border-base-300/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">Forward to...</h3>
                <button onClick={() => setForwardingMessage(null)} className="action-btn w-9 h-9 rounded-full bg-base-200/80 hover:bg-base-300 flex items-center justify-center"><X size={18} /></button>
              </div>
              <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {users.map(u => (
                  <button key={u._id} onClick={() => handleForwardSelection(u._id)} className="action-btn flex items-center gap-3.5 w-full p-3.5 rounded-2xl transition-all hover:bg-base-200/70 group border border-transparent"><div className="avatar"><div className="w-12 h-12 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/50 overflow-hidden"><img src={u.profilePic || "/avatar.png"} alt={u.fullName} className="object-cover w-full h-full transition-transform group-hover:scale-110" /></div></div><span className="font-semibold group-hover:text-primary transition-colors">{u.fullName}</span></button>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-base-300/50"><button onClick={() => setForwardingMessage(null)} className="action-btn w-full px-5 py-3.5 rounded-xl bg-base-200 transition-all font-semibold">Cancel</button></div>
            </div>
          </div>
        </div>
      )}

      {activeImage && (
        <div className="fixed inset-0 z-[9998] bg-black/97 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in-fast" onClick={() => setActiveImage(null)}>
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-3 z-10">
            <button className="action-btn w-12 h-12 rounded-full bg-primary text-primary-content shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center" onClick={(e) => { e.stopPropagation(); downloadImage(activeImage); }}><Download size={20} /></button>
            <button className="action-btn w-12 h-12 rounded-full bg-base-100/20 text-white hover:rotate-90 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md" onClick={() => setActiveImage(null)}><X size={24} /></button>
          </div>
          <img src={activeImage} className="max-w-[94%] max-h-[94%] object-contain rounded-2xl shadow-2xl animate-scale-bounce-slow" alt="Full view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style jsx>{`
        @keyframes message-slide-in { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes scale-bounce { from { opacity: 0; transform: scale(0.85); } 60% { transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        @keyframes scale-bounce-slow { from { opacity: 0; transform: scale(0.9); } 50% { transform: scale(1.01); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-elegant { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -20px) scale(1.05); } 66% { transform: translate(-15px, 15px) scale(0.95); } }
        @keyframes spin-smooth { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-message-slide-in { animation: message-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-smooth { animation: spin-smooth 1.5s linear infinite; }
        .highlight-message { animation: highlight-pulse 2s ease-out; }
        @keyframes highlight-pulse { 0% { box-shadow: 0 0 0 0 oklch(var(--p) / 0.5); } 50% { box-shadow: 0 0 0 10px oklch(var(--p) / 0.1); } 100% { box-shadow: 0 0 0 0 oklch(var(--p) / 0); } }
        .action-btn::before, .action-btn::after { display: none !important; }
        .action-btn { position: relative; overflow: visible !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: oklch(var(--b3)); border-radius: 10px; }
        .message-container::-webkit-scrollbar { width: 8px; }
        .message-container::-webkit-scrollbar-thumb { background: oklch(var(--b3) / 0.6); border-radius: 10px; }
        * { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default memo(ChatContainer);