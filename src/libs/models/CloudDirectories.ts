// import DatabaseModel from './DatabaseModel'
const DatabaseModel = require('./DatabaseModel').default
const CloudObjects = require('./CloudObjects').default

export default function CloudDirectories(postgres: any) {
  const factoryToExtend: IModel = DatabaseModel(postgres, 'cloud_directories')

  return Object.assign(factoryToExtend, {
    accessibleColumns: [
      'bucket_id',
      'parent_directory_id', // if null, it's top level, otherwise is under its parent
      'full_path',
      'name',
    ],

    async getDirectChildren(bucketId: string[], directoryId?: string) {
      let filters: string[] = [`d.bucket_id = ANY($1)`]
      let params: any[] = [bucketId]
      if (directoryId) {
        filters.push(`d.parent_directory_id = $2`)
        params.push(directoryId)
      } else {
        filters.push('d.parent_directory_id is null')
      }

      const { rows } = await (postgres as any).query(
        `
          select d.*
          from cloud_directories as d
          ${filters.length > 0 ? `where ${filters.join(' and ')}` : ''}
          order by full_path
        `,
        params
      )
      return rows
    },

    async createDirsAndObjectFromFullPath(
      bucketId: string,
      fullObjectPath: string,
      objectId?: string
    ): Promise<StringMap[]> {
      fullObjectPath = fullObjectPath.replace(/\/\//g, '/')
      const splitInfo: string[] = fullObjectPath
        .split('/')
        .filter((str: string) => str !== '')
      let info: StringMap[] = []

      for (let ind: number = 0; ind < splitInfo.length; ind++) {
        const dirOrObj: string = splitInfo[ind]
        const parentDirId: string = ((info[info.length - 1] as StringMap) || {})
          .id

        // object name
        if (ind === splitInfo.length - 1) {
          const obj = CloudObjects(postgres)
          let findObjFilters: StringMap = { bucket_id: bucketId }
          if (objectId) {
            findObjFilters.id = objectId
          } else {
            findObjFilters.full_path = (this as any)._getSanitizedValue(
              fullObjectPath
            )
          }
          const existingObj = await obj.findBy(findObjFilters)
          obj.setRecord({
            ...existingObj,
            bucket_id: bucketId,
            full_path: fullObjectPath,
            name: dirOrObj,
            directory_id: parentDirId,
            is_deleted: false,
          })
          await obj.save()
          info.push({ type: 'object', id: obj.record.id })
          continue
        }

        // directory
        const dir = CloudDirectories(postgres)
        await dir.findOrCreateBy({
          bucket_id: bucketId,
          full_path: splitInfo.slice(0, ind + 1).join('/'),
        })
        dir.setRecord({ name: dirOrObj, parent_directory_id: parentDirId })
        await dir.save()
        info.push({ type: 'directory', id: dir.record.id })
      }
      return info
    },

    async getDirectoryHeierarchy(
      bucketId: string,
      bottomMostDirectoryId: string
    ) {
      // cid: child dir id
      // cname: child dir name
      // pid: parent dir id
      const { rows } = await postgres.query(
        `
          WITH RECURSIVE chain(cid, cname, cfull_path, pid) AS (
            select
              o1.id as cid,
              o1.name as cname,
              o1.full_path as cfull_path,
              o1.parent_directory_id as pid
            from cloud_directories as o1
            where
              o1.bucket_id = ANY($1) and
              o1.id = $2

            UNION

            select
              o2.id as cid,
              o2.name as cname,
              o2.full_path as cfull_path,
              o2.parent_directory_id as pid
            from cloud_directories as o2, chain o1
            where o2.id = o1.pid
          )
          select * from chain
          order by pid, cid;
        `,
        [bucketId, bottomMostDirectoryId]
      )
      return rows
    },
  })
}
