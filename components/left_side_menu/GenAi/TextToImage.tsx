import React, { useEffect, useState } from 'react';
import { FaAngleLeft, FaMagic } from 'react-icons/fa';
import { useDispatch, useSelector } from "react-redux";
import { MiddleSectionVisibleaction, settoolbarview } from '../../../app/store/editorSetting';
import Image from "next/image";
import { RootState } from '../../../app/store/store';
import { addClip, ImageClip, updateClip } from '../../../app/store/clipsSlice';



const TextToImage: React.FC = () => {

    const [text, setText] = useState('');
    const [imageRatio, setImageRatio] = useState('1024*1024');
    const [images, setImages] = useState<any[]>([]);
    const [generateLoading, setGenerateLoading] = useState<boolean>(false);
    const [reLoadinglist, setreLoadinglist] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const dispatch = useDispatch();
    const toolbarviewset = (view: string) => {

        dispatch(settoolbarview(view));
    }
    const toolbarhide = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        dispatch(MiddleSectionVisibleaction(false));
    }

    const projectSettings = useSelector((state: RootState) => state.settings);

    useEffect(() => {
        const fetchdata = async () => {
            try {

                const formdata = new FormData();
                formdata.append("access_token", projectSettings.access_token);
                const response = await fetch(`${projectSettings.api_url}/kdmvideoeditor/get-ai-image-generate`, {
                    method: "POST",
                    body: formdata,
                });
                const data = await response.json();
                setImages(data);
                console.log("new data", data)
            } catch {
                console.error("erroe data not fetched")
            } finally {
                setLoading(false);
                setreLoadinglist(false)

            }
        }
        fetchdata()
    }, [projectSettings.access_token, projectSettings.api_url, reLoadinglist])

    // get image from openai api
    const GenerateOpenAiImage = async () => {
        try {
            setGenerateLoading(true);
            const formdata = new FormData();
            formdata.append("access_token", projectSettings.access_token);
            formdata.append("prompt", text);
            formdata.append("size", imageRatio);
            const response = await fetch(`${projectSettings.api_url}/kdmvideoeditor/text-to-image`, {
                method: "POST",
                body: formdata,
            });
            const data = await response.json();
            ;

            console.log(data)
        } catch {
            console.error("erroe data not fetched")
        } finally {
            setImageRatio('');
            setText('');
            setreLoadinglist(true)
            setGenerateLoading(false);
        }
    }





    const bg_height = useSelector(
        (state: RootState) => state.slices.present.videoheight
    );
    const bg_width = useSelector(
        (state: RootState) => state.slices.present.videowidth
    );
    const playercurrentframe = useSelector(
        (state: RootState) => state.slices.present.playertotalframe
    );

    const Allclips = useSelector((state: RootState) => state.slices.present.Allclips);




    const createclpis = (url: string, w: number, h: number) => {
        // console.log("createclpis", url, w, h)

        const defaultWidth = 500;
        const defaultHeight = 500;

        const originalWidth = w > 0 ? w : defaultWidth;
        const originalHeight = h > 0 ? h : defaultHeight;
        const maxTargetWidth = bg_width;
        const maxTargetHeight = bg_height;
        const widthRatio = maxTargetWidth / originalWidth;
        const heightRatio = maxTargetHeight / originalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);

        const scaledWidth = originalWidth * scale;
        const scaledHeight = originalHeight * scale;



        Allclips.forEach((clip) => {
            dispatch(updateClip({ ...clip, properties: { ...clip.properties, zindex: clip.properties.zindex + 1 } }));
        });


        const newClip: ImageClip = {
            id: `image-${Date.now()}`,
            type: 'image',
            properties: {
                src: url,
                animationType: "normal",
                width: scaledWidth,
                height: scaledHeight,
                opacity: 1,
                start: playercurrentframe,
                duration: 120,
                maxWidth: 200,
                maxHeight: 200,
                objectFit: "",
                top: bg_height / 2 - scaledHeight / 2,
                left: bg_width / 2 - scaledWidth / 2,
                zindex: 1,
                contrast: 100,
                hueRotate: 0,
                saturate: 1,
                blur: 0,
                grayscale: 0,
                sepia: 0,
                borderRadius: "0",
                transform: "",
                brightness: 100,
                rotation: 0,

                isDragging: false,
                animation: {
                    in: {
                        type: 'None',
                        duration: 0,
                        slideDistanceX: undefined,
                        slideDistanceY: undefined,
                        degrees: undefined
                    },
                    out: {
                        type: 'None',
                        duration: 0,
                        slideDistanceX: undefined,
                        slideDistanceY: undefined,
                        degrees: undefined
                    }
                }
            },
        };
        dispatch(addClip(newClip));

    };





    return (
        <div className="kd-editor-panel">
            <div className="kd-editor-head flex items-center justify-between text-white mb-4">

                <div className='flex items-center '>

                    <button
                        onClick={() => toolbarviewset("GenerativeAiLibrary")} className="toggle-icon"
                    >
                        <FaAngleLeft />
                    </button>

                    <p className="ms-1 left-text">AI Images</p>
                </div>

                <button onClick={toolbarhide} className="toggle-icon">
                    <Image
                        width={18}
                        height={18}

                        src="https://kdmeditor.s3.us-east-1.amazonaws.com/kd_videoeditor/files/image/collapse.svg"
                        alt="Collapse Icon"
                    />
                </button>
            </div>

            {/* Text Input Field */}

            <div className="mb-2">
                <label className="theme-small-text mb-2">
                    Write a Text
                </label>
                <textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                    }} rows={4}
                    className="kd-form-input"
                    placeholder="Type something..."
                />
            </div>

            {/* image Ratio */}

            <div className="mb-2">
                <label className="theme-small-text mb-2">
                    Ratio
                </label>
                <div className="flex items-center gap-2">
                    <div onClick={() => { setImageRatio("1792x1024") }} className={`${imageRatio === "1792x1024" ? "active" : ""}image-box-wrapper image-box-wrapper-style-2`}>
                        <Image src={'https://kdmeditor.s3.us-east-1.amazonaws.com/kd_videoeditor/files/image/libraryimage/landscape.png'}
                            width={200} height={200}
                            alt={'1'}></Image>
                    </div>
                    <div onClick={() => { setImageRatio("1024x1792") }} className={`${imageRatio === "1024x1792" ? "active" : ""}image-box-wrapper image-box-wrapper-style-2`}>
                        <Image src={'https://kdmeditor.s3.us-east-1.amazonaws.com/kd_videoeditor/files/image/libraryimage/portrait.png'}
                            width={200} height={200}
                            alt={'1'}></Image>
                    </div>
                    <div onClick={() => { setImageRatio("1024x1024") }} className={`${imageRatio === "1024x1024" ? "active" : ""}image-box-wrapper image-box-wrapper-style-2`}>
                        <Image src={'https://kdmeditor.s3.us-east-1.amazonaws.com/kd_videoeditor/files/image/libraryimage/square.png'}
                            width={200} height={200}
                            alt={'1'}></Image>

                    </div>
                </div>
            </div>
            {/* Generate  button */}

            <button onClick={() => { GenerateOpenAiImage() }}
                className="my-2 w-full flex items-center justify-center gap-2 GenerateButtonGenAi text-sm py-2 rounded-md transition"             >
                <FaMagic />
                {generateLoading ? "Progress......" : "Generate Image"}
            </button>
            {/* images list */}

            <div >
                <label className="theme-small-text mb-2">
                    Recent Image
                </label>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loader kd-white-color">Loading...</div>
                    </div>
                ) : images && images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="image-box-wrapper">
                                <Image
                                    src={image.url}
                                    width={200}
                                    height={200}
                                    alt={`Image ${index}`}
                                    className="w-full h-auto cursor-pointer"
                                    onClick={() => createclpis(image.url, image.width, image.height)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p className="kd-white-color text-lg">No images found</p>
                    </div>
                )}
            </div>



        </div>
    );
};

export default TextToImage;
