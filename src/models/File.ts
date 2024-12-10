import mongoose, { Schema, Document } from 'mongoose';

interface IFile extends Document {
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadDate: Date;
  metadata: {
    uploadedBy: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId;
  };
}

const FileSchema: Schema<IFile> = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  metadata: {
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
});

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

