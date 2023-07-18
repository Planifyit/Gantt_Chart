(function() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
#chart {
    border: 1px solid #000;
    padding: 10px;
    margin: 10px;
    width: 100%;  /* Set the width */
    max-width: 95%; /* Add this line */
    height: 500px;  /* Set the height */
    overflow: hidden;  /* Change this line */
    box-sizing: border-box;  /* Add this line */
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

            // Load DHTMLX Gantt CSS
            const dhtmlxGanttCSS = document.createElement('link');
            dhtmlxGanttCSS.rel = 'stylesheet';
            dhtmlxGanttCSS.href = 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css';
            this._shadowRoot.appendChild(dhtmlxGanttCSS);

            // Load DHTMLX Gantt
            const dhtmlxGanttScript = document.createElement('script');
            dhtmlxGanttScript.src = 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js';
            dhtmlxGanttScript.onload = () => {
                this._dhtmlxGanttReady = true;
                this._renderChart();
            };
            this._shadowRoot.appendChild(dhtmlxGanttScript);
        }






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
  
                
                console.log('original startDate:', row.dimensions_2.id , 'endDate:', row.dimensions_3.id);  // Log the start and end dates
       
                const [startDay, startMonth, startYear] = row.dimensions_2.id.split('-');
                const startDate = new Date(`${startYear}-${startMonth}-${startDay}`);
                const [endDay, endMonth, endYear] = row.dimensions_3.id.split('-');
                const endDate = new Date(`${endYear}-${endMonth}-${endDay}`);
               
                console.log('original startDate:', startDate, 'endDate:', endDate);  // Log the start and end dates
       
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
                    id: index + 1,  // Unique id of task
                    text: row.dimensions_0.label,  // Name of task
                    start_date: startDate.toISOString().split('T')[0],  // Start date of task
                    end_date: endDate.toISOString().split('T')[0],  // End date of task
                    progress: 0,  // Progress of task in percent
                    open: true  // Task is open by default
                };
            }
        }).filter(Boolean);  // Filter out any null values

        // Check if all tasks have valid start and end dates
        for (let task of this.tasks) {
            if (!task.start_date || !task.end_date) {
                console.error('Task with null start or end date:', task);
            }
        }

        console.log('Tasks:', this.tasks);  // Log the tasks

        this._renderChart();
    }
}


_renderChart() {
    console.log('_renderChart called');
    if (this._dhtmlxGanttReady) {
        const chartElement = this._shadowRoot.getElementById('chart');

        // Initialize the Gantt chart
        gantt.init(chartElement);

        // Load the tasks into the Gantt chart
        gantt.parse({ data: this.tasks });

        console.log('Gantt chart rendered');
    }
}





    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
