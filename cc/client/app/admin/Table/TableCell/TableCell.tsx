import React, { useEffect, useState } from 'react';
import styles from './TableCell.module.css';

interface TableCellProps<T> {
	key: any;
  item: T;
  value: any;
  format?: (value: any, item: T) => JSX.Element;
  className?: string;
  onEdit?: (newValue: any, item: T) => void;
  isSelected: boolean;
	editable?: boolean;
}

const TableCell = <T,>({ item, value, format, className = '', editable = false, onEdit, isSelected = false }: TableCellProps<T>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const handleEditClick = () => {
    if (editable && isSelected && !isEditing) {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    setEditedValue(value);
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onEdit) {
      onEdit(editedValue, item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (onEdit) {
        onEdit(editedValue, item);
      }
    }
  };

  return (
    <td className={styles[className]} onClick={handleEditClick}>
      {
        format ? format(value, item) : (
          isEditing ? (
            <input
              type="text"
              value={editedValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span onClick={handleEditClick}>{editedValue}</span>
          )
        )
      }
    </td>
  );
};

export default TableCell;
