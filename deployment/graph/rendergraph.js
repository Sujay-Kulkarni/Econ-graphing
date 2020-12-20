//var graphsrendered=0;
var testsi;
var testsd;
var mywigetId; ////SWG-111
var isStaticContent = true; ////SWG-399
function exposeGraph() {
	this.renderGraphModule = function (widgetID, stuDisplay, stuInput, isStatic, isSolution) {
		mywigetId = widgetID; ////SWG-111
		isStaticContent = isStatic; ////SWG-399
		var iframe = document.createElement('iframe');

		if (isSolution) {
			var link = "question/graph/correct.html";
		}
		else {
			var link = "question/graph/student.html";
		}
		//SWG_406 changes
		var iframeWidth = "153%";
		var is_iPad = navigator.userAgent.match(/iPad/i) != null;
		if (is_iPad) iframeWidth = "80%";
		iframe.frameBorder = 0;
		iframe.width = iframeWidth;//SWG-41 changes
		//SWG_406 changes end
		iframe.id = "resultFrame" + widgetID;
		iframe.height = "750px";//SWG-41 changes
		iframe.setAttribute("src", link);
		iframe.style.position = "relative";
		////SWG-399 Changes
		if (!isSolution && !isStatic) {
			var style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = '.studLoaderSpin { background: #bdbaba url(question/graph/images/loading.gif) no-repeat center center; width: 500px !important; height: 600px !important;';
			style.innerHTML += 'text-align: center !important; font-size: 15px !important; margin-left: 55px; margin-top: 10px; position: absolute !important;';
			style.innerHTML += 'opacity: 0.8 !important; z-index:1000 !important;}';
			document.getElementsByTagName('head')[0].appendChild(style);


			var loaderDiv = document.createElement('div');
			loaderDiv.id = "studLoader";
			loaderDiv.innerHTML = "<span style='margin-top: 65%;display:inline-block;color:#3a3737'>Loading...</span>";
			document.getElementById(widgetID).appendChild(loaderDiv);

			$('#studLoader').addClass('studLoaderSpin');
		}
		////SWG-399 End
		//find and append iframe to SW5 div with appropriate widgetId
		document.getElementById(widgetID).appendChild(iframe);

		testsd = stuDisplay;
		testsi = stuInput;

		//console.log("Static: "+isStatic+" Solution: "+isSolution+"graphsrendered: "+graphsrendered);
		console.log("Renderer:" + widgetID, stuDisplay, stuInput);

		//load student display json provided by SW5. Update object with student input if necessary
		$('#resultFrame' + widgetID).load(function () {
			var removeLoader = false; ////SWG-477
			this.contentWindow.createNewObjectSW(stuDisplay, stuInput, isStatic, isSolution, widgetID.split("_attempt")[0]); ////SWFB-2555 widgetId args added
			////SWG-477 Changes start

			////SWFB-2555 Changes start
				this.contentWindow.CheckLoadingStatus(widgetID.split("_attempt")[0]);
			////SWFB-2555 Changes end

			if (!isSolution && !isStatic) {
				var graphObj = document.getElementById("resultFrame" + widgetID).contentWindow.graphMe;

				var graphObjSubArr = $.grep(graphObj, function (obj) {
					return ((obj.mode == "designer" || obj.mode == "correct") && obj.interactive);
				});

				if (graphObjSubArr.length > 1) {
					var graphSE = document.getElementById("resultFrame" + mywigetId).contentWindow.graphSe;
					for (var i = 0; i < graphObjSubArr.length; i++) {
						var giObj = graphObjSubArr[i];
						if (giObj.mode == 'correct' && giObj.acceptedArea != undefined && giObj.acceptedArea == true) {
							var acceptedAreaObj = graphSE.FindInGraph(giObj.correct[0].uniqueLabel != undefined ? giObj.correct[0].uniqueLabel : giObj.correct[0].lbl);
							if (acceptedAreaObj != null) { removeLoader = true; }
							else { removeLoader = false; break; }
						}
						else if ((giObj.mode == 'designer' || giObj.mode == 'correct') && giObj.acceptedArea == undefined) {
							if (giObj.correct[0] != undefined) { removeLoader = true }
							else { removeLoader = false; break; }
						}
					}
				} else if (graphObjSubArr.length == 1 && (graphObjSubArr[0].mode == 'correct' || graphObjSubArr[0].mode == 'designer') && graphObjSubArr[0].correct[0] != undefined) {
					removeLoader = true;
				}
			}
			////SWG-477 Changes end
			////SWG-399 Changes
			if (!isSolution && !isStatic && removeLoader) {
				$('#studLoader').remove();
				////SWFB-2535 changes start
				var statusObj = {};
				statusObj.ModuleType = '28';
				statusObj.WidgetID = widgetID;
				statusObj.Status = removeLoader;

				if (window && window.CommonPlayerControl && window.CommonPlayerControl.getModuleState)
					var data = window.CommonPlayerControl.getModuleState(statusObj);
				////SWFB-2535 changes end
			} 
			////SWG-477 Changes start
			else if (!isSolution && !isStatic && !removeLoader) {
				$('#studLoader').remove();
				var widgetId = widgetID.split("_attempt")[0]; ////SW5-3911
				var attemptCount = widgetID.split("_attempt")[1]; ////SW5-3911
				this.contentWindow.ShowInfoPopUp(widgetId,attemptCount);
			}
			////SWG-477 Changes end
			////SWG-399 End
		});
	}

	this.getStuInput = function (widgetID) {

		document.getElementById("resultFrame" + widgetID).contentWindow.CheckGraph();

		var returnData = {

			graph: document.getElementById("resultFrame" + widgetID).contentWindow.graphSe,
			elements: document.getElementById("resultFrame" + widgetID).contentWindow.graphMe

		};

		return JSON.stringify(returnData);

	}

	////SWG-46 Changes
	this.isGraphEdited = function (widgetID) {
		var graph = document.getElementById("resultFrame" + widgetID).contentWindow.graphSe;
		var actionCount = $.grep(graph.ops, function (v) { return (v.op != undefined) });

		return (actionCount.length > 0 ? true : false);
	}
	////SWG-46 Changes end

	////SWG-111 Changes
	$(document).click(function (e) {
		if (document.getElementById("resultFrame" + mywigetId) != null) {
			var graphSE = document.getElementById("resultFrame" + mywigetId).contentWindow.graphSe;
			var e = event;

			canX = e.pageX;
			canY = e.pageY;
			var pt = { x: canX, y: canY };

			if (graphSE != undefined && (ho = graphSE.ObjSelect(pt)) == null) {
				$('#graphcontainer .styled-custom-select').each(function () {
					$(this).removeAttr('size');
					$(this).removeClass('styled-custom-select');
					$(this).css('height', '24px');
				});
			}
		}
	});

	window.focus();
	$('#container').on('mouseenter', function () {
		if (document.getElementById("resultFrame" + mywigetId) != null) {
			var graphSE = document.getElementById("resultFrame" + mywigetId).contentWindow.graphSe
			var e = event;

			canX = e.pageX;
			canY = e.pageY;
			var pt = { x: canX, y: canY };

			if ((ho = graphSE.ObjSelect(pt)) == null) {
				$('#graphcontainer .styled-custom-select').each(function () {
					$(this).removeAttr('size');
					$(this).removeClass('styled-custom-select');
					$(this).css('height', '24px');
				});
			}
		}
	});
	////SWG-111	
}
window.graphModule = new exposeGraph();
