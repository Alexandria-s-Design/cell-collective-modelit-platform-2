import React from 'react';
import TableRow from "../TableRow";
import styles from "./TableBody.module.css";

interface TableColumn<T> {
  get: (item: T) => any;
  format?: (value: any, item: T) => JSX.Element;
  title: string;
  style?: string;
  showCheckbox?: boolean;
}

interface TableBodyProps<T> {
  columns: Array<TableColumn<T>>;
  data: Array<T>;
  onRowClick: (rowIndex: number) => void;
  selectedRow: number | null;
	autoIncrementRows?: boolean;
}

const TableBody = <T,>({ columns, data, onRowClick, selectedRow, autoIncrementRows = false}: TableBodyProps<T>) => {
  return (
    <table className={styles.tableBody}>
      <tbody>
        {data.map((item, rowIndex) => (
          <TableRow
            key={rowIndex}
            item={item}
            columns={columns}
            onClick={() => onRowClick(rowIndex)}
            isSelected={selectedRow === rowIndex}
						autoIncrement={rowIndex + 1}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TableBody;
