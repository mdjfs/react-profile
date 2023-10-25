

import { ReactCropProps, type Crop } from 'react-image-crop'
import { EXPORT_OBJECT, FILTERS } from 'react-pixels';

export type MODULES = "crop" | "colors" | "filter"

export type SUPPORTED_LANGUAGES = "es" | "en" | "zh" | "ja" | "it" | "fr" | "hin"

export interface ReactProfileProps {
  src: string | File | HTMLImageElement;
  initCrop?: Crop;
  cropOptions?: Omit<ReactCropProps, 'onChange'>;
  square?: boolean;
  onCancel?: () => void;
  onDone?: (editedImage?: EXPORT_OBJECT) => void;
  filtersEnabled?: FILTERS[],
  maxWidth?: number,
  maxHeight?: number,
  quality?: number,
  maxImageSize?: number,
  modules?: MODULES[],
  language?: SUPPORTED_LANGUAGES
  type?: 'image/jpeg'|'image/png'
}

export interface Change {
  brightness: number;
  contrast: number;
  crop?: Crop;
  filter?: string | undefined;
  saturation: number;
  verticalFlip: boolean;
  horizontalFlip: boolean;
  lastChangeTime: number;
}


export interface SendChange {
  brightness?: number;
  contrast?: number;
  crop?: Crop;
  filter?: string | undefined;
  saturation?: number;
  verticalFlip?: boolean;
  horizontalFlip?: boolean;
}