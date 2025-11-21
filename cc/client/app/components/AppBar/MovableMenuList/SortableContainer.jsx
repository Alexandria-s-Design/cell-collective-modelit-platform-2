import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import messages from './messages';
import { sanitizeLayoutName } from "../../../layouts";
import SortableMenuItem from './SortableMenuItem';

/*
items: ['Item 1', 'Item 2', 'Item 3', 'Item 4']
*/
function SortableList(props) {
  const [items, setItems] = useState(props._items);

  const moveItem = (dragIndex, hoverIndex) => {
    const draggedItem = items[dragIndex];
    const updatedItems = [...items];
    updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, draggedItem);
    setItems(updatedItems);
  };

  return (
    <ul className={props.className}>
      {items.map((item, index) => (
        <SortableMenuItem
          key={item.label}
          index={index}
          item={sanitizeLayoutName(item.label)}
          moveItem={moveItem}
					className={item.className}
        />
      ))}
    </ul>
  );
}


export default function MenuContainer({_items, className}) {
  if (!Array.isArray(_items)) {
		return <div></div>;
	}
	return (
		<DndProvider backend={HTML5Backend}>
				<SortableList _items={_items} className={className}/>
		</DndProvider>
	)
}