import mongoose from '../mongoose-db';
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
  googleId: {type: String, unique: true, required: true},
  name: {type: String, required: true},
  email: {type: String, required: true},
  avatarUrl: String,
  appearOnLeaderboard: {type: Boolean, index: true},
  answers: [
    {
      questionId: {type: ObjectId, required: true},
      answers: [Number]
    }
  ]
});

export const User = mongoose.model('User', userSchema);