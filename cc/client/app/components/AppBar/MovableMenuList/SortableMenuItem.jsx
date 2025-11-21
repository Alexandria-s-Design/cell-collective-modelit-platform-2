import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'SORTABLE_ITEM';

const styles = {
	dragging: {
		cursor: 'move',
		opacity: 0.5,
		border: '1px solid rgb(9, 201, 183)'
	},
	static: {
		cursor: 'move',
		opacity: 1,
	}
}

function SortableMenuItem({ item, index, moveItem, className }) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(draggedItem) {
      if (draggedItem.index === index) return;
      moveItem(draggedItem.index, index);
      draggedItem.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <li
      ref={ref}
			className={className}
      style={isDragging ? styles.dragging : styles.static}
    >{item}</li>
  );
}

export default SortableMenuItem;