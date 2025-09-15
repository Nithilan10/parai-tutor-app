import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default async function handler(req, res) {
    if (req.method == 'GET') {
        prisma.beats.findMany({
            where: {nilaiId: Number(nilaiId)},
            orderBy: {order: 'asc'},

        })
        return res.status(200).json(beats);
    }
}