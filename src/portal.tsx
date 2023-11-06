import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOM18 from 'react-dom/client'
import { ReactProfileProps } from './types';
import ReactProfile from './ReactProfile';
import { EXPORT_OBJECT } from 'react-pixels';

export const openEditor = async (props: ReactProfileProps) => {

  return await new Promise<{ done: boolean, cancel: boolean, editedImage?: EXPORT_OBJECT }>((resolve, reject) => {
    try {
      const [reactVersion] = React.version.split(".")
      
      const root = document.createElement("div");
      root.className = "rp-root";
      document.body.append(root);

      const onCancel = () => {
        resolve({ cancel: true, done: false });
        cleanUp();
      };

      const onDone = (editedImage?: EXPORT_OBJECT) => {
        resolve({ cancel: false, done: true, editedImage });
        cleanUp();
      };

      const cleanUp = () => {
        ReactDOM.unmountComponentAtNode(root);
        root.remove();
      };

      if(!props.src) props = { src: props as any }

      if(Number(reactVersion) >= 18 && ReactDOM18.createRoot) {
        const reactRoot = ReactDOM18.createRoot(root);
        reactRoot.render(<ReactProfile {...props} onCancel={onCancel} onDone={onDone} />)
      } else {
        ReactDOM.render(
            <ReactProfile {...props} onCancel={onCancel} onDone={onDone} />,
            root
        );
      }
    } catch (err) {
      reject(err);
    }
  });
};