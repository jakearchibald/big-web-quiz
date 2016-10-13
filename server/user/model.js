import mongoose from '../mongoose-db';

const userSchema = mongoose.Schema({
  googleId: {type: String, unique: true},
  name: String,
  email: String,
  avatarUrl: String
});

export default mongoose.model('User', userSchema);