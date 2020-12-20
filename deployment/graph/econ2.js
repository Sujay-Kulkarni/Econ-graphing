
var gmloc = 1;
var graphSe;

var valuet = 1;
var currquestion;

var paramcheck;

var questionNumber = 1;


var questiontext;

function getquestion(text)
{
	graphSe.fquestion = text;
}


function CheckGraph()
{
		$('#feedback').removeClass("hide");

		var html = '';
		for(var i=0; i<graphMe.length; i++)
		{
			
			if(graphMe[i].mode!="correct") html+="<div class='resultsrow'>"+graphMe[i].label+": "+graphMe[i].iscorrect+"</div>";
		}	

		html += TotalGraph();

		document.getElementById('feedbacktext').innerHTML = html;
		
}

function TotalGraph()
{

		for(var i = 0, ncorr = 0, numuc = 0; i < graphMe.length; i++)
		{
		    var gi = graphMe[i];
			if(gi.iscorrect!=null) 
			{
			    if(gi.mode=="student") ncorr--;
				if(gi.iscorrect == "<span style='color:red'>Not Correct</span>") 
					return "<div><Strong>Total Graph: <span style='color:red'>Incorrect</span></div>";
			}
			else if( gi.mode == "correct" ) 
			{
				ncorr++;
				numuc++;
			}	
			else numuc++;
		}		

    	return (ncorr == 0 && numuc != graphMe.length) ? "<div><Strong>Total Graph: <span style='color:green'>Correct</span></div>" :
    	                    "<div><Strong>Total Graph: <span style='color:red'>Incorrect</span></div>";
}   
	
function update()
{
    console.log("Update: ", gmloc);
    
	if($('#gridtoggle').is(":checked")) {gridt=1;graphSe.grid=true;} else {gridt=0;graphSe.grid=false;};
	if($('#valuetoggle').is(":checked")) {valuet=1; graphSe.value=true;} else {valuet=0; graphSe.value=false;};
	if($('#xytoggle').is(":checked")) {$('#yaxistext').removeClass("hide");$('#xaxistext').removeClass("hide");graphSe.axisshow=true;} else {$('#yaxistext').addClass("hide");$('#xaxistext').addClass("hide");graphSe.axisshow=false;};
	if($('#titletoggle').is(":checked")) {$('#titletext').removeClass("hide");graphSe.titleshow=true;} else {$('#titletext').addClass("hide");graphSe.titleshow=false;};
	if($('#snaptoggle').is(":checked")) graphSe.SnapOnOff(true); else graphSe.SnapOnOff(false);
	
	if( graphMe.length > 0 )
	{
	    if($('#plumbtoggle').is(":checked")) graphMe[gmloc-1].PlumbMe(true); else graphMe[gmloc-1].PlumbMe(false);
	    if($('#labeltoggle').is(":checked")) {graphMe[gmloc-1].LabelMe(true);} else {graphMe[gmloc-1].LabelMe(false);}
	    if($('#rltoggle').is(":checked")) graphMe[gmloc-1].RequiredLabelMe(true); else graphMe[gmloc-1].RequiredLabelMe(false);
	}
}

function Interactive( tf )
{		

	if(tf==true)
	{
		$('#ilabels').removeClass("hide");
		$('#iinputs').removeClass("hide");
	} else {
		$('#ilabels').addClass("hide");
		$('#iinputs').addClass("hide");
	}	
	
    graphMe[gmloc-1].InteractiveMe( tf );
}

function Precise( tf )
{		
    graphMe[gmloc-1].PreciseMe( tf );
    graphMe[gmloc-1].SetSettings();
}

function ShiftLeft(  )
{		
    graphMe[gmloc-1].EvalShift( "left" );
}

function ShiftRight(  )
{		
    graphMe[gmloc-1].EvalShift( "right" );
}

function testGet()
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "http://54.173.144.67:3000/graphelements/1", true);
}

// Create the XHR object.
function CreateCORSRequest(method, url) 
{
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) 
    {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } 
    else if (typeof XDomainRequest != "undefined") 
    {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } 
    else 
    {
        // CORS not supported.
        xhr = null;
    }
  
    return xhr;
}

function getGTitle(text)
{
	graphSe.title = text;
}	

// Helper method to parse the title tag from the response.
function GetTitle(text) 
{
    return text.match('<title>(.*)?</title>')[1];
}

function saveQ1()
{
	simpleObject(graphMe, graphSe, questionNumber)
}

function loadQ1()
{
	LoadElements(questionNumber);
}

// Make the actual CORS request.
function LoadElements(question) 
{
    var url = "http://54.173.144.67:3000/graphelements/"+question;

    var xhr = CreateCORSRequest('GET', url);
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
        //console.log(this.responseText);
        currquestion = this.responseText;
 		createNewObject(currquestion);
 		//currquestion = currquestion.replace('\"', '');       
    };

    xhr.onerror = function() 
    {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}

// Make the actual CORS request.
function MakeCorsDelete(element) 
{
    var url = "http://54.173.144.67:3000/graphelements/"+element;

    var xhr = CreateCORSRequest('DELETE', url);
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
        console.log('Response from CORS request to ' + url + ': ' + text);
    };

    xhr.onerror = function() 
    {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}

// Make the actual CORS request.
function SaveElements(graphjson, elementsjson) 
{
    var url = "http://54.173.144.67:3000/graphelements/";

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
  
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var params = JSON.stringify({ graphelement: { title: graphjson, text: elementsjson } });
    xhr.send(params);
}

// Make the actual CORS request.
function UpdateElements(question, graphjson, elementsjson) 
{
    var url = "http://54.173.144.67:3000/graphelements/"+question;

    var xhr = CreateCORSRequest('PUT', url);
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
        //console.log(this.responseText);
    };

    xhr.onerror = function() 
    {
        alert('Woops, there was an error making the request.');
    };

	var graphjsons = JSON.stringify(graphjson);
	var elementjsons = JSON.stringify(elementsjson);  
  	
  	//paramcheck = { graphelement: { title: graphjsons, text: elementsjsons } }
  
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var params = JSON.stringify({graphelement:{title:graphjson,text:elementsjson}});
    //console.log("these are:"+params)
    xhr.send(params);
}


function simpleObject(object, graph, question)
{
	var x, y;
	var text;
	var tempstring = '';
	var tempstring2 = '';
	
	for(var i=0; i<object.length; i++)
	{		
		for (x in object[i]) {
			text = object[i][x];
			if(!isFunction(text)) 
			{
				tempstring += "?"+x+":"+object[i][x];
				//console.log(x);
			}
			if(x=="ghost")
			{
				//console.log(object[i].ghost);
				for (y in object[i].ghost) {
					text = object[i].ghost[y];
					if(!isFunction(text)) 
					{
						tempstring += "?ghost"+y+":"+object[i].ghost[y];
					}
				}
			}	
			if(x=="dragDxDy")
			{
				//console.log(object[i].ghost);
				for (y in object[i].dragDxDy) {
					text = object[i].dragDxDy[y];
					if(!isFunction(text)) 
					{
						tempstring += "?drag"+y+":"+object[i].dragDxDy[y];
					}
				}
			}	
			if(x=="dragstart")
			{
				//console.log(object[i].ghost);
				for (y in object[i].dragstart) {
					text = object[i].dragstart[y];
					if(!isFunction(text)) 
					{
						tempstring += "?dragstart"+y+":"+object[i].dragstart[y];
					}
				}
			}	
			if(x=="correct")
			{
				//console.log(object[i].ghost);
				for (y in object[i].correct[0]) {
					text = object[i].correct[0][y];
					if(!isFunction(text)) 
					{
						tempstring += "?correctarray"+y+":"+object[i].correct[0][y];
					}
				}
			}										
		}
		tempstring += "!!";
	}		

	for (y in graph) {
		text = graph[y];
		if(!isFunction(text)) 
		{
			tempstring2 += "?"+y+":"+graph[y];
		}
	}
	tempstring2 += "!!";

	
	UpdateElements(question, tempstring, tempstring2);
}

var stringarray = [];

function createNewObject(string)
{
	var grapharray = currquestion.split("!!");
	console.log(grapharray);
	var ln = grapharray.length;
	console.log(ln);
	for(var i=0; i<ln; i++)
	{
		var newobjectarray = new Object();
		
		console.log("loop"+i);
		stringarray = grapharray[i].split("?");
		//console.log(stringarray);
		for(var j=0; j<stringarray.length; j++)
		{
			var splitstring = stringarray[j].split(":");
			//console.log(splitstring[0], splitstring[1]);
			newobjectarray[splitstring[0]] = splitstring[1]
		}
		//console.log("HERE:"+newobjectarray.what);
		if(newobjectarray.what=="point") {graphMe[i] = new Point( newobjectarray.cc, Number(newobjectarray.x), Number(newobjectarray.y), Number(newobjectarray.radius));}
		if(newobjectarray.what=="line") 
		{
			graphMe[i] = new Line( newobjectarray.cc, graphSe.ConvertXgToXpx(Number(newobjectarray.xsg)), graphSe.ConvertYgToYpx(Number(newobjectarray.ysg)), graphSe.ConvertXgToXpx(Number(newobjectarray.xeg)), graphSe.ConvertYgToYpx(Number(newobjectarray.yeg)), Number(newobjectarray.width) );
		
			graphMe[i].bookcolor=newobjectarray.bookcolor;
			graphMe[i].cc=newobjectarray.cc;
			graphMe[i].ccus=newobjectarray.ccus;
			graphMe[i].elementlabel=newobjectarray.elementlabel;	
			graphMe[i].label=newobjectarray.label;	
			graphMe[i].taelement=newobjectarray.taelement;	
			graphMe[i].labelLine = (newobjectarray.labelLine=="true") ;
			graphMe[i].interactive = (newobjectarray.interactive=="true") ;
			graphMe[i].plumbLine = (newobjectarray.plumbLine=="true") ;
			
			graphMe[i].sxeg=Number(newobjectarray.sxeg);
			graphMe[i].sxsg=Number(newobjectarray.sxsg);
			graphMe[i].syeg=Number(newobjectarray.syeg);
			graphMe[i].sysg=Number(newobjectarray.sysg);

			graphMe[i].xe=Number(newobjectarray.xe);
			graphMe[i].xeg=Number(newobjectarray.xeg);
			graphMe[i].xs=Number(newobjectarray.xs);
			graphMe[i].xsg=Number(newobjectarray.xsg);
			graphMe[i].ye=Number(newobjectarray.ye);
			graphMe[i].yeg=Number(newobjectarray.yeg);
			graphMe[i].ys=Number(newobjectarray.ys);
			graphMe[i].ysg=Number(newobjectarray.ysg);

			graphMe[i].taelement=newobjectarray.taelement;
			graphMe[i].trackAng=Number(newobjectarray.trackAng);
			//console.log(ptsarray);
			graphMe[i].TrackAlong(graphMe[i].taelement);
			
			if(newobjectarray.ghost!=null)
			{
				//console.log("hello ghost");
				graphMe[i].ghost = 
				{
					clr: newobjectarray.ghostclr,
					wd: Number(newobjectarray.ghostwd),
					xsg: Number(newobjectarray.ghostxsg),
					ysg: Number(newobjectarray.ghostysg),
					sxsg: Number(newobjectarray.ghostsxsg),
					sysg: Number(newobjectarray.ghostsysg),
					xeg: Number(newobjectarray.ghostxeg),
					yeg: Number(newobjectarray.ghostyeg),
					sxeg: Number(newobjectarray.ghostsxeg),
					syeg: Number(newobjectarray.ghostsyeg)
				}	
			}

			if(newobjectarray.dragDxDy!=null)
			{
				graphMe[i].dragDxDy = 
				{
					dx: Number(newobjectarray.dragdx),
					dy: Number(newobjectarray.dragdy)
				}
			}
				
			if(newobjectarray.dragstart!=null)
			{
				graphMe[i].dragstart = 
				{
					x: Number(newobjectarray.dragstartx),
					y: Number(newobjectarray.dragstarty)
				}
			}

			if(newobjectarray.correct!=[])
			{
				graphMe[i].correct[0] = 
				{
					lbl: newobjectarray.correctarraylbl,
					xeg: Number(newobjectarray.correctarrayxeg),
					xsg: Number(newobjectarray.correctarrayxsg),
					yeg: Number(newobjectarray.correctarrayyeg),
					ysg: Number(newobjectarray.correctarrayysg)
				}
				graphMe[i].CorrectToDesigner();
			}			



			graphMe[i].SetSettings();
								
		}
		if(newobjectarray.what=="curve") 
		{
			var ptsarray = [];
			var gptsarray = [];
			var gsptsarray = [];
			var cptsarray = [];
			var csptsarray = [];
		
			graphMe[i] = new Curve(newobjectarray.cc, Number(newobjectarray.width)) 
		
			var temppts = newobjectarray.pts.split(",");
			for(var k=0; k<temppts.length; k++)
			{
				ptsarray[k]=Number(temppts[k]);
			}
		
			graphMe[i].bookcolor=newobjectarray.bookcolor;
			graphMe[i].cc=newobjectarray.cc;
			graphMe[i].ccus=newobjectarray.ccus;
			graphMe[i].elementlabel=newobjectarray.elementlabel;	
			graphMe[i].label=newobjectarray.label;	
			graphMe[i].taelement=newobjectarray.taelement;	
			graphMe[i].labelLine = (newobjectarray.labelLine=="true") ;
			graphMe[i].interactive = (newobjectarray.interactive=="true") ;
			graphMe[i].plumbLine = (newobjectarray.plumbLine=="true") ;

			graphMe[i].pts = ptsarray;

			var temppts1 = newobjectarray.ghostpts.split(",");
			for(var k=0; k<temppts1.length; k++)
			{
				gptsarray[k]=Number(temppts1[k]);
			}

			var temppts2 = newobjectarray.ghostspts.split(",");
			for(var k=0; k<temppts2.length; k++)
			{
				gsptsarray[k]=Number(temppts2[k]);
			}
			
			if(newobjectarray.ghost!=null)
			{
				//console.log("hello ghost");
				graphMe[i].ghost = 
				{
					clr: newobjectarray.ghostclr,
					wd: Number(newobjectarray.ghostwd),
					pts: gptsarray,
					spts: gsptsarray
				}	
			}

			if(newobjectarray.dragDxDy!=null)
			{
				graphMe[i].dragDxDy = 
				{
					dx: Number(newobjectarray.dragdx),
					dy: Number(newobjectarray.dragdy)
				}
			}
				
			if(newobjectarray.dragstart!=null)
			{
				graphMe[i].dragstart = 
				{
					x: Number(newobjectarray.dragstartx),
					y: Number(newobjectarray.dragstarty)
				}
			}

			var temppts3 = newobjectarray.correctarraypts.split(",");
			for(var k=0; k<temppts3.length; k++)
			{
				cptsarray[k]=Number(temppts3[k]);
			}

			var temppts4 = newobjectarray.correctarrayspts.split(",");
			for(var k=0; k<temppts4.length; k++)
			{
				csptsarray[k]=Number(temppts4[k]);
			}

			if(newobjectarray.correct!=[])
			{
				graphMe[i].correct[0] = 
				{
					lbl: newobjectarray.correctarraylbl,
					pts: cptsarray,
					spts: csptsarray
				}
				graphMe[i].CorrectToDesigner();
			}						

			graphMe[i].taelement=newobjectarray.taelement;
				
			//console.log(ptsarray);
			graphMe[i].SetSettings();
			graphMe[i].TrackAlong(graphMe[i].taelement);
	
		}
		if(newobjectarray.what=="poly") 
		{
			var ptsarray = [];
		
			graphMe[i] = new Polyline( newobjectarray.cc, 1, Number(newobjectarray.width) )
			graphMe[i].doFill = true;

			var temppts = newobjectarray.pts.split(",");
			for(var l=0; l<temppts.length; l+=2)
			{
				ptsarray[l]=Number(temppts[l]);
				var newtemppts = new Object();
				newtemppts.x = graphSe.ConvertXgToXpx(Number(temppts[l]));
				newtemppts.y = graphSe.ConvertYgToYpx(Number(temppts[l+1]));
				console.log(newtemppts);
				graphMe[i].AddPoint(newtemppts);
			
				//console.log(areapoints);
			}
		
			//graphMe[0].pts = ptsarray;
			//console.log(ptsarray);
		
		}
		if(newobjectarray.what=="graph") 
		{
			
			graphSe.title=newobjectarray.title;
			graphSe.xaxis=newobjectarray.xaxis;
			graphSe.yaxis=newobjectarray.yaxis;

			graphSe.fquestion=newobjectarray.fquestion;
			document.getElementById('questiontext').innerHTML=newobjectarray.fquestion;
			document.getElementById('tempquestiontext').value = newobjectarray.fquestion;

			document.getElementById('titletext').value=newobjectarray.title;
			document.getElementById('yaxistext').value=newobjectarray.yaxis;
			document.getElementById('xaxistext').value=newobjectarray.xaxis;
			
		    document.getElementById('xinc').value = Number(newobjectarray.xinc);
		    xincChange(document.getElementById('xinc').value);

		    document.getElementById('yinc').value = Number(newobjectarray.yinc);
		    yincChange(document.getElementById('yinc').value);

		    document.getElementById('xmin').value = Number(newobjectarray.xmin);
		    xminChange(document.getElementById('xmin').value);

		    document.getElementById('ymin').value = Number(newobjectarray.ymin);
		    yminChange(document.getElementById('ymin').value);	
		    
		    graphSe.SetMaxes();	    

			if(newobjectarray.grid=="true"){graphSe.grid==true; gridt=1; document.getElementById("gridtoggle").checked = true;	} else {graphSe.grid==false; gridt=0; document.getElementById("gridtoggle").checked = false;};
			if(newobjectarray.value=="true"){valuet=1; graphSe.value=true; document.getElementById("valuetoggle").checked = true;} else {valuet=0; graphSe.value=false;document.getElementById("valuetoggle").checked = false;};
			if(newobjectarray.titleshow=="true"){document.getElementById("titletoggle").checked = true;} else {document.getElementById("titletoggle").checked = false;};
			if(newobjectarray.axisshow=="true"){document.getElementById("xytoggle").checked = true;} else {document.getElementById("xytoggle").checked = false;};
			if(newobjectarray.snapIt=="true"){document.getElementById("snaptoggle").checked = true;} else {document.getElementById("snaptoggle").checked = false;};
			//graphSe.snapIt=(newobjectarray.snapIt=="true");

			update();	
		}		
	}	
	
}	
	

function isFunction(functionToCheck) {
 	var getType = {};
 	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function resize()
{
	var offset = $("#container").offset().left;
	var offsettop = $("#container").offset().top;
	console.log(offsettop);

	var leftos = offset+57+30
	var topos = offsettop+179+90;
	var topos2 = offsettop+163+90;

	document.getElementById("CanvasAnimate").style.left = leftos+"px";
	document.getElementById("CanvasGraph").style.left = leftos+"px";
	document.getElementById("CanvasAnimate2").style.left = leftos-40+"px";

	document.getElementById("CanvasAnimate").style.top = topos-90+"px";
	document.getElementById("CanvasGraph").style.top = topos-90+"px";
	document.getElementById("CanvasAnimate2").style.top = topos2-90+"px";
	
}	

function correctMode()
{
	document.getElementById('titletextstatic').innerHTML = graphSe.title;
	if(graphSe.titleshow) $('#titletextstatic').removeClass("hide");

	document.getElementById('xaxistextstatic').innerHTML = graphSe.xaxis;
	if(graphSe.axisshow) $('#xaxistextstatic').removeClass("hide");

	document.getElementById('yaxistextstatic').innerHTML = graphSe.yaxis;
	if(graphSe.axisshow) $('#yaxistextstatic').removeClass("hide");	

	$('#student').addClass("btn-main-off");
	$('#designer').addClass("btn-main-off");
	$('#correct').addClass("btn-main-on");

	$('#correct').removeClass("btn-main-off");
	$('#designer').removeClass("btn-main-on");
	$('#student').removeClass("btn-main-on");

	document.getElementById("correct").disabled = true; 
	document.getElementById("designer").disabled = false; 
	document.getElementById("student").disabled = false; 

	document.getElementById("label").disabled = true; 

	$('#toptools').addClass("hide");
	$('#bottomtools').addClass("hide");
	$('#drawingtools').addClass("hide");
	$('#studentdetails').addClass("hide");

	$('#tempquestiontext').addClass("hide");

	
	graphSe.SetMode("correct");

	if(graphMe.length==0)
	{
		$('#emptydesigner').removeClass("hide");		
	}

	if(graphMe.length!=0) graphMe[gmloc-1].SetSettings();

}

function designerMode()
{
	$('#titletextstatic').addClass("hide");
	$('#xaxistextstatic').addClass("hide");
	$('#yaxistextstatic').addClass("hide");

	$('#student').addClass("btn-main-off");
	$('#correct').addClass("btn-main-off");
	$('#designer').addClass("btn-main-on");

	$('#designer').removeClass("btn-main-off");
	$('#correct').removeClass("btn-main-on");
	$('#student').removeClass("btn-main-on");

	document.getElementById("designer").disabled = true; 
	document.getElementById("correct").disabled = false; 
	document.getElementById("student").disabled = false; 

	document.getElementById("label").disabled = true; 

	$('#toptools').removeClass("hide");
	$('#bottomtools').removeClass("hide");
	$('#drawingtools').addClass("hide");
	$('#studentdetails').addClass("hide");
	
	graphSe.SetMode("designer");

	$('#emptydesigner').addClass("hide");		

	if(graphMe.length!=0) graphMe[gmloc-1].SetSettings();

	$('#tempquestiontext').removeClass("hide");


}

function studentMode()
{
	$('#student').addClass("btn-main-on");
	$('#designer').addClass("btn-main-off");
	$('#correct').addClass("btn-main-off");

	$('#designer').removeClass("btn-main-on");
	$('#correct').removeClass("btn-main-on");
	$('#student').removeClass("btn-main-off");

	document.getElementById("designer").disabled = false; 
	document.getElementById("correct").disabled = false; 
	document.getElementById("student").disabled = true; 

	$('#toptools').addClass("hide");
	$('#bottomtools').addClass("hide");
	$('#drawingtools').addClass("hide");
	$('#interactive').addClass("hide");
	$('#studentdetails').removeClass("hide");
		
			 $('#interactivetools').addClass("hide");		
			 $('#labeldetails').addClass("hide");		

	document.getElementById("label").disabled = false; 
	
	graphSe.SetMode("student");

	$('#emptydesigner').addClass("hide");		

	document.getElementById('questiontext').innerHTML = graphSe.fquestion

	//if(graphMe.length!=0) graphMe[gmloc-1].SetSettings();
	$('#tempquestiontext').addClass("hide");


}

function leftArrow()
{
	if(gmloc>=2)
	{
		gmloc--;
		graphMe[gmloc-1].SetSettings();
	} 
}

function rightArrow()
{
	if(gmloc<=graphMe.length-1)
	{
		gmloc++;
		graphMe[gmloc-1].SetSettings();
	} 
}

function GetElement(text)
{
	graphMe[gmloc-1].SetElementLabel(text);
}

function GetCorrectStudentLabel(text)
{
	graphMe[gmloc-1].SetCorrectStudentLabel(text);
}

function GetCorrectLabel(text)
{
	graphMe[gmloc-1].SetCorrectLabel(text);
}


function setQuestion(number)
{
	questionNumber = number;
	//document.getElementById('qdrop').value = this.relementlabel;

}

function GetRelativeElement(text)
{
	graphMe[gmloc-1].SetRelativeElementLabel(text);
}

function bookColor()
{
	var curr = graphMe[gmloc-1];

	if(curr.GetBookColor()=="No")
	{
		curr.SetBookColor("Yes");
		document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-checkedmm"></span>';

	} else 
	{
		curr.SetBookColor("No");
		document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span>';
					
	}
}

function labelUpdate(text)
{
	graphMe[gmloc-1].label = text;
	graphMe[gmloc-1].UpdateLabelText();

}

function labelAMUpdate(text)
{
	graphMe[gmloc-1].labelam = text;

}

function TAElement(text)
{
	graphMe[gmloc-1].taelement = text;
	graphMe[gmloc-1].TrackAlong( text );
}

function xUpdate(newXg)
{	
	//graphMe[gmloc-1].x = graphSe.reverseXC(n);
	graphMe[gmloc-1].xg = newXg;
	graphMe[gmloc-1].SnapMe( );
	//document.getElementById('xpoint').value=convertXC(n);
}

function xsUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].xsg = ng;
	graphMe[gmloc-1].SnapMe( );
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function cxsUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[0] = ng;
	graphMe[gmloc-1].SnapMe( );

}

function cysUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[1] = ng;
	graphMe[gmloc-1].SnapMe( );
}

function cxmUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[2] = ng;
	graphMe[gmloc-1].SnapMe( );

}

function cymUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[3] = ng;
	graphMe[gmloc-1].SnapMe( );
}

function cxeUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[4] = ng;
	graphMe[gmloc-1].SnapMe( );

}

function cyeUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[5] = ng;
}

function apUpdateNoFix(text, number)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[number] = ng;
	graphMe[gmloc-1].SnapMe( );
}

function apUpdate(text, number)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[number+2] = ng;
	graphMe[gmloc-1].SnapMe( );
}

function xeUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].xeg = ng;
	graphMe[gmloc-1].SnapMe( );
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function yUpdate(newYg)
{
	graphMe[gmloc-1].yg = newYg;
	graphMe[gmloc-1].SnapMe( );
	//graphMe[gmloc-1].y = graphSe.reverseYC(n);
	//graphMe[gmloc-1].UpdateLabelText();
}

function ysUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].ysg = ng;
	graphMe[gmloc-1].SnapMe( );
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function yeUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].yeg = ng;
	graphMe[gmloc-1].SnapMe( );
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function slopeUpdate(num)
{
	graphMe[gmloc-1].m = num;
	graphMe[gmloc-1].LineUpdate();
}	

function GetTitle(text)
{
	graphSe.title = text;
}	

function SayFeedback( txt )
{
    document.getElementById("feedbacktext").innerHTML = txt
}

function getYA(text)
{
	graphSe.yaxis = text;
}	

function getXA(text)
{
	graphSe.xaxis = text;
}	

function interactiveb()
{
	$('#binteractivero').removeClass("hide")
	$('#bstaticro').addClass("hide")
}

function staticb()
{
	$('#binteractivero').addClass("hide")
	$('#bstaticro').removeClass("hide")
}

function xincChange(x)
{
	var n = Number(x)
	
	graphSe.xinc = n;
	graphSe.SetMaxes();
	
	graphSe.CalcConverters();
	
	if(graphMe.length>0) graphMe[gmloc-1].SetSettings();
}	

function yincChange(y)
{
	var n = Number(y)

	graphSe.yinc = n;
	graphSe.SetMaxes();
	
	graphSe.CalcConverters();

	if(graphMe.length>0) graphMe[gmloc-1].SetSettings();
}	

function xminChange(x)
{
	var n = Number(x)

	graphSe.xmin = n;
	graphSe.SetMaxes();

	if(graphMe.length>0) graphMe[gmloc-1].SetSettings();
}	

function yminChange(y)
{
	var n = Number(y)

	graphSe.ymin = n;
	graphSe.SetMaxes();

	if(graphMe.length>0) graphMe[gmloc-1].SetSettings();
}	

function StartMM( )
{

document.getElementById("gridtoggle").checked = true;	
document.getElementById("xytoggle").checked = true;	
document.getElementById("titletoggle").checked = true;	
document.getElementById("snaptoggle").checked = false;	
document.getElementById("valuetoggle").checked = true;	

	
$(document).ready(function() {

	
});


}

//window.onload=StartMM;