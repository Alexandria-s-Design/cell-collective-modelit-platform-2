import React from "react";
import styles from "./TableHead.module.css";
interface TableHeadProps<T> {
  columns: Array<TableColumn<T>>;
  handleHeaderCheckboxChange: (checked: boolean, column: TableColumn<T>) => void;
  onSort: (column: TableColumn<T>) => void;
  sortedColumn: TableColumn<T> | null;
  sortDirection: 'asc' | 'desc';
}

interface TableColumn<T> {
  id: number;
  get: (item: T) => any;
  format?: (value: any, item: T) => JSX.Element;
  title: string; 
  style?: string; 
  showCheckbox?: boolean;
  onHeaderCheckboxChange?: (item: any, checked: boolean) => T;
  checkboxRef?: React.RefObject<HTMLInputElement>;
	sortable?: boolean;
	sortValue?: (item: T) => string | number;
}


const TableHead = <T,>({ columns, handleHeaderCheckboxChange, onSort, sortedColumn, sortDirection }: TableHeadProps<T>) => (
  <table className={styles.tableHead}>
    <thead>
      <tr>
        {columns.map((column, index) => (
          <th key={index} className={column.style ? styles[column?.style] : ''} onClick={(e) => {
							e.preventDefault();
              if ((e.target as HTMLElement).tagName === 'INPUT') return;
							if (!column.sortable) return;
              onSort(column);
						}}>
            {column.title}
            <span 
              className={`${styles.sortIcon} ${
                !column.sortable ? '' : sortedColumn?.id === column.id
                  ? sortDirection === 'asc'
                    ? styles.sortAsc
                    : styles.sortDesc
                  : styles.defaultSort
              }`}
            />
            {column.showCheckbox && (
                  <span>
                    <input
                      type="checkbox"
                      onChange={(e) => handleHeaderCheckboxChange(e.target.checked, column)}
                      ref={column.checkboxRef}
                    />
                  </span>
                )}
          </th>
        ))}
      </tr>
    </thead>
  </table>
);

export default TableHead;
