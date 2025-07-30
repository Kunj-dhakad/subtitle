
import { useDispatch, useSelector } from "react-redux";
import { addClip, CaptionClip, CaptionTextClip, updateClip } from "../../app/store/clipsSlice";

import Image from "next/image";

import { RootState } from "../../app/store/store";

import { Caption } from "@remotion/captions";


const VideoGrid: React.FC = () => {
  const Allclips = useSelector(
    (state: RootState) => state.slices.present.Allclips
  );

  const bg_height = useSelector(
    (state: RootState) => state.slices.present.videoheight
  );
  const bg_width = useSelector(
    (state: RootState) => state.slices.present.videowidth
  );

  const dispatch = useDispatch();


  const newId = `caption-${Date.now()}`;

  const createClips = (url: string, caption_url: string) => {
    Allclips.forEach((clip) => {
      dispatch(
        updateClip({
          ...clip,
          properties: {
            ...clip.properties,
            zindex: clip.properties.zindex + 1,
          },
        })
      );
    });


    const newClip: CaptionClip = {
      id: `captionVideo-${Date.now()}`,
      type: "captionVideo",
      properties: {
        videoClipId: newId,
        src: url,
        start: 0,
        duration: 120,
        top: bg_height / 2,
        left: bg_width / 2,
        height: 400,
        width: 300,
        volume: 0.5,
        rotation: 0,
        zindex: 1,
        TrimStart: 1,
        TrimEnd: 120,
        videothumbnail: url,
        isDragging: false,
      },
    };
    dispatch(addClip(newClip));
  };




  const createcaptiontextClips = (url: string, caption_url: Caption[]) => {
    Allclips.forEach((clip) => {
      dispatch(
        updateClip({
          ...clip,
          properties: {
            ...clip.properties,
            zindex: clip.properties.zindex + 1,
          },
        })
      );
    });

    const newClip: CaptionTextClip = {
      id: newId,
      type: "captionText",
      properties: {
        src: url,
        caption_url,
        start: 0,
        duration: 120,
        top: 0,
        left: 0,
        height: 400,
        width: 300,
        volume: 0.5,
        rotation: 0,
        zindex: 1,
        TrimStart: 1,
        TrimEnd: 120,
        videothumbnail: url,
        isDragging: false,
      },
    };

    dispatch(addClip(newClip));
  };


  const get_caption_text = async (url: string, text_url: string) => {
    try {
      const response = await fetch(text_url);
      const rawData: Caption[] = await response.json();

      const sanitizedCaptions = rawData.map((caption) => ({
        ...caption,
        timestampMs: caption.timestampMs ?? 0,
      }));

      createcaptiontextClips(url, sanitizedCaptions);
    } catch (error) {
      console.error("Error fetching or processing captions:", error);
    }
  };
  // caption

  const GenerateSubtitle = async () => {
    try {
      const formdata = new FormData();
      formdata.append("videoUrl", "https://kdmeditor.s3.us-east-1.amazonaws.com/uploads/cat.mp4");
      const response = await fetch("/api/caption", {
        body: formdata,
        method: "POST",
      });

      const data = await response.json();
      console.log("Generated subtitle:", data);
    } catch (error) {
      console.error("Error generating subtitle:", error);
    }
  };

  return (
    <div className="kd-editor-panel">
      {/* Search Input */}

      <div className="grid grid-cols-2 gap-4">

        <div className="relative">
          <Image
            src={"https://picsum.photos/200/300"}
            width="300"
            quality={50}
            height={300}
            alt=""
            onClick={() => {
              createClips("https://remotionlambda-useast1-qe2jk3zrmz.s3.us-east-1.amazonaws.com/kd_videoeditor/files/caption/1737368798492.mp4", "https://remotionlambda-useast1-qe2jk3zrmz.s3.us-east-1.amazonaws.com/kd_videoeditor/files/caption/1737368798492.json");
              get_caption_text("https://remotionlambda-useast1-qe2jk3zrmz.s3.us-east-1.amazonaws.com/kd_videoeditor/files/caption/1737368798492.mp4", "https://remotionlambda-useast1-qe2jk3zrmz.s3.us-east-1.amazonaws.com/kd_videoeditor/files/caption/1737368798492.json");
            }}
            className="w-full h-auto cursor-pointer"
          />
        </div>

      </div>

      <div>
        <button onClick={() => { GenerateSubtitle() }} className="my-2 w-full flex items-center justify-center gap-2 GenerateButtonGenAi text-sm py-2 rounded-md transition">
          Subtitle
        </button>
      </div>

    </div>
  );
};

export default VideoGrid;
