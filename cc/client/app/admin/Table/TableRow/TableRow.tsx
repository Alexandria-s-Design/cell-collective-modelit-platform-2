import React from 'react';
import TableCell from '../TableCell';
import styles from './TableRow.module.css';

interface TableRowProps<T> {
	key: any;
  item: T;
  columns: Array<{
    get: (item: T) => any;
    style?: string;
    format?: (value: any, item: T) => JSX.Element;
    onEdit?: (value: any, item: T) => void;
  }>;
  onClick: () => void;
  isSelected: boolean;
	autoIncrement?: number;
}

const TableRow = <T,>({ item, columns, onClick, isSelected, autoIncrement = 0 }: TableRowProps<T>) => {
  return (
    <tr onClick={onClick} className={isSelected ? `${styles.tableRow} ${styles.selectedRow}` : styles.tableRow}>
      {columns.map((column, colIndex) => (
        <TableCell isSelected={isSelected} key={colIndex} value={autoIncrement > 0 && colIndex == 0 ? autoIncrement :column.get(item)} item={item} format={column.format} className={column.style || ''} onEdit={column.onEdit}/>
      ))}
    </tr>
  );
};

export default TableRow;