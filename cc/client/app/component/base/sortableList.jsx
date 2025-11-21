import React from "react";
import Utils from "../../utils";

function getDragAfterElement(container, y) {
	const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
	return draggableElements.reduce((closest, child) => {
		const box = child.getBoundingClientRect();
		const offset = y - box.top - box.height / 2;
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: child };
		} else {
			return closest;
		}
	}, { offset: Number.NEGATIVE_INFINITY }).element;
}

function setDragEvents(elemList, onSort) {
	if (!elemList) {
		return;
	}
	
	let draggedItem = null;

	elemList.addEventListener('dragstart', (e) => {
		draggedItem = e.target;
		if (!e.target) {
			return;
		}
		e.target.style.opacity = '0.5';
		e.target.classList.add('dragging');
	});

	elemList.addEventListener('dragend', (e) => {
		if (!e.target) {
			return;
		}
		e.target.style.opacity = '1';
		e.target.classList.remove('dragging');
		let currElemList = elemList.querySelectorAll('li[data-pos]'), newElemList = [];
		for (let idx = 0; idx < currElemList.length; idx++) {
			const li = currElemList[idx];
			li.setAttribute("data-pos", idx);			
			newElemList.push({
				id: li.getAttribute("data-id"),
				entity: li.getAttribute("data-entity"),
				position: idx
			});
		}
		onSort && onSort(e, newElemList);
	});

	elemList.addEventListener('dragover', (e) => {
		e.preventDefault();
		const afterElement = getDragAfterElement(elemList, e.clientY);
		if (afterElement == null) {
			elemList.appendChild(draggedItem);
		} else {
			elemList.insertBefore(draggedItem, afterElement);
		}
	});
}

export default function SortableList({ children, className, onSort, sortList}) {

	const wrapperRef = React.useRef(null);

	React.useEffect(() => {
		const sortableList = wrapperRef.current.querySelector('ul');
		setDragEvents(sortableList, onSort, sortList);
	}, []);

	if (!children) {	return null; }

	return (
		<div ref={wrapperRef} className="base-sortable-wrapper">
			<ul className={Utils.css('sortable-list', className)}>
				{/* <li draggable="true">item 1</li> */}
				{children}
			</ul>
		</div>
	)
}