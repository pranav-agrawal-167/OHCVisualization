let dataset;
let textViewList = [];
let textViewKeys = ["Text (OP)", "Reply 1", "Reply 2", "Reply 3"];
let twoWayBarList = [];
let twoWayBarListKeys = ["ID", "QuickestReply", "OPSentiment", "Total Number of Replies", "Conversation Duration", "Reply1Sentiment", "Reply2Sentiment", "Reply3Sentiment", "OPPersonal", "Reply1Personal", "Reply2Personal", "Reply3Personal", "QuestionLength", "Text (OP)"];

let wordCloudMap = new Map();
let medicalKeyWords = ["diabetes","doctor","pharmacist","hypoglycemia","diabetic","Dexcom","Endocrinologists","CMG","Medtronic","insulin","Fasting Insulin","Medicare","A1c","Omnipod","CCS Medical","Insulet","Tandem pump", "I:C calculations","Accucheck","Free Style Libre","LADA","lantus","Tslim","U-500","U-100","ISIG","demo pod", "G5 integration","novorapid","tresiba atm","HbA1c","Dexcom g5","Enlite sensors","MDI","CGM","infusion set", "Retnox","United Federation of Insulin Pumpers","Animas Ping pumps","Medicare","Auto-immune disorder","Enlite/Guardian 3", "CGM","BG","UHC insurance","Edgepark","suspend insulin delivery","MIO infusion","gastroparesis","PCP","NPH", "Lantus","Levemir","Syringe","TruSteel","norm","norm80","Novolin R","2 vials","prebolus","NPH","Endo","basal pattern", "eversense sensor","wizard","Roche accu-check","MM pump","cold/flu","O-ring","type 1 diabetes","Cleo 90 infusion set", "cartridges","IOB","Spirit pump","scheloderma","Dexcom G5 CGM","A1C's"];
let weights = ["670G",".08 ng/mL","3.85 ng/mL","770G","94 mg/dL","6.5 mmol/L","780g","5 unit/hr","13 grams", "0.1u","7 mmol/L","3 units/hr","200 IU","530G","1.25-1.5 g per kg","50g","75g", ,"50 grams","100lbs","220","50units","20units","300 cc","260 units"];
let age = [" 40's","70's","30 years","3 months","24 years","2.5 years","3 years","2 three years","3 hours", "10-12 hours","3-4 nights","40's","4years","35 years","23 years","8 years","2.5 hours", "30 minutes","5 years","2 1/2 months","11 years","20 years","4 years","2 years","46 years","5 to 8 hours", "11 year","37 years","15 yrs","18 years","22 years","2-3 days","8-9 days","3 days","5 hours","4 hours"];
let foodMedsBody = ["Humalog","t-slim/Dexcom","Dexcom CGM","C-Peptide","C-pep","Aetna Supplement"," Dexcom G6","T:Flex","Xdrip+","blood sugar","BG tests","basal testing","carbs","Blood Sugars","Carb ratio", "Bydurion BCISE","Novolog","abdomen","stomach","blood glucose","Lantus/humolog","fruit","bread", "rice","pasta","vegetables","Scar tissue","cannula"];

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
            displayChartView();
        });
});

function preprocessData() {
    for (var i = 0; i < dataset.length; i++) {
        currTextViewDataList = [];
        let wordCloudString="";
        for (var key in textViewKeys) {
            var currText = dataset[i][textViewKeys[key]];
            if(currText!=null){
                wordCloudString+=currText;
                currTextViewDataList.push(currText);
            }
        }
        wordCloudMap.set(i,wordCloudString);
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
        currChartObj["Reply1"] = 40;
        currChartObj["Reply2"] = 40;
        currChartObj["Reply3"] = 40;
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
    var colorParameter = document.querySelector('input[name = "boxColorButton"]:checked').value;
    var boxWidth = document.querySelector('input[name = "boxWidthButton"]:checked').id;
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
    let barWidth, labelForAxis;

    if(boxWidth=="QuestionLength") {
        barWidth ='QuestionLength'
        labelForAxis = "Number of characters";
    } else if(boxWidth == "ReplyCount") {
        barWidth = 'Total Number of Replies'
        labelForAxis = "Number of Replies";
    }else {
        barWidth = 'Conversation Duration'
        labelForAxis = "Conversation duration";
    }

    if(parameter == "temporalButton") {
        copyListForSort.sort(byProperty("QuickestReply"));
    } else if(parameter == "sentimentScore") {
        copyListForSort.sort(byProperty("OPSentiment"));
    } else if(parameter == "replyCountButton") {
        copyListForSort.sort(byProperty("Total Number of Replies"));
    } else {
        copyListForSort.sort(byProperty("Conversation Duration"));
    }
    chart(copyListForSort, colorParameter, barWidth);
    displayThreadViewLegend(colorParameter,labelForAxis);
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

function chart(result, colorParameter, barWidth) {
    d3.selectAll("#chart> *").remove(); 
    var keys = Object.keys(result[0]).slice(14),
        copy = [barWidth].concat(keys);
    var svg = d3.select("#chart"),
        margin = {top: 100, right: 5, bottom: 5, left: 10},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top]);

    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .attr("class","x-axis");
    
    var yAxis = svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .attr("class", "y-axis");

    draw(result, 0);

    function draw(input, speed) {
        var barColorSentiment = d3.scaleThreshold().domain([-0.7, -0.3, 0.3, 0.7])
            .range(["#FF4760", "#FFA0AC", "white", "#B4DC7F", "green"])
        var barColorPersonal = d3.scaleThreshold().domain([0.004, 0.0082, 0.015, 0.025])
            .range(["white", "#58CCED", "#3895D3", "#1261A0", "#072F5F"])
        var barColor;
        var barColorParameters;
        if(colorParameter == "personalScore") {
            barColor = barColorPersonal;
            barColorParameters = ["OPPersonal", "Reply1Personal", "Reply2Personal", "Reply3Personal"];
        } else {
            barColor = barColorSentiment;
            barColorParameters = ["OPSentiment", "Reply1Sentiment", "Reply2Sentiment", "Reply3Sentiment"];
        }

        var data = JSON.parse(JSON.stringify(result));
        for(let i = 0; i<result.length; i++) {
            data[i][barWidth] = -data[i][barWidth];
            if(barWidth == "QuestionLength") {
                data[i]["Reply1"] = 40;
                data[i]["Reply2"] = 40;
                data[i]["Reply3"] = 40;
            } else {
                data[i]["Reply1"] = 1;
                data[i]["Reply2"] = 1;
                data[i]["Reply3"] = 1;
            }
        }

        var series = d3.stack()
            .keys(copy)
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


        var div = d3.select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "lightsteelblue")
            .style("position", "absolute")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "2px")

        bars.enter().append("rect")
            .attr("class", "bars")
            .attr("id", d => d.data.ID)
            .attr("width", x.bandwidth())
            .attr("x", d => x(d.data.ID))
            .attr("y", d => y(d[1]))
            .attr("fill", function(d){
                if(d[0] < 0) { // number of characters bar => fixed color - steelblue
                    return barColor(d.data[barColorParameters[0]]);
                } else if(d[0] == 0) { // Reply 1 bar
                    return barColor(d.data[barColorParameters[1]]);
                } else if(d[0] == 40 || d[0] == 1) { // Reply 2 bar
                    return barColor(d.data[barColorParameters[2]]);
                } else if(d[0] == 80 || d[0] == 2) { // Reply 3 bar
                    return barColor(d.data[barColorParameters[3]]);
                }
            })
            .attr("stroke", "#000")
            .attr("stroke-width", "0.3")

            .on('mousemove', function (event,d) {
                let wordCloudParam = document.querySelector('input[name = "wordCloudOption"]:checked').value;

                let row = d.data.ID;
                let rowText = wordCloudMap.get(row);
                let wordCloudType =medicalKeyWords;
                if (wordCloudParam == "weight"){
                    wordCloudType = weights;
                }else if (wordCloudParam == "age"){
                    wordCloudType = age;
                }else if(wordCloudParam == "foodMedsBody"){
                    wordCloudType = foodMedsBody;
                }
                let _html = "";

                if(rowText!=undefined) {
                    wordCloudType = wordCloudType.filter((str) =>
                        rowText.toLowerCase().includes(str.toLowerCase()));
                    for(let index in wordCloudType){
                        let wordString = wordCloudType[index];
                        _html += "<p>"+ wordString[0].toUpperCase() + wordString.slice(1)+"</p>";
                    }
                }



                d3.select(this).transition()
                    .duration('100')
                    .style('opacity', '1')
                    .attr('stroke-width','4');

                div.transition()
                    .duration(100)
                    .style("opacity", 1);

                div.html(_html)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px")
                    .style("opacity", 1);
            })
            .on('mouseout', function (event,d) {

                d3.select(this).transition()
                    .duration('50')
                    .style('opacity', '1')
                    .attr('stroke-width','0.3')
                    .style("stroke","black");

                div.transition()
                    .duration(50)
                    .style("opacity", 0);
            })
            .merge(bars)
        .transition().duration(speed)
            .attr("y", d => y(d[1]))
            .attr("height", d => Math.abs(y(d[0])) - y(d[1]))

        xAxis.transition().duration(speed)
            .attr("transform", "translate(0," + y(0) + ")")
            .call(d3.axisBottom(x).tickValues(0));

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

function displayThreadViewLegend(boxColor,labelForAxis) {
    var svg = d3.select("#chart")
    if(boxColor == "sentimentScore") {
        textLeft = "Negative"
        textRight = "Positive"
        color1 = "red"
        color2 = "pink"
        color3 = "white"
        color4 = "lightgreen"
        color5 = "green"
        x = -690
    } else {
        textLeft = "Not Personal"
        textRight = "Personal"
        color1 = "white"
        color2 = "#58CCED"
        color3 = "#3895D3"
        color4 = "#1261A0"
        color5 = "#072F5F"
        x = -725
    }
    var rectX = -95;
    svg.append("text").attr("x", x).attr("y", -85).attr('transform', 'rotate(-90 -0 0)').text(textLeft).style("font-size", "20px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", -550).attr("y", -85).attr('transform', 'rotate(-90 -0 0)').text(textRight).style("font-size", "20px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", -670).attr("y", -35).attr('transform', 'rotate(-90 -0 0)').text(labelForAxis).style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("rect")
    .attr("x", rectX)
    .attr("y", 595)
    .attr("width", 10)
    .attr("height", 10)
    .attr("style", "outline: thin solid black;")
    .style("fill", color1);
    svg.append("rect")
    .attr("x", rectX)
    .attr("y", 585)
    .attr("width", 10)
    .attr("height", 10)
    .attr("style", "outline: thin solid black;")
    .style("fill", color2);
    svg.append("rect")
    .attr("x", rectX)
    .attr("y", 575)
    .attr("width", 10)
    .attr("height", 10)
    .attr("style", "outline: thin solid black;")
    .style("fill", color3);
    svg.append("rect")
    .attr("x", rectX)
    .attr("y", 565)
    .attr("width", 10)
    .attr("height", 10)
    .attr("style", "outline: thin solid black;")
    .style("fill", color4);
    svg.append("rect")
    .attr("x", rectX)
    .attr("y", 555)
    .attr("width", 10)
    .attr("height", 10)
    .attr("style", "outline: thin solid black;")
    .style("fill", color5);
}