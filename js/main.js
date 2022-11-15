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
         });
});

function preprocessData() {
    for(var i = 0; i<dataset.length; i++) {
        currTextViewDataList = [];
        for(var key in textViewKeys) {
            var currText = dataset[i][textViewKeys[key]];
            currTextViewDataList.push(currText);
        }
        textViewList.push(currTextViewDataList);
    }
}

function displayTextView() {
    var searched = document.querySelector('input[name = "textViewRadioButton"]:checked').value;
    document.getElementById('textView').innerHTML = "";
    for(var i = 0; i<textViewList.length; i++) {
        var currThread = textViewList[i];
        var element = document.createElement("div");
        for(var j = 0; j<4; j++) {
            var node = document.createElement("p");
            var textVal = currThread[j].toLowerCase();
            var re = new RegExp(searched, "g");
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