let dataset;
let textViewList = [];
let textViewKeys = ["Text (OP) ", "Reply 1", "Reply 2", "Reply 3"];
document.addEventListener('DOMContentLoaded', function () {
    Promise.all([d3.csv('data/datasheet.csv')])
        .then(function (values) {
            console.log('loaded csv file');
            dataset = values[0];
            console.log(dataset);
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
}