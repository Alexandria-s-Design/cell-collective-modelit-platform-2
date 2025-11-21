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
Almost identical to [Checkbox](Checkbox.md "Checkbox"), but instead of being only on or off, the checkbox cycles through a number of
states specified by the `numStates` prop.

Props
-------------------------

A table formatted like the one below, detailing all the props, their type,
whether or not they are required, their default value (if they have one),
and a description of what they do or what their purpose is.

| Name        | Type      | Required           | Default Value | Description                                                                       |
| :---------- | :-------- | :----------------: | :-----------: | :-------------------------------------------------------------------------------- |
| value       | Boolean   | Yes                |               | Whether or not the checkbox is checked                                            |
| numStates   | Integer   | Yes                |               | The number of states to cycle through (including the off state).                  |
| onEdit      | Function  | Recommended        |               | Accepts a boolean value equal to what the value of the checkbox should be set to. |
| className   | String    | No                 |               | Additional classes to apply to the DOM element.                                   |
| title       | String    | No                 |               | Tool-tip text to display when the checkbox is hovered.                            |

How to Use
--------------------------
This component is almost identical to [Checkbox](Checkbox.md "Checkbox") apart from the cycling through states. If the checkbox is in the "off" state,
it will have no additional classes applied to it. Otherwise, it will have the `checkedN` class applied where `N` is the number of the current state. For
example, if a checkbox has `numStates`=3, then after the first click, the checkbox will have class `checked1`, then after the next click it will update to
`checked2`. The next click will set the value back to 0, and so no class will be applied. There is no default styling behavior for each checked state - this
must be manually applied through a stylesheet.

--------------------------

[Home](index.md "Home")

--------------------------