

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
			width: innerWidth
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
				size: sample_vals.map(d=>d+10)
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
