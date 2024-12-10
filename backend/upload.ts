import express, { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { MongoClient, GridFSBucket } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import File from '@/models/File';

// Initialize multer for handling multipart form-data (using memoryStorage)
const upload = multer({ storage: multer.memoryStorage() });

// Extend the Request interface to include `user`
interface FileRequest extends Request {
  file?: Express.Multer.File;
  user?: {
    id: string; // Assuming user.id is a string, adjust based on your actual data type
  };
}

// Create an Express router
const router = express.Router();

// MongoDB connection string (Use environment variables for security)
const mongoURI =
  'mongodb+srv://Swar41:Swar41@cluster0.zx1wdgy.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(mongoURI);

let bucket: GridFSBucket;

// Connect to MongoDB and initialize GridFSBucket
client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB');
    const database = client.db('pdf');
    bucket = new GridFSBucket(database, {
      bucketName: 'pdfFile', // Make sure bucketName is correct
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// File upload handler
const uploadFileHandler: RequestHandler = async (req: FileRequest, res: Response): Promise<void> => {
  try {
    // Ensure database connection is established
    await connectToDatabase();

    // Check if multer has processed the file
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }

    // Validate title, content, and mentorId
    const { title, content, mentorId } = req.body;
    if (!title || !content || !mentorId) {
      res.status(400).json({ message: 'Title, content, and mentorId are required.' });
      return;
    }

    // Get the current user (student) from the session or token
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    // Create a promise to handle the upload stream to GridFS
    const uploadPromise = new Promise<string>((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(req.file!.originalname, {
        contentType: req.file!.mimetype,
        metadata: {
          title,
          content,
          uploadDate: new Date(),
          uploadedBy: studentId,
          assignedTo: mentorId,
        },
      });

      // Stream the file data into GridFS
      uploadStream.end(req.file!.buffer);

      uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
      uploadStream.on('error', (error) => reject(error));
    });

    // Wait for the file upload to complete and get the file id
    const fileId = await uploadPromise;

    // Create a new File document
    const newFile = new File({
      filename: fileId,
      originalName: req.file!.originalname,
      contentType: req.file!.mimetype,
      size: req.file!.size,
      metadata: {
        uploadedBy: studentId,
        assignedTo: mentorId,
      },
    });

    await newFile.save();

    // Update the student's and mentor's file references
    await User.findByIdAndUpdate(studentId, { $push: { files: newFile._id } });
    await User.findByIdAndUpdate(mentorId, { $push: { files: newFile._id } });

    // Respond with the uploaded file details
    res.status(201).json({
      id: fileId,
      title,
      content,
      fileName: req.file!.originalname,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Failed to upload file and save paper details.' });
  }
};

// Define the POST /upload endpoint with multer middleware
router.post('/api/papers/upload', upload.single('pdfFile'), uploadFileHandler);

export default router;
