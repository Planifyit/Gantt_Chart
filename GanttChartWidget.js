
(function() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
   #chart {
    border: 1px solid #000;
    padding: 10px;
    margin: 10px;
  
}

.fn-gantt .leftPanel .spacer {  
height: 72px  !important;    }

.fn-gantt .row.header {      
overflow: hidden;   }
.fn-gantt .dataPanel {
        width: 216px !important;
        height: 144px  !important;
    }
.fn-gantt .rightPanel .month, .fn-gantt .rightPanel .year { 
width: 72px !important;
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
    jQueryScript.src = 'https://code.jquery.com/jquery-3.7.0.min.js';
    jQueryScript.onload = () => {
        // Use noConflict to avoid conflicts with other libraries
        const jQueryNoConflict = jQuery.noConflict(true);
        // Load jQuery UI
        const jQueryUIScript = document.createElement('script');
        jQueryUIScript.src = 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js';
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
        this.tasks = [
            {
                name: "Task 1",
                desc: "Description 1",
                values: [{
                    from: "/Date(1640995200000)/",
                    to: "/Date(1641081600000)/",
                    label: "Task 1",
                    customClass: "ganttRed"
                }]
            },
            {
                name: "Task 2",
                desc: "Description 2",
                values: [{
                    from: "/Date(1641081600000)/",
                    to: "/Date(1641168000000)/",
                    label: "Task 2",
                    customClass: "ganttRed"
                }]
            }
        ];
        this._renderChart();
    }
}


_renderChart() {
    console.log('_renderChart called');
    if (this._jQueryGanttReady) {
        console.log('this._jQuery.fn:', this._jQuery.fn);  // Log this._jQuery.fn to the console
        console.log('this._jQuery:', this._jQuery);  // Log this._jQuery to the console
        console.log('jQuery.fn.gantt:', jQuery.fn.gantt);  // Log jQuery.fn.gantt to the console
        const chartElement = this._shadowRoot.getElementById('chart');

        // Use $.ready to ensure that jquery.fn.gantt.js is loaded
        this._jQuery(document).ready(() => {
            // Add a delay before creating the chart
            setTimeout(() => {
                jQuery(chartElement).gantt({  // Use jQuery instead of this._jQuery
                    source: this.tasks,
                    navigate: 'scroll',
                    scale: 'days',
                    maxScale: 'months',
                    minScale: 'days',
                    itemsPerPage: 5,
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
            }, 100);  // delay of 100 milliseconds
        });
    }
}




    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
