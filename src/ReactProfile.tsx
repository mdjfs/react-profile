import React, { useEffect, useMemo, useState } from 'react';
import {  Change, MODULES, ReactProfileProps, SendChange  } from './types';
import { EDITOR_TEXT } from './language';
import { PixelsImage, getExportObject, getImageSource, EXPORT_OBJECT, FILTERS, PixelsImageSource } from 'react-pixels';
import ReactCrop, { ReactCropProps, type Crop } from 'react-image-crop'
import { ICON_BRIGHTNESS, ICON_COLORS, ICON_CONTRAST, ICON_CROP, ICON_FILTER, ICON_FLIP, ICON_SATURATION, ICON_SPINNER, ICON_UNDO } from './icons';

const language = 'en';

const INIT_STATE: Change = {
  brightness: 0,
  contrast: 0,
  hue: 0,
  saturation: 0,
  verticalFlip: false,
  horizontalFlip: false,
  crop: undefined,
  filter: undefined,
  lastChangeTime: Date.now()
}

const INIT_CROP: Crop = {
  unit: '%',
  width: 50,
  height: 50,
  x: 25,
  y: 25
}

const LAST_CHANGE_DELAY_MS = 1000;

const DEFAULT_FILTERS_ENABLED: FILTERS[] = ["vintage", "perfume", "sunset", "wood", "greyscale", "coral", "lemon", "haze", "radio", "grime", "red_effect", "rgbSplit"]

const ReactProfile: React.FC<ReactProfileProps> = ({ src, initCrop, cropOptions, experimental, square, filtersEnabled = DEFAULT_FILTERS_ENABLED, onCancel, onDone }) => {

  INIT_STATE.crop = initCrop || INIT_CROP;
  cropOptions = square ? {...cropOptions, aspect: 1} as ReactCropProps : cropOptions

  const text = EDITOR_TEXT[language]

  const [close, setClose] = useState(false);
  const [actual, setActual] = useState<MODULES>("crop");
  const [history, setHistory] = useState<Change[]>([INIT_STATE]);
  const [edit, setEdit] = useState<Change>(INIT_STATE);
  const [exportObject, setExportObject] = useState<EXPORT_OBJECT>();
  const [isExporting, setIsExporting] = useState(false);
  const [img, setImg] = useState<HTMLImageElement>();
  const [source, setSource] = useState<PixelsImageSource>();
  const pushHistory = (changes: SendChange) => {
    const last = history[history.length-1];
    const change = { ...edit, ...changes,  lastChangeTime: Date.now()};
    if(change.lastChangeTime - last.lastChangeTime > LAST_CHANGE_DELAY_MS) {
      setHistory([...history, change]);
    }
    setEdit(change)
  }
  const undo = () => {
    if(history.length > 1) { 
      history.pop();
      setHistory(history);
      setEdit(history[history.length-1]);
    } else {
      setEdit(history[0]) 
    }
  }
  const setFilter = (filter: string | undefined) => pushHistory({ filter })
  const setBrightness = (brightness: number) => pushHistory({ brightness })
  const setHue = (hue: number) => pushHistory({ hue })
  const setContrast = (contrast: number) => pushHistory({ contrast })
  const setSaturation = (saturation: number) => pushHistory({ saturation })
  const setVerticalFlip = (verticalFlip: boolean) => pushHistory({ verticalFlip })
  const setHorizontalFlip = (horizontalFlip: boolean) => pushHistory({ horizontalFlip })
  const setCrop = (crop: Crop) => pushHistory({ crop })

  const cancel = () => {
    setClose(true);
    if(onCancel) onCancel();
  }

  const done = async () => {
    if(onDone) {
      const sendCanvas = getExportObject;

      try {
         if(edit.crop) {
          const img = exportObject ? await exportObject.getImageFromBlob() : new Image();
          const type = exportObject ? exportObject.getInferedMimetype() : src.includes(".png") ? 'image/png' : 'image/jpeg'
          if(img) {
            if(!exportObject) img.src = src;
            const crop = edit.crop;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const width = crop.unit === "%" ? img.width * (crop.width/100) : crop.width;
              const height = crop.unit === "%" ? img.height * (crop.height/100) : crop.height;
              canvas.width = width;
              canvas.height = height;
              const context = canvas.getContext("2d");
              if(context) {
                context.drawImage(img, crop.x, crop.y, width, height, 0, 0, width, height);
                sendCanvas(canvas, type)
              } else console.error("ReactProfile: Error obtaining context")
            } 
            img.onerror = () => console.error("React Profile: error fetching img")
          } else console.error("ReactProfile: Error obtaining img")
        } else {
          if(exportObject) sendCanvas(exportObject.getCanvas() as HTMLCanvasElement, exportObject.getInferedMimetype())
          else if(onDone) onDone();
        }
      } catch (err) {
        console.error("ReactProfile: ", err)
      }
    }
  }

  useEffect(() => {
    if(src) {
      const image = new Image();
      image.src = src;
      image.onload = () => setImg(image);
    }
  }, [src])

  useEffect(() => {
    if(img) getImageSource(img).then(setSource)
  }, [img]);

  const IMAGE = useMemo(() => (
    source && <PixelsImage src={source} 
      horizontalFlip={edit.horizontalFlip}
      verticalFlip={edit.verticalFlip}
      filter={edit.filter}
      saturation={edit.saturation}
      brightness={edit.brightness}
      contrast={edit.contrast}
      className="rp-image-preview" 
      onFilter={setExportObject}
    />
  ), [edit.horizontalFlip, edit.verticalFlip, edit.filter, edit.hue, edit.contrast, edit.brightness, edit.saturation, source])

  const FILTERS = useMemo(() => (
    source && actual === "filter" && <div className="rp-filters">
      <div className={`rp-filter no-filter ${!edit.filter && "selected"}`} onClick={() => setFilter(undefined)}>
          <PixelsImage src={source} 
              horizontalFlip={edit.horizontalFlip}
              verticalFlip={edit.verticalFlip}
              saturation={edit.saturation}
              brightness={edit.brightness}
              contrast={edit.contrast}
              className="rp-filter-preview" 
            />
          <p>{text.noFilter}</p>
        </div>
      {Object.entries(text.filters).filter(([_, filter]) => filtersEnabled.includes(filter as FILTERS)).map(([name, filter]) => (
        <div className={`rp-filter ${filter} ${filter === edit.filter && "selected"}`} key={filter} onClick={() => setFilter(filter)}>
          <PixelsImage src={source} 
              horizontalFlip={edit.horizontalFlip}
              verticalFlip={edit.verticalFlip}
              filter={filter}
              saturation={edit.saturation}
              brightness={edit.brightness}
              contrast={edit.contrast}
              className="rp-filter-preview" 
            />
          <p>{name}</p>
        </div>
      ))}
    </div>
  ), [actual, edit.horizontalFlip, edit.verticalFlip, edit.filter, edit.brightness, edit.saturation, edit.hue, edit.contrast, source])

  if(!img) return <></>

  if(close) return <></>

  return  <div className="rp-editor">
    <div className="rp-navigation">
      <div className="rp-back">
          <button className="rp-cancel-button" onClick={cancel}>{text.cancelButton}</button>
          <button className="rp-back-button" onClick={undo} disabled={history.length === 1}>{ICON_UNDO}</button>
      </div>
      <div className="rp-buttons">
        <div className={`rp-button-crop ${actual === "crop" && 'selected'}`} onClick={() => setActual("crop")}>
          {ICON_CROP}
          <p>{text.cropButton}</p>
        </div>
        <div className={`rp-button-filter ${actual === "filter" && 'selected'}`} onClick={() => setActual("filter")}>
          {ICON_FILTER}
          <p>{text.filterButton}</p>
        </div>
        <div className={`rp-button-colors ${actual === "colors" && 'selected'}`} onClick={() => setActual("colors")}>
          {ICON_COLORS}
          <p>{text.colorsButton}</p>
        </div>
      </div>
      <div className="rp-next">
          <button className="rp-done-button" disabled={isExporting} onClick={done}>{isExporting && ICON_SPINNER}{text.doneButton}</button>
      </div>
    </div>
    <div className={`rp-image-section ${actual}`}>
      <div className="rp-controls">
          {actual === "crop" && (
            <div className={`rp-crop ${edit.verticalFlip && 'vertical-flip'} ${edit.horizontalFlip && 'horizontal-flip'}`}>
              <button className="flip-vertical-button" onClick={() => setVerticalFlip(!edit.verticalFlip)}>{ICON_FLIP} {text.flipVertical}</button>
              <button className="flip-horizontal-button" onClick={() => setHorizontalFlip(!edit.horizontalFlip)}>{ICON_FLIP} {text.flipHorizontal}</button>
            </div>
          )}
          {actual === "colors" && (
            <div className="rp-colors">
              <label htmlFor="rp-bs">{ICON_BRIGHTNESS} {text.sliderBrightness}</label>
              <input
                type="range"
                id="rp-bs"
                min={-100}
                max={100}
                value={Number((edit.brightness*100).toFixed(0))}
                onInput={(e) =>  setBrightness(Number(e.currentTarget.value)/100)}
              />
              <label htmlFor="rp-ct">{ICON_CONTRAST} {text.sliderContrast}</label>
              <input
                type="range"
                id="rp-ct"
                min={-100}
                max={100}
                value={Number((edit.contrast*100).toFixed(0))}
                onInput={(e) => setContrast(Number(e.currentTarget.value)/100)}
              />
              <label htmlFor="rp-sat">{ICON_SATURATION} {text.sliderSaturation}</label>
              <input
                type="range"
                id="rp-sat"
                min={-100}
                max={100}
                value={Number((edit.saturation*100).toFixed(0))}
                onInput={(e) => setSaturation(Number(e.currentTarget.value)/100)}
              />
            </div>
          )}
          {actual === "filter" && text.filters && FILTERS}
      </div>
      <div className="rp-preview">
        {(actual === "filter" || actual === "colors") && IMAGE}
        {actual === "crop" && (
            <ReactCrop {...cropOptions} crop={edit.crop} onChange={c => setCrop(c)} >
              {IMAGE}
            </ReactCrop>
        )}
      </div>
    </div>
  </div>;
};

export default ReactProfile;
