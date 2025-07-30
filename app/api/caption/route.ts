import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFileSync, rmSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import {
  WHISPER_LANG,
  WHISPER_MODEL,
  WHISPER_PATH,
  WHISPER_VERSION,
} from "../../../whisper-config.mjs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import { randomUUID } from "crypto";
import fetch from "node-fetch";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const videoUrl = formData.get("videoUrl");

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), "temp");
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    const uniqueName = randomUUID();
    const videoPath = path.join(tempDir, `${uniqueName}.mp4`);
    const wavPath = path.join(tempDir, `${uniqueName}.wav`);

    // 1. Download the video
    const res = await fetch(videoUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(videoPath, new Uint8Array(buffer));

    // 2. Extract audio
    execSync(`npx remotion ffmpeg -i "${videoPath}" -ar 16000 "${wavPath}" -y`, {
      stdio: "ignore",
    });

    // 3. Ensure whisper is ready
    await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
    await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });

    // 4. Transcribe using Whisper.cpp
    const whisperCppOutput = await transcribe({
      inputPath: wavPath,
      model: WHISPER_MODEL,
      tokenLevelTimestamps: true,
      whisperPath: WHISPER_PATH,
      printOutput: false,
      translateToEnglish: false,
      language: WHISPER_LANG,
      splitOnWord: true,
    });

    const { captions } = toCaptions({ whisperCppOutput });

    // 5. Cleanup
    rmSync(tempDir, { recursive: true, force: true });

    // 6. Return captions
    return NextResponse.json({ captions });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
