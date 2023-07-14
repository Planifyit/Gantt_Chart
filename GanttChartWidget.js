(function() {
    const DAY_WIDTH = 10;
    const HEADER_HEIGHT = 50;
    const DEFAULT_ROW_PADDING = 10;
    const DEFAULT_WIDTH = 500;
    const SCALE_FACTOR = 2;
    const DEFAULT_ROW_HEIGHT = 20;
    const FONT_SIZE = 12;
    const ELEMENT_HEIGHT = 20;
    const COLORS = ['blue', 'green', 'red', 'purple', 'orange', 'pink', 'yellow', 'cyan', 'magenta', 'lime'];

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
            dateFnsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.0.0-alpha0/date_fns.min.js';
dateFnsScript.onload = () => {
    this._dateFnsReady = true;
    console.log('dateFns is ready');
};
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
                HEADER_HEIGHT + (this.milestones.size * (DEFAULT_ROW_HEIGHT + (DEFAULT_ROW_PADDING * 2))) * 2;

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
        const dataBinding = changedProperties.myDataBinding;
        if (dataBinding.state === 'success') {
            this._updateData(dataBinding);
        }
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
                // Check if dimensions_0, dimensions_1, dimensions_2, and dimensions_3 are defined before trying to access their properties
                if (row.dimensions_0 && row.dimensions_1 && row.dimensions_2 && row.dimensions_3) {
                    const startDate = moment(row.dimensions_2.id).format('YYYY-MM-DD');
                    const endDate = moment(row.dimensions_3.id).format('YYYY-MM-DD');
                    console.log('startDate:', startDate, 'endDate:', endDate);  // Log the start and end dates
                    return {
                        id: row.dimensions_0.label,
                        label: row.dimensions_1.label,
                        startDate: startDate,
                        endDate: endDate,
                    };
                }
            }).filter(Boolean);  // Filter out any undefined values

            // Store the milestones
            this.milestones = new Map(transformedData.map(milestone => [milestone.id, milestone]));

            // Calculate the start date of the Gantt chart
       this.startDate = Array.from(this.milestones.values()).reduce((min, milestone) => {
    const startDate = new Date(milestone.startDate);
    console.log('milestone startDate:', startDate);  // Log the start date of each milestone
    return startDate < min ? startDate : min;
}, new Date('9999-12-31'));  // Start with a date far in the future

            console.log('chartStartDate:', this.startDate);  // Log the start date of the chart

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

    // Draw the header with the months and days
    const days = dateFns.differenceInDays(new Date(this.endDate), this.startDate);
    for (let i = 0; i <= days; i++) {
        const date = dateFns.addDays(this.startDate, i);
        if (dateFns.isFirstDayOfMonth(date)) {
            this.ctx.fillText(dateFns.format(date, 'MMM'), i * DAY_WIDTH, FONT_SIZE);
        }
        this.ctx.fillText(dateFns.format(date, 'D'), i * DAY_WIDTH, FONT_SIZE * 2);
    }

    // Draw a rectangle for each milestone
    let y = HEADER_HEIGHT;
    let index = 0;  // Add an index variable
    for (let milestone of this.milestones.values()) {
        // Calculate the x coordinates of the start and end of the rectangle
        const startX = dateFns.differenceInDays(new Date(milestone.startDate), this.startDate) * DAY_WIDTH;
        const endX = dateFns.differenceInDays(new Date(milestone.endDate), this.startDate) * DAY_WIDTH;

        console.log('Drawing rectangle for milestone:', milestone, 'startX:', startX, 'endX:', endX, 'y:', y, 'startDate:', new Date(milestone.startDate), 'endDate:', new Date(milestone.endDate), 'chartStartDate:', this.startDate);  // Log the start and end dates of the milestone and the start date of the chart

     // Draw the rectangle
        this.ctx.fillStyle = COLORS[index % COLORS.length];  // Use the index to select a color
        this.ctx.fillRect(startX, y, endX - startX, ELEMENT_HEIGHT);
        
        // Draw the label on the left side of the chart
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(milestone.label, 0, y + ELEMENT_HEIGHT / 2 + FONT_SIZE / 2);

        // Move to the next row
        y += ELEMENT_HEIGHT + (DEFAULT_ROW_PADDING * 2);
          index++;  // Increment the index
    }
}

    }

    customElements.define('gantt-chart-widget', GanttChartWidget);
     console.log('GanttChartWidget defined');
})();
