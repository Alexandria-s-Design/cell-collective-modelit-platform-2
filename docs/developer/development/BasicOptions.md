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
Wraps the functionality of the complex `<Options>` component,
providing a simple dropdown menu component with little flexibility
but with extreme ease-of-use compared to the fully-featured `<Options>`.

Props
-------------------------

| Name          | Type               | Required           | Default Value | Description                                  |
| :------------ | :----------------- | :----------------: | :-----------: | :------------------------------------------- |
| options       | Array              | Yes                |               | The options to choose from                   |
| onChange      | Function           | No                 |               | A function called when the value is changed. |
| none          | String             | No                 | None          | A value displayed when no value is selected. |
| isScrollable  | Boolean            | No                 | false         | See `isScrollable` [here](Options.md)        |
| forcePosition | Object             | No                 |               | See `forcePosition` [here](Options.md)       |

How to Use
--------------------------
`<BasicOptions>`, like `<Options>`, produces a dropdown menu. However, it is significantly easier to use, and thus requires less
time to setup. This comes at the cost of flexibility and editability, but these are not often needed, so they can be easily
ignored in favor of ease-of-use. `<BasicOptions>` wraps `<Options>` and automatically populates the props to attain an intuitive
dropdown box functionality.

Unlike `<Options>`, `<BasicOptions>` accepts an array populated with simple string values instead of complex objects. `<BasicOptions>`
also internally manages the selection mechanism, so `onChange` isn't responsible for a state variable that is fed back into the
component; rather, it is merely offered as a way to catch and handle value changes when they occur. You could theoretically use
`<BasicOptions>` without an `onChange` callback by storing the `<BasicOptions>` in a ref and directly accessing its state variable from
there, but this is less than ideal when it comes to good practice when writing React code. It is much better practice to catch value
changes with `onChange`.

Please note that passing a Seq into `options` in a `<BasicOptions>` component will trigger an error. You must pass in an array. This
is undesirable behavior and should be changed in the future.

--------------------------

[Home](index.md "Home")

--------------------------