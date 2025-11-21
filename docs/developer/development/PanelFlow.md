<style>
	td {
		font-family: "Courier New", monospace;
	}
	div > p:last-of-type{
		text-align: center;
	}
</style>

Overview
------------------------------------------------------
The PanelFlow component is a layout utility class that takes in several panels and automatically
lays them out in a vertical flow - one after another - according to their height. Each inner panel
is set to automatically fit to its contents, and each panel is placed directly below the previous
one in the flow.

Requirements
-------------------------------------------------------
- All children must be Panels or React Fragments containing only Panels.
- If the PanelFlow is in a view, the view should be passed into PanelFlow like this:
		<PanelFlow view={view} ...>...</PanelFlow>
	and NOT like this:

		<PanelFlow {...view} ...>...</PanelFlow>

Props
-------------------------------------------------------

| Name       | Type                | Required    | Default Value | Description                                                                                                          |
| :--------- | :------------------ | :---------: | :-----------: | :------------------------------------------------------------------------------------------------------------------- |
| view       | Object              | Recommended | {}            | Information about the view that the panel flow is in. Only important if the PanelFlow is inside of a view component. |
| top        | Integer             | No          | 0             | Vertically offsets the PanelFlow by the number of pixels specified.                                                  |
| left       | Integer             | No          | 0             | Horizontally offsets the PanelFlow by the number of pixels specified.                                                |
| spacing    | Integer             | No          | 0             | Spaces the panels in the flow apart by the number of pixels specified.                                               |
| scrollable | Boolean/Integer     | No          | false         | Makes the flow scrollable. If a positive integer is provided, this will be the scroll speed of the scrollable.       |

How to Use
-------------------------------------------------------
PanelFlow is very simple to use. As stated above, all of its children must
be Panels or React Fragments that only contain Panels. These Panels will be
automatically arranged sequentially, each one below the previous Panel in the
flow. Additional props may be passed into the Panels in a PanelFlow to adjust
their size or positioning, but this is not necessary. Below is a table of these
props.

| Name         | Type    | Description                                                                                                   |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| layoutHeight | Integer | The height of the panel in the layout. This determines the top-to-bottom height of the Panel's content box.   |
| innerHeight  | Integer | The height of the panel's content - this is the height of the content only, not including padding or margins. |
| top          | Integer | Vertically offsets the Panel by the specified number of pixels.                                               |

There is a utility function for calculating helpful height values when the Panel contains
only a table: HeightFunctions.TableHeight(rowsVisible)

If you pass this into innerHeight, it will automatically fit the panel to fit a `<Table />`
component, displaying at most rowsVisible rows.

---------------------------

[Home](index.md "Home")

---------------------------