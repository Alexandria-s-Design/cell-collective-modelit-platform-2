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
A more robust and React-friendly checkbox component.

Props
-------------------------

A table formatted like the one below, detailing all the props, their type,
whether or not they are required, their default value (if they have one),
and a description of what they do or what their purpose is.

| Name        | Type      | Required           | Default Value | Description                                                                       |
| :---------- | :-------- | :----------------: | :-----------: | :-------------------------------------------------------------------------------- |
| value       | Boolean   | Yes                |               | Whether or not the checkbox is checked                                            |
| onEdit      | Function  | Recommended        |               | Accepts a boolean value equal to what the value of the checkbox should be set to. |
| onMouseDown | Function  | No                 |               | Self-explanatory                                                                  |
| className   | String    | No                 |               | Additional classes to apply to the DOM element.                                   |
| title       | String    | No                 |               | Tool-tip text to display when the checkbox is hovered.                            |

How to Use
--------------------------
The only necessary props for basic functionality are `value` and `onEdit`. While `onEdit` is technically not required, the checkbox will be disabled on non-functional without it.
`value` determines whether the checkbox is checked, and `onEdit` is a callback for setting the variable that controls `value` when the checkbox is clicked. The checked state is not
managed internally, so the checkbox is completely controlled by `value` and `onEdit`.

--------------------------

[Home](index.md "Home")

--------------------------