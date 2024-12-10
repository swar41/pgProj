import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongodb'
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb'
import File from '../../../models/File'

const mongoURI = process.env.MONGODB_URI || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid file ID' })
  }

  try {
    await connectToDatabase()

    const file = await File.findById(id)

    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    // TODO: Add authentication check here
    // Ensure the user is authenticated and authorized to download this file
    // if (!isAuthorized(req.user, file)) {
    //   return res.status(403).json({ message: 'Unauthorized' })
    // }

    const client = new MongoClient(mongoURI)
    await client.connect()

    const db = client.db()
    const bucket = new GridFSBucket(db, {
      bucketName: 'pdfFiles'
    })

    const downloadStream = bucket.openDownloadStream(new ObjectId(file.filename))

    res.setHeader('Content-Type', file.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`)

    downloadStream.pipe(res)

    downloadStream.on('error', (error) => {
      console.error('Error downloading file:', error)
      res.status(500).json({ message: 'Error downloading file' })
    })

    downloadStream.on('end', () => {
      client.close()
    })
  } catch (error) {
    console.error('Error in download route:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

