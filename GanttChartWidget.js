(function() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
        #chart {
            border: 1px solid #000;
            padding: 10px;
            margin: 10px;
        }
    </style>
    <div id="chart"></div>
    `;

    class GanttChartWidget extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({mode: 'open'});
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            // Example tasks
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

            // Load jQuery
            const jQueryScript = document.createElement('script');
            jQueryScript.src = 'https://code.jquery.com/jquery-3.7.0.min.js';
            jQueryScript.onload = () => {
                // Load jQuery UI
                const jQueryUIScript = document.createElement('script');
                jQueryUIScript.src = 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js';
                jQueryUIScript.onload = () => {
                    // Load jQuery.Gantt
                    const jQueryGanttScript = document.createElement('script');
                    jQueryGanttScript.src = 'https://cdn.jsdelivr.net/gh/taitems/jQuery.Gantt@master/js/jquery.fn.gantt.js';
                    jQueryGanttScript.onload = () => {
                        this._renderChart();
                    };
                    this._shadowRoot.appendChild(jQueryGanttScript);
                };
                this._shadowRoot.appendChild(jQueryUIScript);
            };
            this._shadowRoot.appendChild(jQueryScript);
        }

        _renderChart() {
            const chartElement = this._shadowRoot.getElementById('chart');
            jQuery(chartElement).gantt({
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
        }
    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
