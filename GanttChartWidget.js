(function() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
        <style>
            /* Add your CSS styling here */
        </style>
        <div id="chart"></div>
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
