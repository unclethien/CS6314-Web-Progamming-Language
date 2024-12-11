const photoSchema = new mongoose.Schema({
  file_name: String,
  date_time: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.ObjectId,
  comments: [commentSchema],
  sharing_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}); 