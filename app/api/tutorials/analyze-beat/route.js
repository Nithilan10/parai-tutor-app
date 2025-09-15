const { PrismaClient } = require("@prisma/client");

import { NextResponse } from "next/server";
import * as ort from "onnxruntime-node";
import {writeFile} from "fs/promises"
import path, { format } from "path"
import { Readable } from "stream";
import wav from "wav-decoder"
import { error } from "console";
import {writeFile} from "fs/promises"

let session;
async function getSession() {
    if (!session) {
        session = await ort.InferenceSession.create("models/beat-model.onnx")
    }
    return session;
}

async function convertAudioToTensor(audioBuffer) {
    const decoded = await wav.decode(audioBuffer);

    let samples;
    if (decoded.channelData.length < 1) {
        const ch0 = decoded.channelData[0]
        const ch1 = decoded.channelData[1]
        samples = new Float32Array(ch0.length);
        for (let i = 0; i < ch0.length; i++) {
            samples[i] = (ch0[i] + ch1[i]/2)
        }
    }
    else {
        samples = decoded.channelData[0];
    }
}

async function compareBeats(predicted, expected) {
    const feedback = []

    const len = Math.max(predicted.length, expected,length)

    for (let i = 0; i < len; i++) {
        const pred = predicted[i]
        const exp = expected[i]

        if (!pred) {
            feedback.push({beat: i+1, error: "missing beat"});

        }
        if (!exp) {
            feedback.push({beat: i+1, error: "extra beat"})

        }

        if(pred?.type = exp?.type) {
            feedback.push({beat: i+1, error: 'wrong stick, expected $(exp.type)'})
        }
        continue;
    }
    const timeDiff = pred.timestamp - exp.timestamp
    if(Math.abs(timeDiff) > timeThreshold) {
        feedback.push({beat: i+1, error: timeDiff > 0 ? "too late by $(timeDiff)ms" : 'too early by $(timeDiff)ms'})
    }

    const result = feedback.length === 0 ? "perfect": "needs improvement"

    return (result, feedback)
}


export async function POST(req) {
    try {
        const formdata = await req.formdata;
        const file = formdata.get("file")
        const bytes = Buffer.from(await file.arrayBuffer())
        await writeFile('uploads/$(filename)', bytes)

        const tensor = convertAudioToTensor(bytes)

        const session = await getSession()

        const prediction = await session.run({input: 'tensor'})

        const expectedPattern = []
    }
}


