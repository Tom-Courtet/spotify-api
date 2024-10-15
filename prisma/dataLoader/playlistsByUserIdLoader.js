import DataLoader from "dataloader"
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
 
export const playlistsByUserIdLoader = new DataLoader(async (userIds) => {

     const playlists = await prisma.playlist.findMany({
       where: { userId: { in: userIds } }
     });

     return userIds.map((userId) =>

      playlists.filter((playlist) => playlist.userId === userId)

     );


   });