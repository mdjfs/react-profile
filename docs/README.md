![React Profile Icon](https://imgur.com/jqkjGad.png)

# React Profile

[![npm version](https://badge.fury.io/js/react-profile.svg)](https://www.npmjs.com/package/react-profile)

A simple and open-source React component for editing photos.

[Demo](https://react-profile-page-coral.vercel.app/demo)

[Homepage](https://react-profile-page-coral.vercel.app/)

## Table of Contents

1. [Installation](#installation)
2. [Example](#example)
3. [Options](#options)
4. [Props](#props)
5. [Contributing / Developing](#contributing--developing)

{{GET_STARTED}}

## Options

You can change the editor's language with the 'language' property. For example:

```javascript
import React from "react";
import ReactProfile from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return <ReactProfile src="./your-image.png" language="zh" />;
}

export default App;
```

You can request an image in square format. For example:

```javascript
import React from "react";
import ReactProfile from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return <ReactProfile src="./your-image.png" square />;
}

export default App;
```

You can enable only the modules you want using the 'modules' property. For example:

```javascript
import React from "react";
import ReactProfile from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return <ReactProfile src="./your-image.png" modules={["filter", "crop"]} />;
}

export default App;
```

You can add more filters or even all available filters. For example:

```javascript
import React from "react";
import ReactProfile, { ALL_FILTERS } from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return <ReactProfile src="./your-image.png" filters={ALL_FILTERS} />;
}

export default App;
```

Warning: Adding many filters could potentially slow down the editor depending on the image's size

To explore all the filters, you can visit the [Pixels.js](https://silvia-odwyer.github.io/pixels.js/) website

You can initialize the component with an HTMLImageElement object specifying the type. For Example:

```javascript
import React from "react";
import ReactProfile from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return <ReactProfile src={YOUR_IMG_OBJECT as HTMLImageElement} type="image/jpeg" />;
}

export default App;
```

You can change some options to crop the image. The ['react-image-crop'](https://github.com/DominicTobias/react-image-crop) library specifies all the options. For Example:

```javascript
import React from "react";
import ReactProfile from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return <ReactProfile src="./your-image.png" cropOptions={{ maxWidth: 500, maxHeight: 300 }} />;
}

export default App;
```

You can change how the crop object is initialized in the editor. The ['react-image-crop'](https://github.com/DominicTobias/react-image-crop) library specifies all the options. For Example:

```javascript
import React from "react";
import ReactProfile from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return (
    <ReactProfile
      src="./your-image.png"
      initCrop={{
        unit: "%",
        width: 50,
        height: 50,
        x: 25,
        y: 25,
      }}
    />
  );
}

export default App;
```

## Props

**`src?: string | HTMLImageObject`**

Source of the image

**`initCrop?: Crop`**

react-image-crop init crop

**`cropOptions?: CropOptions`**

react-image-crop crop options

**`square?: boolean`**

Square Image

**`onCancel?: () => void`**

Handler when the user cancels edit

**`onDone?: (exportObject?: EXPORT_OBJECT) => void`**

Handler when the user finishes editing. The EXPORT_OBJECT has the following methods:

- getCanvas() -> get canvas object
- getBlob() (async) -> get blob
- getDataURL() -> get data url
- getImageFromBlob() (async) -> get HTMLImageElement from blob
- getImageFromDataURL() (async) -> get HTMLImageElement from blob

**`maxWidth?: number`**

It refers to the maximum resolution (in width) of the image. Note: This is different from the size rendered on the screen. It is done for image optimization. The default maximum is '1000'. Try not to use very high resolutions to avoid slowdowns.

**`maxHeight?: number`**

It refers to the maximum resolution (in height) of the image. Note: This is different from the size rendered on the screen. It is done for image optimization. The default maximum is '1000'. Try not to use very high resolutions to avoid slowdowns.

**`quality?: number`**

Image quality for optimization purposes. Default is '0.8'. Only affects JPEG format images. Range of values 0-1

**`maxImageSize?: number`**

Maximum image size in bytes. The default maximum size is '3MB' (1024 \* 1024 \* 3). If you want to work with larger images, you should specify it here. Note: Working with very large images can overload the canvas object and may cause the editor to fail.

**`modules?: MODULES[]`**

An array that specifies which modules the developer wants to be rendered in the editor.

**`type?: 'image/jpeg|image/png'`**

This property declares the type of the image for the editor

## Contributing / Developing

In your project, navigate to the 'node_modules' folder and look for the 'react-profile' package

Clone the repository

`git clone https://github.com/mdjfs/react-profile`

Install and build

`yarn && yarn run build`

Now. inside src/ you can _change everything about logics, languages, icons, etc_

And inside themes/ you can _change all the styles, add new themes, etc_

After each change. Remember run builds again.

When you're ready, open a pull request.
