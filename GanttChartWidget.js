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
        console.log('dataBinding:', dataBinding);
        if (!dataBinding) {
            console.error('dataBinding is undefined');
        }
        if (!dataBinding || !dataBinding.data) {
            console.error('dataBinding.data is undefined');
        }
        
        if (this._ready) {
            // Check if dataBinding and dataBinding.data are defined
            if (dataBinding && Array.isArray(dataBinding.data)) {
                // Transform the data into the correct format
                const transformedData = dataBinding.data.map(row => {
                    console.log('row:', row);
                    // Check if dimensions_0, dimensions_1, measures_0, and measures_1 are defined before trying to access their properties
                    if (row.dimensions_0 && row.dimensions_1 && row.measures_0 && row.measures_1) {
                        return {
                            id: row.dimensions_0.label,
                            label: row.dimensions_1.label,
                            startDate: row.measures_0.raw,
                            endDate: row.measures_1.raw,
                            dependsOn: []  // You would need to modify this if your data includes dependencies
                        };
                    }
                }).filter(Boolean);  // Filter out any undefined values

                this._renderChart(transformedData);
            } else {
                console.error('Data is not an array:', dataBinding && dataBinding.data);
            }
        }
    }

    _renderChart(data) {
        console.log('data', data);

        // Prepare options for the chart
        const options = {
            elementHeight: 20,
            sortMode: 'date',
            svgOptions: {
                width: this._props.width || 500,
                height: this._props.height || 500,
                fontSize: 12
            }
        };

        // Call the createGanttChart function to draw the chart
        createGanttChart(this._shadowRoot.getElementById('chart'), data, options);
    }
}

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
