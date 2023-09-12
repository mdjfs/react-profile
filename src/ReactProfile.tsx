import React, { useEffect, useMemo, useState } from 'react';
import {  Change, MODULES, ReactProfileProps, SUPPORTED_LANGUAGES, SendChange  } from './types';
import { EDITOR_TEXT } from './language';
import { PixelsImage, getExportObject, getImageSource, EXPORT_OBJECT, FILTERS, PixelsImageSource } from 'react-pixels';
import ReactCrop, { ReactCropProps, type Crop } from 'react-image-crop'
import { ICON_BRIGHTNESS, ICON_COLORS, ICON_CONTRAST, ICON_CROP, ICON_FILTER, ICON_FLIP, ICON_SATURATION, ICON_SPINNER, ICON_UNDO } from './icons';

const DEFAULT_LANGUAGE: SUPPORTED_LANGUAGES = 'en';

const INIT_STATE: Change = {
  brightness: 0,
  contrast: 0,
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

const MAX_IMAGE_WIDTH = 1000;
const MAX_IMAGE_HEIGHT = 1000;
const DEFAULT_OPTIMIZE = 0.8;
const MAX_IMAGE_SIZE = 1024 * 1024 * 3; // 3MB

const LAST_CHANGE_DELAY_MS = 1000;

const DEFAULT_FILTERS_ENABLED: FILTERS[] = ["vintage", "perfume", "sunset", "wood", "greyscale", "coral", "lemon", "haze", "radio", "grime", "red_effect", "rgbSplit"]

const DEFAULT_MODULES: MODULES[] = ["crop", "filter", "colors"];

const ReactProfile: React.FC<ReactProfileProps> = ({ 
  src, 
  initCrop, 
  cropOptions,
  square, 
  filtersEnabled = DEFAULT_FILTERS_ENABLED, 
  onCancel, 
  onDone,
  maxWidth = MAX_IMAGE_WIDTH,
  maxHeight = MAX_IMAGE_HEIGHT,
  maxImageSize = MAX_IMAGE_SIZE,
  quality = DEFAULT_OPTIMIZE,
  modules = DEFAULT_MODULES,
  language = DEFAULT_LANGUAGE
 }) => {
  const moduleSet = [...new Set(modules)]

  INIT_STATE.crop = initCrop || INIT_CROP;
  cropOptions = square ? {...cropOptions, aspect: 1} as ReactCropProps : cropOptions

  const text = EDITOR_TEXT[language]

  const [close, setClose] = useState(false);
  const [actual, setActual] = useState<MODULES>(moduleSet[0]);
  const [history, setHistory] = useState<Change[]>([INIT_STATE]);
  const [edit, setEdit] = useState<Change>(INIT_STATE);
  const [exportObject, setExportObject] = useState<EXPORT_OBJECT>();
  const [isExporting, setIsExporting] = useState(false);
  const [img, setImg] = useState<HTMLImageElement>();
  const [croppedSource, setCroppedSource] = useState<PixelsImageSource>();
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
  const setContrast = (contrast: number) => pushHistory({ contrast })
  const setSaturation = (saturation: number) => pushHistory({ saturation })
  const setVerticalFlip = (verticalFlip: boolean) => pushHistory({ verticalFlip })
  const setHorizontalFlip = (horizontalFlip: boolean) => pushHistory({ horizontalFlip })
  const setCrop = (crop: Crop) => pushHistory({ crop })

  const cancel = () => {
    setClose(true);
    if(onCancel) onCancel();
    else console.warn("ReactProfile: Missing onCancel handler");
  }

  const done = async () => {
    if(onDone) {
      setIsExporting(true);
      const sendCanvas = (canvas: HTMLCanvasElement, type: string) => {
        setIsExporting(false);
        setClose(true);
        onDone(getExportObject(canvas, type))
      };

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
    } else {
      setClose(true);
      console.warn("ReactProfile: Missing onDone handler")
    }
  }

  const getCroppedSource = async () => {
    const cr = edit.crop;
    if(source && cr) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if(!context) throw new Error("ReactProfile: Error obtaining context")
      canvas.width = source.width;
      canvas.height = source.height;
      context.putImageData(source.data, 0, 0);
      const croppedCanvas = document.createElement("canvas");
      const croppedContext = croppedCanvas.getContext("2d");
      if(!croppedContext) throw new Error("ReactProfile: Error obtaining context")
      const width = cr.unit === "%" ? source.width * (cr.width/100) : cr.width;
      const height = cr.unit === "%" ? source.height * (cr.height/100) : cr.height;
      croppedCanvas.width = width;
      croppedCanvas.height = height;
      croppedContext.drawImage(canvas, cr.x, cr.y, width, height, 0, 0, width, height);
      return await getImageSource(croppedCanvas, source.type as any)
    }
  }

  useEffect(() => {
    if(src) {
      const png = src.includes("png");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if(!context) throw new Error('ReactProfile: Error obtaining context');
      const image = new Image();
      image.crossOrigin = "anonymous"
      image.src = src;
      image.onerror = () => console.error('ReactProfile: Error fetching image')
      image.onload = () => {
        let loadWidth = image.width;
        let loadHeight = image.height;
        const aspect = image.width / image.height;
        if(loadWidth > maxWidth) {
          loadWidth = maxWidth;
          loadHeight = loadWidth / aspect;
        }
        if(loadHeight > maxHeight) {
          loadHeight = maxHeight;
          loadWidth = loadHeight * aspect;
        }
        canvas.width = loadWidth;
        canvas.height = loadHeight;
        context.drawImage(image, 0, 0, loadWidth, loadHeight);
        canvas.toBlob((blob) => {
          if(!blob) return console.error('ReactProfile: Error loading image')
          const pixelImage = new Image();
          pixelImage.src = URL.createObjectURL(blob);
          pixelImage.onload = () => setImg(pixelImage)
          pixelImage.onerror = () => console.error('ReactProfile: Error loading image')
        }, png ? 'image/png' : 'image/jpeg', quality)
      }
    }
  }, [src])

  useEffect(() => {
    if(img) getImageSource(img).then((source) => {
      if(source.data.data.byteLength >= maxImageSize) {
        const toMB = (len: number) => (len / (1024*1024)).toFixed(2)
        const err = `ReactProfile: Max Image Size Supported (>${toMB(maxImageSize)} MB). Image size: (${toMB(source.data.data.byteLength)} MB).`;
        console.error(err)
        console.warn('ReactProfile: You can modify the maximum size with the \'maxImageSize\' property, but be careful. Very large images can lead to errors or overloads.')
        throw new Error(err)
      } else {
        setSource(source);
      }
    })
  }, [img]);

  const IMAGE = useMemo(() => (
    source && <PixelsImage src={actual === "crop" ? source : croppedSource || source} 
      horizontalFlip={edit.horizontalFlip}
      verticalFlip={edit.verticalFlip}
      filter={edit.filter}
      saturation={edit.saturation}
      brightness={edit.brightness}
      contrast={edit.contrast}
      className="rp-image-preview" 
      onFilter={setExportObject}
    />
  ), [edit.horizontalFlip, edit.verticalFlip, edit.filter, edit.contrast, edit.brightness, edit.saturation, actual, source, croppedSource])

  const FILTERS = useMemo(() => (
    source && actual === "filter" && <div className="rp-filters">
      <div className={`rp-filter no-filter ${!edit.filter && "selected"}`} onClick={() => setFilter(undefined)}>
          <PixelsImage src={croppedSource || source} 
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
          <PixelsImage src={croppedSource || source} 
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
  ), [actual, edit.horizontalFlip, edit.verticalFlip, edit.filter, edit.brightness, edit.saturation, edit.contrast, source, croppedSource])

  if(!img) return <></>

  if(close) return <></>

  return  <div className="rp-editor">
    <div className="rp-navigation">
      <div className="rp-back">
          <button className="rp-cancel-button" onClick={cancel}>{text.cancelButton}</button>
          <button className="rp-back-button" onClick={undo} disabled={history.length === 1}>{ICON_UNDO}</button>
      </div>
      <div className="rp-buttons">
        {moduleSet.map(module => 
          <div key={module} className={`rp-button-crop ${actual === module && 'selected'}`} onClick={async () => {
            if(actual === "crop") {
              const source = await getCroppedSource();
              if(source) setCroppedSource(source);
            }
            setActual(module)
          }}>
            {module === "crop" ? ICON_CROP : module === "filter" ? ICON_FILTER : ICON_COLORS}
            <p>{module === "crop" ? text.cropButton : module === "filter" ? text.filterButton : text.colorsButton}</p>
          </div>
        )}
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
                step={1}
                value={Number((edit.brightness*100).toFixed(0))}
                onInput={(e) => setBrightness(Number(e.currentTarget.value)/100)}
              />
              <label htmlFor="rp-ct">{ICON_CONTRAST} {text.sliderContrast}</label>
              <input
                type="range"
                id="rp-ct"
                min={-100}
                max={100}
                step={1}
                value={Number((edit.contrast*100).toFixed(0))}
                onInput={(e) => setContrast(Number(e.currentTarget.value)/100)}
              />
              <label htmlFor="rp-sat">{ICON_SATURATION} {text.sliderSaturation}</label>
              <input
                type="range"
                id="rp-sat"
                min={-100}
                max={100}
                step={1}
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
