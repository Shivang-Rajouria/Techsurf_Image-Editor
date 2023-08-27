import React, { useState, useRef } from "react";
import "./App.css";
import "react-image-crop/dist/ReactCrop.css";
import axios from "axios";

const filterOptions = [
  { id: "brightness", name: "Brightness" },
  { id: "saturation", name: "Saturation" },
  { id: "inversion", name: "Inversion" },
  { id: "grayscale", name: "Grayscale" },
  { id: "hue", name: "Hue" },
  { id: "contrast", name: "Contrast" },
  { id: "blur", name: "Blur" },
  { id: "sepia", name: "Sepia" },
];
function App() {
  const [caption, setCaption] = useState();
  const [previewImg, setPreviewImg] = useState(null);
  const [activeFilter, setActiveFilter] = useState("brightness");
  const [sliderValue, setSliderValue] = useState(100);
  const [brightness, setBrightness] = useState("100");
  const [hue, setHue] = useState("0");
  const [blur, setBlur] = useState("0");
  const [sepia, setSepia] = useState("0");
  const [contrast, setContrast] = useState("0");
  const [saturation, setSaturation] = useState("100");
  const [inversion, setInversion] = useState("0");
  const [grayscale, setGrayscale] = useState("0");
  const [rotate, setRotate] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(1);
  const [flipVertical, setFlipVertical] = useState(1);
  const fileInputRef = useRef(null);
  const previewImgRef = useRef(null);
  const loadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImg(file);
    resetFilter();
  };

  const applyFilter = () => {
    previewImgRef.current.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)  contrast(${contrast}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%) `;
    previewImgRef.current.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
  };

  const resetFilter = () => {
    setBrightness("100");
    setSaturation("100");
    setInversion("0");
    setGrayscale("0");
    setContrast("100");
    setHue("0");
    setRotate(0);
    setSepia("0");
    setBlur("0");
    setFlipHorizontal(1);
    setFlipVertical(1);
    setActiveFilter("brightness");
    setSliderValue(100);
  };

  const saveImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)  contrast(${contrast}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (rotate !== 0) {
        ctx.rotate((rotate * Math.PI) / 180);
      }
      ctx.scale(flipHorizontal, flipVertical);
      ctx.drawImage(
        image,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );

      const link = document.createElement("a");
      link.download = "image.jpg";
      link.href = canvas.toDataURL();
      link.click();
    };

    image.src = URL.createObjectURL(previewImg);
  };

  const handleCaption = () => {
    const captionDiv = document.querySelector(".caption-div");
    const formData = new FormData();
    formData.append("filename", "image");
    formData.append("file", previewImg);
    axios
      .post("http://127.0.0.1:8080/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (formData) => formData,
      })
      .then((response) => {
        setCaption(response.data.result);
      })
      .catch((e) => console.log(e));

    // Display the generated caption in the captionDiv
    captionDiv.innerHTML = `<p>Generated caption: ${caption}</p>`;
  };
  const handleFilterClick = (option) => {
    setActiveFilter(option.id);

    switch (option.id) {
      case "brightness":
        setSliderValue(brightness);
        break;
      case "saturation":
        setSliderValue(saturation);
        break;
      case "inversion":
        setSliderValue(inversion);
        break;
      case "hue":
        setSliderValue(hue);
        break;
      case "contrast":
        setSliderValue(contrast);
        break;
      case "blur":
        setSliderValue(blur);
        break;
      case "sepia":
        setSliderValue(sepia);
        break;
      default:
        setSliderValue(grayscale);
    }
  };
  const handleSliderChange = (event) => {
    setSliderValue(event.target.value);
    switch (activeFilter) {
      case "brightness":
        setBrightness(event.target.value);
        break;
      case "saturation":
        setSaturation(event.target.value);
        break;
      case "inversion":
        setInversion(event.target.value);
        break;
      case "contrast":
        setContrast(event.target.value);
        break;
      case "hue":
        setHue(event.target.value);
        break;
      case "blur":
        setBlur(event.target.value);
        break;
      case "sepia":
        setSepia(event.target.value);
        break;
      default:
        setGrayscale(event.target.value);
    }
  };
  const handleRotate = (option) => {
    if (option === "left") {
      setRotate(rotate - 90);
    } else if (option === "right") {
      setRotate(rotate + 90);
    } else if (option === "horizontal") {
      setFlipHorizontal(flipHorizontal === 1 ? -1 : 1);
    } else {
      setFlipVertical(flipVertical === 1 ? -1 : 1);
    }
  };
  return (
    <>
      <div className={`container ${!previewImg ? "disable" : ""}`}>
        <h2>PhotoHack</h2>
        <div className="wrapper">
          <div className="editor-panel">
            <div className="filter">
              <label className="title">Filters</label>

              <div className="options">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    id={option.id}
                    className={activeFilter === option.id ? "active" : ""}
                    onClick={() => handleFilterClick(option)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
              <div className="slider">
                <div className="filter-info">
                  <p className="name">{activeFilter}</p>
                  <p className="value">{`${sliderValue}%`}</p>
                </div>
                <input
                  type="range"
                  min="0"
                  max={
                    activeFilter === "brightness" ||
                    activeFilter === "saturation" ||
                    activeFilter === "contrast"
                      ? "200"
                      : activeFilter === "hue"
                      ? "360"
                      : activeFilter === "blur"
                      ? "30"
                      : "100"
                  }
                  value={sliderValue}
                  onChange={handleSliderChange}
                />
              </div>
            </div>
            <div className="rotate">
              <label className="title">Rotate & Flip</label>
              <div className="options">
                <button id="left" onClick={() => handleRotate("left")}>
                  <i className="fa-solid fa-rotate-left"></i>
                </button>
                <button id="right" onClick={() => handleRotate("right")}>
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
                <button
                  id="horizontal"
                  onClick={() => handleRotate("horizontal")}
                >
                  <i className="bx bx-reflect-vertical"></i>
                </button>
                <button id="vertical" onClick={() => handleRotate("vertical")}>
                  <i className="bx bx-reflect-horizontal"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="preview-img">
            {previewImg ? (
              <img
                src={URL.createObjectURL(previewImg)}
                alt="preview"
                ref={previewImgRef}
                onLoad={applyFilter}
              />
            ) : (
              <img src="image-placeholder.svg" alt="preview-img" />
            )}
          </div>
        </div>
        <div className="controls">
          <button className="reset-filter" onClick={resetFilter}>
            Reset Filters
          </button>
          <input
            type="text"
            placeholder="Give starting text!"
            className="text-input"
          />
          <button className="caption-generator" onClick={handleCaption}>
            Caption
          </button>
          <div className="row">
            <input
              type="file"
              className="file-input"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={loadImage}
            />
            <button
              className="choose-img"
              onClick={() => fileInputRef.current.click()}
            >
              Choose Image
            </button>
            <button onClick={saveImage} className="save-img">
              Save Image
            </button>
          </div>
        </div>
      </div>
      <div className="caption-div">
        <h2>Build a Caption!</h2>
      </div>
    </>
  );
}

export default App;
