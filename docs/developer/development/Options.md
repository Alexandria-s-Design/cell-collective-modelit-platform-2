<style>
	td {
		font-family: "Courier New", monospace;
	}
	div > p:last-of-type {
		text-align: center;
	}
</style>

Overview
-------------------------
A versatile component which produces a dropdown selection box
which has various convenient functionalities for the developer
that makes it very flexible, but the large number of options
can make it confusing and difficult to understand and use.

Props
-------------------------

| Name          | Type               | Required           | Default Value | Description                                                                                                                                                                                |
| :------------ | :----------------- | :----------------: | :-----------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value         | Object             | Yes                |               | The current selected value. The component does not manage the selection itself, this must be managed externally                                                                            |
| options       | Seq (immutable.js) | Yes                |               | The list of values to select from. Each value is an object that which should have a unique `id` attribute.                                                                                 |
| def           | Object             | No                 |               | The default selected value if `value` is a false-like value.                                                                                                                               |
| get           | Function/String    | Yes                | "name"        | If a function, it should accept an object from `options` and return a value to display in the dropdown. If a string, it will be converted to the function `(obj) => obj[get]`              |
| format        | Function           | No                 |               | A function which does further formatting how a value is displayed. The reason to use this along with `get` is discussed later.                                                             |
| editable      | Boolean            | No                 | false         | Determines whether the items in the dropdown should be able to be edited (note that editing is not internally managed)                                                                     |
| onChange      | Function           | Recommended        |               | A function which accepts an object from `options` when it is selected from the dropdown.                                                                                                   |
| onAdd         | Function           | No                 |               | A function called when the `+ Add ...` button is clicked, which is only visible if `editable` is true and `onRemove` is defined                                                            |
| onRemove      | Function           | No                 |               | A function called when the remove button is clicked on an item in the dropdown. The function should accept a single argument, the item to be removed. Only relevant if `editable` is true  |
| onEdit        | Function           | No                 |               | A function called when an item in a dropdown                                                                                                                                               |
| propertyName  | String             | No                 |               | The name of the item type to be added. Its only function is defining the `+ Add (propertyName)` message on editable dropdowns                                                              |
| isScrollable  | Boolean            | No                 | false         | If true, the dropdown box will have a maximum height and will be scrollable. Otherwise, it will simply be as large as necessary to fit all items.                                          |
| none          | String             | No                 | None          | What to display if nothing is selected. Only used if `def` is not defined.                                                                                                                 |
| maxWidth      | Integer            | No                 | 150           | The maximum width of the editable component which is displayed when an item is edited. Only useful if `editable` is true.                                                                  |
| forcePosition | Object             | No                 |               | An object that may contain `left` and `top` attributes, which will be discussed later.

How to Use
--------------------------
Generally speaking, the most important props to provide are `value`, `options`, `get`, and `onChange`. The others can add a lot of helpful functionality, but are not necessary for
basic usage. `options` should be an Immutable.js Seq whose elements are all objects. Each object may have any number of attributes, but it must have an `id` attribute which is unique
among all other elements of `options`. When an item is selected in the dropdown, `onChange` is called on the object represented by the selected item. Typically `onChange` will trigger
a state change which manipulates a value which is passed into the `value` prop. If `onChange` does nothing, then no value will change and it will appear as though nothing has
occurred. If no value is selected at any given time, the value passed into `def` will be treated as the selected value and will be displayed. If `def` is omitted, the value of `none`
will be displayed as the default message. If you anticipate having a lot of items, you may consider setting `isScrollable` to `true` in order to limit the size of the dropdown and
make it scrollable such that it is much more usable (editors note: it seems at this time that the scrollable mode is somewhat glitchy and not ready for general usage). It is also
possible to set a `forcePosition` prop, an object which may contain a `left` and/or `top` attribute. These attributes are numbers which represent left and top offsets respectively.
These offsets will override the automatically calculated position of the dropdown menu, hence **forcing** the position of the dropdown to a location it would not naturally be
located.

If you do not need to use `<Options>` in its `editable` form, then the above is all you need to know. Otherwise, continue reading for details on how to use the "editable" features.

In order to make the `<Options>` component editable, set the `editable` prop to `true`. Then, there are a number of important props to understand in order to properly set up an
editable `<Options>`.

Firstly, if the component is editable, the dropdown will have an item at the bottom with a message in the form `+ Add (some object)`. The actual text in place of
`(some object)` is whatever the `propertyName` prop is set to. If it is not set, the item will simply read `+ Add`. This item does nothing by default when clicked, and will only
do something if `onAdd` is defined. `onAdd` can be any function, and it can theoretically do anything, but in order to use it as intended, it should perform some task which adds
a new item to the data set which is passed into `options`.

Next, if the component is editable, each item will have an "x" that can be clicked when it is hovered which, when clicked, will
trigger a call to the function passed into the `onRemove` prop. It will be called with a single argument - the item for which the "x" was clicked. Like `onAdd`, `onRemove` is not
restricted in what it can do, but its intended use would be to trigger an operation to remove the item passed into `onRemove` from the data passed into `options`.

Finally, if the component is editable, each item can be edited by selecting an item and clicking the selection display (such that the cursor looks like a writing utensil). When
you are finished editing the value and un-focus the field or press Enter/Return, the `onEdit` function will be triggered, which accepts three parameters in the order they appear here:
the object represented by the item being edited, the value passed into `get`, and finally, the value submitted into the editable field. At risk of being redundant: `onEdit` may
do anything, but its intended use would be to trigger an operation to edit the object represented by the edited item according to what value was submitted. Additionally, the
`maxWidth` prop will determine the maximum width of the input field displayed while editing an item (it is set to 150 pixels by default).

As a last note, editable fields do make the `format` field relevant. If `format` is defined, then the result of `format` when called on each item in `options` will be what is
displayed in each item. However, when the field is being edited, the value that is edited will get whatever the result of `get` is. For example, if somebody had an `<Options>`
with some standard prices for some items, then the `format` function may accept a number and return a dollar string, e.g. `$5.75`. But when editing each item, the value displayed
in the editable field will be the raw number, i.e. `5.75`. It is also crucial to note that if `format` is defined, then `onChange` will no longer be automatically triggered, but
is passed into `format` and must be manually implemented in whatever component is returned by `format`. The following arguments are passed into `format` by `<Options>`: the object
represented by a given item, a function that needs no arguments which highlights the dropdown button, and the function which triggers the `onChange` function.

--------------------------

[Home](index.md "Home")

--------------------------