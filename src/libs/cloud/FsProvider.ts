import fs from 'fs'
import path from 'path'
import { ICloudBucket, ICloudProvider, ICloudObject } from './Providers'
import FileManagement from '../FileManagement'

export default function FsProvider(): ICloudProvider {
  const fileMgmt = FileManagement()

  return {
    async areValidCredentials(): Promise<boolean> {
      // local file system should always be truthy since
      // creds aren't needed
      return true
    },

    async doesObjectExist(basePath: string, name: string): Promise<boolean> {
      const fullPath = path.join(basePath, name)
      return await fileMgmt.doesFileExist(fullPath)
    },

    async listObjectsRecursive(
      basePath: string,
      setCallback: (set: ICloudObject[]) => Promise<void>
    ) {
      const allFilePaths = await fileMgmt.readDirRecursive(basePath)
      await setCallback(
        await Promise.all(
          allFilePaths.map(async (fp) => {
            const fileInfo: fs.Stats = await fileMgmt.getFileInfo(fp)
            const pathSplit = fp.split('/')
            const fileName = pathSplit[pathSplit.length - 1]
            return {
              bucketUid: basePath,
              fullPath: fileName, // cwd is base path, so this is from WITHIN the base dir
              name: fileName,
              lastModified: fileInfo.mtime,
              // etag?: string
              sizeBytes: fileInfo.size,
              // storageClass?: string
              // sha256Contents?: string
              // metadata?: object
            }
          })
        )
      )
    },

    async getObject(basePath: string, name: string): Promise<Buffer> {
      const fullPath = path.join(basePath, name)
      return await fileMgmt.getLocalFile(fullPath, null)
    },

    async getObjectInfo(basePath: string, name: string): Promise<ICloudObject> {
      const fullPath = path.join(basePath, name)
      const fileInfo: fs.Stats = await fileMgmt.getFileInfo(fullPath)
      return {
        bucketUid: basePath,
        fullPath: name, // cwd is base path, so this is from WITHIN the base dir
        name: name,
        lastModified: fileInfo.mtime,
        // etag?: string
        sizeBytes: fileInfo.size,
        // storageClass?: string
        // sha256Contents?: string
        // metadata?: object
      }
    },

    async getObjectStreamWithBackoff(
      stream: fs.WriteStream,
      basePath: string,
      name: string
    ) {
      return await new Promise((resolve, reject) => {
        const fullPath = path.join(basePath, name)
        const readStream = fs.createReadStream(fullPath)
        readStream.on('error', reject).on('end', resolve).pipe(stream)
      })
    },

    async writeObject(
      basePath: string,
      name: string,
      data: Buffer | fs.ReadStream | string
    ) {
      const fullPath = path.join(basePath, name)
      await fileMgmt.checkAndCreateDirectoryOrFile(path.dirname(fullPath))
      if (data instanceof fs.ReadStream) {
        return await new Promise((resolve, reject) => {
          data
            .on('error', reject)
            .on('end', resolve)
            .pipe(fs.createWriteStream(fullPath))
        })
      }
      await fileMgmt.checkAndCreateDirectoryOrFile(fullPath, true, data)
    },

    async deleteObject(basePath: string, name: string): Promise<void> {
      const fullPath = path.join(basePath, name)
      await fileMgmt.deleteFile(fullPath)
    },

    async listBuckets(): Promise<ICloudBucket[]> {
      // TODO: What should we return here?
      return []
    },

    async createBucket(basePath: string) {
      return await fileMgmt.checkAndCreateDirectoryOrFile(basePath, false)
    },

    async createPresignedUrl() {
      return null
    },
  }
}