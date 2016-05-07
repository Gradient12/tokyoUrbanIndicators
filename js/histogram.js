function plotTownStationDistribution(){
    sql = "SELECT * FROM tokyo_town_station_count";
    sqlClient.execute(sql).done(function(data){
        // console.log(data);
        var plotData = data.rows.map(function(obj){
            return obj.count;
        });
        // console.log(plotData);

        // Clear all drawn chart elements before redrawing
        d3.selectAll('.chart > g > *').remove();

        var maxValue = _.max(plotData);
        var minValue = _.min(plotData);
        var height = HistogramDefaults.plotHeight -50;
        var width = HistogramDefaults.plotWidth - 15;

        var x = d3.scale.linear()
            .domain([minValue, maxValue])
            .range([minValue, maxValue]);

        var xKDE = d3.scale.linear()
            .domain([minValue, maxValue])
            .range([0, width]);
        var yKDE = d3.scale.linear()
            .domain([0, 0.05])
            .range([height, 30]);

        var kde = kernelDensityEstimator(epanechnikovKernel(4), xKDE.ticks(100));
        var estimate = kde(plotData); // Estimated density
        console.log("estimate",estimate);
        var chart_stations = d3.select('#chart-stations')
                .attr('width', HistogramDefaults.plotWidth)
                .attr('height', HistogramDefaults.plotHeight)
                .append('g')
                .attr('transform', 'translate(' + 10 + ',' + 10 + ')');

        // Plot KDE and callouts
        var plotArea = d3.svg.area()
            .x(function(d) { return xKDE(d[0]); })
            .y0(height)
            .y1(function(d) { return yKDE(d[1]); });

        chart_stations.append('path') // Plot area for KDE
            .datum(estimate)
            .attr('class', 'kde plot')
            .attr('d', plotArea)
            .attr('fill',"rgba(255, 255, 255, 0.74)");

        var xAxis = d3.svg.axis()
            .scale(xKDE)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(yKDE)
            .orient("left")
            .tickFormat(d3.format("%"));

        chart_stations.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("stroke",'white')
            .call(xAxis);

        calloutValue = numStations;
        calloutColor ='rgb(26, 186, 80)';
        if (calloutValue !== null) { // Don't plot null vals - null is not 0
            chart_stations.append('rect') // Callouts - minValue is used for cases below 1 to avoid negInfinity on log10
                .attr('x', xKDE(calloutValue))
                .attr('y', 0)
                .attr('height', height)
                .attr('width', '2px')
                .attr('fill', calloutColor || defaultColor);
        }
    });
}



// Define object config of properties for this chart directive
var HistogramDefaults = {
    plotWidth: 260,
    plotHeight: 100,
    plotWidthPercentage: 0.8,
    barRadius: 4,
    valueField: '',
    transitionMillis: 500,
    lazyLoad: false
};

function kernelDensityEstimator(kernel, x) {
    return function(sample) {
        return x.map(function(x) {
            return [x, d3.mean(sample, function(v) { return kernel(x - v); })];
        });
    };
}

function epanechnikovKernel(scale) {
    return function(u) {
        return Math.abs(u /= scale) <= 1 ? 0.75 * (1 - u * u) / scale : 0;
    };
}

plotTownStationDistribution();
