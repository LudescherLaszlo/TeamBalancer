import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  matchId: { type: String, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CommentModel = mongoose.model('Comment', commentSchema);