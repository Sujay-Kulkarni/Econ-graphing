var gmloc = 1;
var graphSe;

var valuet = 1;
var currquestion;

var paramcheck;

var questionNumber = 1;


var questiontext;

var returndata;
var applyOldElementsSettings = true; // SWG-93

var widgetid;

var attemptCount = 0; ////SW5-3911

function getquestion(text) {
    graphSe.fquestion = text;
}

function checkBoxes() {
    graphMe[gmloc - 1].checkBoxes();
}

function addLabel() {
    graphMe[gmloc - 1].addLabel();
}

var movelabeltimer;
var movelabeltimerother;
var movelabelritimer;
var movelabelrotimer;

function moveLabel() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabeltimer);

        movelabeltimer = setInterval(function() {
            graphMe[gmloc - 1].labelangle += .1;
        }, 100);
    }
}

function moveLabelOther() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabeltimerother);

        movelabeltimerother = setInterval(function() {
            graphMe[gmloc - 1].labelangle -= .1;
        }, 100);
    }
}

function moveLabelOtherC() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        graphMe[gmloc - 1].labelangle -= .1;
    }
}

function moveLabelC() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        graphMe[gmloc - 1].labelangle += .1;
    }
}

function moveLabelRIC() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        graphMe[gmloc - 1].labelradius--;
    }
}

function moveLabelROC() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        graphMe[gmloc - 1].labelradius++;
    }
}

function moveLabelClear() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabeltimer);
    }
}

function moveLabelClearOther() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabeltimerother);
    }
}

function moveLabelRadiusOut() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabelrotimer);

        movelabelrotimer = setInterval(function() {
            graphMe[gmloc - 1].labelradius++;
        }, 100);
    }
}

function moveLabelROClear() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabelrotimer);
    }
}

function moveLabelRadiusIn() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabelritimer);

        movelabelritimer = setInterval(function() {
            graphMe[gmloc - 1].labelradius--;
        }, 100);
    }
}

function moveLabelRIClear() {
    if (graphMe[gmloc - 1].labelangle != undefined) {
        clearInterval(movelabelritimer);
    }
}

function saveCKEText() {
    //console.log("inside");
    if (graphSe.mode == "correct") {
        graphSe.ckeTextCorrect = CKEDITOR.instances.editor1.getData();
    }

    if (graphSe.mode == "incorrect0") {
        graphSe.ckeText[0] = CKEDITOR.instances.editor1.getData();
    }

    if (graphSe.mode == "incorrect1" && graphSe.incorrectActive[1]) {
        graphSe.ckeText[1] = CKEDITOR.instances.editor1.getData();
    }

    if (graphSe.mode == "incorrect2" && graphSe.incorrectActive[2]) {
        graphSe.ckeText[2] = CKEDITOR.instances.editor1.getData();
    }

    if (graphSe.mode == "incorrect3" && graphSe.incorrectActive[3]) {
        graphSe.ckeText[3] = CKEDITOR.instances.editor1.getData();
    }
}

/*var editor = CKEDITOR.instances["editor1"] ;

editor.on( 'contentDom', function() {
	
	var editable = editor.editable();

	editable.attachListener( editor.document, 'keyup', function() {
		console.log("inside");
	
		if(graphSe.mode=="incorrect0")
		{
			graphSe.ckeText[0] = CKEDITOR.instances.editor1.getData();
		}

		if(graphSe.mode=="incorrect1")
		{
			graphSe.ckeText[1] = CKEDITOR.instances.editor1.getData();
		}

		if(graphSe.mode=="incorrect2")
		{
			graphSe.ckeText[2] = CKEDITOR.instances.editor1.getData();
		}

		if(graphSe.mode=="incorrect3")
		{
			graphSe.ckeText[3] = CKEDITOR.instances.editor1.getData();
		}			
	
	} );
	
} );

var dialog = CKEDITOR.dialog ;

dialog.on( 'contentDom', function() {
	
	var editable = dialog.editable();

	editable.attachListener( dialog.document, 'keyup', function() {
		console.log("inside");
	
		if(graphSe.mode=="incorrect0")
		{
			graphSe.ckeText[0] = CKEDITOR.instances.editor1.getData();
		}

		if(graphSe.mode=="incorrect1")
		{
			graphSe.ckeText[1] = CKEDITOR.instances.editor1.getData();
		}

		if(graphSe.mode=="incorrect2")
		{
			graphSe.ckeText[2] = CKEDITOR.instances.editor1.getData();
		}

		if(graphSe.mode=="incorrect3")
		{
			graphSe.ckeText[3] = CKEDITOR.instances.editor1.getData();
		}			
	
	} );
	
} );

editor.on('afterCommandExec', handleAfterCommandExec);
function handleAfterCommandExec(event)
{
	console.log("inside");

	if(graphSe.mode=="incorrect0")
	{
		graphSe.ckeText[0] = CKEDITOR.instances.editor1.getData();
	}

	if(graphSe.mode=="incorrect1")
	{
		graphSe.ckeText[1] = CKEDITOR.instances.editor1.getData();
	}

	if(graphSe.mode=="incorrect2")
	{
		graphSe.ckeText[2] = CKEDITOR.instances.editor1.getData();
	}

	if(graphSe.mode=="incorrect3")
	{
		graphSe.ckeText[3] = CKEDITOR.instances.editor1.getData();
	}	

	var commandName = event.data.name;
	// For 'bold' commmand
	console.log(commandName);
			
}

CKEDITOR.on( 'dialogDefinition', function( ev ) {
      // Take the dialog name and its definition from the event data.
      var dialogName = ev.data.name;
      var dialogDefinition = ev.data.definition;


	  console.log(dialogName, dialogDefinition);

});

/*CKEDITOR.instances.editor1.on('key', function () { 

	console.log("inside");
	
	if(graphSe.mode=="incorrect0")
	{
		graphSe.ckeText[0] = CKEDITOR.instances.editor1.getData();
	}

	if(graphSe.mode=="incorrect1")
	{
		graphSe.ckeText[1] = CKEDITOR.instances.editor1.getData();
	}

	if(graphSe.mode=="incorrect2")
	{
		graphSe.ckeText[2] = CKEDITOR.instances.editor1.getData();
	}

	if(graphSe.mode=="incorrect3")
	{
		graphSe.ckeText[3] = CKEDITOR.instances.editor1.getData();
	}			
	
} );

CKEDITOR.instances.editor1.on('click', function () { 

	console.log("inside");

	if(graphSe.mode=="incorrect1")
	{
		graphSe.ckeText[1] = CKEDITOR.instances.editor1.getData();
	}
	
} );*/


function CheckGraph() {
    //$('#feedback').removeClass("hide");

    var html = '';
    /*
    for(var i=0; i<graphMe.length; i++)
    {
    	
    	if(graphMe[i].mode!="correct") html+="<div class='resultsrow'>"+graphMe[i].label+": "+graphMe[i].iscorrect+"</div>";
    }
    */

    //TotalGraph();
    //GraphCorrect( )

    //var feedbackIncorrect = Feedback( );
    
    ////SWG-295 Changes UAT Issue
    for (var i = 0; i < graphMe.length; i++) {
        if (graphMe[i].what == "line") {
            if (graphMe[i].xeg == undefined || isNaN(graphMe[i].xeg)) {
                graphMe.splice(i, 1);
                gmloc--;
            }
        } else if (graphMe[i].what == "curve") {
            if (graphMe[i].pts.length < 6) {
                graphMe.splice(i, 1);
                gmloc--;
            }
        }
    }
    ////SWG-295 Changes
    var fb = graphSe.GradeMe();

    if (graphSe.tgcorrect == "correct") {
        html += "<div><Strong><span style='color:green'>" + graphSe.ckeFeedback + "</span></div>";
        //graphSe.ckeFeedback = graphSe.ckeTextCorrect;
    } else {
        html += "<div><Strong><span style='color:red'>" + graphSe.ckeFeedback + "</span></div>";
        //graphSe.ckeFeedback = feedbackIncorrect;
    }

    document.getElementById('feedbacktext').innerHTML = html;

}

function GraphCorrect() {
    for (var i = 0, corrFail = false, numuc = 0; i < graphMe.length && !corrFail; i++) {
        var gi = graphMe[i];
        var acceptedArea = gi.acceptedArea != undefined ? gi.acceptedArea : false;
        if (gi.correct[0] != undefined && !acceptedArea) {
            var hasCorrect = true;
            var gic = gi.correct[0];
            if (!gic.match) {
                corrFail = true;
                //if( gic.type != "precise" ) corrFail = true;
                //else if( !gi.CheckIsCorrect() ) corrFail = true;
            }
        }
    }

    graphSe.tgcorrect = hasCorrect && !corrFail ? "correct" : "incorrect";
}

/*
function TotalGraph()
{

		for(var i = 0, ncorr = 0, numuc = 0; i < graphMe.length; i++)
		{
		    var gi = graphMe[i];
		    var acceptedArea = gi.acceptedArea != undefined ? gi.acceptedArea : false;
			if(gi.iscorrect!=null) 
			{
			    if(gi.mode=="student") ncorr--;
				if(gi.iscorrect == "<span style='color:red'>Not Correct</span>") 
				{
					graphSe.tgcorrect="incorrect";
					return "<div><Strong>Total Graph: <span style='color:red'>Incorrect</span></div>";
				}	
			}
			else if( gi.mode == "correct" && !acceptedArea ) 
			{
				ncorr++;
				numuc++;
			}	
			else numuc++;
		}		

    	return (ncorr == 0 && numuc != graphMe.length) ? graphSe.tgcorrect="correct" :
    	                    graphSe.tgcorrect="incorrect";
}
*/

/*
function Feedback( )
{
    var incFail =[ 0, 0, 0, 0 ];
    var fb = null;
    for( var i = 0, incorrectFeedback = null, ln = graphMe.length; i < ln && incorrectFeedback == null; i++ )
    {
        var gi = graphMe[i];
        for( var c = 1; c < 4; c++ )
        {
            if( gi.incorrect[c] != null )
            {
                if( !gi.incorrect[c].match ) incFail[c]++;
            }
        }
    }
    
    for( var c = 1, fb = null; c < 4 && fb == null; c++ )
    { 
        if( !incFail[c] )
            fb = graphSe.ckeText[c];
    }
    
    return fb == null ? graphSe.tgcorrect == "incorrect" ? graphSe.ckeText[0] : graphSe.tgcorrect  : fb; 
}
*/

function Feedback() {
    for (var n = 1, fb = null; n < 4 && fb == null; n++) {
        for (var i = 0, incFail = false, hasInc = false, ln = graphMe.length; i < ln && !incFail; i++) {
            var gi = graphMe[i];
            var acceptedArea = gi.acceptedArea != undefined ? gi.acceptedArea : false;
            if (gi.incorrect[n] != null && !acceptedArea) {
                hasInc = true;
                if (!gi.incorrect[n].match) incFail = true;
            }
        }

        if (hasInc && !incFail) fb = graphSe.ckeText[n];
    }

    return fb == null ? graphSe.tgcorrect == "incorrect" ? graphSe.ckeText[0] : graphSe.tgcorrect : fb;
}



function update() {
    console.log("Update: ", gmloc);

    if ($('#gridtoggle').is(":checked")) {
        gridt = 1;
        graphSe.grid = true;
    } else {
        gridt = 0;
        graphSe.grid = false;
    };
    if ($('#valuetoggle').is(":checked")) {
        valuet = 1;
        graphSe.value = true;
    } else {
        valuet = 0;
        graphSe.value = false;
    };
    if ($('#xytoggle').is(":checked")) {
        $('#yaxistext').removeClass("hide");
        $('#xaxistext').removeClass("hide");
        graphSe.axisshow = true;
    } else {
        $('#yaxistext').addClass("hide");
        $('#xaxistext').addClass("hide");
        graphSe.axisshow = false;
    };
    if ($('#titletoggle').is(":checked")) {
        graphSe.titleshow = true;
        ////SWG-221 Changes 
        resize();
        if (graphSe.mode == 'designer') {
            $('#titletext').removeClass("hide");
            $('#yaxistext').css('top', '126px');
            $('#deletebutton1').css('top', '126px');
            $('#xaxistext').css('top', '580px');//SWG_68
            $('#graphcontainer').css('height','');
        }
        ////SWG-221
    } else {
        $('#titletext').addClass("hide");
        graphSe.titleshow = false;
        ////SWG-221 Changes
         $('#graphcontainer').css('height','520px');
         $('#yaxistext').css('top', '80px');
         $('#xaxistext').css('top', '535px');//SWG_68
         
         $('#deletebutton1').css('top', '80px');
         
         if (graphSe.mode != 'student' && !_isSolution) {
             $('#CanvasGraph').css('top', '205px');
             $('#CanvasAnimate').css('top', '205px');
             $('#CanvasAnimate2').css('top', '187px');
         }
        ////SWG-221
    };
    if ($('#snaptoggle').is(":checked")) graphSe.SnapOnOff(true);
    else graphSe.SnapOnOff(false);

    if (graphMe.length > 0) {
        if ($('#plumbtoggle').is(":checked")) graphMe[gmloc - 1].PlumbMe(true);
        else graphMe[gmloc - 1].PlumbMe(false);
        if ($('#labeltoggle').is(":checked")) { graphMe[gmloc - 1].LabelMe(true); } else { graphMe[gmloc - 1].LabelMe(false); }
        if ($('#rltoggle').is(":checked")) graphMe[gmloc - 1].RequiredLabelMe(true);
        else graphMe[gmloc - 1].RequiredLabelMe(false);
    }
    //SWG-64 changes
    if(graphSe.mode == "correct" && graphMe[gmloc - 1].requiredlabel && graphMe[gmloc-1].requiredlabelinc.length == 0){
        graphMe[gmloc - 1].requiredlabelinc[0] = true;
        graphMe[gmloc - 1].requiredlabelinc[1] = true;
        graphMe[gmloc - 1].requiredlabelinc[2] = true;
        graphMe[gmloc - 1].requiredlabelinc[3] = true;
    }
    //SWG-64 changes end
}

//SWG-142 Changes
function UpdateStudentSettings(){
    graphSe.studentSettings.isPointDisabled = !$("#studToolPointToggle").is(":checked");
    graphSe.studentSettings.isLineDisabled =  !$("#studToolLineToggle").is(":checked");
    graphSe.studentSettings.isCurveDisabled = !$("#studToolCurveToggle").is(":checked");
    graphSe.studentSettings.isPolygonDisabled = !$("#studToolAreaToggle").is(":checked");
}

function SetToolBoxOption() {
    $("#drawpointBtn").attr("disabled", graphSe.studentSettings.isPointDisabled);
    $("#drawlineBtn").attr("disabled", graphSe.studentSettings.isLineDisabled);
    $("#drawcurveBtn").attr("disabled", graphSe.studentSettings.isCurveDisabled);
    $("#drawfillpolylineBtn").attr("disabled", graphSe.studentSettings.isPolygonDisabled);
}

//End SWG-142

function Interactive(tf) {

    if (tf == true) {
        $('#ilabels').removeClass("hide");
        $('#iinputs').removeClass("hide");
        if (!graphMe[gmloc - 1].ghost) graphMe[gmloc - 1].GhostMe();
        Precise(true);
    } else {
        $('#ilabels').addClass("hide");
        $('#iinputs').addClass("hide");
        Precise(false);
    }

    if (!tf) {
        var gobj = graphMe[gmloc - 1];
        graphSe.DeleteAreas(gobj);
        gobj.correct = [];
        gobj.incorrect = [null, null, null, null];
    }


    graphMe[gmloc - 1].InteractiveMe(tf);
    graphMe[gmloc - 1].InteractiveReset();
}

function Precise(tf) {
    var gm = graphMe[gmloc - 1];
    gm.PreciseMe(tf);
    gm.SetSettings();
    if (graphSe.mode.substring(0, 9) == "incorrect") gm.IncorrectMe();
    if (graphSe.mode == "correct") {
        var objType = tf == true ? undefined : "relative"; //// 
        gm.CorrectMe(objType);
        //if (gm.originalCoordinates != undefined ) gm.originalCoordinates = undefined;
    }

    if (gm.rightCoordinatesUpdated != undefined) gm.rightCoordinatesUpdated = undefined;
    if (gm.leftCoordinatesUpdated != undefined) gm.leftCoordinatesUpdated = undefined;
    if (gm.upCoordinatesUpdated != undefined) gm.upCoordinatesUpdated = undefined;
    if (gm.downCoordinatesUpdated != undefined) gm.downCoordinatesUpdated = undefined;
}

function ShiftLeft() {
    var rlltemp;

    if (graphSe.mode == 'correct') {
        rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabel);
    } else if (graphSe.mode == 'incorrect1') {
        rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabelinc[1]);
    } else if (graphSe.mode == 'incorrect2') {
        rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabelinc[2]);
    } else if (graphSe.mode == 'incorrect3') {
        rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabelinc[3]);
    }

    ////SWG-457 Changes
    if(graphMe[gmloc - 1].isshiftdirectionchanged != undefined) {
        graphMe[gmloc - 1].isshiftdirectionchanged = true;
    }
    ////SWG-457 Changes end
    
    var tabLabel = (graphSe.mode.includes('incorrect') && (graphMe[gmloc - 1].correctlabel != 'b' || graphMe[gmloc - 1].correctlabel != "" )) ? graphMe[gmloc - 1].correctlabel : graphMe[gmloc - 1].elementlabel; ////SWG-457

    if (rlltemp.what == 'point' || rlltemp.what == 'poly') {
        graphMe[gmloc - 1].EvalShift("left");
    } else {
        if (rlltemp) {
            if (rlltemp.IsPPF() && rlltemp.elementlabel == 'PPF') { ////SWG-139, SWG-591
                graphMe[gmloc - 1].EvalShift("inward");
            } else if (tabLabel == 'Marginal Cost' || tabLabel == 'Fixed Cost' || tabLabel == 'Variable Cost' || tabLabel == 'Total Cost') { ////SWG-457
                graphMe[gmloc - 1].EvalShift("up");
            } else {
                graphMe[gmloc - 1].EvalShift("left");
            }
        }
    }

}

function ShiftRight() {
    //graphMe[gmloc-1].EvalShift( "right" );

    if (graphSe.mode == 'correct') {
        var rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabel);
    } else if (graphSe.mode == 'incorrect1') {
        var rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabelinc[1]);
    } else if (graphSe.mode == 'incorrect2') {
        var rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabelinc[2]);
    } else if (graphSe.mode == 'incorrect3') {
        var rlltemp = graphSe.FindInGraph(graphMe[gmloc - 1].relementlabelinc[3]);
    }
    ////SWG-457 Changes
    if(graphMe[gmloc - 1].isshiftdirectionchanged != undefined) {
        graphMe[gmloc - 1].isshiftdirectionchanged = true;
    }
    ////SWG-457 Changes End

    var tabLabel = (graphSe.mode.includes('incorrect') && (graphMe[gmloc - 1].correctlabel != 'b' || graphMe[gmloc - 1].correctlabel != "" )) ? graphMe[gmloc - 1].correctlabel : graphMe[gmloc - 1].elementlabel; ////SWG-457

    if (rlltemp.what == 'point' || rlltemp.what == 'poly') {
        graphMe[gmloc - 1].EvalShift("right");
    } else {
        if (rlltemp) {
            //console.log(rlltemp);
            if (rlltemp.IsPPF() && rlltemp.elementlabel == 'PPF') { ////SWG-139, SWG-591
                graphMe[gmloc - 1].EvalShift("outward");
            } else if (tabLabel == 'Marginal Cost' || tabLabel == 'Fixed Cost' || tabLabel == 'Variable Cost' || tabLabel == 'Total Cost') { ////SWG-457
                graphMe[gmloc - 1].EvalShift("down");
            } else {
                graphMe[gmloc - 1].EvalShift("right");
            }
        }
    }

}

function testGet() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://54.173.144.67:3000/graphelements/1", true);
}

// Create the XHR object.
function CreateCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }

    return xhr;
}

function getGTitle(text) {
    graphSe.title = text;
}

// Helper method to parse the title tag from the response.
function GetTitle(text) {
    return text.match('<title>(.*)?</title>')[1];
}

function saveQ1() {
    var pointObjCount = 0, lineObjCount = 0, curveOjbCount = 0; ////SWG - 55
    //SWG-223 Changes
    if (graphMe.length > 0) {
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
        ////SWG - 55 Changes 
        for (var i = 0; i < graphMe.length; i++) {
            if (graphMe[i].what == "point") pointObjCount++;
            if (graphMe[i].what == "line") lineObjCount++;
            if (graphMe[i].what == "curve") curveOjbCount++;
        }
    }
    ////SWG - 55 Changes 
    if (pointObjCount == 0) {
        graphSe.pointCustomLabelValues = [];
        graphSe.pointCustomLabelValuesChkStatus = [true];
    }

    if (lineObjCount == 0) {
        graphSe.lineCustomLabelValues = [];
        graphSe.lineCustomLabelValuesChkStatus = [true, true, true, true, true, true, true, true, true];
    }
    if (curveOjbCount == 0) {
        graphSe.curveCustomLabelValues = [];
        graphSe.curveCustomLabelValuesChkStatus = [true, true, true, true, true, true, true, true, true];
    }
    ////SWG - 55 End
    //SWG-223 Changes end
    saveCKEText();

    graphSe.SetMode("designer");
    designerMode();
    //graphSe.daa = drawAcceptedArea;
    simpleObject(graphMe, graphSe, 1)
}

function loadQ1() {
    LoadElements(1);
}

function LoadElements() {
    var urlparams = getURLParams();

    var data;

    if (window.opener != null) {
        console.log("Retrieving question data...");

        if (window.opener && window.opener.questionPageManager && window.opener.questionPageManager.getGraphData);
        data = window.opener.questionPageManager.getGraphData(urlparams.widgetID);

        //console.log(data);

        if (typeof data.designerData === 'string')
            data.designerData = JSON.parse(data.designerData);

        if (typeof data.fbData === 'string')
            data.fbData = JSON.parse(data.fbData);

        if (typeof data.stuDisplay === 'string')
            data.stuDisplay = JSON.parse(data.stuDisplay);


        // If there was no data saved, add a default and solution tab
        if ($.isEmptyObject(data.stuDisplay)) {

        } else {
            createNewObject(data);
        }
    }
    
    hideDToolsIfEmpty()
}


// Make the actual CORS request.
function MakeCorsDelete(element) {
    var url = "http://54.173.144.67:3000/graphelements/" + element;

    var xhr = CreateCORSRequest('DELETE', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function() {
        var text = xhr.responseText;
        var title = GetTitle(text);
        console.log('Response from CORS request to ' + url + ': ' + text);
    };

    xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}


function getURLParams() {



    var queryParams = window.location.search;

    queryParams = queryParams.replace("?", "");

    queryParams = queryParams.split("&");



    var urlVars = {};



    for (var i in queryParams) {

        if (!queryParams[i])

            continue;

        var param = queryParams[i].split("=");

        urlVars[param[0]] = param[1];

    }



    var path = window.location.pathname;



    // Fix for IE versions lower than 11.

    if (!window.location.origin) {

        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

    }



    urlVars.origin = window.location.origin + "/";



    var splitPath = path.split("/");

    urlVars.contentPath = urlVars.origin + splitPath[1] + "/";

    urlVars.path = splitPath[splitPath.length - 1];



    // TEMPORARY

    //urlVars.saveAsStaticMode = false;



    return urlVars;

}


function SaveElements(graphjson, elementsjson) {

    var urlparams = getURLParams();

    var url = urlparams.contentPath + 'rest/managewidget/saveGraphData?SHIROSESSIONID=' + urlparams.sessionID;

    var questionData = {

        designerData: { graph: graphSe, elements: graphMe },

        fbData: { test: "fbtest" },

        sessionID: urlparams.sessionID,

        stuDisplay: { graph: graphSe, elements: graphMe },

        userID: urlparams.userID,

        widgetID: urlparams.widgetID

    };

    //console.log("Graphdata JSON: " + JSON.stringify(questionData));

    var data;

    if (window.opener && window.opener.questionPageManager && window.opener.questionPageManager.saveGraphData);
    data = window.opener.questionPageManager.saveGraphData(urlparams.widgetID, JSON.stringify(questionData));

    //console.log("DATA: "+data);

    $('#savespinner').removeClass("hide");

    setTimeout(function() {
        $('#savespinner').addClass("hide");
        $('#savetext').removeClass("hide");

        setTimeout(function() {
            $('#savetext').addClass("hide");

        }, 1000);

    }, 3000);

    //console.log("Return Data: " + data);

}

/*
// Make the actual CORS request.
function SaveElements(graphjson, elementsjson) 
{
    var urlparams = getURLParams();
    
    console.log(urlparams);
    
    //var url = "http://54.173.144.67:3000/graphelements/";
	
	var url = urlparams.contentPath + 'rest/managewidget/saveChemData?JSESSIONID=' + urlparams.sessionID;

	var questionData = {

		designerData: {test: "designertest"},

		fbData: {test:"fbtest"},

		sessionID: urlparams.sessionID,

		stuDisplay: {test:"stutest"},

		userID: urlparams.userID,

		widgetID: urlparams.widgetID

	};

    var xhr = CreateCORSRequest('POST', url);
    if (!xhr) 
    {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function() 
    {
        var text = xhr.responseText;
        var title = GetTitle(text);
        //console.log('Response from CORS request to ' + url + ': ' + text);
        console.log(this.responseText);
    };

    xhr.onerror = function() 
    {
        alert('Woops, there was an error making the request.');
    };
  
    //xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //var params = JSON.stringify({ graphelement: { title: graphjson, text: elementsjson } });
    var params = JSON.stringify(questionData);
    xhr.send(params);
}
*/
// Make the actual CORS request.
function UpdateElements(question, graphjson, elementsjson) {
    var url = "http://54.173.144.67:3000/graphelements/" + question;

    var xhr = CreateCORSRequest('PUT', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function() {
        var text = xhr.responseText;
        var title = GetTitle(text);
        //console.log('Response from CORS request to ' + url + ': ' + text);
        //console.log(this.responseText);
    };

    xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
    };

    var graphjsons = JSON.stringify(graphjson);
    var elementjsons = JSON.stringify(elementsjson);

    //paramcheck = { graphelement: { title: graphjsons, text: elementsjsons } }

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var params = JSON.stringify({ graphelement: { title: graphjson, text: elementsjson } });
    //console.log("these are:"+params)
    xhr.send(params);
}


function simpleObject(object, graph, question) {
    var x, y;
    var text;
    var tempstring = '';
    var tempstring2 = '';

    for (var i = 0; i < object.length; i++) {
        for (x in object[i]) {
            text = object[i][x];
            if (!isFunction(text)) {
                tempstring += "?" + x + ":" + object[i][x];
                //console.log(x);
            }
            if (x == "ghost") {
                //console.log(object[i].ghost);
                for (y in object[i].ghost) {
                    text = object[i].ghost[y];
                    if (!isFunction(text)) {
                        tempstring += "?ghost" + y + ":" + object[i].ghost[y];
                    }
                }
            }
            if (x == "dragDxDy") {
                //console.log(object[i].ghost);
                for (y in object[i].dragDxDy) {
                    text = object[i].dragDxDy[y];
                    if (!isFunction(text)) {
                        tempstring += "?drag" + y + ":" + object[i].dragDxDy[y];
                    }
                }
            }
            if (x == "dragstart") {
                //console.log(object[i].ghost);
                for (y in object[i].dragstart) {
                    text = object[i].dragstart[y];
                    if (!isFunction(text)) {
                        tempstring += "?dragstart" + y + ":" + object[i].dragstart[y];
                    }
                }
            }
            if (x == "correct") {
                //console.log(object[i].ghost);
                for (y in object[i].correct[0]) {
                    text = object[i].correct[0][y];
                    if (!isFunction(text)) {
                        tempstring += "?correctarray" + y + ":" + object[i].correct[0][y];
                    }
                }
            }
        }
        tempstring += "!!";
    }

    for (y in graph) {
        text = graph[y];
        if (!isFunction(text)) {
            tempstring2 += "?" + y + ":" + graph[y];
        }
    }
    tempstring2 += "!!";


    SaveElements(tempstring, tempstring2);
}

var stringarray = [];

function createNewObject(data, data2) {
    //console.log("data:" + data);
    if (data.designerData.graph.what == "graph") {

        var graph = data.designerData.elements[i];
        //SWG-124 changes
        savedObjects = data.designerData.elements;
        //SWG-124 changes end
        for (y in graph) {
            graphSe[i][y] = graph[y];
        }

        graphSe.firstload = data.designerData.graph.firstload;

        graphSe.drawAcceptedArea = data.designerData.graph.drawAcceptedArea;

        //SWG-55 Changes
        if (data.designerData.graph.pointCustomLabelValues != undefined) {
            graphSe.pointCustomLabelValues = data.designerData.graph.pointCustomLabelValues;
            graphSe.pointCustomLabelValuesChkStatus = data.designerData.graph.pointCustomLabelValuesChkStatus;
        }

        if (data.designerData.graph.lineCustomLabelValues != undefined) {
            graphSe.lineCustomLabelValues = data.designerData.graph.lineCustomLabelValues;
            graphSe.lineCustomLabelValuesChkStatus = data.designerData.graph.lineCustomLabelValuesChkStatus;
        }

        if (data.designerData.graph.curveCustomLabelValues != undefined) {
            graphSe.curveCustomLabelValues = data.designerData.graph.curveCustomLabelValues;
            graphSe.curveCustomLabelValuesChkStatus = data.designerData.graph.curveCustomLabelValuesChkStatus;
        }
        //SWG-55 End
        graphSe.ops = data.designerData.graph.ops;
        graphSe.opsRedo = data.designerData.graph.opsRedo;
        graphSe.opsStudent = data.designerData.graph.opsStudent;
        graphSe.opsRedoStudent = data.designerData.graph.opsRedoStudent;
        graphSe.opsCorrect = data.designerData.graph.opsCorrect;
        graphSe.opsRedoCorrect = data.designerData.graph.opsRedoCorrect;
        graphSe.opsDesigner = data.designerData.graph.opsDesigner;
        graphSe.opsRedoDesigner = data.designerData.graph.opsRedoDesigner;

        for (var i = 0; i < 4; i++) {
            graphSe.opsIncorrect[i] = data.designerData.graph.opsRedoIncorrect[i];
            graphSe.opsRedoIncorrect[i] = data.designerData.graph.opsRedoIncorrect[i];
        }

        graphSe.incorrectActive = data.designerData.graph.incorrectActive;
        graphSe.ckeText = data.designerData.graph.ckeText;
        graphSe.ckeTextCorrect = data.designerData.graph.ckeTextCorrect;

        graphSe.title = data.designerData.graph.title;
        graphSe.xaxis = data.designerData.graph.xaxis;
        graphSe.yaxis = data.designerData.graph.yaxis;

        graphSe.fquestion = data.designerData.graph.fquestion;
        document.getElementById('questiontext').innerHTML = data.designerData.graph.fquestion;
        //document.getElementById('tempquestiontext').value = data.designerData.graph.fquestion;

        document.getElementById('titletext').value = data.designerData.graph.title;
        document.getElementById('yaxistext').value = data.designerData.graph.yaxis;
        document.getElementById('xaxistext').value = data.designerData.graph.xaxis;

        document.getElementById('titletextstatic').value = data.designerData.graph.title;
        document.getElementById('yaxistextstatic').value = data.designerData.graph.yaxis;
        document.getElementById('xaxistextstatic').value = data.designerData.graph.xaxis;

        document.getElementById('xinc').value = data.designerData.graph.xinc;
        xincChange(document.getElementById('xinc').value);

        document.getElementById('yinc').value = data.designerData.graph.yinc;
        yincChange(document.getElementById('yinc').value);

        document.getElementById('xmin').value = data.designerData.graph.xmin;
        xminChange(document.getElementById('xmin').value);

        document.getElementById('ymin').value = data.designerData.graph.ymin;
        yminChange(document.getElementById('ymin').value);


        //console.log("grid:"+data.designerData.graph.grid);
        //Changes for SWG-142
        if (data.designerData.graph.studentSettings) {
            graphSe.studentSettings = data.designerData.graph.studentSettings;
        }
        else {
            graphSe.studentSettings = {
                isPointDisabled: false,
                isLineDisabled: false,
                isCurveDisabled: false,
                isPolygonDisabled: false
            }
        }
        
        //SWG-142 changes end

        if (data.designerData.graph.grid) {
            graphSe.grid == true;
            gridt = 1;
            document.getElementById("gridtoggle").checked = true;
        } else {
            graphSe.grid == false;
            gridt = 0;
            document.getElementById("gridtoggle").checked = false;
        };
        if (data.designerData.graph.value) {
            valuet = 1;
            graphSe.value = true;
            document.getElementById("valuetoggle").checked = true;
        } else {
            valuet = 0;
            graphSe.value = false;
            document.getElementById("valuetoggle").checked = false;
        };
        if (data.designerData.graph.titleshow) { document.getElementById("titletoggle").checked = true; } else { document.getElementById("titletoggle").checked = false; };
        if (data.designerData.graph.axisshow) { document.getElementById("xytoggle").checked = true; } else { document.getElementById("xytoggle").checked = false; };
        if (data.designerData.graph.snapIt) { document.getElementById("snaptoggle").checked = true; } else { document.getElementById("snaptoggle").checked = false; };
        //graphSe.snapIt=(data.designerData.graph.snapIt=="true");

        graphSe.SetMaxes();

        for (var i = 1; i < graphSe.incorrectActive.length; i++) {
            if (graphSe.incorrectActive[i]) {
                document.getElementById("incorrect" + i).innerHTML = 'Incorrect <span class="glyphicon glyphicon-trash" aria-hidden="true" style="font-size: 18px;" onclick="delInc(' + i + ')"></span>'
                document.getElementById("incorrect" + i).disabled = false;
            }
        }

        update();
        //SWG-142 changes
        if ($("#studToolPointToggle")) $("#studToolPointToggle").prop('checked', !graphSe.studentSettings.isPointDisabled);
        if ($("#studToolLineToggle")) $("#studToolLineToggle").prop('checked', !graphSe.studentSettings.isLineDisabled);
        if ($("#studToolCurveToggle")) $("#studToolCurveToggle").prop('checked', !graphSe.studentSettings.isCurveDisabled);
        if ($("#studToolAreaToggle")) $("#studToolAreaToggle").prop('checked', !graphSe.studentSettings.isPolygonDisabled);
        //SWG-142 changes end
    }

    for (var i = 0; i < data.designerData.elements.length; i++) {
        
        if (data.designerData.elements[i].what == "point") {

            graphMe[i] = new Point(data.designerData.elements[i].cc, data.designerData.elements[i].x, data.designerData.elements[i].y, data.designerData.elements[i].radius);

            var graph = data.designerData.elements[i];

            for (y in graph) {
                graphMe[i][y] = graph[y];
            }
            ////SWG-523 Cahnges
            if (graphSe.pointCustomLabelValues != undefined && graphMe[i].customlabels.length > 0) {
                graphSe.pointCustomLabelValues = $.unique(graphMe[i].customlabels.concat(graphSe.pointCustomLabelValues));
                graphSe.pointCustomLabelValuesChkStatus = graphMe[i].checkboxes;
                graphMe[i].customlabels = [];
            }
            ////SWG-523 
            // //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
            // if(graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null){
            //     graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
            //     if(graphMe[i].correct[0].lbl == undefined)
            //         graphMe[i].correct[0].lbl = graphMe[i].label;
            // }
            // for (var j = 1; j <= 3; j++) {
            //     if (graphMe[i].incorrect[j] != undefined && graphMe[i].incorrect[j] != null) {
            //         graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
            //         if (graphMe[i].incorrect[j].lbl == undefined)
            //             graphMe[i].incorrect[j].lbl = graphMe[i].label;
            //     }
            // }
            // //Prod brocken issue fix end
            //// Prod issue SWG - 322
            if (data.designerData.elements[i].designerLabel == undefined) {
                graphMe[i].designerLabel = data.designerData.elements[i].elementlabel;
            }
            //// SWG-322
            if (graphMe[i].trackAlongLabel != undefined) {
                if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
            }
            graphMe[i].SetSettings();
        }
        if (data.designerData.elements[i].what == "line") {
            graphMe[i] = new Line(data.designerData.elements[i].cc, graphSe.ConvertXgToXpx(data.designerData.elements[i].xsg), graphSe.ConvertYgToYpx(data.designerData.elements[i].ysg), graphSe.ConvertXgToXpx(data.designerData.elements[i].xeg), graphSe.ConvertYgToYpx(data.designerData.elements[i].yeg), data.designerData.elements[i].width);

            var graph = data.designerData.elements[i];

            for (y in graph) {
                graphMe[i][y] = graph[y];
            }
            ////SWG-523 Changes
            if (graphSe.lineCustomLabelValues != undefined && graphMe[i].customlabels.length > 0) {
                graphSe.lineCustomLabelValues =  $.unique(graphMe[i].customlabels.concat(graphSe.lineCustomLabelValues));
                graphSe.lineCustomLabelValuesChkStatus = graphMe[i].checkboxes;
                graphMe[i].customlabels = [];
            }
            ////SWG-523
            // //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
            // if(graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null){
            //     graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
            //     if(graphMe[i].correct[0].lbl == undefined)
            //         graphMe[i].correct[0].lbl = graphMe[i].label;
            // }
            // for (var j = 1; j <= 3; j++) {
            //     if (graphMe[i].incorrect[j] != undefined) {
            //         graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
            //         if (graphMe[i].incorrect[j].lbl == undefined)
            //             graphMe[i].incorrect[j].lbl = graphMe[i].label;
            //     }
            // }
            // //Prod brocken issue fix end
            //// Prod issue SWG - 322
            if (data.designerData.elements[i].designerLabel == undefined) {
                graphMe[i].designerLabel = data.designerData.elements[i].elementlabel;
            }
            //// SWG-322
            if (graphMe[i].trackAlongLabel != undefined) {
                if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
            }
            graphMe[i].SetSettings();
        }
        if (data.designerData.elements[i].what == "curve") {

            graphMe[i] = new Curve(data.designerData.elements[i].cc, data.designerData.elements[i].width)

            var graph = data.designerData.elements[i];

            for (y in graph) {
                graphMe[i][y] = graph[y];
            }
            ////SWG-523 Changes
            if (graphSe.curveCustomLabelValues != undefined && graphMe[i].customlabels.length > 0) {
                graphSe.curveCustomLabelValues = $.unique(graphMe[i].customlabels.concat(graphSe.curveCustomLabelValues));
                graphSe.curveCustomLabelValuesChkStatus = graphMe[i].checkboxes;
                graphMe[i].customlabels = [];
            }
            ////SWG-523
            // //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
            // if(graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null){
            //     graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
            //     if(graphMe[i].correct[0].lbl == undefined)
            //         graphMe[i].correct[0].lbl = graphMe[i].label;
            // }
            // for (var j = 1; j <= 3; j++) {
            //     if (graphMe[i].incorrect[j] != undefined) {
            //         graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
            //         if (graphMe[i].incorrect[j].lbl == undefined)
            //             graphMe[i].incorrect[j].lbl = graphMe[i].label;
            //     }
            // }
            // //Prod brocken issue fix end
            //// Prod issue SWG - 322
            if (data.designerData.elements[i].designerLabel == undefined) {
                graphMe[i].designerLabel = data.designerData.elements[i].elementlabel;
            }
            //// SWG-322
            if (graphMe[i].trackAlongLabel != undefined) {
                if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
            }
            graphMe[i].SetSettings();
        }
        if (data.designerData.elements[i].what == "poly") {
            graphMe[i] = new Polyline(data.designerData.elements[i].cc, 1, data.designerData.elements[i].width)
            graphMe[i].doFill = true;

            var graph = data.designerData.elements[i];

            for (y in graph) {
                graphMe[i][y] = graph[y];
            }
            // //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
            // if(graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null){
            //     graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
            //     if(graphMe[i].correct[0].lbl == undefined)
            //         graphMe[i].correct[0].lbl = graphMe[i].label;
            // }
            // for (var j = 1; j <= 3; j++) {
            //     if (graphMe[i].incorrect[j] != undefined) {
            //         graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
            //         if (graphMe[i].incorrect[j].lbl == undefined)
            //             graphMe[i].incorrect[j].lbl = graphMe[i].label;
            //     }
            // }
            // //Prod brocken issue fix end
            if (graphMe[i].trackAlongLabel != undefined) {
                if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
            }
            graphMe[i].SetSettings();
        }
    }

    if (graphSe.mode == "student") graphSe.SetMode("student");

}

function loadPaths() {
    var glen = graphMe.length;

    for (var i = 0; i < glen; i++) {
        if (graphMe[i].what == "poly") graphMe[i].PathMe();
    }
}

var studentddd;
var studentidd;
var _isSolution = false;
var _isStatic = false; ////SWG-453
var _loadingStatus = ""; ////SWFB-2555
function createNewObjectSW(data, data2, isStatic, isSolution, widgetID) {
    _isSolution =isSolution;
    _isStatic = isStatic; ////SWG-453
    _loadingStatus = "In progress"; ////SWFB-2555
    if (data != undefined) {
        if (data.length > 10) {
            data = JSON.parse(data);
            studentidd = data2;
        }
    }
    if (data != "") {
        ////SWG-295 Changes UAT Issue
        if (data.elements != undefined || data.element != "") {
            for (var i = 0; i < data.elements.length; i++) {
                if (data.elements[i].what == "line") {
                    if (data.elements[i].xeg == undefined) data.elements.splice(i, 1);
                } else if (data.elements[i].what == "curve") {
                    if (data.elements[i].pts.length < 6) data.elements.splice(i, 1);
                }
            }
        }
        ////SWG-295 Changes 
        
        if (data.graph.what == "graph") {
            var graph = data.elements[i];
            //SWG-124 changes
            savedObjects = data.elements;
            //SWG-124 changes end
            graphSe.title = data.graph.title;
            graphSe.xaxis = data.graph.xaxis;
            graphSe.yaxis = data.graph.yaxis;
            graphSe.yaxis = data.graph.yaxis;
            graphSe.firstload = data.graph.firstload;
            graphSe.titleshow = data.graph.titleshow; ////SWG-221 Change
            graphSe.drawAcceptedArea = data.graph.drawAcceptedArea;
            //SWG-55 Changes
            if (data.graph.pointCustomLabelValues != undefined) {
                graphSe.pointCustomLabelValues = data.graph.pointCustomLabelValues;
                graphSe.pointCustomLabelValuesChkStatus = data.graph.pointCustomLabelValuesChkStatus;
            }

            if (data.graph.lineCustomLabelValues != undefined) {
                graphSe.lineCustomLabelValues = data.graph.lineCustomLabelValues;
                graphSe.lineCustomLabelValuesChkStatus = data.graph.lineCustomLabelValuesChkStatus;
            }

            if (data.graph.curveCustomLabelValues != undefined) {
                graphSe.curveCustomLabelValues = data.graph.curveCustomLabelValues;
                graphSe.curveCustomLabelValuesChkStatus = data.graph.curveCustomLabelValuesChkStatus;
            }

            //SWG-55 End
            //corrected issues related to Undo/redo: SWG-48,59,61 
            // // graphSe.ops = data.graph.ops;
            // // graphSe.opsRedo = data.graph.opsRedo;
            // graphSe.ops = data.graph.originalElements;
            // graphSe.opsRedo = data.graph.opsRedoStudent;

            //corrected issues related to Undo/redo: SWG-48,59,61 - Updated by Akash
            var undoCount = 0;
            var elementGhost = true;
            for (var i = 0; i < data.elements.length; i++) {
                if(data.elements[i].mode == 'student' && elementGhost == true){
                    elementGhost = false;
                }
            	if(data.elements[i].studentdrag){
            		undoCount++;
            	}
            }
            //Changes for UAT bug 29984: https://screencast.com/t/eH5If49re and 42488 (duplicate of above, after re-save) https://screencast.com/t/oYVLJCgxlw
            if (undoCount > 0 || !elementGhost) {
                if (data.graph.ops != undefined) graphSe.ops = data.graph.ops;
                if (data.graph.opsRedo != undefined) graphSe.opsRedo = data.graph.opsRedo;
            }
            else {
                if (data.graph.originalElements != undefined) graphSe.ops = data.graph.originalElements;
                if (data.graph.opsRedoStudent != undefined) graphSe.opsRedo = data.graph.opsRedoStudent;
            }
            //End of correction related to Undo/redo: SWG-48,59,61 - Updated by Akash
            graphSe.opsStudent = data.graph.opsStudent;
            graphSe.opsRedoStudent = data.graph.opsRedoStudent;
            graphSe.opsCorrect = data.graph.opsCorrect;
            graphSe.opsRedoCorrect = data.graph.opsRedoCorrect;
            graphSe.opsDesigner = data.graph.opsDesigner;
            graphSe.opsRedoDesigner = data.graph.opsRedoDesigner;

            for (var i = 0; i < 4; i++) {
                graphSe.opsIncorrect[i] = data.graph.opsRedoIncorrect[i];
                graphSe.opsRedoIncorrect[i] = data.graph.opsRedoIncorrect[i];
            }
            graphSe.incorrectActive = data.graph.incorrectActive;
            graphSe.ckeText = data.graph.ckeText;
            graphSe.ckeTextCorrect = data.graph.ckeTextCorrect;

            graphSe.fquestion = data.graph.fquestion;
            document.getElementById('questiontext').innerHTML = data.graph.fquestion;
            if (document.getElementById('tempquestiontext')) document.getElementById('tempquestiontext').value = data.graph.fquestion;

            if (document.getElementById('titletext')) document.getElementById('titletext').value = data.graph.title;
            if (document.getElementById('yaxistext')) document.getElementById('yaxistext').value = data.graph.yaxis;
            if (document.getElementById('xaxistext')) document.getElementById('xaxistext').value = data.graph.xaxis;

            if (document.getElementById('titletextstatic')) document.getElementById('titletextstatic').innerHTML = data.graph.title;
            if (document.getElementById('yaxistextstatic')) document.getElementById('yaxistextstatic').innerHTML = graphSe.yaxis;
            if (document.getElementById('xaxistextstatic')) document.getElementById('xaxistextstatic').innerHTML = data.graph.xaxis;

            if (document.getElementById('xinc')) document.getElementById('xinc').value = data.graph.xinc;
            xincChange(document.getElementById('xinc').value);

            if (document.getElementById('yinc')) document.getElementById('yinc').value = data.graph.yinc;
            yincChange(document.getElementById('yinc').value);

            if (document.getElementById('xmin')) document.getElementById('xmin').value = data.graph.xmin;
            xminChange(document.getElementById('xmin').value);

            if (document.getElementById('ymin')) document.getElementById('ymin').value = data.graph.ymin;
            yminChange(document.getElementById('ymin').value);
            //Changes for SWG-142
        if (data.graph.studentSettings) {
            graphSe.studentSettings = data.graph.studentSettings;
        }
        else {
            graphSe.studentSettings = {
                isPointDisabled: false,
                isLineDisabled: false,
                isCurveDisabled: false,
                isPolygonDisabled: false
            }
        }
        SetToolBoxOption();
        //SWG-142 changes end
            if (data.graph.grid) {
                graphSe.grid == true;
                gridt = 1;
                document.getElementById("gridtoggle").checked = true;
            } else {
                graphSe.grid == false;
                gridt = 0;
                document.getElementById("gridtoggle").checked = false;
            };
            if (data.graph.value) {
                valuet = 1;
                graphSe.value = true;
                document.getElementById("valuetoggle").checked = true;
            } else {
                valuet = 0;
                graphSe.value = false;
                document.getElementById("valuetoggle").checked = false;
            };
            if (data.graph.titleshow) { document.getElementById("titletoggle").checked = true; } else { document.getElementById("titletoggle").checked = false; };
            if (data.graph.axisshow) { document.getElementById("xytoggle").checked = true; } else { document.getElementById("xytoggle").checked = false; };
            if (data.graph.snapIt) { document.getElementById("snaptoggle").checked = true; } else { document.getElementById("snaptoggle").checked = false; };
            //graphSe.snapIt=(data.graph.snapIt=="true");
            graphSe.SetMaxes();

            update();
        }
        for (var i = 0; i < data.elements.length; i++) {
            
            if (data.elements[i].what == "point") {
                graphMe[i] = new Point(data.elements[i].cc, data.elements[i].x, data.elements[i].y, data.elements[i].radius);

                var graph = data.elements[i];

                for (y in graph) {
                    graphMe[i][y] = graph[y];
                }
                //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
                if (graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null) {
                    if (graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
                    if (graphMe[i].correct[0].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].lbl = graphMe[i].label;
                }
                for (var j = 1; j <= 3; j++) {
                    if (graphMe[i].incorrect[j] != undefined) {
                        if (graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
                        if (graphMe[i].incorrect[j].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].lbl = graphMe[i].label;
                    }
                }
                //Prod brocken issue fix end
                //// Prod issue SWG-322
                if (data.elements[i].designerLabel == undefined) {
                    graphMe[i].designerLabel = data.elements[i].elementlabel;
                }
                ////SWG - 322
                if (graphMe[i].trackAlongLabel != undefined) {
                    if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
                }
                graphMe[i].SetSettings();
            }
            if (data.elements[i].what == "line") {
                graphMe[i] = new Line(data.elements[i].cc, graphSe.ConvertXgToXpx(data.elements[i].xsg), graphSe.ConvertYgToYpx(data.elements[i].ysg), graphSe.ConvertXgToXpx(data.elements[i].xeg), graphSe.ConvertYgToYpx(data.elements[i].yeg), data.elements[i].width);

                var graph = data.elements[i];

                for (y in graph) {
                    graphMe[i][y] = graph[y];
                }
                //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
                if (graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null) {
                    if (graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
                    if (graphMe[i].correct[0].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].lbl = graphMe[i].label;
                }
                for (var j = 1; j <= 3; j++) {
                    if (graphMe[i].incorrect[j] != undefined) {
                        if (graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
                        if (graphMe[i].incorrect[j].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].lbl = graphMe[i].label;
                    }
                }
                //Prod brocken issue fix end
                //// Prod issue SWG-322
                if (data.elements[i].designerLabel == undefined) {
                    graphMe[i].designerLabel = data.elements[i].elementlabel;
                }
                ////SWG - 322
                if (graphMe[i].trackAlongLabel != undefined) {
                    if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
                }
                graphMe[i].SetSettings();
            }
            if (data.elements[i].what == "curve") {

                graphMe[i] = new Curve(data.elements[i].cc, data.elements[i].width)
                var graph = data.elements[i];

                for (y in graph) {
                    graphMe[i][y] = graph[y];
                }
                //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
                if (graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null) {
                    if (graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
                    if (graphMe[i].correct[0].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].lbl = graphMe[i].label;
                }
                for (var j = 1; j <= 3; j++) {
                    if (graphMe[i].incorrect[j] != undefined) {
                        if (graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
                        if (graphMe[i].incorrect[j].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].lbl = graphMe[i].label;
                    }
                }
                //Prod brocken issue fix end
                //// Prod issue SWG-322
                if (data.elements[i].designerLabel == undefined) {
                    graphMe[i].designerLabel = data.elements[i].elementlabel;
                }
                ////SWG - 322

                graphMe[i].DrawMe(ctx);

                if (graphMe[i].trackAlongLabel != undefined) {
                    if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
                }
                graphMe[i].SetSettings();
            }
            if (data.elements[i].what == "poly") {

                graphMe[i] = new Polyline(data.elements[i].cc, 1, data.elements[i].width)
                graphMe[i].doFill = true;

                var graph = data.elements[i];

                for (y in graph) {
                    graphMe[i][y] = graph[y];
                }
                //Prod brocken issue fix(correct and incorrect object uniquelabel issue)
                if (graphMe[i].correct[0] != undefined && graphMe[i].correct[0] != null) {
                    if (graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].uniqueLabel = graphMe[i].uniqueLabel;
                    if (graphMe[i].correct[0].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                        graphMe[i].correct[0].lbl = graphMe[i].label;
                }
                for (var j = 1; j <= 3; j++) {
                    if (graphMe[i].incorrect[j] != undefined) {
                        if (graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].uniqueLabel = graphMe[i].uniqueLabel;
                        if (graphMe[i].incorrect[j].lbl == undefined && graphMe[i].relementlabel != "Accepted Area")
                            graphMe[i].incorrect[j].lbl = graphMe[i].label;
                    }
                }
                //Prod brocken issue fix end
                if (graphMe[i].trackAlongLabel != undefined) {
                    if (graphMe[i].trackAlongLabel[0] == "C" || graphMe[i].trackAlongLabel[0] == "A") graphMe[i].Track = graphMe[i].TrackPath;
                }
                graphMe[i].SetSettings();
            }
        }

    }

    var html = "Static: " + isStatic + " Solution: " + isSolution;
    //document.getElementById("feedbackcontainer").innerHTML = html;

    if (isStatic) $('#cover').removeClass("hide");

    //console.log(isStatic, isSolution);

    if (graphSe.mode == "student") graphSe.SetMode("student");

    _loadingStatus = "Completed"; ////SWFB-2555
    ////SWFB-2555 changes start
    var statusObj = {};
    statusObj.ModuleType = '28';
    statusObj.WidgetID = widgetID;
    statusObj.Status = true;

    if (window && window.parent.CommonPlayerControl && window.parent.CommonPlayerControl.getModuleState)
        var data = window.parent.CommonPlayerControl.getModuleState(statusObj);
	////SWFB-2555 changes end   
}

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function resize() {
    var offset = $("#container").offset().left;
    var offsettop = $("#container").offset().top;
    //console.log(graphSe.mode);


    var leftos = graphSe.mode == 'student' ? 112 : offset + 57 + 30
    //var leftos = 112;    
    var topos = offsettop + 163 + 90;
    var topos2 = offsettop + 145 + 90; 
    
    document.getElementById("CanvasAnimate").style.left = leftos + "px";
    document.getElementById("CanvasGraph").style.left = leftos + "px";
    if (graphSe.mode == 'student') {
        document.getElementById("CanvasAnimate2").style.left = leftos - 42 + "px";
    }
    else {
        document.getElementById("CanvasAnimate2").style.left = leftos - 40 + "px";
    }
    
     ////SWG-221 Changes
    if (graphSe.mode == "student" && (document.getElementById("titletextstatic").innerText == "" || !graphSe.titleshow)) {
        $('#CanvasGraph').css('top', '110px');
        $('#CanvasAnimate').css('top', '110px');
        $('#CanvasAnimate2').css('top', '96px');

        $('#yaxistextstatic').css('top', '78px');
        $('#xaxistextstatic').css('top', '532px');//SWG_68
        $('#graphcontainer').css('height', '506px');

        $('#yaxistext').addClass("hide");
        $('#xaxistext').addClass("hide");
        $('#titletextstatic').addClass("hide");
        $('#titletext').addClass("hide");
    } else if (graphSe.mode == 'student' && (document.getElementById('titletextstatic').innerText != "" && graphSe.titleshow)) {
        document.getElementById("CanvasAnimate").style.top = topos - 90 + "px";
        document.getElementById("CanvasGraph").style.top = topos - 90 + "px";
        document.getElementById("CanvasAnimate2").style.top = topos2 - 90 + "px";
        $('#yaxistext').addClass("hide");
        $('#xaxistext').addClass("hide");
        $('#yaxistextstatic').css('top', '');
        $('#xaxistextstatic').css('top', '');
        $('#titletextstatic').removeClass("hide");
        $('#graphcontainer').css('height', '572px');
    } else if (graphSe.titleshow && !_isSolution && graphSe.mode == "designer") {
            document.getElementById("CanvasAnimate").style.top = topos + "px";
            document.getElementById("CanvasGraph").style.top = topos + "px";
            document.getElementById("CanvasAnimate2").style.top = topos2 + "px";
    }
    ////SWG-221

    hideDToolsIfEmpty();
}

function resize2() {
    var offset = $("#container").offset().left;
    var offsettop = $("#container").offset().top;
    console.log(offsettop);

    //var leftos = offset + 57 + 30
    var leftos = graphSe.mode == 'student' ? 112 : offset + 57 + 30
    var topos = offsettop + 163 + 90;
    var topos2 = offsettop + 145 + 90;

    document.getElementById("CanvasAnimate").style.left = leftos + "px";
    document.getElementById("CanvasGraph").style.left = leftos + "px";
    if (graphSe.mode == 'student') {
        document.getElementById("CanvasAnimate2").style.left = leftos - 42 + "px";
    }
    else {
        document.getElementById("CanvasAnimate2").style.left = leftos - 40 + "px";
    }

    if(!_isSolution && !_isStatic){ ////SWG-453
    document.getElementById("CanvasAnimate").style.top = topos - 90 + "px";
    document.getElementById("CanvasGraph").style.top = topos - 90 + "px";
    document.getElementById("CanvasAnimate2").style.top = topos2 - 90 + "px";
    } 

}

function correctMode() {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    gmloc = 1;
    if (graphMe.length > 0)
        graphMe[gmloc - 1].SetSettings();

    saveCKEText();

    document.getElementById('titletextstatic').innerHTML = graphSe.title;
    if (graphSe.titleshow) $('#titletextstatic').removeClass("hide");

    document.getElementById('xaxistextstatic').innerHTML = graphSe.xaxis;
    if (graphSe.axisshow) $('#xaxistextstatic').removeClass("hide");

    document.getElementById('yaxistextstatic').innerHTML = graphSe.yaxis;
    if (graphSe.axisshow) $('#yaxistextstatic').removeClass("hide");

    $('#graphcontainer').removeClass("hide");
    $('#toolbar').removeClass("hide");
    $('#CanvasGraph').removeClass("hide");
    $('#CanvasAnimate').removeClass("hide");
    $('#CanvasAnimate2').removeClass("hide");
    $('#alltools').removeClass("hide");

    $('#cktexteditor').removeClass("hide");

    $('#student').addClass("btn-main-off-small");
    $('#designer').addClass("btn-main-off");
    $('#correct').addClass("btn-main-on");

    $('#correct').removeClass("btn-main-off");
    $('#designer').removeClass("btn-main-on");
    $('#student').removeClass("btn-main-on-small");

    $('#incorrect0').addClass("btn-main-off");
    $('#incorrect0').removeClass("btn-main-on");
    document.getElementById("incorrect0").disabled = false;

    $('#incorrect1').addClass("btn-main-off");
    $('#incorrect1').removeClass("btn-main-on");
    //document.getElementById("incorrect1").disabled = false; 

    $('#incorrect2').addClass("btn-main-off");
    $('#incorrect2').removeClass("btn-main-on");
    //document.getElementById("incorrect2").disabled = false; 

    $('#incorrect3').addClass("btn-main-off");
    $('#incorrect3').removeClass("btn-main-on");
    //document.getElementById("incorrect3").disabled = false; 

    isIncOn();

    $(".btn-econ-sw5").attr("disabled", false);

    document.getElementById("correct").disabled = true;
    document.getElementById("designer").disabled = false;
    document.getElementById("student").disabled = false;

    document.getElementById("label").disabled = true;
    $('#toptools').addClass("hide");
    $('#bottomtools').addClass("hide");
    $('#drawingtools').addClass("hide");
    $('#studentdetails').addClass("hide");
    $('#interactive').addClass("hide");

    $('#tempquestiontext').addClass("hide");


    graphSe.SetMode("correct");
     //Changes for SWG-142
     SetToolBoxOption();
    //End SWG-142

    ////SWG-221 Changes
    if(_isSolution)
    {
        if(graphSe.titleshow && graphSe.title != ""){
             //$('#titletext').addClass("hide");
             $('#CanvasGraph').css('top', '163px');
             $('#CanvasAnimate').css('top', '163px');
             $('#CanvasAnimate2').css('top', '145px');

        } else {
            $('#CanvasGraph').css('top', '110px');
            $('#CanvasAnimate').css('top', '110px');
            $('#CanvasAnimate2').css('top', '96px');

            $('#titletext').addClass("hide");
            $('#yaxistextstatic').css('top', '78px');
            $('#xaxistextstatic').css('top', '530px');//SWG_68
            $('#graphcontainer').css('height', '521px');

            $('#yaxistext').addClass("hide");
            $('#xaxistext').addClass("hide");
            $('#titletextstatic').addClass("hide");

        }

    } else 
    {
        if(graphSe.titleshow && graphSe.title != "")
        {
            resize();
            $('#deletebutton1').css('top', '127px');
            $('#yaxistextstatic').css('top', '125px');
            $('#xaxistextstatic').css('top', '580px');//SWG_68
            $('#titletextstatic').css('display', 'block');
            $('#graphcontainer').css('height', '');

        } 
        else
        {
            $('#titletext').addClass("hide");
            $('#yaxistext').css('top', '80px');
            $('#xaxistext').css('top', '535px');//SWG_68

            $('#deletebutton1').css('top', '80px');

            $('#CanvasGraph').css('top', '205px');
            $('#CanvasAnimate').css('top', '205px');
            $('#CanvasAnimate2').css('top', '187px');

            $('#titletextstatic').css('display', 'none');
            $('#yaxistextstatic').css('top', '78px');
            $('#xaxistextstatic').css('top', '535px');//SWG_68
            $('#graphcontainer').css('height', '520px');

        }

    }

    if (graphMe.length == 0) {
        $('#emptydesigner').removeClass("hide");
    }

    CKEDITOR.instances.editor1.setData(graphSe.ckeTextCorrect)

    if ((graphMe.length != 0) && (graphMe[gmloc - 1] != undefined)) graphMe[gmloc - 1].SetSettings();
    //SWG - 200 changes
    for (var i = 0; i < graphMe.length; i++) {
        var MyObject = graphMe[i];
        //Changes for SWG-312 and 313
        MyObject.resetCoordinates = false;
        if (MyObject.upCoordinatesUpdated)
            MyObject.upCoordinatesUpdated = undefined;
        if (MyObject.downCoordinatesUpdated)
            MyObject.downCoordinatesUpdated = undefined;
        if (MyObject.inwardCoordinatesUpdated)
            MyObject.inwardCoordinatesUpdated = undefined;
        if (MyObject.outwardCoordinatesUpdated)
            MyObject.outwardCoordinatesUpdated = undefined;
        MyObject.rightCoordinatesUpdated = undefined;
        MyObject.leftCoordinatesUpdated = undefined;
        //Changes for SWG-312 and 313 end
        if (MyObject.correctlabel && MyObject.requiredlabel) {
            //MyObject.SetElementLabel(MyObject.correctlabel);
            MyObject.elementlabel = MyObject.correctlabel;
            if (graphSe.mode != "designer" && MyObject.elementlabel != "None") {
                MyObject.tempbookColor = "Yes";
                MyObject.tempLableLine = true;
            }
        }
        else {
            if (MyObject.mode == "designer" && MyObject.designerLabel) {
                MyObject.elementlabel = MyObject.designerLabel != undefined ? MyObject.designerLabel : "";
            }
        }
        MyObject.SetColor();
    }
    UpdateAllCoordinates();

    //capture all the elements and its original coordinates - copy it to some other element
    saveAllElements();

}

// this function saves all the graph elements from graphMe to graphSe.
// correct mode calls this function
function saveAllElements() {
    // remove all the elements before pushing in new elements
    if (graphSe.originalElements.length != 0) graphSe.originalElements.splice(0, graphSe.originalElements.length);

    for (var i = 0, ln = graphMe.length; i < ln; i++) {
        // if you come in here first time, there wont be any value for originalCoordinates, continue in that case
        var existingElement = graphMe[i];
        //var newElement = findInOriginalElements(existingElement.label);

        // if the element cant be found or if the originalCoordinates are not set then move on
        // if ( newElement != null ) 
        // {
        // 	if ( newElement.originalCoordinates != undefined ) 
        // 	{
        // 		// save all the original points back from the originalCoordinates element 
        // 		// -- if we take the values as-is then the updated left/right/up/down values will be stored back as original values and futher cause issues

        // 		if ( existingElement.what == 'point')
        // 		{
        // 				newElement[i].sxg = existingElement.originalCoordinates.sxg; 
        // 				newElement[i].xg = existingElement.originalCoordinates.xg;
        // 		}
        // 		if ( existingElement.what == 'line' )
        // 		{
        // 				// newElement[i].sxsg = existingElement.originalCoordinates.sxsg  
        // 				// newElement[i].sysg = existingElement.originalCoordinates.sysg 
        // 				// newElement[i].sxeg = existingElement.originalCoordinates.sxeg
        // 				// newElement[i].syeg = existingElement.originalCoordinates.syeg
        // 				// newElement[i].xe = existingElement.originalCoordinates.xe
        // 				// newElement[i].xeg = existingElement.originalCoordinates.xeg
        // 				// newElement[i].xs = existingElement.originalCoordinates.xs
        // 				// newElement[i].xsg = existingElement.originalCoordinates.xsg
        // 				// newElement[i].ye = existingElement.originalCoordinates.ye
        // 				// newElement[i].yeg = existingElement.originalCoordinates.yeg
        // 				// newElement[i].ys = existingElement.originalCoordinates.ys
        // 				// newElement[i].ysg = existingElement.originalCoordinates.ysg
        // 		}
        // 	}

        // } // if newElement not null

        graphSe.originalElements.push(existingElement);
    }

    // Akash to start with logic here onwards. 

}

function inc0Mode() {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    gmloc = 1;
    if (graphMe.length > 0)
        graphMe[gmloc - 1].SetSettings();;

    saveCKEText();

    document.getElementById('titletextstatic').innerHTML = graphSe.title;
    if (graphSe.titleshow) $('#titletextstatic').removeClass("hide");

    document.getElementById('xaxistextstatic').innerHTML = graphSe.xaxis;
    if (graphSe.axisshow) $('#xaxistextstatic').removeClass("hide");

    document.getElementById('yaxistextstatic').innerHTML = graphSe.yaxis;
    if (graphSe.axisshow) $('#yaxistextstatic').removeClass("hide");

    $('#graphcontainer').addClass("hide");
    $('#toolbar').removeClass("hide");

    $(".btn-econ-sw5").attr("disabled", true);
    $("#save1").attr("disabled", false);

    $('#CanvasGraph').addClass("hide");
    $('#CanvasAnimate').addClass("hide");
    $('#CanvasAnimate2').addClass("hide");
    $('#alltools').addClass("hide");

    $('#student').addClass("btn-main-off-small");
    $('#designer').addClass("btn-main-off");
    $('#correct').addClass("btn-main-off");

    $('#correct').removeClass("btn-main-on");
    $('#designer').removeClass("btn-main-on");
    $('#student').removeClass("btn-main-on-small");

    document.getElementById("correct").disabled = false;
    document.getElementById("designer").disabled = false;
    document.getElementById("student").disabled = false;
    $('#incorrect0').removeClass("btn-main-off");
    $('#incorrect0').addClass("btn-main-on");
    document.getElementById("incorrect0").disabled = true;

    $('#incorrect1').addClass("btn-main-off");
    $('#incorrect1').removeClass("btn-main-on");
    //document.getElementById("incorrect1").disabled = false; 

    $('#incorrect2').addClass("btn-main-off");
    $('#incorrect2').removeClass("btn-main-on");
    //document.getElementById("incorrect2").disabled = false; 

    $('#incorrect3').addClass("btn-main-off");
    $('#incorrect3').removeClass("btn-main-on");
    //document.getElementById("incorrect3").disabled = false; 

    isIncOn();

    document.getElementById("label").disabled = true;

    $('#toptools').addClass("hide");
    $('#bottomtools').addClass("hide");
    $('#drawingtools').addClass("hide");
    $('#studentdetails').addClass("hide");

    $('#tempquestiontext').addClass("hide");

    $('#cktexteditor').removeClass("hide");

    graphSe.SetMode("incorrect0");
    //Changes for SWG-142
     SetToolBoxOption();
    //End SWG-142

    if (graphMe.length == 0) {
        $('#emptydesigner').removeClass("hide");
    }

    CKEDITOR.instances.editor1.setData(graphSe.ckeText[0])

    if (graphMe.length != 0) graphMe[gmloc - 1].SetSettings();

}

function inc1Mode() {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();

    // gmloc = 1;
    // if (graphMe.length > 0)
    //     graphMe[gmloc - 1].SetSettings();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    saveCKEText();

    document.getElementById('titletextstatic').innerHTML = graphSe.title;
    if (graphSe.titleshow) $('#titletextstatic').removeClass("hide");

    document.getElementById('xaxistextstatic').innerHTML = graphSe.xaxis;
    if (graphSe.axisshow) $('#xaxistextstatic').removeClass("hide");

    document.getElementById('yaxistextstatic').innerHTML = graphSe.yaxis;
    if (graphSe.axisshow) $('#yaxistextstatic').removeClass("hide");

    $('#graphcontainer').removeClass("hide");
    $('#toolbar').removeClass("hide");
    $('#CanvasGraph').removeClass("hide");
    $('#CanvasAnimate').removeClass("hide");
    $('#CanvasAnimate2').removeClass("hide");
    $('#alltools').removeClass("hide");

    $('#cktexteditor').removeClass("hide");

    $('#student').addClass("btn-main-off-small");
    $('#designer').addClass("btn-main-off");
    $('#correct').addClass("btn-main-off");

    $('#correct').removeClass("btn-main-on");
    $('#designer').removeClass("btn-main-on");
    $('#student').removeClass("btn-main-on-small");

    document.getElementById("correct").disabled = false;
    document.getElementById("designer").disabled = false;
    document.getElementById("student").disabled = false;

    $('#incorrect1').removeClass("btn-main-off");
    $('#incorrect1').addClass("btn-main-on");
    //document.getElementById("incorrect1").disabled = true; 

    $('#incorrect0').addClass("btn-main-off");
    $('#incorrect0').removeClass("btn-main-on");
    document.getElementById("incorrect0").disabled = false;

    $('#incorrect2').addClass("btn-main-off");
    $('#incorrect2').removeClass("btn-main-on");
    //document.getElementById("incorrect2").disabled = false; 

    $('#incorrect3').addClass("btn-main-off");
    $('#incorrect3').removeClass("btn-main-on");
    //document.getElementById("incorrect3").disabled = false; 

    $(".btn-econ-sw5").attr("disabled", false);

    isIncOn();
    document.getElementById("incorrect1").disabled = true;

    document.getElementById("label").disabled = true;

    $('#toptools').addClass("hide");
    $('#bottomtools').addClass("hide");
    $('#drawingtools').addClass("hide");
    $('#studentdetails').addClass("hide");

    $('#tempquestiontext').addClass("hide");
    graphSe.SetMode("incorrect1");

    //Changes for SWG-142
     SetToolBoxOption();
    //End SWG-142

     ////SWG-221 Changes
     if (graphSe.title == undefined || graphSe.title == "" || !graphSe.titleshow) {
         $('#titletext').addClass("hide");
         $('#yaxistext').css('top', '80px');
         $('#xaxistext').css('top', '535px');//SWG_68
         
         $('#deletebutton1').css('top', '80px');
         
         $('#CanvasGraph').css('top', '205px');
         $('#CanvasAnimate').css('top', '205px');
         $('#CanvasAnimate2').css('top', '187px');
         
         $('#titletextstatic').css('display','none');
         $('#yaxistextstatic').css('top','78px');
         $('#xaxistextstatic').css('top','535px');//SWG_68
         $('#graphcontainer').css('height','520px');
         
     }
     else {
         resize();
         $('#deletebutton1').css('top', '127px');
         $('#yaxistextstatic').css('top','125px');
         $('#xaxistextstatic').css('top','580px');//SWG_68        
         $('#titletextstatic').css('display','block');          
         $('#graphcontainer').css('height','');
     }
    ////SWG-221

     var arr = jQuery.grep(graphMe, function (val) {
         return ((val.deletedFrom == undefined && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode)) || (val.deletedFrom != undefined && val.deletedFrom.length > 0 && val.deletedFrom.indexOf(graphSe.mode) == -1) && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode));
     });

     gmloc = 1;
     if (graphMe.length > 0 && arr.length > 0) {
         for (var i = 0; i < graphMe.length; i++) {
             if (graphMe[i].deletedFrom != undefined && graphMe[i].deletedFrom[1] == "incorrect1") {
                 gmloc += 1;
             }
             else {
                 break;
             }
         }
         //graphMe[gmloc - 1].SetSettings();
     }

    if (graphMe.length == 0) {
        $('#emptydesigner').removeClass("hide");
    }

    CKEDITOR.instances.editor1.setData(graphSe.ckeText[1])

    if (graphMe.length != 0) graphMe[gmloc - 1].SetSettings();
    //SWG - 200 changes
    for (var i = 0; i < graphMe.length; i++) {
        var MyObject = graphMe[i];
        //Changes for SWG-312 and 313
        MyObject.resetCoordinates = false;
        if (MyObject.upCoordinatesUpdated != undefined)
            MyObject.upCoordinatesUpdated = undefined;
        if (MyObject.downCoordinatesUpdated != undefined)
            MyObject.downCoordinatesUpdated = undefined;
        if (MyObject.inwardCoordinatesUpdated != undefined)
            MyObject.inwardCoordinatesUpdated = undefined;
        if (MyObject.outwardCoordinatesUpdated != undefined)
            MyObject.outwardCoordinatesUpdated = undefined;
        MyObject.rightCoordinatesUpdated = undefined;
        MyObject.leftCoordinatesUpdated = undefined;
        if(MyObject.evalshiftinc[1] == undefined){
            MyObject.evalshiftinc[1] = MyObject.evalshift;
        }
        if(MyObject.preciseinc[1] == undefined){
            MyObject.preciseinc[1] = MyObject.precise;
        }
        //Changes for SWG-312 and 313 end
        if (MyObject.requiredlabelinc[1]) {
            MyObject.elementlabel = (MyObject.correctlabelinc[1] != undefined && MyObject.correctlabelinc[1] != "b") ? MyObject.correctlabelinc[1] : (MyObject.correctlabel != undefined ? MyObject.correctlabel : MyObject.designerLabel);
        }
        else {
            if (MyObject.mode == "designer" && MyObject.designerLabel) {
                MyObject.elementlabel = MyObject.designerLabel != undefined ? MyObject.designerLabel : "";
            }
            else if (MyObject.mode == "correct" && MyObject.correctlabelinc[1] == undefined) {
                MyObject.elementlabel = MyObject.correctlabel != undefined ? MyObject.correctlabel : "";
            }
            else if(MyObject.designerLabel){
                MyObject.elementlabel = (MyObject.correctlabelinc[1] != undefined && MyObject.correctlabelinc[1] != "b") ? MyObject.correctlabelinc[1] : (MyObject.correctlabel != undefined ? MyObject.correctlabel : MyObject.designerLabel);
            }
        }
        MyObject.SetColor();
    }
    //SWG - 200 Changes Ends
}

function inc2Mode() {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    saveCKEText();
    $(".btn-econ-sw5").attr("disabled", false);

    document.getElementById('titletextstatic').innerHTML = graphSe.title;
    if (graphSe.titleshow) $('#titletextstatic').removeClass("hide");

    document.getElementById('xaxistextstatic').innerHTML = graphSe.xaxis;
    if (graphSe.axisshow) $('#xaxistextstatic').removeClass("hide");

    document.getElementById('yaxistextstatic').innerHTML = graphSe.yaxis;
    if (graphSe.axisshow) $('#yaxistextstatic').removeClass("hide");

    $('#cktexteditor').removeClass("hide");
    $('#student').addClass("btn-main-off-small");
    $('#designer').addClass("btn-main-off");
    $('#correct').addClass("btn-main-off");

    $('#correct').removeClass("btn-main-on");
    $('#designer').removeClass("btn-main-on");
    $('#student').removeClass("btn-main-on-small");

    $('#graphcontainer').removeClass("hide");
    $('#toolbar').removeClass("hide");
    $('#CanvasGraph').removeClass("hide");
    $('#CanvasAnimate').removeClass("hide");
    $('#CanvasAnimate2').removeClass("hide");
    $('#alltools').removeClass("hide");

    document.getElementById("correct").disabled = false;
    document.getElementById("designer").disabled = false;
    document.getElementById("student").disabled = false;

    $('#incorrect2').removeClass("btn-main-off");
    $('#incorrect2').addClass("btn-main-on");
    //document.getElementById("incorrect2").disabled = true; 

    $('#incorrect0').addClass("btn-main-off");
    $('#incorrect0').removeClass("btn-main-on");
    document.getElementById("incorrect0").disabled = false;

    $('#incorrect1').addClass("btn-main-off");
    $('#incorrect1').removeClass("btn-main-on");
    //document.getElementById("incorrect1").disabled = false; 

    $('#incorrect3').addClass("btn-main-off");
    $('#incorrect3').removeClass("btn-main-on");
    //document.getElementById("incorrect3").disabled = false; 

    isIncOn();
    document.getElementById("incorrect2").disabled = true;

    document.getElementById("label").disabled = true;

    $('#toptools').addClass("hide");
    $('#bottomtools').addClass("hide");
    $('#drawingtools').addClass("hide");
    $('#studentdetails').addClass("hide");

    $('#tempquestiontext').addClass("hide");

    
    graphSe.SetMode("incorrect2");
    //Changes for SWG-142
    SetToolBoxOption();
    //End SWG-142
     ////SWG-221 Changes
     if (graphSe.title == undefined || graphSe.title == "" || !graphSe.titleshow) {
         $('#titletext').addClass("hide");
         $('#yaxistext').css('top', '80px');
         $('#xaxistext').css('top', '535px');//SWG_68
         
         $('#deletebutton1').css('top', '80px');
         
         $('#CanvasGraph').css('top', '205px');
         $('#CanvasAnimate').css('top', '205px');
         $('#CanvasAnimate2').css('top', '187px');
         
         $('#titletextstatic').css('display','none');
         $('#yaxistextstatic').css('top','78px');
         $('#xaxistextstatic').css('top','535px');//SWG_68
         $('#graphcontainer').css('height','520px');
         
     }
     else {
         resize();
         $('#deletebutton1').css('top', '127px');
         $('#yaxistextstatic').css('top','125px');
         $('#xaxistextstatic').css('top','580px');//SGR_68        
         $('#titletextstatic').css('display','block');          
         $('#graphcontainer').css('height','');
     }
    ////SWG-221

    ////SWG - 199 Changes
    var arr = jQuery.grep(graphMe, function (val) {
         return ((val.deletedFrom == undefined && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode)) || (val.deletedFrom != undefined && val.deletedFrom.length > 0 && val.deletedFrom.indexOf(graphSe.mode) == -1) && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode));
     });

    gmloc = 1;
    if (graphMe.length > 0 && arr.length > 0) {
        for (var i = 0; i < graphMe.length; i++) {
            if (graphMe[i].deletedFrom != undefined && graphMe[i].deletedFrom[2] == "incorrect2") {
                gmloc += 1;
            }
            else {
                break;
            }
        }
        //graphMe[gmloc - 1].SetSettings();
    }

    if (graphMe.length == 0) {
        $('#emptydesigner').removeClass("hide");
    }

    if (graphMe.length == 0) {
        $('#emptydesigner').removeClass("hide");
    }

    CKEDITOR.instances.editor1.setData(graphSe.ckeText[2])

    if (graphMe.length != 0) graphMe[gmloc - 1].SetSettings();
    //SWG - 200 changes
    for (var i = 0; i < graphMe.length; i++) {
        var MyObject = graphMe[i];
        //Changes for SWG-312 and 313
        MyObject.resetCoordinates = false;
        if (MyObject.upCoordinatesUpdated != undefined)
            MyObject.upCoordinatesUpdated = undefined;
        if (MyObject.downCoordinatesUpdated != undefined)
            MyObject.downCoordinatesUpdated = undefined;
        if (MyObject.inwardCoordinatesUpdated != undefined)
            MyObject.inwardCoordinatesUpdated = undefined;
        if (MyObject.outwardCoordinatesUpdated != undefined)
            MyObject.outwardCoordinatesUpdated = undefined;
        MyObject.rightCoordinatesUpdated = undefined;
        MyObject.leftCoordinatesUpdated = undefined;

        if(MyObject.evalshiftinc[2] == undefined){
            MyObject.evalshiftinc[2] = MyObject.evalshift;
        }
        if(MyObject.preciseinc[2] == undefined){
            MyObject.preciseinc[2] = MyObject.precise;
        }
        //Changes for SWG-312 and 313 end
        if (MyObject.requiredlabelinc[2]) {
            MyObject.elementlabel = (MyObject.correctlabelinc[2] != undefined && MyObject.correctlabelinc[2] != "b") ? MyObject.correctlabelinc[2] : (MyObject.correctlabel != undefined ? MyObject.correctlabel : MyObject.designerLabel);
        }
        else {
            if (MyObject.mode == "designer" && MyObject.designerLabel) {
                MyObject.elementlabel = MyObject.designerLabel != undefined ? MyObject.designerLabel : "";
            }
            else if (MyObject.mode == "correct" && MyObject.correctlabelinc[2] == undefined) {
                MyObject.elementlabel = MyObject.correctlabel != undefined ? MyObject.correctlabel : "";
            }
            else if(MyObject.designerLabel) {
                MyObject.elementlabel = (MyObject.correctlabelinc[2] != undefined && MyObject.correctlabelinc[2] != "b") ? MyObject.correctlabelinc[2] : (MyObject.correctlabel != undefined ? MyObject.correctlabel : MyObject.designerLabel);
            }
        }
        MyObject.SetColor();
    }
    //SWG - 200 Changes Ends
}

function inc3Mode() {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    gmloc = 1;
    if (graphMe.length > 0)
        graphMe[gmloc - 1].SetSettings();

    saveCKEText();

    document.getElementById('titletextstatic').innerHTML = graphSe.title;
    if (graphSe.titleshow) $('#titletextstatic').removeClass("hide");

    document.getElementById('xaxistextstatic').innerHTML = graphSe.xaxis;
    if (graphSe.axisshow) $('#xaxistextstatic').removeClass("hide");

    document.getElementById('yaxistextstatic').innerHTML = graphSe.yaxis;
    if (graphSe.axisshow) $('#yaxistextstatic').removeClass("hide");

    $('#cktexteditor').removeClass("hide");

    $(".btn-econ-sw5").attr("disabled", false);

    $('#graphcontainer').removeClass("hide");
    $('#toolbar').removeClass("hide");
    $('#CanvasGraph').removeClass("hide");
    $('#CanvasAnimate').removeClass("hide");
    $('#CanvasAnimate2').removeClass("hide");
    $('#alltools').removeClass("hide");

    $('#student').addClass("btn-main-off-small");
    $('#designer').addClass("btn-main-off");
    $('#correct').addClass("btn-main-off");

    $('#correct').removeClass("btn-main-on");
    $('#designer').removeClass("btn-main-on");
    $('#student').removeClass("btn-main-on-small");

    document.getElementById("correct").disabled = false;
    document.getElementById("designer").disabled = false;
    document.getElementById("student").disabled = false;
    //Changes for SWG-142
     SetToolBoxOption();
    //End SWG-142

    $('#incorrect3').removeClass("btn-main-off");
    $('#incorrect3').addClass("btn-main-on");
    //document.getElementById("incorrect3").disabled = true; 

    $('#incorrect0').addClass("btn-main-off");
    $('#incorrect0').removeClass("btn-main-on");
    document.getElementById("incorrect0").disabled = false;

    $('#incorrect1').addClass("btn-main-off");
    $('#incorrect1').removeClass("btn-main-on");
    //document.getElementById("incorrect1").disabled = false; 

    $('#incorrect2').addClass("btn-main-off");
    $('#incorrect2').removeClass("btn-main-on");
    //document.getElementById("incorrect2").disabled = false; 

    isIncOn();
    document.getElementById("incorrect3").disabled = true;

    document.getElementById("label").disabled = true;

    $('#toptools').addClass("hide");
    $('#bottomtools').addClass("hide");
    $('#drawingtools').addClass("hide");
    $('#studentdetails').addClass("hide");

    $('#tempquestiontext').addClass("hide");
    
    graphSe.SetMode("incorrect3");
    //Changes for SWG-142
     SetToolBoxOption();
    //End SWG-142
     ////SWG-221 Changes
     if (graphSe.title == undefined || graphSe.title == "" || !graphSe.titleshow) {
         $('#titletext').addClass("hide");
         $('#yaxistext').css('top', '80px');
         $('#xaxistext').css('top', '535px');//SWG_68
         
         $('#deletebutton1').css('top', '80px');
         
         $('#CanvasGraph').css('top', '205px');
         $('#CanvasAnimate').css('top', '205px');
         $('#CanvasAnimate2').css('top', '187px');
         
         $('#titletextstatic').css('display','none');
         $('#yaxistextstatic').css('top','78px');
         $('#xaxistextstatic').css('top','535px');//SWG_68
         $('#graphcontainer').css('height','520px');
         
     }
     else {
         resize();
         $('#deletebutton1').css('top', '127px');
         $('#yaxistextstatic').css('top','125px');
         $('#xaxistextstatic').css('top','580px');//SWG_68       
         $('#titletextstatic').css('display','block');          
         $('#graphcontainer').css('height','');
     }
    ////SWG-221
    ////SWG - 199 Changes
     var arr = jQuery.grep(graphMe, function (val) {
         return ((val.deletedFrom == undefined && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode)) || (val.deletedFrom != undefined && val.deletedFrom.length > 0 && val.deletedFrom.indexOf(graphSe.mode) == -1) && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode));
     });

     gmloc = 1;
     if (graphMe.length > 0 && arr.length > 0) {
         for (var i = 0; i < graphMe.length; i++) {
             if (graphMe[i].deletedFrom != undefined && graphMe[i].deletedFrom[3] == "incorrect3") {
                 gmloc += 1;
             }
             else {
                 break;
             }
         }
        // graphMe[gmloc - 1].SetSettings();
     }

    if (graphMe.length == 0) {
        $('#emptydesigner').removeClass("hide");
    }

    CKEDITOR.instances.editor1.setData(graphSe.ckeText[3])

    if (graphMe.length != 0) graphMe[gmloc - 1].SetSettings();
     //SWG - 200 changes
    for (var i = 0; i < graphMe.length; i++) {
        var MyObject = graphMe[i];
        //Changes for SWG-312 and 313
        MyObject.resetCoordinates = false;
         MyObject.resetCoordinates = false;
        if (MyObject.upCoordinatesUpdated != undefined)
            MyObject.upCoordinatesUpdated = undefined;
        if (MyObject.downCoordinatesUpdated != undefined)
            MyObject.downCoordinatesUpdated = undefined;
        if (MyObject.inwardCoordinatesUpdated != undefined)
            MyObject.inwardCoordinatesUpdated = undefined;
        if (MyObject.outwardCoordinatesUpdated != undefined)
            MyObject.outwardCoordinatesUpdated = undefined;
        MyObject.rightCoordinatesUpdated = undefined;
        MyObject.leftCoordinatesUpdated = undefined;
        
        if(MyObject.evalshiftinc[3] == undefined){
            MyObject.evalshiftinc[3] = MyObject.evalshift;
        }
        if(MyObject.preciseinc[3] == undefined){
            MyObject.preciseinc[3] = MyObject.precise;
        }
        //Changes for SWG-312 and 313 end
        if (MyObject.requiredlabelinc[3]) {
            MyObject.elementlabel = (MyObject.correctlabelinc[3] != undefined && MyObject.correctlabelinc[3] != "b") ? MyObject.correctlabelinc[3] : (MyObject.correctlabel != undefined ? MyObject.correctlabel : MyObject.designerLabel);
        }
        else {
            if (MyObject.mode == "designer" && MyObject.designerLabel) {
                MyObject.elementlabel = MyObject.designerLabel != undefined ? MyObject.designerLabel : "";
            }
            else if (MyObject.mode == "correct" && MyObject.correctlabelinc[3] == undefined ) {
                MyObject.elementlabel = MyObject.correctlabel != undefined ? MyObject.correctlabel : "";
            }
            else if (MyObject.designerLabel){
                MyObject.elementlabel = (MyObject.correctlabelinc[3] != undefined && MyObject.correctlabelinc[3] != "b") ? MyObject.correctlabelinc[3] : (MyObject.correctlabel != undefined ? MyObject.correctlabel : MyObject.designerLabel);
            }
        }
        MyObject.SetColor();
    }
    //SWG - 200 Changes Ends
}

function deleteAll() {
    //undoMe = []; 
    //graphMe = []; 
    //graphSe.ops = []; 
    //graphSe.opsRedo = [];
    //if( graphSe.mode == "designer" ) {graphSe.opsDesigner = []; graphSe.opsRedoDesigner = []; }
    //else if( graphSe.mode == "correct" ) { graphSe.opsCorrect = []; graphSe.opsRedoCorrect = []; }
    //if( graphSe.mode == "student" ) { graphSe.opsStudent = []; graphSe.opsRedoStudent = []; }
    //graphSe.opsDesigner = []; 
    //graphSe.opsRedoDesigner = [];
    //graphSe.opsCorrect = []; 
    //graphSe.opsRedoCorrect = [];
    //graphSe.opsStudent = []; 
    //graphSe.opsRedoStudent = [];
    while (graphSe.ops.length > 0) graphSe.Undo1();

    if (graphSe.mode == "designer" || graphSe.mode == "correct") {
        graphSe.opsDesigner = [];
        graphSe.opsRedoDesigner = [];
        graphSe.opsCorrect = [];
        graphSe.opsRedoCorrect = [];
    } else if (graphSe.mode == "student") {
        graphSe.opsStudent = [];
        graphSe.opsRedoStudent = [];
    }

    graphSe.ops = [];
    graphSe.opsRedo = [];

    resetSetSettings();

}

function resetSetSettings() {

    $('#bottomtools').addClass("hide");
    $('#interactive').addClass("hide");
    $('#interactivetools').addClass("hide");
    $('#drawingtools').addClass("hide");
    $('#labeldetails').addClass("hide");

    npoints = 0;
    lpoints = 0;
    cpoints = 0;
    apoints = 0;
}

function designerMode() {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    gmloc = 1;
    if (graphMe.length > 0)
        graphMe[gmloc - 1].SetSettings();

    saveCKEText();

    $('#titletextstatic').addClass("hide");
    $('#xaxistextstatic').addClass("hide");
    $('#yaxistextstatic').addClass("hide");

    $(".btn-econ-sw5").attr("disabled", false);

    $('#student').addClass("btn-main-off");
    $('#correct').addClass("btn-main-off");
    $('#designer').addClass("btn-main-on");

    $('#graphcontainer').removeClass("hide");
    $('#toolbar').removeClass("hide");
    $('#CanvasGraph').removeClass("hide");
    $('#CanvasAnimate').removeClass("hide");
    $('#CanvasAnimate2').removeClass("hide");
    $('#alltools').removeClass("hide");

    $('#cktexteditor').addClass("hide");

    $('#designer').removeClass("btn-main-off");
    $('#correct').removeClass("btn-main-on");
    $('#student').removeClass("btn-main-on-small");

    $('#incorrect0').addClass("btn-main-off");
    $('#incorrect0').removeClass("btn-main-on");
    document.getElementById("incorrect0").disabled = false;

    $('#incorrect1').addClass("btn-main-off");
    $('#incorrect1').removeClass("btn-main-on");
    //document.getElementById("incorrect1").disabled = false; 

    $('#incorrect2').addClass("btn-main-off");
    $('#incorrect2').removeClass("btn-main-on");
    //document.getElementById("incorrect2").disabled = false; 

    $('#incorrect3').addClass("btn-main-off");
    $('#incorrect3').removeClass("btn-main-on");
    //document.getElementById("incorrect3").disabled = false; 

    isIncOn();

    document.getElementById("designer").disabled = true;
    document.getElementById("correct").disabled = false;
    document.getElementById("student").disabled = false;

    document.getElementById("label").disabled = true;

    $('#toptools').removeClass("hide");
    $('#bottomtools').removeClass("hide");
    $('#drawingtools').addClass("hide");
    $('#studentdetails').addClass("hide");

    //SWG - 199 Unit Testing Changes Start
    for (var i = 0; i < graphMe.length; i++) {
        if (graphMe[i].mode == "designer") {
            graphMe[i].elementlabel = (graphMe[i].designerLabel != undefined) ? graphMe[i].designerLabel : "" ;
            graphMe[i].SetColor();
        }
    }
    //SWG - 199 Unit Testing Changes Start

    graphSe.SetMode("designer");

    $('#emptydesigner,#labeldetails').addClass("hide"); //SWG-452 changes

    if (graphMe.length != 0) graphMe[gmloc - 1].SetSettings();

    $('#tempquestiontext').removeClass("hide");

    resetAllElementsIncomingFromCorrectMode();
    
    update(); ////SWG-221 Changes

    for (var i = 0; i < graphMe.length; i++) {
        if (graphMe[i].mode == "designer") {
            $('#bottomtools').removeClass("hide");
            $('#interactive').removeClass("hide");
            return;
        }

        $('#bottomtools').addClass("hide");
        $('#interactive').addClass("hide");
    }

}

// finds an element by label name in graphSe.originalElements container
function findInOriginalElements(lbl) {
    var ln = graphSe.originalElements.length;

    if (ln == 0) return null;

    for (var k = 0; k < ln; k++) {
        var gi = graphSe.originalElements[k];
        //Prod issue fix(correct to designer tab object disappear)
        if (gi.uniqueLabel == lbl) {
            // Deep copy
            var newObject = jQuery.extend(true, {}, gi);
            return newObject;
        }
        if (gi.label == lbl) {
            // Deep copy
            var newObject = jQuery.extend(true, {}, gi);
            return newObject;
        }
    }
    return null;
}

function resetAllElementsIncomingFromCorrectMode() {
    if (graphSe.originalElements.length == 0) return;
    for (var i = 0; i < graphMe.length; i++) {
        var updElm = graphMe[i];
        var oldElm = findInOriginalElements(updElm.uniqueLabel != undefined ? updElm.uniqueLabel : updElm.label);//Prod issue fix(correct to designer tab object disappear)
        if (graphMe[i].upCoordinatesUpdated != undefined) graphMe[i].upCoordinatesUpdated = undefined;
        if (graphMe[i].downCoordinatesUpdated != undefined) graphMe[i].downCoordinatesUpdated = undefined;
        if (graphMe[i].leftCoordinatesUpdated != undefined) graphMe[i].leftCoordinatesUpdated = undefined;
        if (graphMe[i].rightCoordinatesUpdated != undefined) graphMe[i].rightCoordinatesUpdated = undefined;
        if (graphMe[i].inwardCoordinatesUpdated != undefined) graphMe[i].inwardCoordinatesUpdated = undefined;
        if (graphMe[i].outwardCoordinatesUpdated != undefined) graphMe[i].outwardCoordinatesUpdated = undefined;
        //SWG-93
        if (oldElm != null && applyOldElementsSettings) {
            if (updElm.what == 'line') {
                graphMe[i].sxsg = oldElm.sxsg
                graphMe[i].sysg = oldElm.sysg
                graphMe[i].sxeg = oldElm.sxeg
                graphMe[i].syeg = oldElm.syeg
                graphMe[i].xe = oldElm.xe
                graphMe[i].xeg = oldElm.xeg
                graphMe[i].xs = oldElm.xs
                graphMe[i].xsg = oldElm.xsg
                graphMe[i].ye = oldElm.ye
                graphMe[i].yeg = oldElm.yeg
                graphMe[i].ys = oldElm.ys
                graphMe[i].ysg = oldElm.ysg
            } else if (updElm.what == 'point') {
                graphMe[i].sxg = oldElm.sxg;
                graphMe[i].syg = oldElm.syg;
                graphMe[i].xg = oldElm.xg;
                graphMe[i].yg = oldElm.yg;
                graphMe[i].x = oldElm.x;
                graphMe[i].y = oldElm.y;
            } else if (updElm.what == 'curve') {
                graphMe[i].pts.splice(0, graphMe[i].pts.length);
                graphMe[i].spts.splice(0, graphMe[i].spts.length);

                for (p = 0, l = oldElm.pts.length; p < l; p++) {
                    graphMe[i].pts.push(oldElm.pts[p]);
                    graphMe[i].spts.push(oldElm.spts[p]);
                }
            } else if (updElm.what == 'poly') {
                graphMe[i].pts.splice(0, graphMe[i].pts.length);
                graphMe[i].spts.splice(0, graphMe[i].spts.length);

                for (p = 0, l = oldElm.pts.length; p < l; p++) {
                    graphMe[i].pts.push(oldElm.pts[p]);
                    graphMe[i].spts.push(oldElm.spts[p]);
                }
            }
        } //end if -- oldElm != null condition 
    }
}

function hideDToolsIfEmpty() {
    for (var i = 0; i < graphMe.length; i++) {
        if (graphMe[i].mode == "designer") {
            $('#bottomtools').removeClass("hide");
            $('#interactive').removeClass("hide");
            return;
        }

        $('#bottomtools').addClass("hide");
        $('#interactive').addClass("hide");
    }
    console.log("dtools");
}

function studentMode() {
    saveCKEText();

    $('#student').addClass("btn-main-on-small");
    $('#designer').addClass("btn-main-off");
    $('#correct').addClass("btn-main-off");

    $('#designer').removeClass("btn-main-on");
    $('#correct').removeClass("btn-main-on");
    $('#student').removeClass("btn-main-off");

    $(".btn-econ-sw5").attr("disabled", false);

    $('#cktexteditor').addClass("hide");

    $('#incdetails').addClass("hide");

    $('#graphcontainer').removeClass("hide");
    $('#toolbar').removeClass("hide");
    $('#CanvasGraph').removeClass("hide");
    $('#CanvasAnimate').removeClass("hide");
    $('#CanvasAnimate2').removeClass("hide");
    $('#alltools').removeClass("hide");

    $('#incorrect0').addClass("btn-main-off");
    $('#incorrect0').removeClass("btn-main-on");
    document.getElementById("incorrect0").disabled = false;

    $('#incorrect1').addClass("btn-main-off");
    $('#incorrect1').removeClass("btn-main-on");
    //document.getElementById("incorrect1").disabled = false; 

    $('#incorrect2').addClass("btn-main-off");
    $('#incorrect2').removeClass("btn-main-on");
    //document.getElementById("incorrect2").disabled = false; 

    $('#incorrect3').addClass("btn-main-off");
    $('#incorrect3').removeClass("btn-main-on");
    //document.getElementById("incorrect3").disabled = false; 

    isIncOn();

    document.getElementById("designer").disabled = false;
    document.getElementById("correct").disabled = false;
    document.getElementById("student").disabled = true;

    $('#toptools').addClass("hide");
    $('#bottomtools').addClass("hide");
    $('#drawingtools').addClass("hide");
    $('#interactive').addClass("hide");
    $('#studentdetails').removeClass("hide");

    $('#interactivetools').addClass("hide");

	//Shashikant: Added code to fix SWG-42
    $('#labeldetails').css("display", "none");


    $('#labeldetails').addClass("hide");

    document.getElementById("label").disabled = false;

    graphSe.SetMode("student");

    $('#emptydesigner').addClass("hide");

    document.getElementById('questiontext').innerHTML = graphSe.fquestion

    //if(graphMe.length!=0) graphMe[gmloc-1].SetSettings();
    $('#tempquestiontext').addClass("hide");

    $('#titletext').addClass("hide");
    $('#yaxistext').addClass("hide");
    $('#xaxistext').addClass("hide");

    $('#titletextstatic').removeClass("hide");
    $('#yaxistextstatic').removeClass("hide");
    $('#xaxistextstatic').removeClass("hide");

    $('#deletebutton1').addClass("hide");

}

function isIncOn() {
    document.getElementById("incorrect1").disabled = true;
    document.getElementById("incorrect2").disabled = true;
    document.getElementById("incorrect3").disabled = true;

    if (graphSe.incorrectActive[1] == true) {
        document.getElementById("incorrect1").disabled = false;
    }

    if (graphSe.incorrectActive[2] == true) {
        document.getElementById("incorrect2").disabled = false;
    }

    if (graphSe.incorrectActive[3] == true) {
        document.getElementById("incorrect3").disabled = false;
    }

}

function resetRelativeSettings(location) {
    if (location != null || location != undefined) {
        if (graphMe[gmloc - 1] != null) {
            graphMe[gmloc - 1].SetSettings();
            graphMe[gmloc - 1].ControlMe(true);

            if (graphMe[gmloc - 1].leftCoordinatesUpdated != undefined) graphMe[gmloc - 1].leftCoordinatesUpdated = undefined;
            if (graphMe[gmloc - 1].rightCoordinatesUpdated != undefined) graphMe[gmloc - 1].rightCoordinatesUpdated = undefined;

            graphMe[gmloc - 1].DrawMe();
        }
    }
}

function leftArrow() {
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    // before we move to some other element - reset previous elements relative settings 
    //resetRelativeSettings( gmloc );

    if (gmloc == 1) {
        gmloc = graphMe.length;
        if (graphSe.boo && graphMe[gmloc - 1].interactive && !graphMe[gmloc - 1].ghost && graphSe.mode != "student") graphMe[gmloc - 1].GhostMe();
    } else if (gmloc >= 2) {
        gmloc--;
        if (graphSe.boo && graphMe[gmloc - 1].interactive && !graphMe[gmloc - 1].ghost && graphSe.mode != "student") graphMe[gmloc - 1].GhostMe();
    }

    if (graphSe.mode == 'designer' || graphSe.mode == 'correct') {
        if (graphMe[gmloc - 1].mode == graphSe.mode || graphMe[gmloc - 1].mode == 'designer') {
            graphMe[gmloc - 1].SetSettings();

        } else {
            leftArrow();
        }
    }

    //SWG - 199 Changes
    for (var i = gmloc - 1; i < graphMe.length; i++) {
        if (graphMe[i].deletedFrom != undefined && graphMe[i].deletedFrom.indexOf(graphSe.mode) != -1) {
            gmloc--;
            if (gmloc < 1) {
                gmloc = graphMe.length;
            }
        }
        if (graphMe[gmloc - 1].deletedFrom != undefined && graphMe[gmloc - 1].deletedFrom.indexOf(graphSe.mode) != -1) {
            gmloc--;
            if (gmloc < 1) {
                gmloc = graphMe.length;
            }
        }
        else {
            i = graphMe.length;
        }
    }

    if (graphSe.mode == 'incorrect1' || graphSe.mode == 'incorrect2' || graphSe.mode == 'incorrect3') {
        if (graphMe[gmloc - 1].mode == graphSe.mode || graphMe[gmloc - 1].mode == 'designer' || graphMe[gmloc - 1].mode == 'correct') {
            graphMe[gmloc - 1].SetSettings();

        } else {
            leftArrow();
        }
    }
    //clickElement(); // click element to force settings of the element
}

function rightArrow() {
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    // before we move to some other element - reset previous elements relative settings 
    //resetRelativeSettings( gmloc );
    if (gmloc >= graphMe.length) {
        gmloc = 1;
        if (graphSe.boo && graphMe[gmloc - 1].interactive && !graphMe[gmloc - 1].ghost && graphSe.mode != "student") graphMe[gmloc - 1].GhostMe();
    } else if (gmloc <= graphMe.length - 1) {
        gmloc++;
        if (graphSe.boo && graphMe[gmloc - 1].interactive && !graphMe[gmloc - 1].ghost && graphSe.mode != "student") graphMe[gmloc - 1].GhostMe();
    }

    if (graphSe.mode == 'designer' || graphSe.mode == 'correct') {
        if (graphMe[gmloc - 1].mode == graphSe.mode || graphMe[gmloc - 1].mode == 'designer') {
            graphMe[gmloc - 1].SetSettings();

        } else {
            rightArrow();
        }
    }

    //SWG - 199    
    for (var i = gmloc - 1; i < graphMe.length; i++) {
        if (graphMe[i].deletedFrom != undefined && graphMe[i].deletedFrom.indexOf(graphSe.mode) != -1) {
            gmloc++;
            if (gmloc > graphMe.length) {
                gmloc = 1;
            }
        }
        if (graphMe[gmloc - 1].deletedFrom == undefined || (graphMe[gmloc - 1].deletedFrom != undefined && graphMe[gmloc - 1].deletedFrom.indexOf(graphSe.mode) == -1)) {
            i = graphMe.length;
        }
    }

    if (graphSe.mode == 'incorrect1' || graphSe.mode == 'incorrect2' || graphSe.mode == 'incorrect3') {
        if (graphMe[gmloc - 1].mode == graphSe.mode || graphMe[gmloc - 1].mode == 'designer' || graphMe[gmloc - 1].mode == 'correct') {
            graphMe[gmloc - 1].SetSettings();

        } else {
            rightArrow();
        }
    }
    //clickElement();
}

function GetElement(text) {
    if (graphSe.mode == "designer") {
        graphMe[gmloc - 1].designerLabel = text;
        graphMe[gmloc - 1].tempbookColor = "No";
    }
    graphMe[gmloc - 1].SetElementLabel(text); ////Object mode need to set as set by author

    if (graphMe[gmloc - 1].elementlabel != text) {
        graphMe[gmloc - 1].resetCoordinates = true;
        graphMe[gmloc - 1].evalshift = null;
        graphMe[gmloc - 1].precise = true;
    }

}

function GetCorrectStudentLabel(text, id, uniqueId) {
    //var uniqueId = this;
    ////SWG-111 Changes
    $(uniqueId).removeAttr('size');
    $(uniqueId).removeClass('styled-custom-select');
    $(uniqueId).css('height', '24px');
    ////SWG-111
    $(uniqueId).css('background', 'none');
    //document.getElementById(id).style.background = "none";

    //var newloc = id.split("elabel");
    ////SWG - 184 Changes
     var uniqueId = $('#'+id).attr('data-uniqueid');//release 3.7 changes
     var selem = graphSe.FindInGraph(uniqueId);

    if (selem != undefined) {
        selem.SetCorrectStudentLabel(text);
        selem.setStudentColor();
        selem.droppedlabel = 1; ////SWG-451

        //graphSe.OpsAddStudentLabel( gmloc );
    }
}

function GetCorrectStudentLabelLoad(el, text, id) {
    el.SetCorrectStudentLabel(text);
    document.getElementById("elabel" + id).style.background = "none";
    document.getElementById("elabel" + id).value = text;
    el.setStudentColor();

    //graphSe.OpsAddStudentLabel( gmloc );
}

function LoadLabels() {

    for (var b = 0; b < graphMe.length; b++) {
        if (graphMe[b].studentcorrectlabel != 'a') {
            gmloc = b + 1; //SWG - 247
            graphMe[b].droppedlabel = 0;
            graphMe[b].LabelMeDrop();
            GetCorrectStudentLabelLoad(graphMe[b], graphMe[b].studentcorrectlabel, graphMe[b].divid);
            graphMe[b].droppedlabel = 1;
        }
    }

}

function GetCorrectLabel(text) {
    graphMe[gmloc - 1].SetCorrectLabel(text);
    GetElement(text);
    ////SWG-139 Changes
    if (graphMe[gmloc - 1].what != 'point' && graphMe[gmloc - 1].what != 'poly' && !graphMe[gmloc - 1].precise) {
        UpdateShiftFromOriginLabel(text);
        graphMe[gmloc - 1].EvalShift(null);
        graphMe[gmloc - 1].resetCoordinates = true;
    }
    ////SWG-139 Changes Ends
}

function GetIncorrectLabel(text) {
    graphMe[gmloc - 1].SetIncorrectLabel(text);
    GetElement(text);
    ////SWG-457 Changes
    var nn;
    if(graphSe.mode.includes("incorrect"))
    {
        nn = Number(graphSe.mode.charAt(9));
    }

    if (graphMe[gmloc - 1].what != 'point' && graphMe[gmloc - 1].what != 'poly' && !graphMe[gmloc - 1].preciseinc[nn] && 
       (graphMe[gmloc - 1].correctlabel == 'b' || graphMe[gmloc - 1].correctlabel == "")) {
        UpdateShiftFromOriginLabel(text);
        graphMe[gmloc - 1].EvalShift(null);
        graphMe[gmloc - 1].resetCoordinates = true;
    } 
    ////SWG-457 Changes end
}

function setQuestion(number) {
    questionNumber = number;
    //document.getElementById('qdrop').value = this.relementlabel;

}

function GetRelativeElement(text) {
    graphMe[gmloc - 1].SetRelativeElementLabel(text);
}

function bookColor() {
    var curr = graphMe[gmloc - 1];

    if (curr.GetBookColor() == "No") {
        curr.SetBookColor("Yes");
        document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-checkedmm"></span>';

    } else {
        curr.SetBookColor("No");
        document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span>';

    }
}

function labelUpdate(text) {
    graphMe[gmloc - 1].labeledit = text;
    graphMe[gmloc - 1].UpdateLabelText();

}

function labelAMUpdate(text) {
    graphMe[gmloc - 1].labelam = text;

}

function TAElement(text) {
    var ta;
    var gm = graphMe[gmloc - 1];
    if (gm.taelement != "None") {
        ta = graphSe.FindInGraph(gm.taelement);
        ta.locked = false;
    }
    gm.taelement = text;
    gm.TrackAlong(text);

    if (text != "None") {
        ta = graphSe.FindInGraph(text);
        ta.locked = true;
    }

}

function xUpdate(newXg) {
    //graphMe[gmloc-1].x = graphSe.reverseXC(n);
    graphMe[gmloc - 1].xg = Number(newXg);
    graphMe[gmloc - 1].SnapMe();
    //document.getElementById('xpoint').value=convertXC(n);

    UpdateAllCoordinates();
}

function xsUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].xsg = ng;
    graphMe[gmloc - 1].SnapMe();
    graphMe[gmloc - 1].CalculateSlope();
    graphMe[gmloc - 1].UpdateSlope();

    UpdateAllCoordinates();
}

function UpdateAllCoordinates() {
    // changes to shift multiple element - By Akash
    for (var i = 0, ln = graphMe.length; i < ln; i++) {
        var gm = graphMe[i];
        if (gm != undefined) {
            if (graphSe.boo && gm.interactive && !gm.ghost) gm.GhostMe();
            if (graphSe.mode == "designer" && gm.interactive) gm.GhostMe();
            if (graphSe.mode == "designer" && gm.interactive && gm.correct[0] != null && gm.correct[0].type[0] == "relative")
                gm.CorrectMe(gm.correct[0].type);
            else if (graphSe.mode == "correct") gm.CorrectMe(gm.correct[0] != undefined ? gm.correct[0].type : undefined);
            else if (graphSe.mode.substring(0, 9) == "incorrect") {
                var nn = graphSe.mode[9];
                gm.IncorrectMe(undefined, nn, gm.incorrect[nn] != undefined ? gm.incorrect[nn].type : undefined);
            }
        }
    }

    // var gm = graphMe[gmloc - 1]
    // if (gm != undefined) {
    //     if (graphSe.boo && gm.interactive && !gm.ghost) gm.GhostMe();
    //     if (graphSe.mode == "designer") gm.GhostMe();
    //     if (graphSe.mode == "designer" && gm.interactive && gm.correct[0] != null && gm.correct[0].type[0] == "relative")
    //         gm.CorrectMe(gm.correct[0].type);
    //     else if (graphSe.mode == "correct") gm.CorrectMe(gm.correct[0] != undefined ? gm.correct[0].type : undefined);
    //     else if (graphSe.mode.substring(0, 9) == "incorrect") {
    //         var nn = graphSe.mode[9];
    //         gm.IncorrectMe(undefined, nn, gm.incorrect[nn] != undefined ? gm.incorrect[nn].type : undefined);
    //     }
    // }
}

function cxsUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[0] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function cysUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[1] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function cxmUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[2] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function cymUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[3] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function cxeUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[4] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function cyeUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[5] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function apUpdateNoFix(text, number) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[number] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function apUpdate(text, number) {
    var ng = Number(text)

    graphMe[gmloc - 1].pts[number + 2] = ng;
    graphMe[gmloc - 1].SnapMe();

    UpdateAllCoordinates();
}

function xeUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].xeg = ng;
    graphMe[gmloc - 1].SnapMe();
    graphMe[gmloc - 1].CalculateSlope();
    graphMe[gmloc - 1].UpdateSlope();

    UpdateAllCoordinates();
}

function yUpdate(newYg) {
    graphMe[gmloc - 1].yg = Number(newYg);
    graphMe[gmloc - 1].SnapMe();
    //graphMe[gmloc-1].y = graphSe.reverseYC(n);
    //graphMe[gmloc-1].UpdateLabelText();
    UpdateAllCoordinates();
}

function ysUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].ysg = ng;
    graphMe[gmloc - 1].SnapMe();
    graphMe[gmloc - 1].CalculateSlope();
    graphMe[gmloc - 1].UpdateSlope();

    UpdateAllCoordinates();
}

function yeUpdate(text) {
    var ng = Number(text)

    graphMe[gmloc - 1].yeg = ng;
    graphMe[gmloc - 1].SnapMe();
    graphMe[gmloc - 1].CalculateSlope();
    graphMe[gmloc - 1].UpdateSlope();

    UpdateAllCoordinates();
}

function slopeUpdate(num) {
    graphMe[gmloc - 1].m = num;
    graphMe[gmloc - 1].LineUpdate();

    UpdateAllCoordinates();

}

function GetTitle(text) {
    graphSe.title = text;
}

function SayFeedback(txt) {
    document.getElementById("feedbacktext").innerHTML = txt
}

function getYA(text) {
    graphSe.yaxis = text;
}

function getXA(text) {
    graphSe.xaxis = text;
}

function interactiveb() {
    $('#binteractivero').removeClass("hide")
    $('#bstaticro').addClass("hide")
}

function staticb() {
    $('#binteractivero').addClass("hide")
    $('#bstaticro').removeClass("hide")
}

function xincChange(x) {
    var n = Number(x)

    graphSe.xinc = n;
    graphSe.SetMaxes();

    graphSe.CalcConverters();

    if (graphMe.length > 0) graphMe[gmloc - 1].SetSettings();
}

function yincChange(y) {
    var n = Number(y)

    graphSe.yinc = n;
    graphSe.SetMaxes();

    graphSe.CalcConverters();

    if (graphMe.length > 0) graphMe[gmloc - 1].SetSettings();
}

function xminChange(x) {
    var n = Number(x)

    graphSe.xmin = n;
    graphSe.SetMaxes();

    if (graphMe.length > 0) graphMe[gmloc - 1].SetSettings();
}

function yminChange(y) {
    var n = Number(y)

    graphSe.ymin = n;
    graphSe.SetMaxes();

    if (graphMe.length > 0) graphMe[gmloc - 1].SetSettings();
}

function addNextIncorrect() {
     //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    for (var i = 1; i < graphSe.incorrectActive.length; i++) {
        if (!graphSe.incorrectActive[i]) {
            addIncorrect(i);
            return;
        }
    }

}

function addIncorrect(number) {

    document.getElementById("incorrect" + number).innerHTML = 'Incorrect <span class="glyphicon glyphicon-trash" aria-hidden="true" style="font-size: 18px;" onclick="delInc(' + number + ')"></span>'
    document.getElementById("incorrect" + number).disabled = false;

    if (number == 1) inc1Mode();
    if (number == 2) inc2Mode();
    if (number == 3) inc3Mode();

}

function delInc(number) {
    document.getElementById("incorrect" + number).innerHTML = '';
    graphSe.incorrectActive[number] = false;
    graphSe.ckeText[number] = null;

    for (var i = 0; i < graphMe.length; i++) {
        var gi = graphMe[i];
        if (gi.mode == "incorrect" + number) {
            graphMe.splice(i, 1);
            if (i <= (gmloc - 1)) gmloc--;
            if (gmloc <= 0) gmloc = 1;
            i--;
        } else {
            gi.incorrect[number] = null;
            gi.correctlabelinc[number] = '';
            gi.requiredlabelinc[number] = false;
        }
    }

    if (graphSe.mode == "incorrect" + number) {
        graphSe.mode = "designer";
        designerMode();
        document.getElementById("incorrect" + number).disabled = true;
    } else {
        document.getElementById("incorrect" + number).disabled = true;
    }

}


function StartMM() {

    if (graphSe.firstload == true) {
        document.getElementById("gridtoggle").checked = true;
        document.getElementById("xytoggle").checked = true;
        document.getElementById("titletoggle").checked = true;
        document.getElementById("snaptoggle").checked = true;
        document.getElementById("valuetoggle").checked = true;
        //SWG-142 changes
        if (graphSe.mode == 'designer') {
            if($("#studToolPointToggle")) $("#studToolPointToggle").prop('checked', true);
            if($("#studToolLineToggle"))  $("#studToolLineToggle").prop('checked', true);
            if($("#studToolCurveToggle")) $("#studToolCurveToggle").prop('checked', true);
            if($("#studToolAreaToggle"))  $("#studToolAreaToggle").prop('checked', true);
            
        }
        //SWG-142 changes end
        graphSe.firstload = false;
        hideDToolsIfEmpty();
    }
    if (graphMe[0] != undefined) graphMe[0].SetSettings();
    update();
    UpdateStudentSettings();

    $(document).ready(function() {


    });

}

////SWG-139 Changes
function UpdateShiftFromOriginLabel(text) {
    //Change the Radio button text
    if (text == 'PPF') {
        document.getElementById("lefttext").innerHTML = 'Inward';
        document.getElementById("righttext").innerHTML = 'Outward';
    } else if (text == 'Marginal Cost' || text == 'Fixed Cost' || text == 'Variable Cost' || text == 'Total Cost') {
        document.getElementById("lefttext").innerHTML = 'Up';
        document.getElementById("righttext").innerHTML = 'Down';
    } else {
        document.getElementById("lefttext").innerHTML = 'Left';
        document.getElementById("righttext").innerHTML = 'Right';
    }
}
////SWG-139 Changes End
////SWG-477 Changes Start
function ShowInfoPopUp(widgetID, count){
    if(widgetID != undefined) { widgetid = widgetID }
    attemptCount = count;
    $('#myModalTimeout').modal();
}

function BlockGraph() {
    $('#error').addClass('blockGraph');
    $('#error').append("<span style='margin-top: 50%;display:inline-block;color:#3a3737'>An error has occurred and we are unable to " + '<br />' +
     "display the graph. Please contact <a href='http://books.wwnorton.com/books/support/' target='_blank' style='color:#000000; text-decoration : none ;border-bottom: 2px solid #e0bb48; cursor: pointer; padding-bottom: 4px;'>W. W. Norton Support.</a> </span>");
    //$('#error').append("<span style='margin-top: 10%;display:inline-block;color:#3a3737'>To reload <button id='btnReload' onclick=ReloadGraph()> Click Here </button> </span>" );
}

function ReloadGraph() {
    if(window && window.parent.CommonPlayerControl)
    {   
        if(window.parent.CommonPlayerControl.reloadModule)
        {
            var obj = window.parent.CommonPlayerControl.reloadModule(widgetid,attemptCount);
        } else
        {
            console.log('window.CommonPlayerControl.reloadModule not found');
        }

    }
}
////SWG-477 Changes End

////SWFB-2555 Changes start
function CheckLoadingStatus(widgetID) {
    setTimeout(function () {
        if (_loadingStatus != null && _loadingStatus != "Completed") {
            if (widgetID != undefined) { widgetid = widgetID }
            $('#myLoadingPopup').modal();
        }
    }, 6000);
}

function WaitTimer() {
    if (_loadingStatus != null && _loadingStatus != "Completed") {
        CheckLoadingStatus(widgetid);
        var statusObj = {};
        statusObj.ModuleType = '28';
        statusObj.WidgetID = widgetid;
        statusObj.Status = false;

        if (window && window.CommonPlayerControl && window.CommonPlayerControl.getModuleState)
            var data = window.CommonPlayerControl.getModuleState(statusObj);

    }
}
////SWFB-2555 Changes end
