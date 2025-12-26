import { useEffect, useState } from 'react';
import './index.scss';
import type { DropdownItemData } from './types';

interface DropdownMenuProps {
  items?: DropdownItemData[];
  title: string;
  onSelect: (meshId: string | number) => void;
  selectedMeshId: string | null;
}

export const ObjectList = ({
  items,
  title,
  onSelect,
  selectedMeshId,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DropdownItemData | null>(
    items?.find(({ id }) => id === selectedMeshId) || null
  );

  useEffect(() => {
    const onClick = () => {
      setIsOpen(false);
    };
    document.addEventListener('pointerdown', onClick);

    return () => document.removeEventListener('pointerdown', onClick);
  });

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleItemClick = (item: DropdownItemData) => {
    onSelect(item.id);
    setSelectedItem(item);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <button
        className="dropdown-toggle"
        onPointerDown={(e) => {
          toggleMenu();
          e.stopPropagation();
        }}
      >
        {selectedItem ? (
          <span className="selected-content">
            {selectedItem.icon} {selectedItem.label}
          </span>
        ) : (
          title
        )}
      </button>

      {isOpen && (
        <ul className="dropdown-menu">
          {items?.map((item, key) => (
            <li
              key={key}
              onPointerDown={(e) => {
                setIsOpen(false);
                handleItemClick(item);
                e.stopPropagation();
              }}
              className="dropdown-item"
            >
              {item.icon && <span className="item-icon">{item.icon}</span>}
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
