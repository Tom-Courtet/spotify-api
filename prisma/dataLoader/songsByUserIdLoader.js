import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const songsByUserIdLoader = new DataLoader(async (authorIds) => {
    const song = await prisma.song.findMany({
        where: { authorId: { in: authorIds } },
    });
    return authorIds.map((authorId) =>
        books.filter((song) => song.authorId === authorId)
    );
});
