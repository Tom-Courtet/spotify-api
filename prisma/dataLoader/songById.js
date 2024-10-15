import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
 
export const songById = new DataLoader(async (idList) => {
    const songs = await prisma.song.findMany({ where: { id: { in: idList } } });
    return idList.map((id) => songs.find((song) => song.id === id));
});