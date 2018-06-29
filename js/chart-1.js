function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}

function createDoughnutChart(objectName, data) {
    let canvas = document.getElementById(objectName);
    if (canvas === null) {
        return;
    }
    let userId = document.body.getAttribute("data-user-id");
    let labels = ("langRepoCount" === objectName) ?  Object.keys(strMapToObj(data.getLangRepoCount())) :(("langStarCount" === objectName)? Object.keys(strMapToObj(data.getLangStarCount())):(("langCommitCount" === objectName)?Object.keys(strMapToObj(data.getLangCommitCount())) :((objectName === "repoCommitCount")? Object.keys(strMapToObj(data.getRepoCommitCount())) : ((objectName === "repoStarCount")? Object.keys(strMapToObj(data.getRepoStarCount())) : '' ) )));
    let values; 
    let colors = createColorArray(labels.length);
    let tooltipInfo = null;
    window.languageColors = window.languageColors || {};
    if ("langRepoCount" === objectName) {
       
        values = Object.values(strMapToObj(data.getLangRepoCount()));
        // when the first language-set is loaded, set a color-profile for all languages
        labels.forEach((language, i) => languageColors[language] = colors[i]);
    }
    if ("langStarCount" === objectName) {
       
        values = Object.values(strMapToObj(data.getLangStarCount()));
       
    }
    if ("langCommitCount" === objectName) {
       
        values = Object.values(strMapToObj(data.getLangCommitCount()));
       
    }
    if (["langRepoCount", "langStarCount", "langCommitCount"].indexOf(objectName) > -1) {
        // if the dataset is language-related, load color-profile
        labels.forEach((language, i) => colors[i] = languageColors[language]);
    }
    if (objectName === "repoCommitCount") {
       
        values = Object.values(strMapToObj(data.getRepoCommitCount()));
       

        tooltipInfo = strMapToObj(data.getRepoCommitCountDescriptions()); // high quality programming
        arrayRotate(colors, 4); // change starting color
    }
    if (objectName === "repoStarCount") {
       
        values = Object.values(strMapToObj(data.getRepoStarCount()));
       

        tooltipInfo = strMapToObj(data.getRepoStarCountDescriptions()); // high quality programming
        arrayRotate(colors, 2); // change starting color
    }
    new Chart(canvas.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            animation: false,
            rotation: (-0.40 * Math.PI),
            legend: { // todo: fix duplication ?
                position: window.innerWidth < 600 ? "bottom" : "left",
                labels: {
                    fontSize: window.innerWidth < 600 ? 10 : 12,
                    padding: window.innerWidth < 600 ? 8 : 10,
                    boxWidth: window.innerWidth < 600 ? 10 : 12
                }
            },
            tooltips: {
                callbacks: {
                    afterLabel: function (tooltipItem, data) {
                        if (tooltipInfo !== null) {
                            return wordWrap(tooltipInfo[data["labels"][tooltipItem["index"]]], 45);
                        }
                    }
                },
            },
            onClick: function (e, data) {
                try {
                    let label = labels[data[0]._index];
                    let canvas = data[0]._chart.canvas.id;
                    if (canvas === "repoStarCount" || canvas === "repoCommitCount") {
                        window.open("https://github.com/" + userId + "/" + label, "_blank");
                        window.focus();
                    } else {
                        window.open("https://github.com/" + userId + "?utf8=%E2%9C%93&tab=repositories&q=&type=source&language=" + encodeURIComponent(label), "_blank");
                        window.focus();
                    }
                } catch (ignored) {
                }
            },
            onResize: function (instance) { // todo: fix duplication ?
                instance.chart.options.legend.position = window.innerWidth < 600 ? "bottom" : "left";
                instance.chart.options.legend.labels.fontSize = window.innerWidth < 600 ? 10 : 12;
                instance.chart.options.legend.labels.padding = window.innerWidth < 600 ? 8 : 10;
                instance.chart.options.legend.labels.boxWidth = window.innerWidth < 600 ? 10 : 12;
            }
        }
    });

    function createColorArray(length) {
        const colors = [
            "#54ca76",
            "#f5c452",
            "#f2637f",
            "#9261f3",
            "#31a4e6",
            "#55cbcb"
        ];

        let array = [...Array(length).keys()].map(i => colors[i % colors.length]);

        // avoid first and last colors being the same
        if (length % colors.length === 1)
            array[length - 1] = colors[1];

        return array;
    }

    function arrayRotate(arr, n) {
        for (let i = 0; i < n; i++) {
            arr.push(arr.shift());
        }
        return arr
    }

    function wordWrap(str, n) {
        if (str === null) {
            return null;
        }
        let currentLine = [];
        let resultLines = [];
        str.split(" ").forEach(word => {
            currentLine.push(word);
            if (currentLine.join(" ").length > n) {
                resultLines.push(currentLine.join(" "));
                currentLine = [];
            }
        });
        if (currentLine.length > 0) {
            resultLines.push(currentLine.join(" "));
        }
        return resultLines
    }
}

function createLineChart(objectName, data) {
    
    new Chart(document.getElementById(objectName).getContext("2d"), {
        type: "line",
        data: {
            //labels: Object.keys(strMapToObj(data['get'+objectName]())),
            labels: Object.keys(strMapToObj(data.getQuarterCommitCount())),
            datasets: [{
                label: "Commits",
                //data: Object.values(strMapToObj(data['get'+objectName])),
                data: Object.values(strMapToObj(data.getQuarterCommitCount())),
                backgroundColor: "rgba(67, 142, 233, 0.2)",
                borderColor: "rgba(67, 142, 233, 1)",
                lineTension: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            animation: false,
            scales: {
                xAxes: [{
                    display: false
                }],
                yAxes: [{
                    position: "right",
                    beginAtZero: true
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                intersect: false
            }
        }
    });
}