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
Very simple component which wraps components/elements which allows these elements to be collapsed/hidden.

Props
-------------------------

| Name      | Type      | Required           | Default Value                     | Description                                                                                                                                                                                                      |
| :-------- | :-------- | :----------------: | :-------------------------------: | :------------------------------------------------------------------------------------------------------                                                                                                          |
| show      | String    | No                 | Show                              | The text displayed when the content is hidden that prompts the user to "Show" the content.                                                                                                                       |
| hide      | String    | No                 | Hide                              | The text displayed when the content is showing that prompts the user to "Hide" the content.                                                                                                                      |
| className | String    | No                 |                                   | Additional classes to be added onto the root HTML element in the Collapsible.                                                                                                                                    |
| showing   | Boolean   | No                 | false                             | Determines if the collapsible should show by default. Only has an effect when the component is mounted.                                                                                                          |
| arrow     | Function  | No                 | >>> when hidden, <<< when showing | A function which returns the content to display as the "arrow" after the show/hide text that depends on whether the collapsible is showing or hiding. This prop may be `null`, in which case no arrow will show. |

How to Use
--------------------------
Simply wrap desired content with the `<Collapsible>` component to make it collapsible.

--------------------------

[Home](index.md "Home")

--------------------------

An example of this standard in action can be seen [here](PanelFlow.md "PanelFlow Documentation")