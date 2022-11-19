let dataset;
let textViewList = [];
let textViewKeys = ["Text (OP)", "Reply 1", "Reply 2", "Reply 3"];
let twoWayBarList = [];
let twoWayBarListKeys = ["ID", "QuickestReply", "OPSentiment", "Total Number of Replies", "Conversation Duration"];
document.addEventListener('DOMContentLoaded', function () {
    Promise.all([d3.csv('data/DiabetesDaily2.csv')])
        .then(function (values) {
            console.log('loaded csv file');
            dataset = values[0];
            // pre-process data for visualizations, add your preprocessing in this function
            preprocessData();
            displayTextView();
            displayHistogramView();
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
        currChartList = [];
        for(var key in twoWayBarListKeys) {
            var currVal = dataset[i][twoWayBarListKeys[key]];
            currChartList.push(currVal);
        }
        twoWayBarList.push(currChartList);
    }
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
    var key = 0;
    if(parameter == "temporalButton") {
        key = 1;
    } else if(parameter == "sentimentScore") {
        key = 2;
    } else if(parameter == "replyCountButton") {
        key = 3;
    } else {
        key = 4;
    }
    var copyListForSort = twoWayBarList;
    copyListForSort.sort(sortFunction);

    function sortFunction(a, b) {
        if (a[key] === b[key]) {
            return 0;
        }
        else {
            return (a[key] < b[key]) ? -1 : 1;
        }
    }
}

function displayHistogramView() {
    var margin = { top: 10, right: 30, bottom: 80, left: 40 },
        width = 260 - margin.left - margin.right,
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
        .attr("x", width-60)
        .attr("y", height+25)
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
        .attr("x", width-60)
        .attr("y", height+25)
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

    min = 0
   max = 0
    qLen = []
    dataset.forEach(d => {
    qLen.push(+d['QuestionLength']) 
   });
   min = Math.min(...qLen)
   max = Math.max(...qLen)
   console.log(min)
    var hist3 = d3.select("#hist3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
    .domain([min, max])
        // .domain([min, d3.max(dataset, function (d) { 
            
        //     return +d['QuestionLength'] })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    hist3.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        hist3.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width-60)
        .attr("y", height+25)
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
        .attr("x", width-60)
        .attr("y", height+25)
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
        .attr("x", width-60)
        .attr("y", height+25)
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