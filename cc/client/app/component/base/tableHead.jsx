import React from "react";

export default ({columns, sort, onSortChange, onActivityCheckboxChange, setCheckboxRef}) => {
	columns = columns.map(c => {
		const result = {
			index: c.index,
			style: c.style,
			label: c.label,
			title: c.title,
			showCheckbox: c.showCheckbox
		};
		if (c.sortable) {
			result.style += " sortable";
			result.onClick = onSortChange.bind(null, c.index);
			result.icon = "base-" + (c.index === sort.column ? (sort.ascending ? "asc" : "desc") : "sort");
		}

		if (c.showCheckbox) {
			result.onActivityCheckboxChange = onActivityCheckboxChange;
		}

		return result;
	});

	return (
		<table>
			<thead>
				<tr>
					{columns.map(c => (
						<th key={c.index} className={c.style} title={c.title} onClick={c.onClick}>
							{c.label}
							{c.showCheckbox && (
                <span>
                  <input
                    type="checkbox"
                    onClick={c.onActivityCheckboxChange.bind(null, c.index)}
										ref={setCheckboxRef}
                  />
                </span>
              )}
							{c.icon && (<span className={c.icon}></span>)}
						</th>
					))}
				</tr>
			</thead>
		</table>
	);
};