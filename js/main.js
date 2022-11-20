let dataset;
let textViewList = [];
let textViewKeys = ["Text (OP)", "Reply 1", "Reply 2", "Reply 3"];
let twoWayBarList = [];
let twoWayBarListKeys = ["ID", "QuickestReply", "OPSentiment", "Total Number of Replies", "Conversation Duration", "Reply1Sentiment", "Reply2Sentiment", "Reply3Sentiment", "Text (OP)"];
document.addEventListener('DOMContentLoaded', function () {
    Promise.all([d3.csv('data/DiabetesDaily2.csv')])
        .then(function (values) {
            console.log('loaded csv file');
            dataset = values[0];
            // pre-process data for visualizations, add your preprocessing in this function
            preprocessData();
            displayTextView();
            displayHistogramView();
            scatterPlot();
        });
});

function preprocessData() {
    for (var i = 0; i < dataset.length; i++) {
        currTextViewDataList = [];
        for (var key in textViewKeys) {
            var currText = dataset[i][textViewKeys[key]];
            currTextViewDataList.push(currText);
        }
        textViewList.push(currTextViewDataList);

        var currChartObj = {};
        for(var key in twoWayBarListKeys) {
            if(twoWayBarListKeys[key] == "Text (OP)") {
                var currVal = +dataset[i][twoWayBarListKeys[key]].length;
                currChartObj[twoWayBarListKeys[key]] = -currVal;
            } else {
                var currVal = dataset[i][twoWayBarListKeys[key]];
                currChartObj[twoWayBarListKeys[key]] = +currVal;
            }
        }
        currChartObj["Reply1"] = 20;
        currChartObj["Reply2"] = 20;
        currChartObj["Reply3"] = 20;
        twoWayBarList.push(currChartObj);
    }
}

function scatterPlot(){
    // set the dimensions and margins of the graph
    const margin = {top: 5, right: 30, bottom: 30, left: 30},
            width = 350 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
    
            
    // append the svg object to the body of the page
    const svg = d3.select("#scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    //Read the data
    d3.csv("data/out.csv").then( function(data) {

        
        var c_data  = []
        var thread = []
        for(i = 0;i<data.length;i++){
            c_data.push(data[i]['tsne1'])
            thread.push(i)
        }
        max_y = d3.max(c_data)

        // Add X axis
        const x = d3.scaleLinear()
        .domain([-140, 70])
        .range([ 0, width ]);
        svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
    
        // Add Y axis
        const y = d3.scaleLinear()
        .domain([-40, 80])
        .range([ height, 0]);
        svg.append("g")
        .call(d3.axisLeft(y));
    
        // Add dots
        svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
            .attr("cx", function (d) { return x(d.tsne1); } )
            .attr("cy", function (d) { return y(d.tsne2); } )
            .attr("r", 1.5)
            .style("fill", "#69b3a2")
    
    })
}

function displayTextView() {
    var searched = document.querySelector('input[name = "textViewRadioButton"]:checked').value;
    var re = new RegExp(searched, "g");
    document.getElementById('textView').innerHTML = "";
    for (var i = 0; i < textViewList.length; i++) {
        var currThread = textViewList[i];
        var element = document.createElement("div");
        for (var j = 0; j < 4; j++) {
            var node = document.createElement("p");
            var textVal = currThread[j].toLowerCase();
            var newText = textVal.replace(re, `<mark style="background: #00ced1!important">${searched}</mark>`);
            node.innerHTML = newText;
            element.appendChild(node);
        }
        document.getElementById('textView').appendChild(element);
        var hrLine = document.createElement("hr");
        hrLine.style.height = "1px";
        hrLine.style.backgroundColor = "black";
        document.getElementById('textView').appendChild(hrLine);
    }
}

function displayChartView() {
    var parameter = document.querySelector('input[name = "verticalOrderButton"]:checked').value;
    var copyListForSort = twoWayBarList;
    var byProperty = function(prop) {
        return function(a,b) {
            if (typeof a[prop] == "number") {
                return (a[prop] - b[prop]);
            } else {
                return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
            }
        };
    };
    if(parameter == "temporalButton") {
        copyListForSort.sort(byProperty("QuickestReply"));
    } else if(parameter == "sentimentScore") {
        copyListForSort.sort(byProperty("OPSentiment"));
    } else if(parameter == "replyCountButton") {
        copyListForSort.sort(byProperty("Total Number of Replies"));
    } else {
        copyListForSort.sort(byProperty("Conversation Duration"));
    }
    chart(copyListForSort);
}

function displayHistogramView() {
    var margin = { top: 10, right: 30, bottom: 80, left: 40 },
        width = 260,
        height = 200 - margin.top - margin.bottom;

    var hist1 = d3.select("#hist1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return +d['Total Number of Replies'] })])
        .range([0, width]);
    hist1.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    hist1.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width - 60)
        .attr("y", height + 25)
        .style("font-size", "10px")
        .text("Total Number of Replies");

    var histogram = d3.histogram()
        .value(function (d) {
            return +d['Total Number of Replies'];
        })
        .domain(x.domain())
        .thresholds(x.ticks(15));

    var bins = histogram(dataset);

    var y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, function (d) {
        return d.length;
    })]);
    hist1.append("g")
        .call(d3.axisLeft(y));

    hist1.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function (d) { return height - y(d.length); })
        .style("fill", "#69b3a2")


    //-------------------------------------hist2-------------------------------------

    var hist2 = d3.select("#hist2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return +d['Conversation Duration'] })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    hist2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    hist2.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width - 60)
        .attr("y", height + 25)
        .style("font-size", "10px")
        .text("'Conversation Duration");

    var histogram = d3.histogram()
        .value(function (d) {
            return +d['Conversation Duration'];
        })
        .domain(x.domain())
        .thresholds(x.ticks(3));

    var bins = histogram(dataset);

    var y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, function (d) {
        return d.length;
    })]);
    hist2.append("g")
        .call(d3.axisLeft(y));

    hist2.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function (d) { return height - y(d.length); })
        .style("fill", "#69b3a2")

    //----------------------------------hist3---------------------------------------------------

    h3_width = 400,
    h3_height = 200 - margin.top - margin.bottom;
    min = 0
    max = 0
    qLen = []
    dataset.forEach(d => {
        qLen.push(+d['QuestionLength'])
    });
    min = Math.min(...qLen)
    max = Math.max(...qLen)
    var hist3 = d3.select("#hist3")
        .append("svg")
        .attr("width", h3_width + margin.left + margin.right)
        .attr("height", h3_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([min, max])
        .range([0, h3_width]);
    hist3.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    hist3.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", h3_width - 200)
        .attr("y", height + 25)
        .style("font-size", "10px")
        .text("QuestionLength");

    var histogram = d3.histogram()
        .value(function (d) {
            return +d['QuestionLength'];
        })
        .domain(x.domain())
        .thresholds(x.ticks(8));

    var bins = histogram(dataset);

    var y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, function (d) {
        return d.length;
    })]);
    hist3.append("g")
        .call(d3.axisLeft(y));

    hist3.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function (d) { return height - y(d.length); })
        .style("fill", "#69b3a2")


    // -----------------------------------------------------------hist4------------------------------------------------------------
    var hist4 = d3.select("#hist4")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return +d['PersonalScores'] })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    hist4.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    hist4.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width - 100)
        .attr("y", height + 25)
        .style("font-size", "10px")
        .text("PersonalScores");

    var histogram = d3.histogram()
        .value(function (d) {
            return +d['PersonalScores'];
        })
        .domain(x.domain())
        .thresholds(x.ticks(8));

    var bins = histogram(dataset);

    var y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, function (d) {
        return d.length;
    })]);
    hist4.append("g")
        .call(d3.axisLeft(y));

    hist4.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function (d) { return height - y(d.length); })
        .style("fill", "#69b3a2")



    // -----------------------------------------------------------------hist5-----------------------------------------------------------
    var hist5 = d3.select("#hist5")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return +d['CompoundSentimentScore'] })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    hist5.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    hist5.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width - 60)
        .attr("y", height + 25)
        .style("font-size", "10px")
        .text("CompoundSentimentScore");

    var histogram = d3.histogram()
        .value(function (d) {
            return +d['CompoundSentimentScore'];
        })
        .domain(x.domain())
        .thresholds(x.ticks(8));

    var bins = histogram(dataset);

    var y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, function (d) {
        return d.length;
    })]);
    hist5.append("g")
        .call(d3.axisLeft(y));

    hist5.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function (d) { return height - y(d.length); })
        .style("fill", "#69b3a2")
}

function chart(result) {
    d3.selectAll("#chart> *").remove(); 
    var keys = Object.keys(result[0]).slice(8),
        copy = [].concat(keys);
    var svg = d3.select("#chart"),
        margin = {top: 5, right: 5, bottom: 5, left: 10},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top]);

    var color = d3.scaleOrdinal()
        .range(["steelblue", "darkorange", "lightblue", "crimson","green"]);

    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .attr("class","x-axis");

    var yAxis = svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .attr("class", "y-axis");

    draw("QuickestReply", 0, keys);

    function draw(input, speed) {
        var barColor = d3.scaleThreshold().domain([-1, -0.3, 0.3])
            .range(["steelblue", "red", "white", "green"])

        var data = result;

        var series = d3.stack()
            .keys(keys)
            .offset(d3.stackOffsetDiverging)(data);

        x.domain(data.map(d => d.ID));

        y.domain([
            d3.min(series, stackMin), 
            d3.max(series, stackMax)
        ]).nice();

        var barGroups = svg.selectAll("g.layer")
            .data(series, d => d.key);

        barGroups.exit().remove();

        barGroups.enter().insert("g", ".x-axis")
            .classed('layer', true);

        var bars = svg.selectAll("g.layer").selectAll(".bars")
            .data(d => d, d => d.data.ID);

        bars.exit().remove();

        bars.enter().append("rect")
            .attr("class", "bars")
            .attr("width", x.bandwidth())
            .attr("x", d => x(d.data.ID))
            .attr("y", d => y(d[1]))
            .attr("fill", function(d){
                if(d[0] < 0) { // number of characters bar => fixed color - steelblue
                    return barColor(-100);
                } else if(d[0] == 0) { // Reply 1 bar
                    return barColor(d.data.Reply1Sentiment);
                } else if(d[0] == 20) { // Reply 2 bar
                    return barColor(d.data.Reply2Sentiment);
                } else if(d[0] == 40) { // Reply 3 bar
                    return barColor(d.data.Reply3Sentiment);
                }
            })
            .merge(bars)
        .transition().duration(speed)
            .attr("y", d => y(d[1]))
            .attr("height", d => Math.abs(y(d[0])) - y(d[1]))

        xAxis.transition().duration(speed)
            .attr("transform", "translate(0," + y(0) + ")")
            .call(d3.axisBottom(x));

        yAxis.transition().duration(speed)
            .call(d3.axisLeft(y));
    }
}

function stackMin(serie) {
    return d3.min(serie, function(d) { return d[0]; });
}

function stackMax(serie) {
    return d3.max(serie, function(d) { return d[1]; });
}