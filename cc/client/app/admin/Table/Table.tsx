import React, { useEffect, useState } from 'react';
import TableHead from './TableHead';
import TableBody from './TableBody';
import styles from './Table.module.css';
import TableSearch from './TableSearch';
import Scrollable from '../Scrollable';

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
	sortKey?: string;
}

interface TableProps<T> {
  columns: Array<TableColumn<T>>;
  data: any;
  handleHeaderCheckboxChange: (checked: boolean, column: TableColumn<T>) => void;
  onDataChanged: (data: Array<T>) => void;
  search?: boolean;
  onRowSelected?: (rowIndex: number | null) => void;
	maxHeight?: number;
	autoIncrementRows?: boolean;
	onSearch?: (term: string) => void;
	searchTerm?: string;
	onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
	sortField?: string;
	sortDirection?: 'asc' | 'desc';
}

const Table = <T,>({
  columns,
  data,
  handleHeaderCheckboxChange,
  onDataChanged,
  search = true,
  onRowSelected,
	maxHeight = 200,
	autoIncrementRows = false,
	onSearch,
	searchTerm,
	onSortChange,
	sortField,
	sortDirection
}: TableProps<T>) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

	const onSort = (column: TableColumn<T>) => {
		if (!column.sortable) return;
		const newDirection = sortField === (column.sortKey ?? column.title.toLowerCase().replace(/\s/g, '_')) && sortDirection === 'asc' ? 'desc' : 'asc';
		onSortChange?.(column.sortKey ?? column.title.toLowerCase().replace(/\s/g, '_'), newDirection);
	};

  const handleRowClick = (rowIndex: number) => {
    
    const newSelectedRow = rowIndex === selectedRow ? null : rowIndex;
    setSelectedRow(newSelectedRow); 
		onRowSelected && onRowSelected(newSelectedRow);
  };

  return (
    <Scrollable maxHeight={maxHeight}> 
      {search && <TableSearch
        value={searchTerm}
        data={data}
        property="name"
        onSearch={(val) => onSearch?.(val)}
        maxHistory={10}
        parentWidth={200}
      />}
      <div className={styles.table}>
        <TableHead
          columns={columns}
          handleHeaderCheckboxChange={handleHeaderCheckboxChange}
          onSort={onSort}
          sortedColumn={columns.find(col => (col.sortKey ?? col.title.toLowerCase().replace(/\s/g, '_')) === sortField) || null}
  				sortDirection={sortDirection ?? 'asc'}
        />
        <TableBody
          columns={columns}
          data={data}
          onRowClick={handleRowClick}
          selectedRow={selectedRow}
					autoIncrementRows={autoIncrementRows}
        />
      </div>
    </Scrollable>
  );
};

export default Table;
