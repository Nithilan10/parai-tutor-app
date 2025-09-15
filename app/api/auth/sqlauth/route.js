import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"

const prisma = new PrismaClient()

export default async function GET(res) {

    const session = await getServerSession(authOptions)

    if(!session) {
        return res.status(500).JSON({error: "SERVER ERROR"})
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        select: {
            id: true,
            email: true,
            name: true
        }

    })

    if (!user) {
        return res.status(404).json({error: "user does not exist"})
    }

    return res.status(200).json({user})

}