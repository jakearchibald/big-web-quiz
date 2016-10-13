import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/bwq');
export default mongoose;