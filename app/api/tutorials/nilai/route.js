import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default function handler(req, res) {
    if (req.method == 'GET') {
        const nilais = prisma.nilais.findMany()
        return res.status(200).json({nilais})
    }
}