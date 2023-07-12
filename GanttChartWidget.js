(function() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
        .image-container {
            width: 100%;
            height: 100px;
            background:url background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
        .arc {
            stroke: #fff;
            transition: transform 0.3s ease-out;
        }
        .arc:hover {
            transform: scale(1.1);
            cursor: pointer;
        }
        .arc text {
            fill: #fff;
            font: 10px sans-serif;
            text-anchor: middle;
        }
        #chart {
            border: 1px solid #000;
            padding: 10px;
            margin: 10px;
        }
    </style>
    <div class="image-container"> <svg width="750" height="100">  </svg></div>   
    <div id="chart"></div>
    <a href="https://www.linkedin.com/company/planifyit" target="_blank" class="follow-link">Follow us on Linkedin - Planifyit</a>
    `;

    class GanttChartWidget extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({mode: 'open'});
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
            this._props = {};

            // Load D3.js
            const script = document.createElement('script');
            script.src = 'https://d3js.org/d3.v5.min.js';
            script.onload = () => this._ready = true;
            this._shadowRoot.appendChild(script);
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            this._props = { ...this._props, ...changedProperties };
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            if ("myDataBinding" in changedProperties) {
                this._updateData(changedProperties.myDataBinding);
            }
        }

        _updateData(dataBinding) {
            if (this._ready) {
                // Check if dataBinding and dataBinding.data are defined
                if (dataBinding && Array.isArray(dataBinding.data)) {
                    // Transform the data into the correct format
                    const transformedData = dataBinding.data.map(row => {
                        return {
                            id: row.dimensions_0.label,
                            label: row.dimensions_1.label,
                            startDate: row.dimensions_2.label,
                            endDate: row.dimensions_3.label,
                            duration: row.measures_0.raw,
                            dependsOn: row.dimensions_4.label
                        };
                    });

                    this._renderChart(transformedData);
                } else {
                    console.error('Data is not an array:', dataBinding && dataBinding.data);
                }
            }
        }

        _renderChart(data) {
            // Here, you would adapt the Gantt chart rendering code you provided to work with the transformed data
            // and the D3.js library. This will involve replacing the placeholder with this._shadowRoot.getElementById('chart')
            // and adjusting the code to work within the context of a custom widget.
        }
    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
