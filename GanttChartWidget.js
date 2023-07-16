
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

    // Load jQuery UI CSS
    const jQueryUICSS = document.createElement('link');
    jQueryUICSS.rel = 'stylesheet';
    jQueryUICSS.href = 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css';
    this._shadowRoot.appendChild(jQueryUICSS);

    // Load jQuery Gantt CSS
    const jQueryGanttCSS = document.createElement('link');
    jQueryGanttCSS.rel = 'stylesheet';
    jQueryGanttCSS.href = 'https://cdn.jsdelivr.net/gh/taitems/jQuery.Gantt@master/css/style.css';
    this._shadowRoot.appendChild(jQueryGanttCSS);

    // Load jQuery
    const jQueryScript = document.createElement('script');
    jQueryScript.src = 'https://code.jquery.com/jquery-1.12.4.min.js';
    jQueryScript.onload = () => {
        // Use noConflict to avoid conflicts with other libraries
        const jQueryNoConflict = jQuery.noConflict(true);
        // Load jQuery UI
        const jQueryUIScript = document.createElement('script');
        jQueryUIScript.src = 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js';
        jQueryUIScript.onload = () => {
            // Load jQuery.Gantt with a delay
            setTimeout(() => {
                const jQueryGanttScript = document.createElement('script');
                jQueryGanttScript.src = 'https://cdn.jsdelivr.net/gh/taitems/jQuery.Gantt@master/js/jquery.fn.gantt.js';
                jQueryGanttScript.onload = () => {
                        console.log(jQuery.fn.gantt); 
                    this._jQueryGanttReady = true;
                    this._jQuery = jQueryNoConflict;  // Store the noConflict version of jQuery
                    this._renderChart();
                };
                this._shadowRoot.appendChild(jQueryGanttScript);
            }, 1000);  // delay of 1 second
        };
        this._shadowRoot.appendChild(jQueryUIScript);
    };
    this._shadowRoot.appendChild(jQueryScript);
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
                    name: row.dimensions_0.label,
                    desc: row.dimensions_1.label,
                    values: [{
                        from: "/Date(" + startDate.getTime() + ")/",
                        to: "/Date(" + endDate.getTime() + ")/",
                        label: row.dimensions_1.label,
                        customClass: "ganttRed"
                    }]
                };
            }
        }).filter(Boolean);  // Filter out any null values

        // Check if all tasks have valid start and end dates
        for (let task of this.tasks) {
            if (!task.values || task.values.length === 0 || !task.values[0].from || !task.values[0].to) {
                console.error('Task with null start or end date:', task);
            }
        }

        console.log('Tasks:', this.tasks);  // Log the tasks

        this._renderChart();
    }
}


_renderChart() {
    console.log('_renderChart called');
    if (this._jQueryGanttReady) {
        console.log('this._jQuery.fn:', this._jQuery.fn);  // Log this._jQuery.fn to the console
        console.log('this._jQuery:', this._jQuery);  // Log this._jQuery to the console
        const chartElement = this._shadowRoot.getElementById('chart');

        // Use $.ready to ensure that jquery.fn.gantt.js is loaded
        this._jQuery(document).ready(() => {
            this._jQuery(chartElement).gantt({
                source: this.tasks,
                navigate: 'scroll',
                scale: 'weeks',
                maxScale: 'months',
                minScale: 'days',
                itemsPerPage: 10,
                onItemClick: function(data) {
                    alert('Item clicked - show some details');
                },
                onAddClick: function(dt, rowId) {
                    alert('Empty space clicked - add an item!');
                },
                onRender: function() {
                    console.log('chart rendered');
                }
            });
        });
    }
}


    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
