
var gmloc = 1;
var graphSe;

var valuet = 1;

function update()
{
    console.log("Update: ", gmloc);
    
	if($('#gridtoggle').is(":checked")) {gridt=1;graphSe.grid=true;} else {gridt=0;graphSe.grid=false;};
	if($('#valuetoggle').is(":checked")) {valuet=1; graphSe.value=true;} else {valuet=0; graphSe.value=false;};
	if($('#xytoggle').is(":checked")) {$('#yaxistext').removeClass("hide");$('#xaxistext').removeClass("hide");} else {$('#yaxistext').addClass("hide");$('#xaxistext').addClass("hide");};
	if($('#titletoggle').is(":checked")) {$('#titletext').removeClass("hide");} else {$('#titletext').addClass("hide");};
	if($('#snaptoggle').is(":checked")) graphSe.SnapOnOff(true); else graphSe.SnapOnOff(false);
	if($('#plumbtoggle').is(":checked")) graphMe[gmloc-1].PlumbMe(true); else graphMe[gmloc-1].PlumbMe(false);
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

function xUpdate(newXg)
{	
	//graphMe[gmloc-1].x = graphSe.reverseXC(n);
	graphMe[gmloc-1].xg = newXg;
	//document.getElementById('xpoint').value=convertXC(n);
}

function xsUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].xsg = ng;
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function cxsUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[0] = ng;

}

function cysUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[1] = ng;
}

function cxmUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[2] = ng;

}

function cymUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[3] = ng;
}

function cxeUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[4] = ng;

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
}

function apUpdate(text, number)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].pts[number+2] = ng;
}


function xeUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].xeg = ng;
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function yUpdate(newYg)
{
	graphMe[gmloc-1].yg = newYg;
	//graphMe[gmloc-1].y = graphSe.reverseYC(n);
	//graphMe[gmloc-1].UpdateLabelText();
}

function ysUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].ysg = ng;
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function yeUpdate(text)
{
	var ng = Number(text)
	
	graphMe[gmloc-1].yeg = ng;
	graphMe[gmloc-1].CalculateSlope();
	graphMe[gmloc-1].UpdateSlope();
}

function slopeUpdate(num)
{
	graphMe[gmloc-1].m = num;
	graphMe[gmloc-1].LineUpdate();
}	

function getTitle(text)
{
	graphSe.title = text;
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