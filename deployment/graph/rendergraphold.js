var graphsrendered=0;
var testsi;
var testsd;
function exposeGraph()
{
	this.renderGraphModule = function(widgetID, stuDisplay, stuInput, isStatic, isSolution)
	{
		//console.log("student display:"+stuDisplay);
		//console.log("student input:"+stuInput);
		//create iframe with blank graphing module
		graphsrendered++
		//console.log("renderGraph:"+graphsrendered);
		var iframe = document.createElement('iframe');

		if(isSolution) 
		{
			var link = "question/graph/correct.html";
		}
		else
		{
			var link = "question/graph/student.html";		
		}
		
		iframe.frameBorder=0;
		iframe.width="500px";
		iframe.id="resultFrame"+graphsrendered;
		iframe.height="650px";
		iframe.setAttribute("src", link);
		iframe.style.position = "relative";
	
		//find and append iframe to SW5 div with appropriate widgetId
		document.getElementById(widgetID).appendChild(iframe);
		
		testsd = stuDisplay;
		testsi = stuInput;

		//console.log("Static: "+isStatic+" Solution: "+isSolution+"graphsrendered: "+graphsrendered);
		console.log("Renderer:"+graphsrendered, stuDisplay, stuInput);
		
		//load student display json provided by SW5. Update object with student input if necessary
		$('#resultFrame'+graphsrendered).load(function() {this.contentWindow.createNewObjectSW(stuDisplay, stuInput, isStatic, isSolution)})
	}

	this.getStuInput = function(widgetID)
	{
		
		//console.log("WIDGETID:"+widgetID);
		
		document.getElementById("resultFrame"+graphsrendered).contentWindow.CheckGraph();

		//var xxx =  { "feedback": [ { "isCorrect": true, "isSolution": false, "response": document.getElementById("resultFrame"+graphsrendered).contentWindow.graphSe.ckeFeedback } ] }

		//document.getElementById("resultFrame"+graphsrendered).contentWindow.graphSe.ckeFeedback = JSON.stringify(xxx);
		//JSON.stringify(xxx)
		
		var returnData = {

			graph: document.getElementById("resultFrame"+graphsrendered).contentWindow.graphSe, 
			elements: document.getElementById("resultFrame"+graphsrendered).contentWindow.graphMe

		};

		console.log("GetStuInput:"+graphsrendered, returnData);
		
		return JSON.stringify(returnData);
		
	}
} 
/*
function SaveEs (graphjson, elementsjson)
{
	//var exitOnSave = event.target.value == "Save and Exit";

	//padManager.stopUpdateLoop();
	
    var urlparams = getURLPP();

	var url = urlparams.contentPath + 'rest/managewidget/saveGraphData?JSESSIONID=' + urlparams.sessionID;

	var questionData = {

		designerData: {graph: graphSe, elements: graphMe},

		fbData: {test:"fbtest1"},

		sessionID: urlparams.sessionID,

		stuDisplay: {graph: graphSe, elements: graphMe},

		userID: urlparams.userID,

		widgetID: urlparams.widgetID

	};

	console.log("Graphdata JSON: " + JSON.stringify(questionData));

	$.ajax({

		type: 'POST',

		url: url,

		data: JSON.stringify(questionData),

		dataType:"json",

		contentType: "application/json; charset=utf-8",

		error: function (XMLHttpRequest, textStatus, errorThrown) {

			console.log("saveGraphData error");

			console.log(XMLHttpRequest);

			console.log(textStatus);

			console.log(errorThrown);

		},

		success: function (data, textStatus) {

			//padManager.startUpdateLoop();

			$('#questionSaved').fadeIn(500,function(){

				setTimeout(function(){

					$('#questionSaved').fadeOut(2000);

				},2500);

			});

			if(data.result=="true"){

				console.log("Question Saved");

				console.log('widgetID='+data.widgetID);

			}else if(data.result=="false"){

				console.log("Question save failed...");

			}else{

				console.log(data.result);

			}

			/*if(exitOnSave){

				window.close();

				window.history.back();

			}

		}
	

	});
}


function getURLPP(){

	var queryParams = window.location.search;
	queryParams = queryParams.replace("?","");
	queryParams = queryParams.split("&");
	
	var urlVars = {};

	for(var i in queryParams){
		if(!queryParams[i])
			continue;
		var param = queryParams[i].split("=");
		urlVars[param[0]] = param[1];
	}

	var path = window.location.pathname;

	// Fix for IE versions lower than 11.

	if (!window.location.origin) {
	  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
	}

	urlVars.origin = window.location.origin + "/";

	var splitPath = path.split("/");

	urlVars.contentPath = urlVars.origin + splitPath[1] + "/";

	urlVars.path = splitPath[splitPath.length - 1];

	return urlVars;

}
*/
window.graphModule = new exposeGraph();
