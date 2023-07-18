# Gantt Chart Widget for SAP Analytics Cloud

![Planifyit Logo](https://planifyit.github.io/Pie_chart/PlanifyIT_Logo2.png)


This is a custom widget for SAP Analytics Cloud that displays a Gantt chart using the DHTMLX Gantt library. The widget is designed to be used with data that includes start and end dates for tasks, as well as task names and progress.

## Features

- Displays a Gantt chart with tasks, start and end dates, and progress.
- Tasks are displayed as bars on the chart, with the length of the bar representing the duration of the task.
- The progress of each task is represented by a darker section within the task bar.
- The chart is read-only and does not allow for adding, modifying, or deleting tasks.

## Usage

1. Add the widget to your SAP Analytics Cloud dashboard.
2. Bind the `myDataBinding` data binding to your data source. The data source should include the following fields:
   - `dimensions_0`: The unique ID of each task.
   - `dimensions_1`: The name of each task.
   - `dimensions_2`: The start date of each task, in the format `YYYY-MM-DD`.
   - `dimensions_3`: The end date of each task, in the format `YYYY-MM-DD`.
   - `measures_0`: The progress of each task, as a decimal between 0 and 1.
   - `dimensions_4`: A boolean value indicating whether the task is open or closed.

## Installation

The widget can be installed by adding it to your SAP Analytics Cloud dashboard and linking it to the `GanttChartWidget.js` and `GanttChartWidget.json` files.

The `GanttChartWidget.js` file contains the JavaScript code for the widget, and the `GanttChartWidget.json` file contains the configuration for the widget.

The files can be hosted on any server that is accessible from your SAP Analytics Cloud instance. The URL of the `GanttChartWidget.js` file should be specified in the `url` field of the `webcomponents` array in the `GanttChartWidget.json` file.

## Customization

The appearance of the widget can be customized by modifying the CSS in the `GanttChartWidget.js` file. The size of the widget can be adjusted by changing the `width` and `height` properties in the `GanttChartWidget.json` file.

## License

This widget is open source and can be used and modified freely.

## Support

For any issues or questions, please contact the vendor, Planifyit.

## Disclaimer

This widget is provided as-is, without any warranty. Use at your own risk.
