import { useState } from 'react';
import './index.scss';

export const ToolBar = ({
  setMode,
}: {
  setMode: (mode: "position" | "rotation" | "scale") => void;
}) => {
  const [activeButton, setActiveButton] = useState(1);

  return (
    <div className="toolBarWrapper">
      <div className={'toolBar'}>
        <button
          onClick={() => {
            setActiveButton(1);
            setMode('position');
          }}
          className={`toolBar__button toolBar__button_transform ${
            activeButton === 1 ? 'active' : ''
          }`}
        />
        <button
          onClick={() => {
            setActiveButton(2);
            setMode('rotation');
          }}
          className={`toolBar__button toolBar__button_rotate ${
            activeButton === 2 ? 'active' : ''
          }`}
        />
        <button
          onClick={() => {
            setActiveButton(3);
            setMode('scale');
          }}
          className={`toolBar__button toolBar__button_scale ${
            activeButton === 3 ? 'active' : ''
          }`}
        />
      </div>
      <span>Правка</span>
    </div>
  );
};
