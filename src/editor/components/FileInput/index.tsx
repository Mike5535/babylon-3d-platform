import type { ChangeEventHandler } from 'react';
import './index.scss';

export function FileInput({
  onFile,
}: {
  onFile: (file: File) => void | Promise<void>;
}) {
  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await onFile(file);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="fileInputWrapper">
      <label className="fileInput">
        <input
          className="fileInput__input"
          type="file"
          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
          onChange={onChange}
        />
      </label>

      <span>Импорт</span>
    </div>
  );
}
