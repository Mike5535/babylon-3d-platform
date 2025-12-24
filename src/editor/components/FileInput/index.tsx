import type { ChangeEventHandler } from 'react';

export function FileInput({
  onFile,
}: { onFile: (file: File) => void | Promise<void> }) {
  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await onFile(file);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <input
      type="file"
      accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
      onChange={onChange}
    />
  );
}