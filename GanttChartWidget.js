(function() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
       #chart {
        border: 1px solid #000;
        padding: 10px;
        margin: 10px;
        width: 100%;  /* Set the width */
        height: 500px;  /* Set the height */
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

            // Load moment.js
            const momentScript = document.createElement('script');
            momentScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
            momentScript.onload = () => this._momentReady = true;
            this._shadowRoot.appendChild(momentScript);

            // Load frappe-gantt ES5 version
            const frappeGanttScript = document.createElement('script');
            frappeGanttScript.src = 'https://unpkg.com/frappe-gantt/dist/frappe-gantt.js';
            frappeGanttScript.onload = () => {
                this._frappeGanttReady = true;
                this._renderChart();
            };
            this._shadowRoot.appendChild(frappeGanttScript);
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
            if (this._momentReady) {
                if (dataBinding && Array.isArray(dataBinding.data)) {
                    this.tasks = dataBinding.data.map(row => {
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
                                id: row.dimensions_0.label,
                                name: row.dimensions_1.label,
                                start: startDate,
                                end: endDate,
                                progress: 0,
                                dependencies: ''
                            };
                        }
                    }).filter(Boolean);  // Filter out any null values

                    // Check if all tasks have valid start and end dates
                    for (let task of this.tasks) {
                        if (task.start === null || task.end === null) {
                            console.error('Task with null start or end date:', task);
                        }
                    }

                    console.log('Tasks:', this.tasks);  // Log the tasks

                    this._renderChart();
                }
            }
        }

        _renderChart() {
            console.log('_renderChart called');
            if (this._frappeGanttReady) {
                const chartElement = this._shadowRoot.getElementById('chart');
                new Gantt(chartElement, this.tasks, {
                    view_mode: 'Month',
                    language: 'en'
                });
            }
        }
    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
