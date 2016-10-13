import mongoose from '../mongoose-db';

const userSchema = mongoose.Schema({
  googleId: {type: String, unique: true},
  name: String,
  email: String,
  avatarUrl: String,
  appearOnLeaderboard: {type: Boolean, index: true}
});

export default mongoose.model('User', userSchema);