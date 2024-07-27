document.addEventListener('DOMContentLoaded', () => {
    const cityData = [
        { city: 'New York', temperature: 13.2, avgTemp: 12.5, highTemp: 19.0, lowTemp: 5.0 },
        { city: 'Los Angeles', temperature: 18.5, avgTemp: 17.0, highTemp: 25.0, lowTemp: 10.0 },
        { city: 'Chicago', temperature: 11.7, avgTemp: 10.0, highTemp: 15.0, lowTemp: 2.0 },
        { city: 'Houston', temperature: 20.0, avgTemp: 21.0, highTemp: 28.0, lowTemp: 15.0 },
        { city: 'Phoenix', temperature: 22.3, avgTemp: 23.0, highTemp: 30.0, lowTemp: 15.0 },
        { city: 'Philadelphia', temperature: 12.8, avgTemp: 12.0, highTemp: 18.0, lowTemp: 6.0 },
        { city: 'San Antonio', temperature: 19.5, avgTemp: 19.0, highTemp: 26.0, lowTemp: 13.0 },
        { city: 'San Diego', temperature: 17.9, avgTemp: 17.5, highTemp: 23.0, lowTemp: 12.0 }
    ];

    const monthlyData = {
        'New York': [2.2, 3.6, 8.2, 14.0, 19.4, 24.5, 26.2, 25.8, 21.2, 15.2, 10.5, 5.0],
        'Los Angeles': [14.5, 15.0, 16.0, 17.5, 19.1, 22.3, 24.0, 24.8, 23.9, 20.5, 17.8, 14.8],
        'Chicago': [0.2, 1.5, 6.0, 12.5, 18.5, 23.0, 25.0, 24.0, 18.5, 12.0, 7.0, 1.0],
        'Houston': [12.0, 14.5, 18.0, 22.0, 27.5, 29.5, 31.0, 30.5, 28.0, 22.5, 16.0, 12.5],
        'Phoenix': [13.5, 15.5, 18.0, 22.5, 27.0, 31.5, 34.0, 33.5, 30.0, 24.5, 18.0, 14.0],
        'Philadelphia': [1.8, 3.0, 8.0, 14.0, 20.0, 24.5, 27.0, 25.0, 20.5, 14.0, 8.5, 3.0],
        'San Antonio': [14.0, 16.0, 19.5, 23.0, 27.0, 30.0, 32.0, 31.5, 29.0, 23.5, 18.0, 14.5],
        'San Diego': [15.0, 15.5, 16.5, 17.0, 18.5, 19.0, 20.0, 20.5, 20.0, 18.0, 16.0, 15.0]
    };

    const temperatureDomain = [0, 34];

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain(temperatureDomain);

    const width = window.innerWidth * 0.8;
    const height = window.innerHeight * 0.5;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };

    const tooltip = d3.select('#tooltip');

    function updateBarChart() {
        d3.select('#chart').selectAll('*').remove();

        const svg = d3.select('#chart').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(cityData.map(d => d.city))
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(cityData, d => d.temperature)])
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        svg.append('g')
            .selectAll('.bar')
            .data(cityData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.city))
            .attr('y', d => y(d.temperature))
            .attr('width', x.bandwidth())
            .attr('height', d => height - margin.top - margin.bottom - y(d.temperature))
            .style('fill', d => colorScale(d.temperature))
            .on('mouseover', (event, d) => {
                tooltip.style('display', 'block')
                    .html(`City: ${d.city}<br>Temperature: ${d.temperature}°C`)
                    .style('left', `${event.pageX + 5}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mouseout', () => tooltip.style('display', 'none'))
            .on('click', (event, d) => showMonthlyTrend(d.city));

        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x).tickSize(0))
            .append('text')
            .attr('x', width - margin.left - margin.right + 20)
            .attr('y', 40)
            .attr('fill', '#000')
            .style('font-size', '14px')
            .style('text-anchor', 'end')
            .text('City');

        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2)
            .attr('fill', '#000')
            .style('font-size', '14px')
            .style('text-anchor', 'middle')
            .text('Temperature (°C)');

        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-width + margin.left + margin.right)
                .tickFormat('')
            );
    }

    function showMonthlyTrend(city) {
        d3.select('#chart').classed('hide', true);
        d3.select('#monthlyTrend').classed('hide', false);
        d3.select('#backButton').classed('hide', false);
        d3.select('#compareButton').classed('hide', false);
        d3.select('#details').text(`Monthly Temperature Trend for ${city}`);

        d3.select('#monthlyChart').selectAll('*').remove();

        const data = monthlyData[city];

        const svgMonthly = d3.select('#monthlyChart').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xMonth = d3.scaleBand()
            .domain(d3.range(1, 13))
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const yMonth = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        svgMonthly.append('g')
            .selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => xMonth(i + 1))
            .attr('y', d => yMonth(d))
            .attr('width', xMonth.bandwidth())
            .attr('height', d => height - margin.top - margin.bottom - yMonth(d))
            .style('fill', d => colorScale(d))
            .on('mouseover', (event, d) => {
                tooltip.style('display', 'block')
                    .html(`Temperature: ${d}°C`)
                    .style('left', `${event.pageX + 5}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mouseout', () => tooltip.style('display', 'none'));

        svgMonthly.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(xMonth).tickFormat(d => `M${d}`))
            .append('text')
            .attr('x', width - margin.left - margin.right + 20)
            .attr('y', 40)
            .attr('fill', '#000')
            .style('font-size', '14px')
            .style('text-anchor', 'end')
            .text('Month');

        svgMonthly.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yMonth).ticks(5).tickSize(-width + margin.left + margin.right))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2)
            .attr('fill', '#000')
            .style('font-size', '14px')
            .style('text-anchor', 'middle')
            .text('Temperature (°C)');

        svgMonthly.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yMonth)
                .ticks(5)
                .tickSize(-width + margin.left + margin.right)
                .tickFormat('')
            );

        const line = d3.line()
            .x((d, i) => xMonth(i + 1) + xMonth.bandwidth() / 2)
            .y(d => yMonth(d));

        svgMonthly.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line);

        // Add legend
        d3.select('#legend').selectAll('*').remove(); // Clear previous legend
        const legend = d3.select('#legend')
            .append('svg')
            .attr('width', width)
            .attr('height', 50)
            .append('g')
            .attr('transform', `translate(${margin.left}, 10)`);

        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', colorScale(d3.mean(data)));

        legend.append('text')
            .attr('x', 15)
            .attr('y', 10)
            .style('font-size', '12px')
            .text(city);
    }

    function showComparison() {
        d3.select('#chart').classed('hide', true);
        d3.select('#monthlyTrend').classed('hide', true);
        d3.select('#comparison').classed('hide', false);
        d3.select('#backButton').classed('hide', true);
        d3.select('#compareButton').classed('hide', true);
        d3.select('#backToMonthlyButton').classed('hide', false);
        d3.select('#details').text('Monthly Temperature Comparison for All Cities');

        d3.select('#comparisonChart').selectAll('*').remove();

        const svgComparison = d3.select('#comparisonChart').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xComparison = d3.scaleBand()
            .domain(d3.range(1, 13))
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const yComparison = d3.scaleLinear()
            .domain([0, d3.max(Object.values(monthlyData).flat())])
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        const colorComparison = d3.scaleOrdinal(d3.schemeCategory10);

        Object.keys(monthlyData).forEach((city, index) => {
            const line = d3.line()
                .x((d, i) => xComparison(i + 1) + xComparison.bandwidth() / 2)
                .y(d => yComparison(d));

            svgComparison.append('path')
                .datum(monthlyData[city])
                .attr('class', 'line')
                .attr('d', line)
                .style('stroke', colorComparison(city))
                .style('stroke-width', 2)
                .style('fill', 'none')
                .on('mouseover', (event, d) => {
                    tooltip.style('display', 'block')
                        .html(`City: ${city}<br>Temperature: ${d3.format('.1f')(d[0])}°C`)
                        .style('left', `${event.pageX + 5}px`)
                        .style('top', `${event.pageY - 28}px`);
                })
                .on('mouseout', () => tooltip.style('display', 'none'));
        });

        svgComparison.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(xComparison).tickFormat(d => `M${d}`))
            .append('text')
            .attr('x', width - margin.left - margin.right + 20)
            .attr('y', 40)
            .attr('fill', '#000')
            .style('font-size', '14px')
            .style('text-anchor', 'end')
            .text('Month');

        svgComparison.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yComparison).ticks(5).tickSize(-width + margin.left + margin.right))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -height / 2)
            .attr('fill', '#000')
            .style('font-size', '14px')
            .style('text-anchor', 'middle')
            .text('Temperature (°C)');

        svgComparison.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yComparison)
                .ticks(5)
                .tickSize(-width + margin.left + margin.right)
                .tickFormat('')
            );

        // Add legend
        d3.select('#legend').selectAll('*').remove(); // Clear previous legend
        const legend = d3.select('#legend')
            .append('svg')
            .attr('width', width)
            .attr('height', 50)
            .append('g')
            .attr('transform', `translate(${margin.left}, 10)`);

        Object.keys(monthlyData).forEach((city, index) => {
            legend.append('rect')
                .attr('x', index * 100)
                .attr('y', 0)
                .attr('width', 10)
                .attr('height', 10)
                .style('fill', colorComparison(city));

            legend.append('text')
                .attr('x', index * 100 + 15)
                .attr('y', 10)
                .style('font-size', '12px')
                .text(city);
        });
    }

    d3.select('#compareButton').on('click', showComparison);
    d3.select('#backToMonthlyButton').on('click', () => {
        d3.select('#chart').classed('hide', true);
        d3.select('#monthlyTrend').classed('hide', false);
        d3.select('#comparison').classed('hide', true);
        d3.select('#backButton').classed('hide', false);
        d3.select('#compareButton').classed('hide', false);
        d3.select('#backToMonthlyButton').classed('hide', true);
    });

    d3.select('#backButton').on('click', () => {
        d3.select('#chart').classed('hide', false);
        d3.select('#monthlyTrend').classed('hide', true);
        d3.select('#comparison').classed('hide', true);
        d3.select('#backButton').classed('hide', true);
        d3.select('#compareButton').classed('hide', true);
        d3.select('#details').text('Welcome to the City Temperature Visualization. Click on a city to see more details.');
    });

    updateBarChart();
});
