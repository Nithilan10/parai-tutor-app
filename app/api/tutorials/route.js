import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req, res) {
    if (req.method == 'GET')  {
        const tutorials = await prisma.tutorials.findMany()
        return res.status(200).json({tutorials})
    }
    if (req.method == 'POST') {
        try {
            const {nilais, beats, description} = req.body

            if (!nilais || !beats || !Array.isArray(beats)) {
                return res.status(400).json({error: "Missing required fields"})
            }

            const newTutorial = await prisma.tutorials.create({
                data: {
                    nilai1,
                    beats: {set:beats},
                    description
                }
            })

            return res.status(200).json({tutorial: newTutorial})
        } catch(error) {
            console.log(error)
            return res.status(500).json({error: "server error"})
        }
    }
}
export async function GET() {
    
    

    
}