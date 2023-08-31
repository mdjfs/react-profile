

import { ReactCropProps, type Crop } from 'react-image-crop'
import { EXPORT_OBJECT, FILTERS } from 'react-pixels/dist/types';

export type MODULES = "crop" | "colors" | "filter"




export interface ReactProfileProps {
  src: string;
  initCrop?: Crop;
  cropOptions?: Omit<ReactCropProps, 'onChange'>;
  square?: boolean;
  onCancel?: () => void;
  onDone?: (editedImage?: EXPORT_OBJECT) => void;
  filtersEnabled?: FILTERS[]
}

export interface Change {
  brightness: number;
  contrast: number;
  crop?: Crop;
  filter?: string | undefined;
  hue: number;
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
  hue?: number;
  saturation?: number;
  verticalFlip?: boolean;
  horizontalFlip?: boolean;
}