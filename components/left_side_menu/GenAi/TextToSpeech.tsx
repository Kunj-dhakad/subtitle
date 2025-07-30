import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaAngleLeft, FaMagic, FaSyncAlt, FaTrash } from 'react-icons/fa';
import { MdClose } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { RiArrowDownSLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { MiddleSectionVisibleaction, settoolbarview } from '../../../app/store/editorSetting';
import Image from "next/image";
import {
    FaPlay, FaPause,
    // FaPlus
} from 'react-icons/fa';
import { addClip, AudioClip, } from '../../../app/store/clipsSlice';
import { RootState } from '../../../app/store/store';
import { FixedSizeGrid as Grid } from 'react-window';

const columnCount = 2;
const itemHeight = 80;
const itemWidth = 420;
const gap = 15;


const genderMap: { [key: string]: string } = {
    male: "1",
    female: "2",
};

const languageMap: { [key: string]: string } = {
    english: "en",
    hindi: "hi",
    marathi: "mr",
    spanish: "es",
    french: "fr",
};


interface StockAudio {
    id: number;
    url: string;
    duration: number;
    title: string;
}
const TextToSpeech: React.FC = () => {
    const playercurrentframe = useSelector(
        (state: RootState) => state.slices.present.playertotalframe
    );
    const [text, setText] = useState('');
    const [playing, setPlaying] = useState<string | null>(null);
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [SelectedLanguage, setSelectedLanguage] = useState("Language");
    const [SelectedGander, setSelectedGander] = useState("Gander");
    const [DemoVioceSearchQuery, setDemoVioceSearchQuery] = useState("");
    const [languageModelOpen, setlanguageModelOpen] = useState(false);
    const languageDropdownRef = useRef<HTMLDivElement>(null);
    const [ganderModelOpen, setganderModelOpen] = useState(false);
    const GAnderdropdownRef = useRef<HTMLDivElement>(null);
    const [reLoadinglist, setreLoadinglist] = useState(false);
    const [generateLoading, setGenerateLoading] = useState<boolean>(false);
    const [generateAudioList, setGenerateAudioList] = useState<any[]>([])
    const [voiceOver, setVoiceOver] = useState<any[]>([]);
    const projectSettings = useSelector((state: RootState) => state.settings);
    const [selectedVoice, setSelectedVoice] = useState<any | null>(null);
    const [model, setModel] = useState(false);
    const [modeltap, setModeltap] = useState<"AiVoice" | "CloneVoice">("AiVoice");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [VoiceDemoCardStatus, setVoiceDemoCardStatus] = useState<"clone" | "demoVoice">("demoVoice");

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
                setlanguageModelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (GAnderdropdownRef.current && !GAnderdropdownRef.current.contains(event.target as Node)) {
                setganderModelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const dispatch = useDispatch();
    const toolbarviewset = (view: string) => {

        dispatch(settoolbarview(view));
    }
    const toolbarhide = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        dispatch(MiddleSectionVisibleaction(false));
    }


    // generate audio  api
    const GenerateAudio = async () => {
        setGenerateLoading(true);
        try {

            const formdata = new FormData();
            formdata.append("access_token", projectSettings.access_token);
            formdata.append("avatar_script", text);
            if (audioFile) {
                formdata.append("type", "clone");
                formdata.append("audio", audioFile);
            } else {
                formdata.append("voice_id", selectedVoice?.sv_svid);

            }
            const response = await fetch(`${projectSettings.api_url}/kdmvideoeditor/generate-ai-sp-audio`, {
                method: "POST",
                body: formdata,
            });
            const data = await response.json();
            console.log(data)
        } catch {
            console.error("erroe data not fetched")
        } finally {
            setreLoadinglist(true);
            setGenerateLoading(false);
            setText('');
            setVoiceDemoCardStatus("demoVoice");
        }
    }

    // audio list delte functionlity
    const DeleteAudio = async (id: any) => {
        try {

            const formdata = new FormData();
            formdata.append("access_token", projectSettings.access_token);
            formdata.append("type", "delete");
            formdata.append("id", id);
            const response = await fetch(`${projectSettings.api_url}/kdmvideoeditor/delete-ai-sp-audio-list`, {
                method: "POST",
                body: formdata,
            });
            const data = await response.json();
            console.log(data)
        } catch {
            console.error("erroe data not fetched")
        } finally {
            setreLoadinglist(true);
            setGenerateLoading(false);
            setText('');
        }
    }


    // get generate audio list
    useEffect(() => {
        const fetchdata = async () => {
            setreLoadinglist(false);
            setLoading(true);
            try {
                const formdata = new FormData();
                formdata.append("access_token", projectSettings.access_token);
                const response = await fetch(`${projectSettings.api_url}/kdmvideoeditor/get-ai-sp-audio-list`, {
                    method: "POST",
                    body: formdata,
                });
                const data = await response.json();
                setGenerateAudioList(data);
                console.log("get-ai-sp-audio-list", data)
                // setstockaudio(data);
            } catch {
                console.error("erroe data not fetched")
            } finally {
                setLoading(false);
            }
        }
        fetchdata()
    }, [projectSettings.access_token, projectSettings.api_url, reLoadinglist]);

    // get demo voice from api
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const formdata = new FormData();
                formdata.append("access_token", projectSettings.access_token);
                const response = await fetch(`${projectSettings.api_url}/kdmvideoeditor/get-default-sp-audio`, {
                    method: "POST",
                    body: formdata,
                });
                const data = await response.json();
                setVoiceOver(data);
                console.log(data)
            } catch {
                console.error("erroe data not fetched")
            } finally {

            }
        }
        fetchdata()
    }, [projectSettings.access_token, projectSettings.api_url])

    // set default voice
    useEffect(() => {
        if (voiceOver.length > 0 && !selectedVoice) {
            setSelectedVoice(voiceOver[0]);
        }
    }, [voiceOver]);



    // create audio clip from stock audio
    const createAudioClip = (audio: StockAudio) => {
        const newClip: AudioClip = {
            id: `audio-${Date.now()}`,
            type: 'audio',
            properties: {
                src: audio.url,
                duration: Number(audio.duration) * 30,
                start: playercurrentframe,
                volume: 1,
                top: -100,
                width: 0,
                height: 0,
                rotation: 0,
                left: 0,
                zindex: 0,
                isDragging: false,
            },
        };
        dispatch(addClip(newClip));
    };

    // const formatDuration = (durationInSeconds: number) => {
    //     console.log("durationInSeconds", durationInSeconds)
    //     const minutes = Math.floor(durationInSeconds / 60);
    //     const seconds = durationInSeconds % 60;
    //     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    // };


    //voice demo filter 

    const filteredVoices = useMemo(() => {
        return voiceOver.filter((voice) => {
            const matchesGender =
                SelectedGander === "Gander" || voice.sv_gender === genderMap[SelectedGander.toLowerCase()];
            const matchesLanguage =
                SelectedLanguage === "Language" || voice.sv_locale?.toLowerCase().startsWith(languageMap[SelectedLanguage.toLowerCase()]);

            const matchesSearchQuery =
                DemoVioceSearchQuery.trim() === "" ||
                voice.sv_name?.toLowerCase().includes(DemoVioceSearchQuery.toLowerCase()) ||
                voice.sv_locale?.toLowerCase().includes(DemoVioceSearchQuery.toLowerCase());
            return matchesGender && matchesLanguage && matchesSearchQuery;
        });
    }, [voiceOver, SelectedGander, SelectedLanguage, DemoVioceSearchQuery]);






    const handleFile = (file: File) => {
        const isValidType = ["audio/mpeg", "audio/wav"].includes(file.type);
        if (!isValidType) {
            setError("Only MP3 or WAV files allowed.");
            return;
        }

        const audio = document.createElement("audio");
        audio.src = URL.createObjectURL(file);

        audio.onloadedmetadata = () => {
            const duration = audio.duration;
            if (duration < 5 || duration > 30) {
                setError("Audio duration must be between 5 and 30 seconds.");
                return;
            }
            setError(null);
            setAudioFile(file);
            setVoiceDemoCardStatus("clone");
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };


    // list audio toggle play/pause for audio
    const togglePlayPause = (audioId: string) => {
        const currentAudio = audioRefs.current[audioId];
        if (currentAudio) {
            if (playing === audioId) {
                currentAudio.pause();
                setPlaying(null);
            } else {
                if (playing && audioRefs.current[playing]) {
                    audioRefs.current[playing]?.pause();
                }
                currentAudio.play();
                setPlaying(audioId);
            }
        }
    };




    const [demoAudioplaying, setDemoAudioplaying] = useState<string | null>(null);


    const audioPlayer = useRef<HTMLAudioElement | null>(null)
    const playAudioById = (id: string, url: string) => {
        if (!audioPlayer.current) {
            audioPlayer.current = new Audio();
        }

        const player = audioPlayer.current;

        if (player.src !== url) {
            player.src = url;
        }

        if (player.paused || player.dataset.id !== id) {
            player.dataset.id = id;
            player.play();
            setDemoAudioplaying(id);

        } else {
            player.pause();
            player.dataset.id = '';
            setDemoAudioplaying(null);
        }
    };

    useEffect(() => {
        if (!audioPlayer.current) {
            audioPlayer.current = new Audio();
        }

        audioPlayer.current.onended = () => {
            audioPlayer.current!.dataset.id = '';
            setDemoAudioplaying(null);
        };
    }, []);




    return (
        <div className="kd-editor-panel">
            <div className="kd-editor-head flex items-center justify-between text-white mb-2">

                <div className='flex items-center '>

                    <button
                        onClick={() => toolbarviewset("GenerativeAiLibrary")} className="toggle-icon"
                    >
                        <FaAngleLeft />
                    </button>

                    <p className="ms-1 left-text">Text To Speech</p>
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

            <div >
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

            {/* select voice */}
            <label className="theme-small-text mb-2">voice </label>
            <div className="bg-[#1E293B] text-white rounded-md shadow-lg border border-[#334155]">

                {VoiceDemoCardStatus === "demoVoice" && (
                    <div className="voice-bx voice-bx-style-2 active">

                        <div className="voice-img-wrapper">
                            <button className="play-pause-btn"
                                onClick={() => { playAudioById(selectedVoice?.sv_id.toString(), selectedVoice?.sv_preview_url); }}
                            // className="audio-btn "
                            >
                                {demoAudioplaying === selectedVoice?.sv_id.toString() ? <FaPause /> : <FaPlay />}

                            </button>
                            <img className=' className="img-box object-cover"' src={selectedVoice?.sv_avatar_image} alt="Profile" />
                        </div>
                        <div className="voice-info">
                            <h6 className='name mb-1'>{selectedVoice?.sv_name || "devid"}</h6>
                            <div className="voice-tags">
                                <span className="badge-tags">{selectedVoice === "1" ? 'Male' : 'Female'}</span>
                                <span className="badge-tags">Text</span>
                                <span className="badge-tags">Work</span>
                                <span className="badge-tags">Accent</span>
                            </div>
                        </div>
                        <span className="selected-badge">
                            Selected
                        </span>
                    </div>
                    // <div className="flex items-center justify-between border-b p-2 border-[#334155]">
                    // </div>

                )}


                {VoiceDemoCardStatus === "clone" && (

                    <div> ✔ File: {audioFile?.name}</div>

                )}


                <button onClick={() => { setModel(true) }} className="w-full flex items-center justify-center gap-2 text-gray-300 text-sm transition p-2">
                    <FaSyncAlt />
                    Change Voice
                </button>
            </div>

            {/* Generate Audio button */}
            <button onClick={() => { GenerateAudio() }} className="my-2 w-full flex items-center justify-center gap-2 GenerateButtonGenAi text-sm py-2 rounded-md transition">
                <FaMagic />
                {generateLoading ? "Progress......" : "Generate Audio"}
            </button>
            {/* audio list */}
            <label className="theme-small-text mb-2">
                Recent Audio
            </label>
            <div className="p-2">

                <div className="grid grid-cols-1 gap-2">

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="loader kd-white-color">Loading...</div>
                        </div>
                    ) : generateAudioList && generateAudioList.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {generateAudioList.map((audio, index) => (

                                <div key={index} className="kd-audio-wrapper kd-audio-wrapper-style-2">
                                    <div className="flex justify-between items-center gap-3">
                                        <button
                                            onClick={() => togglePlayPause(audio.id.toString())}
                                            className="audio-btn"
                                        >
                                            {playing === audio.id.toString() ? <FaPause /> : <FaPlay />}
                                        </button>

                                        <div className="flex-grow "
                                            onClick={() => createAudioClip(audio)}
                                        >
                                            <p className="audio-title">
                                                {audio.title}
                                            </p>
                                            {/* <p className="text-xs kd-white-color">
                                                {formatDuration(audio.duration)}
                                            </p> */}
                                        </div>

                                        <button onClick={() => { DeleteAudio(audio.id) }} className="delete-btn">
                                            <FaTrash />
                                        </button>

                                    </div>

                                    <audio
                                        ref={(el) => {
                                            audioRefs.current[audio.id] = el;
                                        }}
                                        src={audio.url}
                                        onEnded={() => {
                                            if (playing === audio.id.toString()) {
                                                setPlaying(null);
                                            }
                                        }}
                                    />
                                </div>

                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="kd-white-color text-lg">No audio found</p>
                        </div>
                    )}
                </div>

            </div>

            {/* popup model start */}
            {model && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-90 z-40"
                        style={{
                            backdropFilter: "blur(8px)",
                        }}
                    ></div>
                    {/* Popup Box */}

                    <div className="fixed z-50"
                        style={{
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <div className='voice-wrapper'>
                            <div className="flex justify-between items-center mb-4">
                                <div className="nav-wrapper">
                                    <button
                                        onClick={() => setModeltap("AiVoice")}
                                        className={`nav-button ${modeltap === "AiVoice" ? "active" : ""}`}
                                    >
                                        All Voice
                                    </button>
                                    <button
                                        onClick={() => setModeltap("CloneVoice")}
                                        className={`nav-button ${modeltap === "CloneVoice" ? "active" : ""}`}
                                    >
                                        Clone Voice
                                    </button>
                                </div>

                                <button className="text-white closeBtn" onClick={() => setModel(false)}>
                                    <MdClose />
                                </button>
                            </div>
                            {modeltap === "AiVoice" && (
                                <div>
                                    {/* Filters */}
                                    {/* gander filter */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div style={{ flex: "1" }} className="kd-dropdown-container" ref={GAnderdropdownRef}>
                                            <button
                                                onClick={() => setganderModelOpen((prev) => !prev)}
                                                className="kd-dropdown-toggle"
                                            >
                                                {SelectedGander}
                                                <RiArrowDownSLine className="kd-dropdown-arrow" />
                                            </button>

                                            {ganderModelOpen && (
                                                <div className="kd-dropdown-menu">

                                                    <div onClick={() => { setganderModelOpen(false); setSelectedGander("male") }} className={`kd-dropdown-item kd-text-white-color}`}>
                                                        Male
                                                    </div>
                                                    <div onClick={() => { setganderModelOpen(false); setSelectedGander("female") }} className={`kd-dropdown-item kd-text-white-color}`}>
                                                        Female
                                                    </div>

                                                </div>
                                            )}
                                        </div>

                                        {/* lunglage filter */}
                                        <div style={{ flex: "1" }} className="kd-dropdown-container" ref={languageDropdownRef}>
                                            <button
                                                onClick={() => setlanguageModelOpen((prev) => !prev)}
                                                className="kd-dropdown-toggle"
                                            >
                                                {SelectedLanguage}
                                                <RiArrowDownSLine className="kd-dropdown-arrow" />
                                            </button>

                                            {languageModelOpen && (
                                                <div className="kd-dropdown-menu">

                                                    <div onClick={() => { setlanguageModelOpen(false); setSelectedLanguage("hindi") }} className={`kd-dropdown-item kd-text-white-color}`}>
                                                        Hindi
                                                    </div>
                                                    <div onClick={() => { setlanguageModelOpen(false); setSelectedLanguage("english") }} className={`kd-dropdown-item kd-text-white-color}`}>
                                                        English
                                                    </div>
                                                    <div onClick={() => { setlanguageModelOpen(false); setSelectedLanguage(" Spanish") }} className={`kd-dropdown-item kd-text-white-color}`}>
                                                        Spanish
                                                    </div>
                                                    <div onClick={() => { setlanguageModelOpen(false); setSelectedLanguage("French") }} className={`kd-dropdown-item kd-text-white-color}`}>
                                                        French
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: "1" }} className="relative flex items-center">
                                            <input
                                                type="search"
                                                placeholder="Search"
                                                className='kd-form-input search'
                                                value={DemoVioceSearchQuery}
                                                onChange={(e) => setDemoVioceSearchQuery(e.target.value)}
                                            />
                                            <span className="search-icon"><IoSearch /></span>
                                        </div>

                                    </div>

                                    {/* Voice Cards */}
                                    <div className="grid grid-cols-2 gap-3 scroll-bx-wrapper">
                                        <Grid
                                            className="grid-wrapper"
                                            columnCount={columnCount}
                                            columnWidth={itemWidth + gap}
                                            height={325}
                                            rowCount={Math.ceil(filteredVoices.length / columnCount)}
                                            rowHeight={itemHeight + gap}
                                            width={870}
                                        >
                                            {({ columnIndex, rowIndex, style }) => {
                                                const index = rowIndex * columnCount + columnIndex;
                                                if (index >= filteredVoices.length) return null;

                                                const voice = filteredVoices[index];
                                                console.log("Rendering:", voice.sv_id);
                                                return (
                                                    <div
                                                        onClick={() => { setSelectedVoice(voice); setVoiceDemoCardStatus("demoVoice"); }}
                                                        style={{
                                                            ...style,
                                                            padding: gap / 2,
                                                            boxSizing: 'border-box',
                                                        }}
                                                    >
                                                        <div

                                                            className={` ${selectedVoice?.sv_id === voice.sv_id ? 'active' : ''} voice-bx`}
                                                            style={{
                                                                width: itemWidth,
                                                                height: itemHeight,
                                                            }}
                                                        >

                                                            <div className="voice-img-wrapper">
                                                                <button className="play-pause-btn"
                                                                    onClick={() => { playAudioById(voice.sv_id.toString(), voice.sv_preview_url); }}
                                                                // className="audio-btn "
                                                                >
                                                                    {demoAudioplaying === voice.sv_id.toString() ? <FaPause /> : <FaPlay />}

                                                                </button>
                                                                <img src={voice.sv_avatar_image} alt="Profile" />
                                                            </div>
                                                            <div className="voice-info">
                                                                <h2 className="name">{voice.sv_name}</h2>
                                                                <div className="voice-tags">
                                                                    <span className="badge-tags">
                                                                        {voice.sv_gender === "1" ? 'Male' : 'Female'}
                                                                    </span>
                                                                    <span className="badge-tags">Text</span>
                                                                    <span className="badge-tags">Work</span>
                                                                    <span className="badge-tags">Accent</span>
                                                                </div>
                                                            </div>
                                                            <div className="selected-badge">Selected</div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        </Grid>

                                    </div>
                                </div>
                            )}
                            {modeltap === "CloneVoice" && (
                                <div onClick={() => inputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop} className="clone-voice-wrapper">
                                    <div className="inner-content">
                                        <div className="icon">
                                            <svg width="99" height="80" viewBox="0 0 99 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M94.7631 57.0376C92.8784 57.0376 91.3497 55.5089 91.3497 53.6243V26.3172C91.3497 
                                                24.4326 92.8784 22.9038 94.7631 22.9038C96.6477 22.9038 98.1764 24.4326 98.1764
                                                 26.3172V53.6243C98.1764 55.5089 96.6477 57.0376 94.7631 57.0376ZM83.0051 62.7266V17.2149C83.0051
                                                  15.3302 81.4764 13.8015 79.5917 13.8015C77.7071 13.8015 76.1783 15.3302 76.1783
                                                   17.2149V62.7266C76.1783 64.6113 77.7071 66.14 79.5917 66.14C81.4764 66.14 83.0051 64.6113
                                                    83.0051 62.7266ZM67.836 49.0731V30.8684C67.836 28.9837 66.3073 27.455 64.4226 
                                                    27.455C62.538 27.455 61.0093 28.9837 61.0093 30.8684V49.0731C61.0093 50.9577 
                                                    62.538 52.4865 64.4226 52.4865C66.3073 52.4865 67.836 50.9577 67.836
                                                     49.0731ZM52.6647 67.2778V12.6637C52.6647 10.779 51.1359 9.2503
                                                      49.2513 9.2503C47.3667 9.2503 45.8379 10.779 45.8379 12.6637V67.2778C45.8379
                                                       69.1624 47.3667 70.6912 49.2513 70.6912C51.1359 70.6912 52.6647 69.1624 52.6647 
                                                       67.2778ZM37.4933 76.3801V3.56133C37.4933 1.67669 35.9646 0.147949 34.08 0.147949C32.1953
                                                        0.147949 30.6666 1.67669 30.6666 3.56133V76.3801C30.6666 78.2648 32.1953 79.7935 34.08
                                                         79.7935C35.9646 79.7935 37.4933 78.2648 37.4933 76.3801ZM22.3243 58.1754V21.766C22.3243
                                                          19.8814 20.7955 18.3527 18.9109 18.3527C17.0263 18.3527 15.4975 19.8814
                                                           15.4975 21.766V58.1754C15.4975 60.0601 17.0263 61.5888 18.9109 61.5888C20.7955
                                                            61.5888 22.3243 60.0601 22.3243 58.1754ZM7.15293 53.6243V26.3172C7.15293 
                                                            24.4326 5.62419 22.9038 3.73955 22.9038C1.85491 22.9038 0.326172 24.4326
                                                             0.326172 26.3172V53.6243C0.326172 55.5089 1.85491 57.0376 3.73955 
                                                             57.0376C5.62419 57.0376 7.15293 55.5089 7.15293 53.6243Z" fill="white" fillOpacity="0.15" />
                                            </svg>
                                        </div>
                                        <div className="info">

                                            <h6 className="mb-[5px]">Drag & Drop or Upload Audio Here</h6>
                                            <p className="text-sm font-light max-w-[310px] text-[var(--kd-light-color)]">Upload Voice File (MP3/WAV) - Minimum 5 Seconds, Maximum 30 seconds</p>
                                            {error && <p className="text-red-500 text-sm">{error}</p>}
                                            {audioFile && (
                                                <p className="text-green-500 text-sm">✔ File: {audioFile.name}</p>
                                            )}

                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="audio/mp3,audio/wav"
                                        ref={inputRef}
                                        className="hidden"
                                        onChange={handleUpload}
                                    />

                                </div>
                            )}
                        </div>
                    </div>


                </>
            )

            }

        </div >
    );
};

export default TextToSpeech;
