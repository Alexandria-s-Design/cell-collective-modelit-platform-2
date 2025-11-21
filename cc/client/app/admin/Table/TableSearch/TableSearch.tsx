import React, { useState, useRef, useEffect } from 'react';
import styles from './TableSearch.module.css';

interface TableSearchProps {
  onSearch: (searchTerm: string) => void;
  data: any[];
  property: string;
  value: string;
  maxHistory?: number;
  parentWidth?: number;
}

const TableSearch: React.FC<TableSearchProps> = ({
  onSearch,
  data,
  property,
  value,
  maxHistory = 10,
  parentWidth = 300,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      confirmSearch();
    }
  };

  const handleBlur = () => {
    confirmSearch();
  };

  const confirmSearch = () => {
    if (searchTerm) {
      const lowerCasedTerm = searchTerm.toLowerCase();
      const existsInHistory = history.some(item => item.toLowerCase() === lowerCasedTerm);
      if (!existsInHistory) {
        const updatedHistory = [searchTerm, ...history.slice(0, maxHistory - 1)];
        setHistory(updatedHistory);
      }
    }
    onSearch(searchTerm.toLowerCase());
    setShowHistory(false);
  };

  const handleHistoryItemClick = (item: string) => {
    setSearchTerm(item);
    onSearch(item.toLowerCase());
    setShowHistory(false);
  };

  const handleDeleteHistoryItem = (itemToDelete: string) => {
    const updatedHistory = history.filter(item => item !== itemToDelete);
    setHistory(updatedHistory);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    setShowHistory(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.tableSearch} ref={searchContainerRef}>
      <button onClick={confirmSearch} className={styles.searchButton}/>
      {showHistory && history.length > 0 && (
        <ul className={styles.historyList}>
          {history.map((item, index) => (
            <li key={index}>
              <div className={styles.historyItem} onMouseDown={() => handleHistoryItemClick(item)}>
                {item}
              </div>
              <button className={styles.deleteButton} onClick={() => handleDeleteHistoryItem(item)}/>
            </li>
          ))}
        </ul>
      )}

      <button
        className={styles.historyButton}
        disabled={history.length === 0}
        onClick={() => setShowHistory(!showHistory)}
      />
      <div className={styles.searchInputWrapper}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          placeholder="Search..."
          style={{ width: `${parentWidth}px` }}
        />
        {searchTerm && (
          <button className={styles.clearButton} onClick={clearSearch}/>
        )}
      </div>
    </div>
  );
};

export default TableSearch;
