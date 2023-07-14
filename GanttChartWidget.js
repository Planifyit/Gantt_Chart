(function() {
    const DAY_WIDTH = 10;
    const HEADER_HEIGHT = 50;
    const DEFAULT_ROW_PADDING = 10;
    const DEFAULT_WIDTH = 500;
    const SCALE_FACTOR = 2;
    const DEFAULT_ROW_HEIGHT = 20;
     const FONT_SIZE = 12;
    const ELEMENT_HEIGHT = 20;
    
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
    <style>
        .image-container {
            width: 100%;
            height: 100px;
            background-size: contain;
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
         console.log('GanttChartWidget constructor called');
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

        // GanttChart methods
static get metadata() {
     console.log('metadata getter called');
    return {
        properties: {
            myDataBinding: {
                type: "object",
                defaultValue: {}
            },
           
        }
    };
}   
        initializeCanvas(parentElt) {
                 console.log('initializeCanvas called');
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
      console.log('onCustomWidgetBeforeUpdate called with:', changedProperties);

    this._props = { ...this._props, ...changedProperties };
}
        
        onCustomWidgetAfterUpdate(changedProperties) {
             console.log('onCustomWidgetAfterUpdate called with:', changedProperties);

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
            
            if (this._momentReady && this._dateFnsReady) {
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

                    // Store the milestones
                    this.milestones = new Map(transformedData.map(milestone => [milestone.id, milestone]));

                    // Calculate the start date of the Gantt chart
                    this.startDate = Array.from(this.milestones.values()).reduce((min, milestone) => {
                        const startDate = new Date(milestone.startDate);
                        return startDate < min ? startDate : min;
                    }, new Date(Infinity));

                    // Render the chart
                    this._renderChart();
                } else {
                    console.error('Data is not an array:', dataBinding && dataBinding.data);
                }
            }
        }

        _renderChart() {
            console.log('_renderChart called');
       
            // Clear the chart element
            const chartElement = this._shadowRoot.getElementById('chart');
            while (chartElement.firstChild) {
                chartElement.removeChild(chartElement.firstChild);
            }

            // Initialize the canvas
            this.initializeCanvas(chartElement);

     
 // Set the font size
            this.ctx.font = `${FONT_SIZE}px sans-serif`;

            
            // Draw a rectangle for each milestone
            let y = HEADER_HEIGHT;
            for (let milestone of this.milestones.values()) {
                // Calculate the x coordinates of the start and end of the rectangle
                const startX = dateFns.differenceInDays(new Date(milestone.startDate), this.startDate) * DAY_WIDTH;
                const endX = dateFns.differenceInDays(new Date(milestone.endDate), this.startDate) * DAY_WIDTH;

               
                // Draw the rectangle
                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(startX, y, endX - startX, ELEMENT_HEIGHT);

                // Move to the next row
               y += ELEMENT_HEIGHT + (DEFAULT_ROW_PADDING * 2);
            }
        }
    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
     console.log('GanttChartWidget defined');
})();
