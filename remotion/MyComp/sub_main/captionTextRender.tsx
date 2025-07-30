import React, { } from "react";
import {
    CaptionTextClip,
} from "../../../app/store/clipsSlice";
import { CaptionedText } from "../../CaptionedText";



interface TextRendererprops {
    clip: CaptionTextClip;
}

const CaotionTextRenderer: React.FC<TextRendererprops> = ({ clip }) => {
    const parentdiv: React.CSSProperties = {
        position: "absolute",
        top: `${clip.properties.top}px`,
        left: `${clip.properties.left}px`,
        zIndex: 100 - clip.properties.zindex,
        display: "flex",
        overflow: "hidden",
        rotate: `${clip.properties.rotation}deg`,
        width: `${clip.properties.width}px`,
        height: `${clip.properties.height}px`,
        boxSizing: "border-box",

    }

    return (
        <div style={parentdiv}>
            <CaptionedText subtitlesData={clip.properties.caption_url} />
        </div>
    )

}

export default CaotionTextRenderer;

