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
  // Initialize GanttChart properties
        this.milestones = new Map();
        this.canvas = null;
        this.canvasWidth = null;
        this.canvasHeight = null;
        this.ctx = null;
    
    // Load moment.js
    const momentScript = document.createElement('script');
    momentScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
    momentScript.onload = () => this._momentReady = true;
    this._shadowRoot.appendChild(momentScript);

    // Load date-fns
    const dateFnsScript = document.createElement('script');
    dateFnsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.27.0/date-fns.min.js';
    dateFnsScript.onload = () => this._dateFnsReady = true;
    this._shadowRoot.appendChild(dateFnsScript);
}

    createGanttChart(parentElt, milestones, options) {
        const chart = new GanttChart(parentElt, milestones, options);
        chart.render();
    }
        // GanttChart methods
    initializeCanvas(parentElt) {
        this.canvas = document.createElement("canvas");
        parentElt.appendChild(this.canvas);

        this.canvasWidth = this.canvas.outerWidth || DEFAULT_WIDTH;
        this.canvasHeight =
            this.canvas.outerHeight ||
            HEADER_HEIGHT + (this.milestones.size * (DEFAULT_ROW_HEIGHT + (DEFAULT_ROW_PADDING * 2)));

        this.canvas.style.width = `${this.canvasWidth / SCALE_FACTOR}px`;
        this.canvas.style.height = `${this.canvasHeight / SCALE_FACTOR}px`;

        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        this.ctx = this.canvas.getContext("2d");
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
            
            if (this._ready && this._momentReady) {
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
                                startDate: moment(row.measures_0.raw).format('YYYY-MM-DD'),
                                endDate: moment(row.measures_1.raw).format('YYYY-MM-DD'),
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

            // Clear the chart element
            d3.select(this._shadowRoot.getElementById('chart')).selectAll("*").remove();

            // Call the createGanttChart function to draw the chart
            createGanttChart(this._shadowRoot.getElementById('chart'), data, options);
        }
    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
})();
