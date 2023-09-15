## Installation

In your terminal, execute this command depending on your preferred package manager:

```
npm i react-profile
yarn add react-profile
pnpm add react-profile
```

## Example

One way to open the editor is passing the image path and rendering it. For example:

```javascript
import React from "react";
import ReactProfile from "react-profile";
import "react-profile/themes/default.min.css";

function App() {
  return <ReactProfile src="./your-image.png" />;
}

export default App;
```

Additionally, you can open the editor directly in your code. For example:

```javascript
import { openEditor } from "react-profile";
import "react-profile/themes/dark.min.css";

async function open() {
  const result = await openEditor({ src: "./your-image.jpg" });
}
```

Very important: Always import the corresponding style file for the desired theme when rendering/calling the editor.
