<style>
	td {
		font-family: "Courier New", monospace;
	}
	div > p:nth-last-of-type(2) {
		text-align: center;
	}
</style>

Overview
-------------------------
`<Editable>` is a component for providing convenient editable values. These values will normally be displayed
inline in non-obstructive ways, unlike values that are always displayed within `<input>` components. However, when
an `<Editable>` is clicked (or double-clicked - either can be implemented), a text field will appear where the value
was, replacing the original inline component. The value can then be edited, and then by hitting Enter/Return or un-focusing
the text field, the editor will disappear and be replaced once again by the inline display.

Props
-------------------------

| Name              | Type                                                             | Required           | Default Value | Description                                                                                                                                                                  |
| :---------------- | :--------------------------------------------------------------- | :----------------: | :-----------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value             | String                                                           | Yes                |               | The current value of the editable                                                                                                                                            |
| def               | String                                                           | No                 |               | A sort of "default value". Discussed more later.                                                                                                                             |
| placeHolder       | String                                                           | No                 |               | A message will be displayed when the editable is not being edited and the value is empty.                                                                                    |
| clear             | Boolean                                                          | No                 | false         | If true, a button with an "x" will be displayed while editing which will clear the text field when clicked                                                                   |
| preventDefault    | Boolean                                                          | No                 | false         | If true, other click behaviors beyond initiating the edit will be prevented. This neuters the effect of `editOnDoubleClick`                                                  |
| onEdit            | Function                                                         | Recommended        |               | The function to call when editing is finished. It should accept a single argument, the value entered by the user. If this is not defined, the field cannot be edited.        |
| maxWidth          | Number                                                           | No                 |               | The maximum width of the `<Editable>` when editing. If `maxWidthStatic` is not defined, it will default to this.                                                             |
| maxWidthStatic    | Number                                                           | No                 |               | The maximum width of the `<Editable>` when not editing. Defaults to `maxWidth` if not explicitly defined.                                                                    |
| following         | React Component or any value that can be interpreted as a String | No                 |               | Content which will be placed immediately after the displayed value when not editing.                                                                                         |
| multiline         | Boolean                                                          | No                 | false         | When true, the editable will wrap text that exceeds `maxStaticWidth`. Otherwise, it will all be placed on a single line and will cut off text beyond the Component's bounds. |
| className         | String                                                           | No                 |               | Extra classnames to be added to the displayed components on top of the ones included for functionality.                                                                      |
| editOnDoubleClick | Boolean                                                          | No                 | false         | When true, editing will be triggered upon a double click, rather than a single click. Ignored if `preventDefault` is true.                                                   |

How to Use
--------------------------
For basic uses, `<Editable>` is very intuitive to use. All that is necessary for basic usage is `value` and `onEdit`. With `value` set to a state variable and `onEdit` set to a
function that modifies that state variable, `<Editable>`'s entire functionality can be seen in action. It is recommended to have a `placeHolder` to display if `value` is empty.
Note that if a user edits the content of the `<Editable>` and submits a blank value, the value which is passed into `onEdit` is not a blank string but `undefined`.

The `def` prop has very little function, but its function is this: when the `value` passed into the editable is equal to `def` and the user clicks to edit the content, they will
be presented with an empty text field instead of one populated by the existing value. For example, if I create an `<Editable>` with a default value set to "Text", I might set
`def` to "Text" so that when the user clicks to edit the content, it will present them with an empty editor instead of one populated with my default value.

The other props described in the table above are largely self explanatory and do not need to be discussed here. However, there is on more feature of `<Editable>`s - they can
accept children, and if any children are passed in, these will be displayed instead of `value` when not editing, though it is best practice to have the content reflect the
value of `value` rather than being independent of it.

--------------------------

[Link to Table of Contents](index.md "Home")

--------------------------

An example of this standard in action can be seen [here](PanelFlow.md "PanelFlow Documentation")