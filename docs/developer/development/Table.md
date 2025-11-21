<style>
	td {
		font-family: "Courier New", monospace;
	}
	div > p:last-of-type {
		text-align: center;
	}
</style>

Overview
---------------------
The `Table` component is used for the purpose of displaying
tabular data in a neat format. It has several built in features
for searching through data, displaying data in various formats,
and editing data.

Requirements
----------------------
In order to display properly, a Table should be the first and only
child of a `Panel` component.

Props
----------------------
| Name          | Type               | Required    | Default Value             | Description                                                                                                   |
| :------------ | :----------------- | :---------: | :-----------------------: | :------------------------------------------------------------------------------------------------------------ |
| columns       | Array              | Yes         |                           | The information about the table columns to be displayed.                                                      |
| cursor        | String             | No          |                           | The cursor that should be displayed when the user hovers over the selected table row.                         |
| data          | Seq (immutable.js) | Yes         |                           | The source data to be displayed.                                                                              |
| editable      | Function           | No          | ()  =>  true              | A function which determines whether a given row should be editable.                                           |
| headHeight    | Integer            | No          | 20                        | The height of the table head in pixels.                                                                       |
| master        | Boolean            | No          | true                      | If true, onSelect will be called on the first row of the table automatically upon mounting.                   |
| onClick       | Function           | No          |                           | Click event listener called when the selected table row is clicked.                                           |
| onDoubleClick | Function           | No          |                           | Same as onClick, but for double clicks.                                                                       |
| onDrag        | Function           | No          |                           | Drag event listener called when any table row is dragged.                                                     |
| onEdit        | Function           | No          |                           | Edit event listener called when a table row is edited.                                                        |
| onSelect      | Function           | No          |                           | Select event listener called when a table row is selected. Called automatically on mount if "master" is true. |
| owner         | Array/Object       | No          |                           | A sentinel value. Further information will be provided in the "How to Use" section.                           |
| references    | Array/Object       | Yes         |                           | A sentinel value. Further information will be provided in the "How to Use" section.                           |
| rowHeight     | Integer            | No          | 23                        | The height of each table row in pixels.                                                                       |
| search        | String             | No          |                           | The field of each data entry to search against. If not specified or null/undefined, no search bar will show.  |
| searchHeight  | Integer            | No          | 22                        | The height of the search bar in pixels, if it is displayed.                                                   |
| selected      | Object             | No          |                           | The data entry that should be selected in the table.                                                          |
| showEmpty     | Boolean            | No          | false                     | If true, will display a cell showing "... no data ..." when the data array is empty.                          |


How to Use
----------------------
If the table is only intended for displaying data, then setting up a table is very simple.
The only props which are necessary for this are `columns`, `data`, and `references`. `columns`
is an array of objects in the following format.

#### Column Format

| Field    | Type            | Required         |
| :------- | :-------------: | :--------------: |
| get      | string/function | Recommended      |
| key      | string          | No               |
| format   | function        | No               |
| label    | string          | Yes              |
| title    | string          | No               |
| editable | boolean         | No               |

The `get` field is not strictly required, but is the easiest way to use `Table`.
If it is a string, it represents the field of each data object to be displayed
in the column represented by this entry of `columns`. If the table is editable
and `editable` is set to `true` on this column, then `get` determines which key of
the data entry to modify when a cell in this column is modified.

If `get` is a function, then it should accept a data entry (single row entry) and return
a string value to display. If not a string, whatever value is returned will be converted
to a string.

The `key` field is not required, but if `get` is a function (and the table is editable),
then `key` must be defined in order to specify which field of the data object should be
modified when a cell in this column is modified. If both `key` and `get` are defined, then
it will always override `get` regarding which field of the data entry to modify.

The `format` field is not required, but it can be used to override the what would be displayed
by the `get` field. If `format` is defined, it will always override `get` when displaying the
table data. The `format` function should accept the same data as the `get` function - a single
data entry/row of data.

The `label` field determines what will be displayed in the table's header (the column label).

The `title` field determines the tool-tip text when this column's header is hovered.

The `editable` field determines whether this particular columns should be editable. If the
table's `editable` prop is not set to true, however, the column will not be editable no matter
what value this field is set to.

#### Data
The `data` prop should be a Seq containing the data for the rows of the table. The individuals may
be of any data type, theoretically, but it is most conventional to have all the entries be objects
with the same format. See the Data Examples in the "Examples" section to see examples of data.

----------------------

[Home](index.md "Home")

----------------------
