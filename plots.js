var masterData = []; // variable to store master data
var filteredData = []; // variable to store data of chosen year and position

var scatterPlotContainer = d3.select("#plot-containerScatter");
var plotContainerBubble = document.getElementById("plot-containerBubble");
plotContainerBubble.innerHTML = "";
var plotSpecScatter = {};
var scatterPlots = {};
var plotSpecBubble = {};
var bubblePlots = {};
var fantasyTeamData = {};
var opacity = 1;
var duration = 500;
var interval = 10;

var selectedPosition = "";

var selectedC = "";
var selected1B = "";
var selected2B = "";
var selected3B = "";
var selectedSS = "";
var selectedLF = "";
var selectedCF = "";
var selectedRF = "";
var selectedDH = "";

var selectedCData = [];
var selected1BData = [];
var selected2BData = [];
var selected3BData = [];
var selectedSSData = [];
var selectedLFData = [];
var selectedCFData = [];
var selectedRFData = [];
var selectedDHData = [];

// function to filter data by year and position
function filterDataByYear() {
    // variables to store string from dropdowns
    var year = document.getElementById("year").value.toString();
    const csvFilePath = 'data/mlb17to22.csv';

    // read the CSV file and insert data into master and filtered data variable
    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function(results) {
            masterData = results.data;
            filteredData = results.data.filter(function(row) {
                return row.Year == year;
            });

            // update the player dropdown menus
            updatePlayerDropdowns();
            // update the plot with new data
            plotSpecScatter = drawScatterPlot()
            updatePlot();
        }
    });
    filterTeamByYear()
}

function filterTeamByYear() {
    // variables to store string from dropdowns
    var year = document.getElementById("year").value.toString();
    const csvFilePath = 'data/teamData17to22.csv';

    // read the CSV file and insert data into master and filtered data variable
    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function(results) {
            masterData = results.data;
            filteredTeam = results.data.filter(function(row) {
                return row.Year == year;
            });
            // update the plot with new data
            plotSpecBubble = drawBubblePlot()
        }
    });
}

// positionString
function filterDataByPositionAndYear(position) {
    // variables to store string from dropdowns
    var year = document.getElementById("year").value;

    selectedPosition = position;
    
    const csvFilePath = 'data/mlb17to22.csv';

    //  ** AT THIS PT, position = clickedPosition = (string). But its not, therefore the
    // scatter plot does not update. Commenting/deleting the snippet of code below,
    // after clicking on the image, all scatter plot goes to blank.
    // Validates the position value
    const validPositions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH/UTL'];
    if (!validPositions.includes(position)) {
        return; // Exit the function if position is invalid
    }

    // read the CSV file and insert data into master and filtered data variable
    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function(results) {
            masterData = results.data;
            filteredData = results.data.filter(function(row) {
                return row.Year == year && row.Pos === position;
            });

            // update the player dropdown menus
            updatePlayerDropdowns();
            // update the plot with new data
            plotSpecScatter = drawScatterPlot(position)
            updatePlot(position);
        }
    });
    //animateScatterPlot()
}

// function to update player dropdowns after data filtering
function updatePlayerDropdowns() {
    // variables to store string from dropdowns
    var player1Dropdown = document.getElementById("player1");
    var player2Dropdown = document.getElementById("player2");

    // clear previous options
    player1Dropdown.innerHTML = "";
    player2Dropdown.innerHTML = "";

    // variables contain a null option for the player dropdowns
    var nullOption1 = document.createElement("option")
    var nullOption2 = document.createElement("option")
    nullOption1.value = null
    nullOption2.value = null

    // add null option to dropdowns
    player1Dropdown.append(nullOption1);
    player2Dropdown.append(nullOption2);

    // add options for each player in the filtered data
    for (var i = 0; i < filteredData.length; i++) {
        var playerName = filteredData[i].Name;
        var option1 = document.createElement("option");
        option1.value = playerName;
        option1.textContent = playerName;
        var option2 = document.createElement("option");
        option2.value = playerName;
        option2.textContent = playerName;
        player1Dropdown.appendChild(option1);
        player2Dropdown.appendChild(option2);
    }
}

function drawScatterPlot(position) {
    var player1 = document.getElementById("player1").value;
    var player2 = document.getElementById("player2").value;
    var yearValue = document.getElementById("year").value.toString();

    scatterPlots = [
        {
            "title": "Batting Average vs. Slugging Percentage",
            "xField": "SLG",
            "yField": "BA"
        },
        {
            "title": "Home Runs vs. Stolen Bases",
            "xField": "SB",
            "yField": "HR"
        },
        {
            "title": "Strikeouts vs. Walks",
            "xField": "BB",
            "yField": "SO"
        }
    ];
    titleText = "Performance of all players in " + yearValue;
    if (position) {
        titleText = "Performance of all " + position + " players in " + yearValue;
    }
    plotSpecScatter = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": filteredData
        },
        "title": {
            "text": titleText,
            "fontSize": 24,
            "anchor": "mid",
            "color": "black"
        },
        "params": [{
            "name": "brush",
            "select": //"interval",
            {
                "type": "point",
                "toggle": "event.shiftKey"
              }
          }, 
          
          {"name": "grid", 
          "select": "interval", 
          "bind": "scales"
        }],
        "hconcat": scatterPlots.map(function (scatterPlot) {
            return {
                "title": scatterPlot.title,
                "mark": "point",
                "encoding": {
                    "x": {"field": scatterPlot.xField, "type": "quantitative"},
                    "y": {"field": scatterPlot.yField, "type": "quantitative"},
                    "text": {"field": "Name", "format": ".2%"},
                    "color": {
                        "condition": {
                          "param": "brush",
                          "field": "Pos", 
                          "type": "nominal",
                        },
                        "value": "grey"
                        },
                    "size": {
                        "condition": [],
                        "value": 50
                    },
                    "tooltip": [
                        {"field": "Name", "title": "Name"},
                        {"field": "Age", "title": "Age"},
                        {"field": scatterPlot.xField, "title": scatterPlot.xField},
                        {"field": scatterPlot.yField, "title": scatterPlot.yField}
                    ],
                    "order": {
                        "condition": [],
                        value: 0
                    },
                    "opacity": {"value": opacity}
                }
            };
        })
    };

    vegaEmbed('#plot-containerScatter', plotSpecScatter).catch(console.error);
    return plotSpecScatter;
}

// function to update plots
function updatePlot(position) {
    // variables to store string from dropdowns
    var player1 = document.getElementById("player1").value;
    var player2 = document.getElementById("player2").value;
    
    var yAxisLine = document.getElementById("y-axisLine").value;
    
    // variables with data filtered for the selected players
    var player1Data = filteredData.find(function(row) {
        return row.Name === player1;
    });
    var player2Data = filteredData.find(function(row) {
        return row.Name === player2;
    });
    
    // variable containing player1 and player2 data for all years
    var playerCombinedData = masterData.filter(function(row) {
        return row.Name === player1 || row.Name === player2;
    })

    // change year column to numbers
    playerCombinedData.Year = Number(playerCombinedData.Year);

    // variables for baseball diamond
    var source = [{"x": 0, "y": 0, "img": "https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/76536/baseball-diamond-clipart-md.png"}];

    var framed = [{"x": 1, "y": 1},
                    {"x": -1, "y": -1},
                    {"x": -1, "y": 1},
                    {"x": 1, "y": -1}];

    var player_locations = [{"x": 0, "y": -0.68, "position": "C"},
                        {"x": 0.37, "y": -0.08, "position": "1B"},
                        {"x": 0.25, "y": 0.28, "position": "2B"},
                        {"x": -0.37, "y": -0.08, "position": "3B"},                            
                        {"x": -0.25, "y": 0.28, "position": "SS"},
                        { "x": 0.53, "y": 0.45, "position": "LF"},
                        {"x": 0, "y": 0.75, "position": "CF"},
                        {"x": -0.53, "y": 0.45, "position": "RF"},
                        {"x": 0.45, "y": -0.55, "position": "DH/UTL"}];

    // create the plot containers
    var plotContainerBarH = document.getElementById("plot-containerBarH");
    plotContainerBarH.innerHTML = "";

    var plotContainerBarHR = document.getElementById("plot-containerBarHR");
    plotContainerBarHR.innerHTML = "";

    var plotContainerBarRBI = document.getElementById("plot-containerBarRBI");
    plotContainerBarRBI.innerHTML = "";

    var plotContainerBarSB = document.getElementById("plot-containerBarSB");
    plotContainerBarSB.innerHTML = "";

    var plotContainerLine = document.getElementById("plot-containerLine");
    plotContainerLine.innerHTML = "";

    var plotContainerScatter = document.getElementById("plot-containerScatter");
    plotContainerScatter.innerHTML = "";

    var plotContainerDiamond = document.getElementById("plot-containerDiamond");
    plotContainerDiamond.innerHTML = "";

    // hits bar chart
    var plotSpecBarH = {
        "title": "Hits",
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": [player1Data, player2Data]
        },
        "mark": "bar",
        "encoding": {
            "x": {"field": "Name", "type": "nominal"},
            "y": {"field": "H", "type": "quantitative"},
            "tooltip": {"field": "H", "type": "quantitative"},
            "color": {
                "field": "Name",
                "type": "nominal",
                "scale": {"range": ["#002d72", "#d50032"]},
                "legend": null 
            }
        }
    };

    // home runs bar chart
    var plotSpecBarHR = {
        "title": "Home Runs",
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": [player1Data, player2Data]
        },
        "mark": "bar",
        "encoding": {
            "x": {"field": "Name", "type": "nominal"},
            "y": {"field": "HR", "type": "quantitative"},
            "tooltip": {"field": "HR", "type": "quantitative"},
            "color": {
                "field": "Name",
                "type": "nominal",
                "scale": {"range": ["#002d72", "#d50032"]},
                "legend": null 
            }
        }
    };

    // runs batted in bar chart
    var plotSpecBarRBI = {
        "title": "Runs Batted In",
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": [player1Data, player2Data]
        },
        "mark": "bar",
        "encoding": {
            "x": {"field": "Name", "type": "nominal"},
            "y": {"field": "RBI", "type": "quantitative"},
            "tooltip": {"field": "RBI", "type": "quantitative"},
            "color": {
                "field": "Name",
                "type": "nominal",
                "scale": {"range": ["#002d72", "#d50032"]},
                "legend": null 
            }
        }
    };
    
    // stolen bases bar chart
    var plotSpecBarSB = {
        "title": "Stolen Bases",
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": [player1Data, player2Data]
        },
        "mark": "bar",
        "encoding": {
            "x": {"field": "Name", "type": "nominal"},
            "y": {"field": "SB", "type": "quantitative"},
            "tooltip": {"field": "SB", "type": "quantitative"},
            "color": {
                "field": "Name",
                "type": "nominal",
                "scale": {"range": ["#002d72", "#d50032"]},
                "legend": null 
            }
        }
    };
    

    // hitting averages line chart
    var plotSpecLine = {
        "title": "Hitting Averages",
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": playerCombinedData
        },
        "layer": [{
            "mark": {"type": "line", "point": true},
            "encoding": {
                "x": {"field": "Year", "type": "temporal"},
                "y": {"field": yAxisLine, "type": "quantitative"},
                "tooltip": [{"field": yAxisLine, "type": "quantitative"}],
                "color": {
                    "field": "Name",
                    "type": "nominal",
                    "scale": {"range": ["#002d72", "#d50032"]} 
                }
            }
        }]
    };

    // Layered Diamond Plot
    var plotSpecDiamond = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": source
        },
        "layer": [{
            "mark": {
                "type": "image",
                "width": 170,
                "height": 175,
            },
            "encoding": {
                "x": {
                    "field": "x",
                    "type": "quantitative"
                },
                "y": {
                    "field": "y",
                    "type": "quantitative"
                },
                "url": {
                    "field": "img",
                    "type": "nominal"
                }
            }
        },
        {
            "mark": {
                "type": "circle",
                "color": "white",
                "size": 100
            },
            "encoding": {
                "x": {
                    "field": "x",
                    "type": "quantitative"
                },
                "y": {
                    "field": "y",
                    "type": "quantitative"
                }
            },
            "data": {
                "values": framed
            }
        },
        {
            "mark": {
              "type": "circle",
              "color": "black",
              "size": 300
            },
            "encoding": {
              "x": {
                "field": "x",
                "type": "quantitative"
              },
              "y": {
                "field": "y",
                "type": "quantitative"
              },
              "tooltip": {
                "field": "position",
                "type": "nominal"
              },
              "transform": [
                {
                  "calculate": "datum.position",
                  "as": "clickedPosition"
                }
              ]
            },
            "data": {
              "values": player_locations
            },
            "selection": {
              "markSelection": {
                "type": "single",
                "on": "click",
                "encodings": ["x", "y"],
                "nearest": true
              }
            }
          }
        ],
        "config": {
          "axis": {
            "grid": false,
            "title": null,
            "domain": false,
            "ticks": false,
            "labels": false
          }
        }
    };
    
    // embed plots into containers
    vegaEmbed('#plot-containerBarH', plotSpecBarH).catch(console.error);
    vegaEmbed('#plot-containerBarHR', plotSpecBarHR).catch(console.error);
    vegaEmbed('#plot-containerBarRBI', plotSpecBarRBI).catch(console.error);
    vegaEmbed('#plot-containerBarSB', plotSpecBarSB).catch(console.error);
    vegaEmbed('#plot-containerLine', plotSpecLine).catch(console.error);
    
    /*
    vegaEmbed('#plot-containerDiamond', plotSpecDiamond).then((result) => {
        result.view.addSignalListener('markSelection', function (name, value) {
          if (value !== null) {
            var clickedPosition = value.clickedPosition;
            // Call your desired function with the clickedPosition variable
            filterDataByPositionAndYear(clickedPosition);
          }
        });
      }).catch(console.error);
    */
   
    updateScatterPlot(player1, player2, position);

}

function updateScatterPlot(player1, player2, position) {
    // Update the colors
    var yearValue = document.getElementById("year").value.toString();
    console.log(position);
    if (position != null) {
        plotSpecScatter.title.text = "Performance of all " + position + " players in " + yearValue;
    }
    else if (player1 != "null" && player2 == "null") {
        plotSpecScatter.title.text = "Performance of " + player1 + " in " + yearValue;
    } else if (player1 == "null" && player2 != "null") {
        plotSpecScatter.title.text = "Performance of " + player2 + " in " + yearValue;
    } else if (player1 != "null" && player2 != "null") {
        plotSpecScatter.title.text = "Performance of " + player1 + " and " + player2 + " in " + yearValue;
    }
    else if (player1 == player2 && player1 != "null") {
        plotSpecScatter.title.text = "Performance of " + player1 + " in " + yearValue;
    }
    else {
        plotSpecScatter.title = {"text": "Performance of all players in " + yearValue, "anchor": "mid", "fontSize": 24};
    }
    plotSpecScatter.hconcat.forEach((plot, i) => {
        if (player1 != "null" || player2 != "null") {
        plot.encoding.color.condition = [
            {"test": "datum.Name === '" + player1.replace("'", "\\'") + "'", "value": "#8fce00"},
            {"test": "datum.Name === '" + player2.replace("'", "\\'") + "'", "value": "#8fce00"},
        ]}
        plot.encoding.size.condition = [
            {"test": "datum.Name === '" + player1.replace("'", "\\'") + "'", "value": 200},
            {"test": "datum.Name === '" + player2.replace("'", "\\'") + "'", "value": 200},
        ]
        plot.encoding.order.condition = [
            {"test": "datum.Name === '" + player1.replace("'", "\\'") + "'", "value": 1},
            {"test": "datum.Name === '" + player2.replace("'", "\\'") + "'", "value": 2},
        ]
        }
    );
    // Render the updated plot
    vegaEmbed('#plot-containerScatter', plotSpecScatter).catch(console.error);
}

function drawBubblePlot(userTeam) {
    var player1 = document.getElementById("player1").value;
    var player2 = document.getElementById("player2").value;
    var yearValue = document.getElementById("year").value.toString();

    bubblePlots = [
        {
            "title": "Batting Average vs. Slugging Percentage",
            "xField": "SLG",
            "yField": "BA"
        },
        {
            "title": "Home Runs vs. Stolen Bases",
            "xField": "SB",
            "yField": "HR"
        },
        {
            "title": "Strikeouts vs. Walks",
            "xField": "BB",
            "yField": "SO"
        }
    ];
    titleText = "Performance of all teams in " + yearValue;
    if (userTeam) {
        titleText = "Performance of all teams and your dream team in " + yearValue;
    }

    plotSpecBubble = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
          "values": filteredTeam
        },
        "title": {
          "text": titleText,
          "fontSize": 24,
          "anchor": "mid",
          "color": "black"
        },
        "hconcat": bubblePlots.map(function(bubblePlot) {
            const xMin = Math.min(...filteredTeam.map(d => d[bubblePlot.xField]));
            const xMax = Math.max(...filteredTeam.map(d => d[bubblePlot.xField]));
            const yMin = Math.min(...filteredTeam.map(d => d[bubblePlot.yField]));
            const yMax = Math.max(...filteredTeam.map(d => d[bubblePlot.yField]));
            console.log(xMin, xMax, yMin, yMax)
          return {
            "title": bubblePlot.title,
            "layer": [{
                "mark": "point",
                "params": [{
                  "name": "gridBubble",
                  "select": "interval",
                  "bind": "scales"
                }],
                "encoding": {
                  "x": {
                    "field": bubblePlot.xField,
                    "type": "quantitative",
                    "title": bubblePlot.xField,
                    "scale": {
                        "domain": [xMin, xMax]
                      }
                  },
                  "y": {
                    "field": bubblePlot.yField,
                    "type": "quantitative",
                    "title": bubblePlot.yField,
                    "scale": {
                        "domain": [yMin, yMax]
                      }
                  },
                  "text": {
                    "field": "Name",
                    "format": ".2%"
                  },
                  "color": {
                    "field": "League",
                    "type": "nominal",
                    "title": "League",
                    "scale": {
                      "domain": ["AL", "NL", "My League"],
                      "range": ["#d50032", "#002d72", "#8fce00"]
                    }
                  },
                    
                    
                  "size": {
                    "condition": [],
                    "value": 50
                  },
                  "tooltip": [{
                      "field": "Tm",
                      "title": "Team Name"
                    },
                    {
                      "field": bubblePlot.xField,
                      "title": bubblePlot.xField
                    },
                    {
                      "field": bubblePlot.yField,
                      "title": bubblePlot.yField
                    }
                  ],
                  "order": {
                    "condition": [],
                    "value": 0
                  },
                  "opacity": {
                    "value": opacity
                  }
                }},
                { 
                "mark": "rule",
                "encoding": {
                  "y": {
                    "aggregate": "mean",
                    "field": bubblePlot.yField,
                    "type": "quantitative"
                  },
                  "color": { "value": "black" },
                  "size": { "value": 2 },
                }
              },
              {
                "mark": "rule",
                "encoding": {
                  "x": {
                    "aggregate": "mean",
                    "field": bubblePlot.xField,
                    "type": "quantitative"
                  },
                  "color": { "value": "black" },
                  "size": { "value": 2 },
                  "align": { "value": "left" },
                  "baseline": { "value": "middle" },
                  "angle": { "value": 90 }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "Low " + bubblePlot.xField
                  },
                  "x": {
                    "value": 30
                  },
                  "y": {
                    "value": 10
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "High " + bubblePlot.yField
                  },
                  "x": {
                    "value": 30
                  },
                  "y": {
                    "value": 25
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "High " + bubblePlot.xField
                  },
                  "x": {
                    "value": 165
                  },
                  "y": {
                    "value": 10
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "High " + bubblePlot.yField
                  },
                  "x": {
                    "value": 165
                  },
                  "y": {
                    "value": 25
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "Low " + bubblePlot.xField
                  },
                  "x": {
                    "value": 30
                  },
                  "y": {
                    "value": 175
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "Low " + bubblePlot.yField
                  },
                  "x": {
                    "value": 30
                  },
                  "y": {
                    "value": 190
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "High " + bubblePlot.xField
                  },
                  "x": {
                    "value": 165
                  },
                  "y": {
                    "value": 175
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
              {
                "mark": "text",
                "encoding": {
                  "text": {
                    "value": "Low " + bubblePlot.yField
                  },
                  "x": {
                    "value": 165
                  },
                  "y": {
                    "value": 190
                  },
                  "baseline": {
                    "value": "top"
                  },
                  "align": {
                    "value": "left"
                  },
                  "color": {
                    "value": "black"
                  },
                  "size": {
                    "value": 14
                  }
                }
              },
            ],
          };
        })
      };
                        
    vegaEmbed('#plot-containerBubble', plotSpecBubble).catch(console.error);
    return plotSpecBubble;
}


function resetScatterPlots(){
    plotSpecScatter = {};
    scatterPlots = {};
    filterDataByYear();
}

function toggleText(id) {
    var text = document.getElementById(id);
    text.classList.toggle("show");
  }
 
function player1Selected(){
    if (selectedPosition === "C") {
        selectedC = document.getElementById("player1").value;
        selectedCData = filteredData.find(function(row) {
            return row.Name === selectedC;
        });

        document.getElementById('CText').innerHTML = "<strong>Selected Catcher: </strong>" + selectedCData.Name;
    }
    else if (selectedPosition === "1B") {
        selected1B = document.getElementById("player1").value;
        selected1BData = filteredData.find(function(row) {
            return row.Name === selected1B;
        });

        document.getElementById('1BText').innerHTML = "<strong>Selected First Baseman: </strong>" + selected1BData.Name;
    }
    else if (selectedPosition === "2B") {
        selected2B = document.getElementById("player1").value;
        selected2BData = filteredData.find(function(row) {
            return row.Name === selected2B;
        });

        document.getElementById('2BText').innerHTML = "<strong>Selected Second Baseman: </strong>" + selected2BData.Name;
    }
    else if (selectedPosition === "3B") {
        selected3B = document.getElementById("player1").value;
        selected3BData = filteredData.find(function(row) {
            return row.Name === selected3B;
        });

        document.getElementById('3BText').innerHTML = "<strong>Selected Third Baseman: </strong>" + selected3BData.Name;
    }
    else if (selectedPosition === "SS") {
        selectedSS = document.getElementById("player1").value;
        selectedSSData = filteredData.find(function(row) {
            return row.Name === selectedSS;
        });

        document.getElementById('SSText').innerHTML = "<strong>Selected Shortstop: </strong>" + selectedSSData.Name;
    }
    else if (selectedPosition === "LF") {
        selectedLF = document.getElementById("player1").value;
        selectedLFData = filteredData.find(function(row) {
            return row.Name === selectedLF;
        });

        document.getElementById('LFText').innerHTML = "<strong>Selected Left Fielder: </strong>" + selectedLFData.Name;
    }
    else if (selectedPosition === "CF") {
        selectedCF = document.getElementById("player1").value;
        selectedCFData = filteredData.find(function(row) {
            return row.Name === selectedCF;
        });

        document.getElementById('CFText').innerHTML = "<strong>Selected Center Fielder: </strong>" + selectedCFData.Name;
    }
    else if (selectedPosition === "RF") {
        selectedRF = document.getElementById("player1").value;
        selectedRFData = filteredData.find(function(row) {
            return row.Name === selectedRF;
        });

        document.getElementById('RFText').innerHTML = "<strong>Selected Right Fielder: </strong>" + selectedRFData.Name;
    }
    else if (selectedPosition === "DH/UTL") {
        selectedDH = document.getElementById("player1").value;
        selectedDHData = filteredData.find(function(row) {
            return row.Name === selectedDH;
        });

        document.getElementById('DHText').innerHTML = "<strong>Selected Designated Hitter/Utility: </strong>" + selectedDHData.Name;
    }

    getFantasyTeamStats()
}

function player2Selected(){
    if (selectedPosition === "C") {
        selectedC = document.getElementById("player2").value;
        selectedCData = filteredData.find(function(row) {
            return row.Name === selectedC;
        });

        document.getElementById('CText').innerHTML = "<strong>Selected Catcher: </strong>" + selectedCData.Name;
    }
    else if (selectedPosition === "1B") {
        selected1B = document.getElementById("player2").value;
        selected1BData = filteredData.find(function(row) {
            return row.Name === selected1B;
        });

        document.getElementById('1BText').innerHTML = "<strong>Selected First Baseman: </strong>" + selected1BData.Name;
    }
    else if (selectedPosition === "2B") {
        selected2B = document.getElementById("player2").value;
        selected2BData = filteredData.find(function(row) {
            return row.Name === selected2B;
        });

        document.getElementById('2BText').innerHTML = "<strong>Selected Second Baseman: </strong>" + selected2BData.Name;
    }
    else if (selectedPosition === "3B") {
        selected3B = document.getElementById("player2").value;
        selected3BData = filteredData.find(function(row) {
            return row.Name === selected3B;
        });

        document.getElementById('3BText').innerHTML = "<strong>Selected Third Baseman: </strong>" + selected3BData.Name;
    }
    else if (selectedPosition === "SS") {
        selectedSS = document.getElementById("player2").value;
        selectedSSData = filteredData.find(function(row) {
            return row.Name === selectedSS;
        });

        document.getElementById('SSText').innerHTML = "<strong>Selected Shortstop: </strong>" + selectedSSData.Name;
    }
    else if (selectedPosition === "LF") {
        selectedLF = document.getElementById("player2").value;
        selectedLFData = filteredData.find(function(row) {
            return row.Name === selectedLF;
        });

        document.getElementById('LFText').innerHTML = "<strong>Selected Left Fielder: </strong>" + selectedLFData.Name;
    }
    else if (selectedPosition === "CF") {
        selectedCF = document.getElementById("player2").value;
        selectedCFData = filteredData.find(function(row) {
            return row.Name === selectedCF;
        });

        document.getElementById('CFText').innerHTML = "<strong>Selected Center Fielder: </strong>" + selectedCFData.Name;
    }
    else if (selectedPosition === "RF") {
        selectedRF = document.getElementById("player2").value;
        selectedRFData = filteredData.find(function(row) {
            return row.Name === selectedRF;
        });

        document.getElementById('RFText').innerHTML = "<strong>Selected Right Fielder: </strong>" + selectedRFData.Name;
    }
    else if (selectedPosition === "DH/UTL") {
        selectedDH = document.getElementById("player2").value;
        selectedDHData = filteredData.find(function(row) {
            return row.Name === selectedDH;
        });

        document.getElementById('DHText').innerHTML = "<strong>Selected Designated Hitter/Utility: </strong>" + selectedDHData.Name;
    }

    getFantasyTeamStats()
}

function getFantasyTeamStats(){
    var rawTeamBA = (Number(selectedCData.BA)+Number(selected1BData.BA)+Number(selected2BData.BA)+Number(selected3BData.BA)+Number(selectedSSData.BA)+Number(selectedLFData.BA)+Number(selectedCFData.BA)+Number(selectedRFData.BA)+Number(selectedDHData.BA))/9;
    var rawTeamSLG = (Number(selectedCData.SLG)+Number(selected1BData.SLG)+Number(selected2BData.SLG)+Number(selected3BData.SLG)+Number(selectedSSData.SLG)+Number(selectedLFData.SLG)+Number(selectedCFData.SLG)+Number(selectedRFData.SLG)+Number(selectedDHData.SLG))/9;
    var teamHR = Number(selectedCData.HR)+Number(selected1BData.HR)+Number(selected2BData.HR)+Number(selected3BData.HR)+Number(selectedSSData.HR)+Number(selectedLFData.HR)+Number(selectedCFData.HR)+Number(selectedRFData.HR)+Number(selectedDHData.HR);
    var teamSB = Number(selectedCData.SB)+Number(selected1BData.SB)+Number(selected2BData.SB)+Number(selected3BData.SB)+Number(selectedSSData.SB)+Number(selectedLFData.SB)+Number(selectedCFData.SB)+Number(selectedRFData.SB)+Number(selectedDHData.SB);
    var teamBB = Number(selectedCData.BB)+Number(selected1BData.BB)+Number(selected2BData.BB)+Number(selected3BData.BB)+Number(selectedSSData.BB)+Number(selectedLFData.BB)+Number(selectedCFData.BB)+Number(selectedRFData.BB)+Number(selectedDHData.BB);
    var teamSO = Number(selectedCData.SO)+Number(selected1BData.SO)+Number(selected2BData.SO)+Number(selected3BData.SO)+Number(selectedSSData.SO)+Number(selectedLFData.SO)+Number(selectedCFData.SO)+Number(selectedRFData.SO)+Number(selectedDHData.SO);

    var teamBA = rawTeamBA.toFixed(3);
    var teamSLG = rawTeamSLG.toFixed(3);

    console.log(teamBA)
    console.log(teamSLG)
    console.log(teamHR)
    console.log(teamSB)
    console.log(teamBB)
    console.log(teamSO)

    fantasyTeamData = {"Tm": "My Team", "League": "My League", "Year": document.getElementById("year").value, "BA": teamBA, "SLG": teamSLG, "HR": teamHR, "SB": teamSB, "BB": teamBB, "SO": teamSO};

    console.log(fantasyTeamData)

    return fantasyTeamData;
}

function finalizeTeam(){
    console.log(filteredTeam)
    //fantasyTeamData = {"Tm": "A", "League": "My League", "Year": 2022, "BA": 1.0, "SLG": 1.0, "HR": 300, "SB": 150, "BB": 1600, "SO": 650};
    filteredTeam.push(fantasyTeamData)
    console.log(filteredTeam)

    document.getElementById("BATable").innerHTML = fantasyTeamData.BA;
    document.getElementById("SLGTable").innerHTML = fantasyTeamData.SLG;
    document.getElementById("HRTable").innerHTML = fantasyTeamData.HR;
    document.getElementById("SBTable").innerHTML = fantasyTeamData.SB;
    document.getElementById("SOTable").innerHTML = fantasyTeamData.SO;
    document.getElementById("BBTable").innerHTML = fantasyTeamData.BB;

    drawBubblePlot(fantasyTeamData)
}

// initialize table and plot on page load
filterDataByYear();
//filterTeamByYear();
