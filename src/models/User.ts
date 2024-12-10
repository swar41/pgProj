import mongoose, { Schema, Document } from 'mongoose';

// Ensure File model is correctly imported
import File from './File';

// Define the IUser interface
interface IUser extends Document {
  name:string;
  email: string;
  password: string;
  role: string;
  files: mongoose.Types.ObjectId[];  // Array of ObjectIds referencing the File model
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  files: [{ type: Schema.Types.ObjectId, ref: 'File' }],  // Reference to the File model
});

// Create and export the User model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
