var innerWidth = Math.floor(window.innerWidth*0.8);

function populateDropdown() {
	var selectdd = document.getElementById("selDataset");
	Plotly.d3.json("/names", function(error, response) {
        	//console.log(error);
		for (var i = 0; i<response.length; i++){
  	 		var optdd = document.createElement("option");  
			optdd.innerText = response[i]
			selectdd.appendChild(optdd);
		}
	
	});
}

function optionChanged(sampleID) {
	//alert("Selected: "+sampleID);
	//fetch data for the newly selected sample
	//console.log("http://127.0.0.1:5000/metadata/"+sampleID);

	var selectmd = document.getElementById("mdbox");
	if (selectmd.hasChildNodes()) {
		var myNode = document.getElementById("mdbox");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		};
	};

	Plotly.d3.json("http://127.0.0.1:5000/metadata/"+sampleID, function(error, response) {
		//console.log(response);
		for (key in response) {
			var h5md = document.createElement("h5");
			h5md.innerText = key + " : "+response[key];
			selectmd.appendChild(h5md);
		};
	});
	
	Plotly.d3.json("http://127.0.0.1:5000/samples/"+sampleID, function(error, response) {
		if(error) console.error;
		console.log(response);
		var otus_ids = response.otu_ids;
		var sample_vals = response.sample_values;
		console.log(otus_ids.slice(0,10));
		console.log(sample_vals.slice(0,10));
		pieChart(otus_ids.slice(0,10),sample_vals.slice(0,10));
		bubbleChart(otus_ids.slice(0,10), sample_vals.slice(0,10));
	});
	
        // Enter a speed between 0 and 180
        Plotly.d3.json("http://127.0.0.1:5000/wfreq/"+sampleID, function(error,response) {
        if(error) console.log(error);

        var level;
        if (response) {
                level = response
        } else {
                level = 0;
        }

        // Trig to calc meter point
        var degrees = 180 - (180./13.)*(level+1),
                 radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
                 pathX = String(x),
                 space = ' ',
                 pathY = String(y),
                 pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);
        var degreesLevel = 360;
        var numLevels = 6;
        var data = [{ type: 'scatter',
           x: [0], y:[0],
                marker: {size: 28, color:'850000'},
                showlegend: false,
                name: 'wash freq.',
                text: level,
                hoverinfo: 'text+name'},
          { values: [degreesLevel/numLevels, degreesLevel/numLevels, degreesLevel/numLevels, degreesLevel/numLevels, degreesLevel/numLevels, degreesLevel/numLevels, degreesLevel],
          rotation: 90,
          text: ['>9','8-9','6-7','4-5','2-3','0-1',''],
          textinfo: 'text',
          textposition:'inside',
          marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                           'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                           'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                           'rgba(255, 255, 255, 0)']},
          labels: ['>9','8-9','6-7','4-5','2-3','0-1',''],
          hoverinfo:'label',
          hole: .5,
          type: 'pie',
          showlegend: false
        }];

        var layout = {
          shapes:[{
              type: 'path',
              path: path,
              fillcolor: '850000',
              line: {
                color: '850000'
              }
            }],
          title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
          height: 1000,
          width: innerWidth,
          xaxis: {zeroline:false, showticklabels:false,
                                 showgrid: false, range: [-1, 1]},
          yaxis: {zeroline:false, showticklabels:false,
                                 showgrid: false, range: [-1, 1]}
        };

        Plotly.newPlot("gaugeChart", data, layout);
        });


};

function pieChart(otus_ids,sample_vals) {
	Plotly.d3.json("http://127.0.0.1:5000/otu", function(error, response) {
		var otuLabels=[];
		for (var i=0; i < otus_ids.length; i++) {
			otuLabels.push(response[otus_ids[i]]);
		};
		console.log(otuLabels);
		
		var data = [{
			values: sample_vals,
			labels: otus_ids,
			text: otuLabels,
			textinfo: 'none',
			type: 'pie'
		}];
		
		var layout = {
			height: 400,
			width: innerWidth*0.6
		};
		
		Plotly.newPlot("pieChart", data, layout);
	});
};

function bubbleChart(otus_ids,sample_vals) {
	Plotly.d3.json("http://127.0.0.1:5000/otu", function(error, response) {
		var otuLabels=[];
                for (var i=0; i < otus_ids.length; i++) {
                        otuLabels.push(response[otus_ids[i]]);
                };

		var trace1 = {
			x: otus_ids,
			y: sample_vals,
			text: otuLabels,
			mode: 'markers',
			marker: {
			size: sample_vals.map(d=>d+10),
				color: sample_vals,
                    		colorscale: "Earth"
			}
		};
		var data = [trace1];

		var layout = {
			showlegend: false,
			xaxis: {
				title:"OTU IDS"
			},
			yaxis: {
				title: "Sample values"
			},
			height: 400,
			width: innerWidth
		};
		Plotly.newPlot("scatterChart",data,layout);

	});
};


populateDropdown();
optionChanged("BB_940");
