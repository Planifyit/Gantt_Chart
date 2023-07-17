
(function() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
   #chart {
    border: 1px solid #000;
    padding: 10px;
    margin: 10px;
  /*  width: 100%; 
    max-width: 95%; 
    height: 500px; 
    overflow: auto;  
    box-sizing: border-box;  */
}

    </style>
    <div id="chart"></div>
    <a href="https://www.linkedin.com/company/planifyit" target="_blank" class="follow-link">Follow us on Linkedin - Planifyit</a>

    `;

    class GanttChartWidget extends HTMLElement {
constructor() {
    super();
    console.log('Constructor called');
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
    this._props = {};
    this.tasks = [];

// Load Frappe Gantt
const FrappeGanttScript = document.createElement('script');
FrappeGanttScript.src = 'https://unpkg.com/frappe-gantt@0.5.0/dist/frappe-gantt.min.js';
FrappeGanttScript.onload = () => {
    // Frappe Gantt is now loaded and can be used.
    this._FrappeGanttReady = true;
};
this._shadowRoot.appendChild(FrappeGanttScript);


        // GanttChart methods
        static get metadata() {
            console.log('metadata called');
            return {
                properties: {
                    myDataBinding: {
                        type: "object",
                        defaultValue: {}
                    },
                }
            };
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            console.log('onCustomWidgetBeforeUpdate called');
            this._props = { ...this._props, ...changedProperties };
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            console.log('onCustomWidgetAfterUpdate called');
            if ("myDataBinding" in changedProperties) {
                const dataBinding = changedProperties.myDataBinding;
                if (dataBinding.state === 'success') {
                    this._updateData(dataBinding);
                }
            }
        }

_updateData(dataBinding) {
    console.log('_updateData called');
    if (dataBinding && Array.isArray(dataBinding.data)) {
        this.tasks = dataBinding.data.map((row, index) => {
            if (row.dimensions_0 && row.dimensions_1 && row.dimensions_2 && row.dimensions_3) {
                const startDate = new Date(row.dimensions_2.id);
                const endDate = new Date(row.dimensions_3.id);
                // Check if startDate and endDate are valid dates
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.error('Invalid date:', row.dimensions_2.id, row.dimensions_3.id);
                    return null;
                }
                // Check if startDate is before endDate
                if (startDate > endDate) {
                    console.error('Start date is after end date:', startDate, endDate);
                    return null;
                }
                console.log('startDate:', startDate, 'endDate:', endDate);  // Log the start and end dates
                return {
                    id: 'Task ' + (index + 1),  // Unique id of task
                    name: row.dimensions_0.label,  // Name of task
                    start: startDate.toISOString().split('T')[0],  // Start date of task
                    end: endDate.toISOString().split('T')[0],  // End date of task
                    progress: 0,  // Progress of task in percent
                    dependencies: ''  // Dependencies of task
                };
            }
        }).filter(Boolean);  // Filter out any null values

        // Check if all tasks have valid start and end dates
        for (let task of this.tasks) {
            if (!task.start || !task.end) {
                console.error('Task with null start or end date:', task);
            }
        }

        console.log('Tasks:', this.tasks);  // Log the tasks

        this._renderChart();
    }
}

        
_renderChart() {
    console.log('_renderChart called');
    if (this._FrappeGanttReady) {
        const chartElement = this._shadowRoot.getElementById('chart');

        // Create a new Gantt chart
        const gantt = new window.Gantt(chartElement, this.tasks, {
            on_click: function(task) {
                console.log(task);
            },
            on_date_change: function(task, start, end) {
                console.log(task, start, end);
            },
            on_progress_change: function(task, progress) {
                console.log(task, progress);
            },
            on_view_change: function(mode) {
                console.log(mode);
            },
            custom_popup_html: function(task) {
                // the task object will contain the updated
                // dates and progress value
                return `
                    <div class="details-container">
                        <h5>${task.name}</h5>
                        <p>Expected to finish by ${task.end}</p>
                        <p>${task.progress}% completed!</p>
                    </div>
                `;
            }
        });
    }
}




    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
