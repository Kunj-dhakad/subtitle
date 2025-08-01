// import { NextRequest, NextResponse } from "next/server";
// import path from "path";
// import { writeFileSync, rmSync, mkdirSync, existsSync } from "fs";
// import { execSync } from "child_process";
// import {
//   WHISPER_LANG,
//   WHISPER_MODEL,
//   WHISPER_PATH,
//   WHISPER_VERSION,
// } from "../../../whisper-config.mjs";
// import {
//   downloadWhisperModel,
//   installWhisperCpp,
//   transcribe,
//   toCaptions,
// } from "@remotion/install-whisper-cpp";
// import { randomUUID } from "crypto";
// import fetch from "node-fetch";

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const videoUrl = formData.get("videoUrl");

//     if (!videoUrl || typeof videoUrl !== "string") {
//       return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
//     }

//     const tempDir = path.join(process.cwd(), "temp");
//     if (!existsSync(tempDir)) {
//       mkdirSync(tempDir);
//     }

//     const uniqueName = randomUUID();
//     const videoPath = path.join(tempDir, `${uniqueName}.mp4`);
//     const wavPath = path.join(tempDir, `${uniqueName}.wav`);

//     // 1. Download the video
//     const res = await fetch(videoUrl);
//     const buffer = Buffer.from(await res.arrayBuffer());
//     writeFileSync(videoPath, new Uint8Array(buffer));

//     // 2. Extract audio
//     execSync(`npx remotion ffmpeg -i "${videoPath}" -ar 16000 "${wavPath}" -y`, {
//       stdio: "ignore",
//     });

//     // 3. Ensure whisper is ready
//     await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
//     await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });

//     // 4. Transcribe using Whisper.cpp
//     const whisperCppOutput = await transcribe({
//       inputPath: wavPath,
//       model: WHISPER_MODEL,
//       tokenLevelTimestamps: true,
//       whisperPath: WHISPER_PATH,
//       printOutput: false,
//       translateToEnglish: false,
//       language: WHISPER_LANG,
//       splitOnWord: true,
//     });

//     const { captions } = toCaptions({ whisperCppOutput });

//     // 5. Cleanup
//     rmSync(tempDir, { recursive: true, force: true });

//     // 6. Return captions
//     return NextResponse.json({ captions });
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import path from "path";
// import { writeFileSync, rmSync, mkdirSync, existsSync } from "fs";
// import { execSync } from "child_process";
// import { randomUUID } from "crypto";
// import fetch from "node-fetch";
// import fs from "fs";
// import OpenAI from "openai";
// import { openAiWhisperApiToCaptions } from '@remotion/openai-whisper';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const videoUrl = formData.get("videoUrl");

//     if (!videoUrl || typeof videoUrl !== "string") {
//       return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
//     }

//     const tempDir = path.join(process.cwd(), "temp");
//     if (!existsSync(tempDir)) {
//       mkdirSync(tempDir);
//     }

//     const uniqueName = randomUUID();
//     const videoPath = path.join(tempDir, `${uniqueName}.mp4`);
//     const audioPath = path.join(tempDir, `${uniqueName}.mp3`);

//     // 1. Download the video
//     const res = await fetch(videoUrl);
//     const buffer = Buffer.from(await res.arrayBuffer());
//     writeFileSync(videoPath, new Uint8Array(buffer));

//     // 2. Convert to audio (.mp3)
//     execSync(
//       `npx remotion ffmpeg -i ${videoPath} -ar 16000 ${audioPath} -y`,
//       { stdio: ["ignore", "inherit"] },
//     );

//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(audioPath),
//       model: 'whisper-1',
//       response_format: 'verbose_json',
//       timestamp_granularities: ['word'],
//     });

//     const transcriptionWithMeta = {
//       ...transcription,
//       duration:  0, 
//       language:'en',
//     };

//     const { captions } = openAiWhisperApiToCaptions({ transcription: transcriptionWithMeta });

//     rmSync(tempDir, { recursive: true, force: true });

//     return NextResponse.json({ caption: captions });
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

























import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFileSync, rmSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import fetch from "node-fetch";
import fs from "fs";
import OpenAI from "openai";
import { openAiWhisperApiToCaptions } from '@remotion/openai-whisper';
import { v4 as uuidv4 } from 'uuid'; // Replaced randomUUID

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const videoUrl = formData.get("videoUrl");

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
    }

    // ✅ Use /tmp directory for AWS Amplify
    const tempDir = "/tmp";

    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const uniqueName = uuidv4(); // replaced randomUUID
    const videoPath = path.join(tempDir, `${uniqueName}.mp4`);
    const audioPath = path.join(tempDir, `${uniqueName}.mp3`);

    // ✅ Download the video
    const res = await fetch(videoUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(videoPath, new Uint8Array(buffer));

    // ✅ Convert to audio using FFmpeg
    execSync(`npx remotion ffmpeg -i ${videoPath} -ar 16000 ${audioPath} -y`, {
      stdio: ["ignore", "inherit"],
    });

    // ✅ Transcribe using OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    const transcriptionWithMeta = {
      ...transcription,
      duration: 0,
      language: 'en',
    };

    const { captions } = openAiWhisperApiToCaptions({ transcription: transcriptionWithMeta });

    // ✅ Clean up
    rmSync(videoPath, { force: true });
    rmSync(audioPath, { force: true });

    return NextResponse.json({ caption: captions });

  } catch (error: any) {
    console.error("Error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}











