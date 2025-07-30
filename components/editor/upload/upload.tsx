import { useEffect, useState, } from "react";
import Videolist from "./videolist";
import Imagelist from "./imagelist";
import AudioList from "./audiolist";
import ToolbarHeader from "../helper/ToolbarHeader";
import GifList from "./GifList";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";

const Upload: React.FC = () => {

  const [activeTab, setActiveTab] = useState<"videos" | "images" | "audio" | "gif">("videos");
  const projectSettings = useSelector((state: RootState) => state.settings);

  const sendMessageModelOpen = () => {
    window.parent.postMessage({ action: 'sendMessageModelOpen' }, '*');
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'FileUploadedSuccessfully') {
        if (event.data.upload_file_type === "videos") {
          setActiveTab("videos")

        }
        if (event.data.upload_file_type === "image") {
          setActiveTab("images")

        }
        if (event.data.upload_file_type === "audio") {
          setActiveTab("audio")
        }
        if (event.data.upload_file_type === "gif") {
          setActiveTab("gif")
        }

      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };

  }, []);



  return (

    <div className="kd-upload-panel">

      <ToolbarHeader title="My Assets" showSetToolbarViewClear={true} />


      <div className="upload-wrapper">
        <div onClick={sendMessageModelOpen} className="custom-file-upload">
          <div className="left-content">
            <div className="image-box">
              <img id="previewImage" src="https://kdmeditor.s3.us-east-1.amazonaws.com/kd_videoeditor/files/image/faFileUpload.png" alt="image" />
            </div>
          </div>
          <div className="right-content">
            <h5 className="title">Upload Asset</h5>
            {/* <p>Videos, Images, GIFs & Audios</p> */}
            <p>Videos, Images, Audios & Gifs </p>

          </div>
        </div>
      </div>
      {/* Tabs */}


      {/* <div className="kd-tab-wrapper">
        <div className="kd-tab-list">
          <button
            onClick={() => setActiveTab("videos")}
            className={`kd-tab-btn ${activeTab === "videos" ? "active" : ""}`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`kd-tab-btn ${activeTab === "images" ? "active" : ""}`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`kd-tab-btn ${activeTab === "audio" ? "active" : ""}`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab("gif")}
            className={`kd-tab-btn ${activeTab === "gif" ? "active" : ""}`}
          >
            Gif
          </button>
        </div>
      </div> */}


      <div className="mb-4">
        <select
          className="kd-form-input"
          value={activeTab}
          onChange={(e) => { setActiveTab(e.target.value as "videos" | "images" | "audio" | "gif") }}>
          <option value={`videos`}>Videos</option>
          <option value={`images`}>Images</option>
          <option value={`audio`}>Audios</option>
          {projectSettings.project_id === 'project_getkidstaleai' && (
            <option value={`gif`}>Gifs</option>
          )}


        </select>
      </div>



      {/* Scrollable Content */}
      <div className="kd-upload-content">
        {activeTab === "videos" && <Videolist />}
        {activeTab === "images" && <Imagelist />}
        {activeTab === "audio" && <AudioList />}
        
        {activeTab === "gif" && <GifList />}
      </div>
    </div>

  );
};

export default Upload;

