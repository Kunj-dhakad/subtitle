import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
} from "remotion";
import { loadFont } from "./load-font";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import SubtitlePage from "./SubtitlePage";

const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const CaptionedText: React.FC<{subtitlesData: Caption[];}> = ({ subtitlesData }) => {
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const { fps } = useVideoConfig();

  useEffect(() => {
    const loadSubtitles = async () => {
      try {
        await loadFont();
        setSubtitles(subtitlesData);
      } catch (e) {
        console.error("Error loading subtitles", e);
      }
    };

    loadSubtitles();
  }, [subtitlesData]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS
        );

        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <SubtitlePage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
