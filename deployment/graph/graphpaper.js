var FPS = 10;
var FDMS = 1 / FPS * 1000.0;
var D2R = Math.PI / 180.0;
var R2D = 180.0 / Math.PI;
var r90 = Math.PI / 2;
var E = Math.E;

var wwr = 1.0;
var whr = 1.0;

var can, ctx, can2, ctx2;
var mouseIsDown = false;
var cancursor;

var graphMe = [];
var animMe = [];
//var undoMe = [ ];

var doLabelMode = false;
var doPointerMode = false;
var drawPointMode = false;
var drawLineMode = false;
var drawCurveMode = false;
var drawFillPolylineMode = false;
var theCurve = null;
var thePoly = null;
var anchorPt = null;
var oldPt;
var newPt = null;
var newLine = null;

var npoints = 0;
var lpoints = 0;
var cpoints = 0;
var apoints = 0;
//SWG-124 changes
var savedObjects = [];
var dragObj = null;
var tempLableLine = false; //SWG-87
var tempbookColor = "No"; //SWG-87
graphSe = new Graph();

function Graph() {
    this.what = 'graph';
    this.grid = true;
    this.value = true;

    this.firstload = true;

    this.fquestion = "Write your question here"

    this.showpos = false;

    this.xinc = 1;
    this.xmin = 0;
    this.xmax = 16;

    this.yinc = 1;
    this.ymin = 0;
    this.ymax = 16;

    this.xaxis = '';
    this.yaxis = '';
    this.title;

    this.nlines = 16;
    this.wdPx = 384;
    this.htPx = 384;

    this.handleColor = "rosybrown";
    this.handleRadius = 6;

    this.snapIt = false;
    this.mode = "designer";
    this.boo = false;

    this.ops;
    this.opsRedo;

    this.opsDesigner = [];
    this.opsRedoDesigner = [];

    this.opsCorrect = [];
    this.opsRedoCorrect = [];

    this.ops = this.opsDesigner;
    this.opsRedo = this.opsRedoDesigner;
    //SWG-142 Changes
    this.studentSettings = {
        isPointDisabled: false,
        isLineDisabled: false,
        isCurveDisabled: false,
        isPolygonDisabled: false
    }
    //SWG-142 Changes End
    this.opsIncorrect = [
        [],
        [],
        [],
        []
    ];
    this.opsRedoIncorrect = [
        [],
        [],
        [],
        []
    ];

    this.title = '';
    this.axisshow = true;
    this.titleshow = true;

    this.opsStudent = [];
    this.opsRedoStudent = [];
    this.tempLableLine = false; //SWG-87
    this.tempbookColor = "No"; //SWG-87
    this.incorrectActive = [false, false, false, false];
    this.ckeTextCorrect = "";
    this.ckeText = [null, null, null, null];

    this.correct = [];

    this.tgcorrect;
    this.ckeFeedback = "";

    this.prevPt = { x: 0, y: 0 };

    this.hitCount = 0;

    this.drawAcceptedArea = null;

    this.originalElements = [];

    ////SWG - 55 Changes
    ////Point required custom label array
    this.pointCustomLabelValues = [];
    this.pointCustomLabelValuesChkStatus = [true];

    ///Line required custom label array
    this.lineCustomLabelValues = [];
    this.lineCustomLabelValuesChkStatus = [true, true, true, true, true, true, true, true, true];

    ////Curve required custom label array
    this.curveCustomLabelValues = [];
    this.curveCustomLabelValuesChkStatus = [true, true, true, true, true, true, true, true, true];

    this.SetMode = function (md) {
        switch (md) {
            case "designer":
                this.boo = false;
                this.ops = this.opsDesigner;
                this.opsRedo = this.opsRedoDesigner;
                this.SetupDesignerTab();
                break;

            case "correct":
                this.boo = true;
                this.ops = this.opsCorrect;
                this.opsRedo = this.opsRedoCorrect;
                this.SetupCorrectTab();
                //graphSe.incorrectActive = [ false, false, false, false ];
                break;

            case "incorrect0":
                this.ops = this.opsIncorrect[0];
                this.opsRedo = this.opsRedoIncorrect[0];
                break;

            case "incorrect1":
            case "incorrect2":
            case "incorrect3":
                this.boo = true;
                var nn = Number(md.charAt(9))
                this.ops = this.opsIncorrect[nn];
                this.opsRedo = this.opsRedoIncorrect[nn];
                this.SetupIncorrectTab(nn);
                graphSe.incorrectActive[nn] = true;
                break;

            case "student":
                if (graphSe.mode == "student") break;
                this.boo = true;
                this.ops = this.opsStudent;
                this.opsRedo = this.opsRedoStudent;
                this.SetupStudentTab();
                break;
        }

        this.mode = md;
    }

    this.SetupDesignerTab = function () {
        for (var i = 0, ln = graphMe.length; i < ln; i++) {
            //ghost ===> graph
            graphMe[i].SetupDesigner();
        }
    }

    this.SetupCorrectTab = function () {

        for (var i = 0, ln = graphMe.length; i < ln; i++) {
            var gi = graphMe[i];
            if (gi.correct[0] == undefined && this.mode == "designer" && !gi.acceptedArea) {
                gi.CorrectMe();
            }

            //correct ==> graph
            gi.SetupCorrect();
            gi.iscorrect = null;

        }

        //remove student created data
        for (var i = graphMe.length - 1; i >= 0; i--) {
            var gi = graphMe[i];
            if (gi.mode == "student") {
                graphMe.splice(i, 1);
                gmloc--;
            }
        }

        //CheckGraph();
    }


    this.SetupIncorrectTab = function (nn) {
        for (var i = 0, ln = graphMe.length; i < ln; i++) {
            //correct ==> incorrect ==> graph
            graphMe[i].SetupIncorrect(nn);
        }

        this.incorrectActive[nn] = true;
    }


    this.SetupStudentTab = function () {
        for (var i = 0, ln = graphMe.length; i < ln; i++)
            graphMe[i].SetupStudent();
    }

    this.GradeMe = function () {
        ////SWG-391 Changes
        var inc1ObjCount = 0; var inc2ObjCount = 0; var inc3ObjCount = 0; //SWG-507 changes
        let staticObjCount = 0;
        var graphMeSubArr = $.grep(graphMe, function (v) {
            //SWG-507 changes start
            if (v.mode == 'incorrect1' && (v.acceptedArea == undefined || v.acceptedArea == false))
                inc1ObjCount++;
            if (v.mode == 'incorrect2' && (v.acceptedArea == undefined || v.acceptedArea == false))
                inc2ObjCount++;
            if (v.mode == 'incorrect3' && (v.acceptedArea == undefined || v.acceptedArea == false))
                inc3ObjCount++;
            if (v.mode == "designer" && (v.interactive == false))
                staticObjCount++;
            //SWG-507 changes end
            return (v.acceptedArea == undefined || v.acceptedArea == false);
        });
        ////SWG-391 Changes Ends
        var nn;
        //SWG-101
        if (thePoly != null && !thePoly.IsDone() && graphSe.mode == "student") {
            thePoly.CompleteMe();
        }
        for (var v = 0, lnv = graphMeSubArr.length; v < lnv; v++) {
            var gv = graphMeSubArr[v];
            if (gv.correct[0] != undefined) gv.correct[0].match = false;
            for (var j = 1, ninc = gv.incorrect.length; j < ninc; j++)
                if (gv.incorrect[j] != undefined) gv.incorrect[j].match = false;
        }

        for (var i = 0, lni = graphMeSubArr.length; i < lni; i++) {
            var gi = graphMeSubArr[i];
            //SWG-597 changes
            if (gi.mode == "designer") {
                if (gi.correct[0] != null) {
                    //corrfail.has = true;
                    if (gi.CheckIsCorrect()) {
                        gi.correct[0].match = true;
                    }
                    //else { SWG_312 and SWG_313 changes
                    //gi.correct[0].match = false;
                    //} //SWG-64 changes

                    for (var j = 1, ninc = gi.incorrect.length; j < ninc; j++) {
                        if (gi.incorrect[j] != null) {
                            //incfail[j].has = true;
                            if (gi.CheckIsCorrect(undefined, gi.incorrect[j])) {
                                gi.incorrect[j].match = true;

                            } else {
                                //gi.incorrect[j].match = false;
                                //incfail[j].fail = true;
                            }
                        }
                    }
                    //}SWG_312 and SWG_313 changes
                }//SWG-64 changes
            } else if (gi.mode == "correct" && !gi.acceptedArea) {
                //Something created in correct tab, grade objects created by student
                for (var s = 0, ss = false, lns = graphMeSubArr.length; s < lns && !ss; s++) {
                    var gs = graphMeSubArr[s];
                    if (gs.mode == "student" && !(gs.correct[0] == undefined ? false : gs.correct[0].match)) {
                        if (gi.correct[0] != null) {
                            //corrfail.has = true;
                            if (gs.CheckIsCorrect(undefined, gi.correct[0])) {
                                gi.correct[0].match = true;
                                gs.correct[0] = { match: true };
                                //ss = true;
                            }
                            //else {SWG_312 and SWG_313 changes
                            //gi.correct[0].match = false;
                            //} //SWG-64 changes
                            //corrfail.fail = true;
                            for (var k = 1; k < 4; k++) {
                                if (gi.incorrect[k] != null && !gi.incorrect[k].match) {
                                    //incfail[k].has = true;
                                    if (gs.CheckIsCorrect(undefined, gi.incorrect[k])) {
                                        gi.incorrect[k].match = true;
                                        gs.incorrect[k] = { match: true };
                                    }
                                    //else incfail[k].fail = true
                                }
                            }
                            //SWG_312 and SWG_313 changes
                            //}//SWG-64 changes
                            //SWG - 75 changes
                            if (gs.correct[0] != undefined && gs.correct[0].match) {
                                s = graphMeSubArr.length;
                            }

                        }
                    }
                }
            } else if (gi.mode.substring(0, 9) == "incorrect" && !gi.acceptedArea) {
                var nn = Number(gi.mode[9]);
                for (var s = 0, nmatches = 0, lns = graphMeSubArr.length; s < lns; s++) {
                    var gs = graphMeSubArr[s];
                    //SWG-64 changes
                    //if (gs.mode == "student") {
                    if (gs.mode == "student" && !(gs.correct[0] == undefined ? false : gs.correct[0].match)) {

                        if (gi.incorrect[nn] != null) {
                            if (gs.CheckIsCorrect(undefined, gi.incorrect[nn])) {
                                gi.incorrect[nn].match = true;
                                gs.incorrect[nn] = { match: true };
                                nmatches++;
                            }
                            //else incfail.fail[nn] = true;
                            //SWG - 75 changes
                            if (gs.incorrect[nn] != undefined) {
                                s = graphMeSubArr.length;
                            }
                        }
                    }
                }

                if (nmatches == 0 && gi.incorrect[nn] != undefined) {
                    gi.incorrect[nn].match = false;
                    //incfail.fail[nn] = true;
                }
            }
        }


        var xtra = false
        for (var s = 0, lns = graphMeSubArr.length; s < lns; s++) {
            var gs = graphMeSubArr[s];
            if (gs.mode == "student") {
                var mi = gs.incorrect[1] == null && gs.incorrect[2] == null && gs.incorrect[3] == null;
                if (gs.correct[0] == undefined && mi) xtra = true;
            }
        }

        /*
        this.ckeFeedback = this.ckeText[0];
        this.tgcorrect = "incorrect";
        if( xtra )
            { this.tgcorrect = "incorrect"; this.ckeFeedback = this.ckeText[0]; }
        else
        {
        */
        //SWG_312 and SWG_313 changes
        var inc1Count = 0; var inc2Count = 0; var inc3Count = 0;
        for (var i = 0, incorr1 = false, lns = graphMeSubArr.length; i < lns; i++) {
            if (graphMeSubArr[i].incorrect[1] != undefined && graphMeSubArr[i].interactive == true) {
                if (graphMeSubArr[i].incorrect[1].match)//SWG-597 changes
                    inc1Count++; //SWG-597 changes
                if (graphMeSubArr[i].interactive && graphMeSubArr[i].incorrect[1].match) {
                    incorr1 = graphMeSubArr[i].incorrect[1].match;
                    //inc1Count++; //SWG_312 and SWG_313 changes
                    //if (!incorr1) break;  //SWG-64 changes
                }
            }
        }

        for (var i = 0, incorr2 = false, lns = graphMeSubArr.length; i < lns; i++) {
            if (graphMeSubArr[i].incorrect[2] != undefined && graphMeSubArr[i].interactive == true) {
                if (graphMeSubArr[i].incorrect[2].match)//SWG-597 changes
                    inc2Count++;//SWG-597 changes
                if (graphMeSubArr[i].interactive && graphMeSubArr[i].incorrect[2].match) {
                    incorr2 = graphMeSubArr[i].incorrect[2].match;
                    //inc2Count++; //SWG_312 and SWG_313 changes
                    //if (!incorr2) break; //SWG-64 changes
                }
            }
        }

        for (var i = 0, incorr3 = false, lns = graphMeSubArr.length; i < lns; i++) {
            if (graphMeSubArr[i].incorrect[3] != undefined && graphMeSubArr[i].interactive == true) {
                if (graphMeSubArr[i].incorrect[3].match)//SWG-597 changes
                    inc3Count++;//SWG-597 changes
                if (graphMeSubArr[i].interactive && graphMeSubArr[i].incorrect[3].match) {
                    incorr3 = graphMeSubArr[i].incorrect[3].match;
                    //inc3Count++; //SWG_312 and SWG_313 changes
                    //if (!incorr3) break; //SWG-64 changes
                }
            }
        }
        //SWG_312 and SWG_313 changes
        ////SWG-391 Changes
        if ((inc3Count < graphMeSubArr.length || inc2Count < graphMeSubArr.length || inc1Count < graphMeSubArr.length)) {
            for (var i = 0, corr = false, lns = graphMeSubArr.length; i < lns; i++) {
                if (graphMeSubArr[i].correct[0] != undefined && !graphMeSubArr[i].acceptedArea) {
                    ////SWG-391 Changes
                    if ((graphMeSubArr[i].interactive && graphMeSubArr[i].mode.substring(0, 9) != "incorrect")) {
                        corr = graphMeSubArr[i].correct[0].match;
                        if (!corr) break;
                    }
                }

            }
        }
        //SWG-64 changes
        if (corr) {
            var correctModeObj = $.grep(graphMeSubArr, function (v) {
                return (v.mode == 'correct');
            });
            var studentModeObj = $.grep(graphMeSubArr, function (v) {
                return (v.mode == 'student');
            });
            if (studentModeObj.length > correctModeObj.length) {
                corr = false;
            }
        }
        //SWG-64 changes end
        this.tgcorrect = "incorrect";
        this.ckeFeedback = this.ckeText[0];

        if (corr) {
            this.tgcorrect = "correct";
            this.ckeFeedback = this.ckeTextCorrect;
        } else if (inc1Count == (graphMeSubArr.length - (inc2ObjCount + inc3ObjCount + staticObjCount))) { //SWG_312 and SWG_313 changes //SWG-507 changes
            this.tgcorrect = "incorrect";
            this.ckeFeedback = this.ckeText[1];
        } else if (inc2Count == (graphMeSubArr.length - (inc1ObjCount + inc3ObjCount + staticObjCount))) { //SWG_312 and SWG_313 changes //SWG-507 changes
            this.tgcorrect = "incorrect";
            this.ckeFeedback = this.ckeText[2];
        } else if (inc3Count == (graphMeSubArr.length - (inc1ObjCount + inc2ObjCount + staticObjCount))) { //SWG_312 and SWG_313 changes //SWG-507 changes
            this.tgcorrect = "incorrect";
            this.ckeFeedback = this.ckeText[3];
        }
        //SWG-64 changes
        //if (xtra) {
        // if (xtra && !incorr1 && !incorr2 && !incorr3) { //SWG_312 and SWG_313 changes
        if (xtra && (inc1Count < graphMeSubArr.length) && (inc2Count < graphMeSubArr.length) && (inc3Count < graphMeSubArr.length)) {
            this.tgcorrect = "incorrect";
            this.ckeFeedback = this.ckeText[0];
        };

        ////Commented Code removed

        return { tgcorrect: this.tgcorrect, ckeFeedback: this.ckeFeedback };
    }



    this.AddElement = function (gMe, gobj) {
        var n = gMe.push(gobj);

        if (gMe == graphMe) gmloc = graphMe.length;

        this.OpsAddElement(n - 1);
    }

    this.HitPt = function (mpt, xg, yg, tol) {
        if (tol == undefined) tol = this.handleRadius;

        var xpx = graphSe.ConvertXgToXpx(xg);
        var ypx = graphSe.ConvertYgToYpx(yg);
        var dx = xpx - mpt.x;
        var dy = ypx - mpt.y;

        return Math.sqrt(dx * dx + dy * dy) < tol;
    }

    this.ObjSelect = function (pt, oi) {
        var rtv = null;
        var dx = pt.x - this.prevPt.x;
        var dy = pt.y - this.prevPt.y;
        this.prevPt = pt;

        this.hits = this.FindAllHits(pt, oi);
        this.hitCount = this.hitCount >= (graphSe.hits.length - 1) ? 0 : this.hitCount + 1;
        // if (doLabelMode && graphSe.mode == "student") {
        //     for(var i = 0; i < this.hits.length; i++){
        //         if (this.hits[i].gi.mode == "student") {
        //         this.hitCount = i;
        //             break;
        //         }
        //     }
        // }
        //SWG-409 changes start
        if (this.hits.length > 1) {
            var pCount = 0;
            var pIndex = "";
            var pACount = 0;
            var pAIndex = "";
            var lCount = 0;
            var lIndex = "";
            for (var i = 0; i < this.hits.length; i++) {
                if (graphSe.mode == 'student' && this.hits[i].gi.mode == 'student' && this.hits[i].gi.what == "point") {
                    pCount++;
                    pIndex = i;
                }
                else if (this.hits[i].gi.what == "point") {
                    pACount++;
                    pAIndex = i;
                }
                if (this.hits[i].gi.what == "line") {
                    lCount++;
                    lIndex = i;
                }
            }
            if (graphSe.mode == 'student' && pCount > 0) {
                if (pCount >= 1) { this.hitCount = pIndex; }
                if (pCount == 0 && lCount >= 1) { this.hitCount = lIndex; }
            }
            else {
                if (pACount >= 1) { this.hitCount = pAIndex; }
                if (pACount == 0 && lCount >= 1) { this.hitCount = lIndex; }
            }
        }
        //SWG-409 changes end
        var gh = this.hits[this.hitCount];
        if (gh != undefined) rtv = { loc: gh.loc, gi: gh.gi };
        else rtv = null;

        return rtv;
    }

    this.FindAllHits = function (pt, oi) {
        for (var i = 0, allHits = [], lni = graphMe.length; i < lni; i++) {
            var gi = graphMe[i];
            //SWG-110
            var isGhostEmpty = false;
            if (gi.ghost == null && graphSe.mode == "student" && gi.mode != 'student' && gi.interactive) {
                gi.GhostMe();
                isGhostEmpty = true;
            }
            //SWG_409 changes start
            // if (oi != undefined) {
            //     if (gi.HitMe(pt) && gi.interactive) allHits.push({ loc: i, gi: gi });
            // } else {
            //if (gi.HitMe(pt) || isGhostEmpty) allHits.push({ loc: i, gi: gi });
            if (Array.isArray(gi.HitMe(pt)) ? (gi.HitMe(pt)).length > 0 : gi.HitMe(pt) > 0) allHits.push({ loc: i, gi: gi });//SWG_409 changes
            //}
            //SWG_409 changes end
        }

        return allHits;
    }

    this.SetMaxes = function () {
        this.xmax = (this.xinc * this.nlines) + this.xmin;
        this.ymax = (this.yinc * this.nlines) + this.ymin;

        document.getElementById('xmax').value = this.xmax;
        document.getElementById('ymax').value = this.ymax;

    }

    this.SnapOnOff = function (tf) {
        this.snapIt = tf;

        //if( tf ) this.SnapAll( );
        this.SnapAll();

        //console.log("SnapOnOff: ", this.snapIt);
    }

    this.SnapX = function (xg) {
        var sxg = xg;
        var xincd2 = graphSe.xinc / 2;

        //if( graphSe.snapIt )
        //{
        var sxg = Math.round(xg / xincd2) * xincd2;
        //}

        return sxg;

    }

    this.SnapY = function (yg) {
        var syg = yg;
        var yincd2 = graphSe.yinc / 2;

        //if( graphSe.snapIt )
        //{
        var syg = Math.round(yg / yincd2) * yincd2;
        //}

        return syg;
    }

    this.SnapAll = function () {
        for (var i = 0, gln = graphMe.length; i < gln; i++) {
            graphMe[i].SnapMe();
            if (gmloc == i + 1) graphMe[i].SetElementPoints();
        }
    }

    this.NoHover = function () {
        for (var i = 0, gln = graphMe.length; i < gln; i++)
            graphMe[i].ControlMe(false);
    }

    this.OneHover = function () {
        for (var i = 0, gln = graphMe.length; i < gln; i++) {
            var gi = graphMe[i];
            if (gi != hoverObj) gi.ControlMe(false);
        }
    }

    this.CalcConverters = function () {
        this.px2gX = (this.xmax - this.xmin) / this.wdPx;
        this.g2pxX = 1 / this.px2gX;
        this.px2gY = (this.ymax - this.ymin) / this.htPx;
        this.g2pxY = 1 / this.px2gY;
    }

    this.convertX = function (x) {
        return this.xmin + (x * this.xinc);
    }

    this.ConvertXpxToXg = function (xPx) {
        return this.xmin + xPx * this.px2gX;
    }

    this.ConvertXgToXpx = function (xg) {
        return (xg - this.xmin) * this.g2pxX;
    }

    this.convertY = function (y) {
        return this.ymin + (y * this.yinc);
    }

    this.ConvertYpxToYg = function (yPx) {
        return this.ymax - yPx * this.px2gY;
    }

    this.ConvertYgToYpx = function (yg) {
        return (this.ymax - yg) * this.g2pxY;
    }

    this.reverseXC = function (x) {
        return (x / (this.xmax - this.xmin)) * this.wdPx
    }

    this.reverseYC = function (y) {
        var n = (y / (this.ymax - this.ymin)) * this.htPx;
        return this.htPx - n;
    }

    this.OpsAddElement = function (gloc) {
        this.ops.push({ op: "add", gloc: gloc });
    }

    this.OpsDeleteElement = function (gobj) {
        this.ops.push({ op: "delete", gobj: gobj });
    }

    this.OpsMoveElement = function (gobj, type, dx, dy) {
        this.ops.push({ op: "move", gobj: gobj.uniqueLabel != undefined ? gobj.uniqueLabel : gobj.label, type: type, dx: dx, dy: dy });
    }

    this.OpsAddStudentLabel = function (gloc) {
        ////SWG - 247 Changes Start
        var opsArr = $.grep(this.ops, function (obj) {
            return obj.op == "addLabel" && obj.gloc == gloc;
        });

        if (opsArr.length == 0) ////SWG - 247 Changes End
            this.ops.push({ op: "addLabel", gloc: gloc });
    }

    this.Undo = function (e) {
        //SWG-223 Changes
        if (graphMe.length > 0)
            graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
        //SWG-223 Changes end
        if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();

        switch (e.type) {
            //SWG-226 changes start
            // case "mousedown":
            //     undoTmr = setTimeout(function() {
            //         $('#myModal').modal()
            //             /*undoMe = [];
            //             graphMe = [];
            //             this.ops = [];
            //             this.opsRedo = [];
            //             //if( this.mode == "designer" ) {this.opsDesigner = []; this.opsRedoDesigner = []; }
            //             //else if( this.mode == "correct" ) { this.opsCorrect = []; this.opsRedoCorrect = []; }
            //             //else if( this.mode == "student" ) { this.opsStudent = []; this.opsRedoStudent = []; }
            //             this.opsDesigner = [];
            //             this.opsRedoDesigner = [];
            //             this.opsCorrect = [];
            //             this.opsRedoCorrect = [];
            //             this.opsStudent = [];
            //             this.opsRedoStudent = [];*/
            //     }, 2000);
            //     break;
            //SWG-226 changes end
            case "mouseup":
                clearTimeout(undoTmr);

                this.Undo1();
                break;

            case "touchstart":
                undoTmr = setTimeout(function () {
                    $('#myModal').modal()
                    /*undoMe = [];
                    graphMe = [];
                    this.ops = [];
                    this.opsRedo = [];
                    //if( this.mode == "designer" ) {this.opsDesigner = []; this.opsRedoDesigner = []; }
                    //else if( this.mode == "correct" ) { this.opsCorrect = []; this.opsRedoCorrect = []; }
                    //else if( this.mode == "student" ) { this.opsStudent = []; this.opsRedoStudent = []; }
                    this.opsDesigner = [];
                    this.opsRedoDesigner = [];
                    this.opsCorrect = [];
                    this.opsRedoCorrect = [];
                    this.opsStudent = [];
                    this.opsRedoStudent = [];*/
                }, 2000);
                break;

            case "touchend":
                clearTimeout(undoTmr);

                //this.Undo1( );
                break;

        }
    }

    this.Undo1 = function () {
        //Changes for SWG-41(25-07-2017) - By Akash
        var objCount = 0;
        var op = this.ops.pop();
        $.grep(this.ops, function (element, index) {
            if (element.gobj == op.gobj) objCount++;
        });
        //End changes for SWG-41(25-07-2017) - By Akash
        if (op != undefined) {
            this.opsRedo.push(op);
            switch (op.op) {
                case "add":
                    var gobj = this.PopGraphMe();
                    if (gobj != undefined) {
                        op.gobj = gobj;
                        if (graphMe.length > 0) {
                            if (gmloc > 1) gmloc--;
                            graphMe[gmloc - 1].SetSettings();
                            graphMe[gmloc - 1].ControlMe(true);
                        } else {
                            $('#bottomtools').addClass("hide");
                            $('#interactive').addClass("hide");
                        }
                    }

                    break;

                case "delete":
                    var gobj = op.gobj;
                    //SWG-215 changes start
                    var incorrectDeleted = false;
                    if (gobj.deletedFrom != undefined) {
                        $.each(gobj.deletedFrom, function (index, value) {
                            if (gobj.deletedFrom[index] != undefined && gobj.deletedFrom[index] == graphSe.mode) {
                                gobj.deletedFrom[index] = null;
                                incorrectDeleted = true;
                            }
                        });
                    }
                    if (!incorrectDeleted) {
                        gmloc = graphSe.InsertElement(gobj);
                    }
                    //gmloc = graphSe.InsertElement(gobj);
                    //SWG-215 changes end
                    gobj.SetSettings();
                    gobj.ControlMe(true);
                    break;

                case "move":
                    var gobj = graphSe.FindInGraph(op.gobj);
                    //Changes for SWG-41(25-07-2017) - By Akash
                    gobj.MoveMe(op.type, op.dx, op.dy, objCount);
                    gobj.upadeteStudLabelPossitiopn(); ////SWG-128, SWG-445
                    break;

                case "addLabel":
                    var gobj = graphMe[op.gloc - 1];
                    gobj.deleteStudentLabel();
                    break;
            }
        }
    }

    this.Redo = function (e) {
        if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();

        var op = this.opsRedo.pop();

        if (op != undefined) {
            this.ops.push(op);
            switch (op.op) {
                case "add":
                    if (op.gobj != undefined) {
                        gmloc = graphSe.InsertElement(op.gobj);
                        var gm = graphMe[gmloc - 1];
                        gm.SetSettings();
                        gm.ControlMe(true);
                    }
                    break;

                case "delete":
                    for (var i = 0, done = false, ln = graphMe.length; i < ln && !done; i++) {
                        if (graphMe[i] == op.gobj) {
                            //SWG-215 changes start
                            var incorrectRedo = false;
                            var redoObj = graphMe[i];
                            if (redoObj.deletedFrom != undefined) {
                                $.each(redoObj.deletedFrom, function (index, value) {
                                    if (redoObj.deletedFrom[index] != undefined && redoObj.deletedFrom[index] == graphSe.mode) {
                                        graphMe[i].deletedFrom[index] = graphSe.null;
                                        incorrectRedo = true;
                                    }
                                });
                            }
                            if (!incorrectRedo) {
                                graphMe.splice(i, 1);
                            }
                            //graphMe.splice(i, 1)
                            //SWG-215 changes end
                            if (i < gmloc - 1) gmloc--;
                            done = true;
                            var gobj = graphMe[gmloc - 1]
                            if (gobj != undefined) {
                                gobj.SetSettings();
                                gobj.ControlMe(true);
                            }
                            //else resetSetSettings();
                        }
                    }
                    break;


                case "move":
                    var gobj = graphSe.FindInGraph(op.gobj);
                    gobj.MoveMe(op.type, -op.dx, -op.dy, 0, op);
                    gobj.upadeteStudLabelPossitiopn(); ////SWG-128, SWG-445
                    break;

                case "addLabel":
                    var gobj = graphMe[op.gloc - 1];

                    if (document.getElementById("elabel" + gobj.divid) == null) {
                        gobj.replaceStudentLabel();
                    } else {
                        this.ops.pop();
                    }

                    break;
            }
        }
    }
    //SWG-226 changes start
    this.ResetAll = function () {
        $('#myModal').modal();
    }
    //SWG-226 changes end
    this.PopGraphMe = function () {
        var gi;
        for (var le = graphMe.length - 1, poped = false; le >= 0 && !poped; le--) {
            gi = graphMe[le];
            if (gi.mode == graphSe.mode) {
                graphMe.splice(le, 1);
                poped = true;
            }
        }

        return gi;
    }

    this.FindInGraph = function (lbl) {
        var gi;
        lbl = lbl != undefined ? lbl.toString() : lbl;
        for (var i = 0, fnd = false, ln = graphMe.length; i < ln && !fnd; i++) {
            gi = graphMe[i];
            var CheckLabel = gi.uniqueLabel != undefined ? gi.uniqueLabel.toString() : gi.label;
            fnd = (CheckLabel === lbl);
            if (!fnd) {
                fnd = gi.label == lbl;
            }
        }

        if (!fnd) {
            for (var i = 0, fnd = false, ln = graphMe.length; i < ln && !fnd; i++) {
                gi = graphMe[i];
                fnd = gi.labeledit == lbl;
            }
        }

        return fnd ? gi : null;
    }

    this.FindInGraphIndex = function (lbl) {
        var gi;
        for (var i = 0, fnd = false, ln = graphMe.length; i < ln && !fnd; i++) {
            gi = graphMe[i];
            fnd = gi.label == lbl;
        }

        return fnd ? i - 1 : -1;
    }


    this.DeleteElement = function () {
        var gobj = graphMe[gmloc - 1];
        //SWG - 200 Changes
        if (gobj != undefined && (gobj.mode != graphSe.mode) && graphSe.mode.includes("incorrect") && gobj.what != "poly") {
            if (graphMe[gmloc - 1].deletedFrom == undefined) {
                graphMe[gmloc - 1].deletedFrom = [];
            }
            var nn = Number(graphSe.mode.charAt(9));
            graphMe[gmloc - 1].deletedFrom[nn] = graphSe.mode;

        } else {
            if (gobj != undefined) this.DeleteAreas(gobj);

            if (gobj != undefined) {
                graphMe.splice(gmloc - 1, 1);
                gmloc--;
                if (gmloc <= 0) gmloc = 1;
                if (graphMe.length > 0) {
                    var gg = graphMe[gmloc - 1];
                    gg.SetSettings();
                    gg.ControlMe(true);
                } else {
                    applyOldElementsSettings = false;
                    resetSetSettings();
                }
            }
        }
        var arr = jQuery.grep(graphMe, function (val) {
            return ((val.deletedFrom == undefined && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode)) || (val.deletedFrom != undefined && val.deletedFrom.length > 0 && val.deletedFrom.indexOf(graphSe.mode) == -1) && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode));
        });
        if (arr.length > 0) {
            arr[arr.length - 1].SetSettings();
            var index = 1;
            for (var i = 0; i < graphMe.length; i++) {
                if (arr[arr.length - 1].uniqueLabel != graphMe[i].uniqueLabel) index++;
                else break;
            }
            gmloc = index;
        }
        graphSe.OpsDeleteElement(gobj);
        DoPointer();
    }

    this.DeleteAreas = function (go) {
        var iareas = [];

        if (go.correct[0] != undefined) {
            if (go.correct[0].lbl[0] == "A") {
                var ia = graphSe.FindInGraphIndex(go.correct[0].lbl)
                if (ia > -1) iareas.push(ia);
            }
        }

        for (var i = 1; i < 4; i++) {
            if (go.incorrect[i] != null) {
                if (go.incorrect[i].lbl[0] == "A") {
                    var ia = graphSe.FindInGraphIndex(go.incorrect[i].lbl)
                    if (ia > -1) iareas.push(ia);
                }
            }
        }

        iareas.sort(function (a, b) { return b - a });

        for (var i = 0, lni = iareas.length; i < lni; i++)
            graphMe.splice(iareas[i], 1);
    }

    this.InsertElement = function (gobj) {
        var tc = gobj.label[0];
        var nn = Number(gobj.label.substr(1));

        for (var i = 0, done = false, ln = graphMe.length; i < ln && !done; i++) {
            var gi = graphMe[i];
            if (gi.label[0] == tc && Number(gi.label.substr(1)) > nn) {
                graphMe.splice(i, 0, gobj);
                done = true;
            }
        }

        if (!done) {
            graphMe.push(gobj);
            i = graphMe.length;
        }

        return i;
    }
    //SWG-223/224/225 Changes
    this.DeleteIncompleteObject = function (objType) {
        var objDeleted = false;
        var objeIndex = graphMe.length - 1;
        var myObject = graphMe[objeIndex];
        //graphSe.DeleteAreas(myObject);
        switch (objType) {
            case "line":
                if (myObject.xeg == undefined || isNaN(myObject.xeg)) {
                    graphMe.splice(objeIndex, 1);
                    newLine = null;
                    objDeleted = true;
                }
                break;
            case "curve":
                if (myObject.pts.length < 6) {
                    graphMe.splice(objeIndex, 1);
                    theCurve = null;
                    animMe = [];
                    objDeleted = true;
                }
                break;
            case "poly":
                if (myObject.pts.length < 6) {
                    graphMe.splice(objeIndex, 1);
                    thePoly = null;
                    objDeleted = true;
                }
                break;
        }

        if (objDeleted) {
            gmloc = graphMe.length > 0 ? gmloc - 1 : 1;
            var arr = jQuery.grep(graphMe, function (val) {
                return ((val.deletedFrom == undefined && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode)) || (val.deletedFrom != undefined && val.deletedFrom.length > 0 && val.deletedFrom.indexOf(graphSe.mode) == -1) && (val.mode == "designer" || val.mode == "correct" || val.mode == graphSe.mode));
            });

            if (arr.length > 0) {
                arr[arr.length - 1].SetSettings();
            }

        }
    }
    //SWG-223 Changes end
    this.SetMaxes();
    this.CalcConverters();

}



function Start() {
    paper.setup(document.getElementById('CanvasGraph'));
    paper.setup(document.getElementById('CanvasAnimate'));
    paper.setup(document.getElementById('CanvasAnimate2'));

    can = document.getElementById("CanvasAnimate");
    ctx = can.getContext("2d");

    can2 = document.getElementById("CanvasAnimate2");
    ctx2 = can2.getContext("2d");

    can.addEventListener("mousedown", MouseDown, false);
    can.addEventListener("mousemove", MouseMove, false);
    can.addEventListener("touchstart", TouchDown, false);
    can.addEventListener("touchmove", TouchMove, true);
    can.addEventListener("touchend", TouchUp, false);
    can.addEventListener("mouseout", PosOff, false);
    can.addEventListener("mouseover", PosOn, false);

    document.body.addEventListener("mouseup", MouseUp, false);
    document.body.addEventListener("touchcancel", TouchUp, false);

    var dlBtn = document.getElementById("pointerBtn");
    dlBtn.addEventListener("click", DoPointer, false);

    dlBtn = document.getElementById("drawpointBtn");
    dlBtn.addEventListener("click", DoDrawPoint, false);

    dlBtn = document.getElementById("drawlineBtn");
    dlBtn.addEventListener("click", DoDrawLine, false);

    dlBtn = document.getElementById("drawcurveBtn");
    dlBtn.addEventListener("click", DoDrawCurve, false);

    dlBtn = document.getElementById("drawfillpolylineBtn");
    dlBtn.addEventListener("click", DoDrawFillPolyline, false);

    dlBtn = document.getElementById("label");
    dlBtn.addEventListener("click", DoLabel, false);

    dlBtn = document.getElementById("drawundoBtn");
    dlBtn.addEventListener("mousedown", function (e) { graphSe.Undo(e) }, false);
    dlBtn.addEventListener("mouseup", function (e) { graphSe.Undo(e) }, false);
    dlBtn.addEventListener("touchstart", function (e) { graphSe.Undo(e) }, false);
    dlBtn.addEventListener("touchend", function (e) { graphSe.Undo(e) }, false);

    dlBtn = document.getElementById("drawredoBtn");
    dlBtn.addEventListener("click", function (e) { graphSe.Redo(e) }, false);
    //SWG-226 changes start
    dlBtn = document.getElementById("resetBtn");
    dlBtn.addEventListener("click", function (e) { graphSe.ResetAll() }, false);
    //SWG-226 changes end
    DrawGrid();

    paper.projects[0].view.onFrame = AnimateGraph;
    //paper.projects[1].view.onFrame = DrawGraph;
    //tmr = setInterval( AnimateGraph, FDMS );

    StartMM();
    resize();
    ////SWG-111 Changes
    $('#container').on("click", function (e) {
        var pt = MouseXY(e);
        if ((ho = graphSe.ObjSelect(pt)) == null) {
            $('#graphcontainer .styled-custom-select').each(function () {
                $(this).removeAttr('size');
                $(this).removeClass('styled-custom-select');
                $(this).css('height', '24px');
            })
        }

    });
    ////SWG-111
    document.getElementById("pointerBtn").click();
}

function PosOff() {
    graphSe.showpos = false;
    ctx.clearRect(0, 0, can.width, can.height);

}

function PosOn() {
    graphSe.showpos = true;
}

function Point(clr, xx, yy, szz) {
    this.what = "point";
    //SWG-124 changes
    this.uniqueLabel = Math.floor(Math.random() * 90000) + 10000;

    this.droppedlabel = 0;

    this.studentcorrectlabel = "a";

    this.iscorrect = null;
    //this.correctgraph;
    //this.labelcorrect;

    this.clselectsinc = ['</span><option value="None">None</option><option value="Equilibrium">Equilibrium</option>', '</span><option value="None">None</option><option value="Equilibrium">Equilibrium</option>', '</span><option value="None">None</option><option value="Equilibrium">Equilibrium</option>', '</span><option value="None">None</option><option value="Equilibrium">Equilibrium</option>'];
    this.clselects = '</span><option value="None">None</option><option value="Equilibrium">Equilibrium</option>'
    this.relementlabelinc = ["None", "None", "None", "None"];
    this.evalshiftinc = [null, null, null];
    this.preciseinc = [null, null, null]
    this.correctlabelinc = ["b", "b", "b", "b"];
    //this.checkboxes = [true]; ////SWG-55 Changes
    this.checkboxesinc1 = [true];
    this.checkboxesinc2 = [true];
    this.checkboxesinc3 = [true];
    this.customlabels = [];
    this.customlabelsinc1 = [];
    this.customlabelsinc2 = [];
    this.customlabelsinc3 = [];
    this.clabeloffsetinc = ["42px", "42px", "42px", "42px",];
    this.requiredlabelinc = []; ////SWG-245
    this.checkboxhtmlinc = [];

    this.x = xx;
    this.y = yy;
    this.color = clr;
    this.radius = szz;
    this.type = "";
    this.elementlabel = "None";
    this.relementlabel = "None";
    this.bookcolor = "No";
    this.iscurrent = true;
    this.once = 0;

    this.interactive = graphSe.mode.indexOf("correct") != -1 || graphSe.mode == "student" ? true : false;
    this.precise = null;
    this.evalshift = null;
    this.labelam = '';
    this.taelement = 'None';
    this.labelLine = false;
    this.relselects = '';
    this.locked = false;

    this.correctx = null;
    this.correcty = null;

    this.trackAng = 0;
    this.trackOffset = 0;
    this.trackXg;
    this.trackYg;

    this.xg = graphSe.ConvertXpxToXg(xx);
    this.yg = graphSe.ConvertYpxToYg(yy);

    this.sxg = graphSe.SnapX(this.xg);
    this.syg = graphSe.SnapY(this.yg);

    this.tempy;

    this.plumbLine = false;

    this.ghost = null;

    this.mode = graphSe.mode;

    this.dragState = "off";
    this.dragStart = null;
    this.dragDxDy = { dx: 0, dy: 0 };
    npoints++;
    //gmloc = npoints;
    this.label = "P" + npoints;
    this.divid = this.label;

    this.labelvalue = npoints;
    this.moves = [];
    this.myPath;

    this.labeledit = this.label;
    this.labelvalueedit = this.labelvalue;
    //Changes for Undo/reset when tracking against the curve
    this.prevCords = [];
    this.MyFirstGhost = {};

    this.correct = [];
    this.correctTolerance = 4;
    this.correctFeedback = "Point Correct!";
    this.notCorrectFeedback = "Point Not Correct!";
    this.feedback = "";

    this.incorrect = [null, null, null, null];
    this.isIncorrect = [null, null, null, null];

    this.templabel;

    this.correctlabel = "b";

    this.taselects = '';
    this.relselects = '';

    this.cc = 'rgba(0, 0, 0, 1)'
    this.ccus = 'rgba(0, 0, 0, .5)'

    this.clabeloffset = "42px";
    this.elabelmode = "";

    this.studentdrag = null;

    this.requiredlabel = false;

    this.elabelmode = "";

    this.removedcheckboxes = [];
    this.removedcheckboxesstate = [];
    ////Prod issue SWG-332
    this.designerLabel = "";
    ////Prod issue SWG-332
    this.setStudentColor = function () {

    }
    //SWG-87 added tempbookcolor condition
    this.SetColor = function () {
        if (this.elementlabel == "None") {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        } else if (this.elementlabel == "PPF" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(170, 95, 166, 1)';
            this.ccus = 'rgba(170, 95, 166, .5)';
        } else if (this.elementlabel == "Demand" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(0, 131, 173, 1)';
            this.ccus = 'rgba(0, 131, 173, .5)';
        } else if (this.elementlabel == "Supply" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Fixed Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(188, 189, 192, 1)';
            this.ccus = 'rgba(188, 189, 192, .5)';
        } else if (this.elementlabel == "Indifference" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Revenue" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(35, 31, 32, 1)';
            this.ccus = 'rgba(35, 31, 32, .5)';
        } else if (this.elementlabel == "Total Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Variable Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(238, 165, 122, 1)';
            this.ccus = 'rgba(238, 165, 122, .5)';
        } else {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        }
    }

    // get evalshift based on current tab
    this.getEvalShift = function () {
        if (graphSe.mode == 'correct') return this.evalshift;
        if (graphSe.mode == 'incorrect1') return this.evalshiftinc[1];
        if (graphSe.mode == 'incorrect2') return this.evalshiftinc[2];
        if (graphSe.mode == 'incorrect3') return this.evalshiftinc[3];
        return '';
    };
    //Changes for SWG-312 and 313
    // get precise based on current tab
    this.getPrecise = function () {
        if (graphSe.mode == 'correct') return this.precise;
        if (graphSe.mode == 'incorrect1') return this.preciseinc[1];
        if (graphSe.mode == 'incorrect2') return this.preciseinc[2];
        if (graphSe.mode == 'incorrect3') return this.preciseinc[3];
        return '';
    };
    //Changes for SWG-312 and 313 end
    // drawme of a point
    this.DrawMe = function (ctx) {
        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
        var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);

        // original location of drawing
        //this.myPath = new paper.Path.Circle(new paper.Point(xpx, ypx), this.radius);
        //this.myPath.fillColor = this.iscurrent ? this.cc : this.ccus;

        if (graphSe.boo && this.ghost && (this.mode.indexOf("correct") == -1) && this.mode != "student") {
            var gh = this.ghost;
            var xx = graphSe.ConvertXgToXpx(graphSe.snapIt ? gh.sxg : gh.xg);
            var xy = graphSe.ConvertYgToYpx(graphSe.snapIt ? gh.syg : gh.yg);
            var dx = xpx - xx;
            var dy = ypx - xy;
            if (Math.sqrt(dx * dx + dy * dy) > 2) {
                this.myPath = new paper.Path.Circle(new paper.Point(xx, xy), this.radius);
                this.myPath.fillColor = gh.clr;
            }

            if (this.labelLine == true) {
                text = new paper.PointText(new paper.Point(xx, xy + 20));
                text.justification = 'center';
                text.fillColor = this.ccus;
                text.content = this.labeledit;
            }
            var shiftVal = this.getEvalShift();
            shiftVal = shiftVal == undefined ? this.evalshift : shiftVal; ////SWG-312, 313
            // change the point coordinates 2 points away in the correct direction
            var isPrecise = this.getPrecise();
            if (!isPrecise && shiftVal) {
                if (shiftVal == "left") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        this.originalCoordinates = { sxg: this.sxg, xg: this.xg, syg: this.syg, yg: this.yg };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.leftCoordinatesUpdated == undefined || this.leftCoordinatesUpdated == null) {
                            if (this.originalCoordinates.sxg != this.sxg && this.originalCoordinates.xg != this.xg) {
                                // reset the Coordinates
                                this.sxg = this.originalCoordinates.sxg;
                                this.xg = this.originalCoordinates.xg;
                                //Changes for SWG-60 by Akash
                                if (this.taelement != "None") {
                                    var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                                    if (tracToElement.what == 'curve' || tracToElement.what == 'line') {
                                        this.syg = this.originalCoordinates.syg;
                                        this.yg = this.originalCoordinates.yg;
                                    }
                                }
                            }
                            var xincrement = 1;
                            if (document.getElementById('xinc') != undefined) xincrement = document.getElementById('xinc').value;
                            var yincrement = 1;
                            if (document.getElementById('yinc') != undefined) yincrement = document.getElementById('yinc').value;
                            //Changes for SWG-60 by Akash (added if else condition)
                            if (this.taelement != "None") {
                                var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                                if (tracToElement.what == 'curve' || tracToElement.what == 'line') {
                                    if (tracToElement.what == 'curve') {
                                        var addValue = 2;
                                        var dX = this.ghost.xg - (addValue * parseInt(xincrement));
                                        var dY = this.ghost.yg - (addValue * parseInt(yincrement));//code refactor - Akash
                                        dX = graphSe.ConvertXgToXpx(dX);
                                        dY = graphSe.ConvertYgToYpx(dY);
                                        var nearestPoint = tracToElement.myPath.getNearestPoint(dX, dY);
                                        this.xg = graphSe.ConvertXpxToXg(nearestPoint.x);
                                        this.yg = graphSe.ConvertYpxToYg(nearestPoint.y);
                                        this.sxg = graphSe.SnapX(this.xg);
                                        this.syg = graphSe.SnapY(this.yg);
                                    }
                                    else {
                                        var minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                                        var maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                                        var minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                                        var maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                                        if (this.orignalPosition == undefined) {
                                            this.orignalPosition = this.myPath.position;
                                        }
                                        if (minX == maxX) {
                                            this.yg = this.ghost.yg - (2 * yincrement);//code refactor - Akash
                                        }
                                        else if (minY == maxY) {
                                            this.xg = this.ghost.xg - (2 * xincrement);//code refactor - Akash
                                        }
                                        else {
                                            //code refactor - Akash
                                            this.TrackAlong();
                                            var s = this.Track(-2 * xincrement);
                                            var s1 = this.Track(-2 * yincrement);
                                            var dsxg = xincrement > yincrement ? s.sx : s1.sx;
                                            var dsyg = xincrement > yincrement ? s.sy : s1.sy;
                                            this.xg = this.ghost.xg + dsxg;
                                            this.yg = this.ghost.yg + dsyg;
                                        }
                                        this.sxg = graphSe.SnapX(this.xg);
                                        this.syg = graphSe.SnapY(this.yg);
                                    }
                                }
                                else {
                                    this.sxg = this.sxg - (2 * xincrement); //this.ysg -= 2 * yinc;
                                    this.xg = this.xg - (2 * xincrement); //this.yg -= 2 * yinc;
                                }

                            }
                            else {
                                this.sxg = this.sxg - (2 * xincrement); //this.ysg -= 2 * yinc;
                                this.xg = this.xg - (2 * xincrement); //this.yg -= 2 * yinc;
                            }
                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                            this.leftCoordinatesUpdated = true;
                            this.rightCoordinatesUpdated = undefined;
                        }
                    }
                } else if (shiftVal == "right") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        this.originalCoordinates = { sxg: this.sxg, xg: this.xg, syg: this.syg, yg: this.yg };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.rightCoordinatesUpdated == undefined || this.rightCoordinatesUpdated == null) {
                            if (this.originalCoordinates.sxg != this.sxg && this.originalCoordinates.xg != this.xg) {
                                // reset the Coordinates
                                this.sxg = this.originalCoordinates.sxg;
                                this.xg = this.originalCoordinates.xg;
                                //Changes for SWG-60 by Akash
                                if (this.taelement != "None") {
                                    var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                                    if (tracToElement.what == 'curve' || tracToElement.what == 'line') {
                                        this.syg = this.originalCoordinates.syg;
                                        this.yg = this.originalCoordinates.yg;
                                    }
                                }
                            }
                            var xincrement = 1;
                            if (document.getElementById('xinc') != undefined) xincrement = document.getElementById('xinc').value;
                            var yincrement = 1;
                            if (document.getElementById('yinc') != undefined) yincrement = document.getElementById('yinc').value;
                            //Changes for SWG-60 by Akash (added if else condition)
                            if (this.taelement != "None") {
                                var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                                if (tracToElement.what == 'curve' || tracToElement.what == 'line') {
                                    if (tracToElement.what == 'curve') {
                                        var addValue = 2;
                                        var dX = this.ghost.xg + (addValue * parseInt(xincrement));
                                        var dY = this.ghost.yg + (addValue * parseInt(yincrement));
                                        dX = graphSe.ConvertXgToXpx(dX);
                                        dY = graphSe.ConvertYgToYpx(dY);
                                        var nearestPoint = tracToElement.myPath.getNearestPoint(dX, dY);
                                        this.xg = graphSe.ConvertXpxToXg(nearestPoint.x);
                                        this.yg = graphSe.ConvertYpxToYg(nearestPoint.y);
                                        this.sxg = graphSe.SnapX(this.xg);
                                        this.syg = graphSe.SnapY(this.yg);
                                    }
                                    else {
                                        var minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                                        var maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                                        var minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                                        var maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                                        if (this.orignalPosition == undefined) {
                                            this.orignalPosition = this.myPath.position;
                                        }
                                        if (minX == maxX) {
                                            this.yg = this.ghost.yg + (2 * yincrement);
                                        }
                                        else if (minY == maxY) {
                                            this.xg = this.ghost.xg + (2 * xincrement);
                                        }
                                        else {
                                            this.TrackAlong();
                                            var s = this.Track(2 * xincrement);
                                            var s1 = this.Track(2 * yincrement);
                                            var dsxg = xincrement > yincrement ? s.sx : s1.sx;
                                            var dsyg = xincrement > yincrement ? s.sy : s1.sy;
                                            this.xg = this.ghost.xg + dsxg;
                                            this.yg = this.ghost.yg + dsyg;
                                        }
                                        this.sxg = graphSe.SnapX(this.xg);
                                        this.syg = graphSe.SnapY(this.yg);
                                    }
                                }
                                else {
                                    this.sxg = this.sxg + (2 * xincrement);
                                    this.xg = this.xg + (2 * xincrement);
                                }
                            }
                            else {
                                this.sxg = this.sxg + (2 * xincrement); //this.ysg -= 2 * yinc;
                                this.xg = this.xg + (2 * xincrement); //this.yg -= 2 * yinc;
                            }
                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                            this.rightCoordinatesUpdated = true;
                            this.leftCoordinatesUpdated = undefined;
                        }
                    }
                } // end of else if - right
            } // end if precise condition
            else {
                ////SWG-391 Changes
                var nn = Number(graphSe.mode.charAt(9));
                if (this.relementlabelinc[nn] != "Accepted Area")
                    ////SWG-391 Changes Ends
                    this.IncorrectMe();
            }

        } // correct condition
        // recalculate in case if there are any updates from left/right positions

        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
        var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);

        this.myPath = new paper.Path.Circle(new paper.Point(xpx, ypx), this.radius);
        this.myPath.fillColor = this.iscurrent ? this.cc : this.ccus;
        //SWG - 200 changes
        if (graphSe.mode.includes("incorrect")) {
            var nn = Number(graphSe.mode.charAt(9));
            if (this.deletedFrom != undefined && this.deletedFrom[nn] != undefined) {
                this.myPath.visible = false;
            }
            else {
                this.myPath.visible = true;
            }
        }
        else {
            this.myPath.visible = true;
        }
        this.myPath.smooth();
        //SWG-120
        var xstart = graphSe.snapIt ? this.sxg : this.xg;
        var ystart = graphSe.snapIt ? this.syg : this.yg
        if (xstart == graphSe.xmin) {
            this.myPath.position.x += 2.0;
        }
        if (ystart == graphSe.ymax) {
            this.myPath.position.y += 2.0;
        }
        if (xstart == graphSe.ymax && graphSe.xmin != graphSe.ymax) {
            this.myPath.position.x -= 1.8;
        }
        // code edit ends here for point drawing changes

        if (this.plumbLine) this.PlumbLine();
        //SWG-87
        // if(this.tempLableLine == undefined && this.elementlabel!='' && this.mode!='designer'){
        //     this.SetElementLabel(this.elementlabel);
        // }
        //SWG-87
        if ((this.labelLine || this.tempLableLine) && this.myPath.visible) this.LabelLine();

        if (graphSe.mode == "correct") this.SetCorrectPoints();
    }

    this.TrackAlong = function (lbl) {
        if (lbl != undefined) this.trackAlongLabel = lbl;

        var trackElement = graphSe.FindInGraph(this.trackAlongLabel);

        if (trackElement != null) {
            var t = trackElement;
            switch (t.constructor.name) {
                case "Line":
                    s = t.SwapPoints();
                    //this.ang = Math.atan2(this.yeg - this.ysg, this.xeg - this.xsg);
                    //this.trackAng = Math.atan2(s.yeg - s.ysg, s.xeg - s.xsg);
                    this.trackAng = Math.atan2(s.ye - s.ys, s.xe - s.xs);
                    this.Track = this.TrackLine;
                    break;
                case "Curve":
                case "Polyline":
                    if (lbl != undefined) {
                        this.trackOffset = 0;
                        this.trackXg = t.pts[0];
                        this.trackYg = t.pts[1];
                        this.Track = this.TrackPath;
                    }
                    break;
            }
        }
    }

    this.TrackLine = function (dist) {
        var ang = this.trackAng;
        var dx = Math.cos(ang) * dist;
        var dy = Math.sin(ang) * dist;

        return { sx: dx, sy: dy };
    }

    this.TrackPath = function (dist) {
        var pt;
        var te = graphSe.FindInGraph(this.trackAlongLabel);

        if (dist > 0 && this.trackOffset < .985) this.trackOffset += .015;
        else if (dist < 0 && this.trackOffset > .015) this.trackOffset -= .015;

        var path = te.myPath
        if (path == undefined) path = te.path;

        var pathOffset = this.trackOffset * path.length;

        pt = path.getPointAt(pathOffset);

        var txg = graphSe.ConvertXpxToXg(pt.x);
        var tyg = graphSe.ConvertYpxToYg(pt.y);

        var tdx = txg - this.trackXg;
        var tdy = tyg - this.trackYg;
        this.trackXg = txg;
        this.trackYg = tyg;

        return { sx: tdx, sy: tdy };
    }

    this.Track = this.TrackLine;

    this.SetupDesigner = function () {
        if (this.ghost) {
            var gh = this.ghost;
            this.xg = gh.xg;
            this.yg = gh.yg;
            this.sxg = gh.sxg;
            this.syg = gh.syg;
        }
    }

    this.SetupCorrect = function () {
        var me;

        if (this.correct.length > 0) {
            var ca = this.correct[0];
            if (ca.type == undefined || ca.type[1] != "area" && this.interactive) {
                this.xg = ca.xg;
                this.yg = ca.yg;
            } else if (!this.interactive && graphSe.mode == "designer") this.CorrectMe();
            else if (ca.type[1] == "relative") {
                var ro = graphSe.FindInGraph(ca.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    this.xg = me.xg;
                    this.yg = me.yg;
                }
            }
            this.SnapMe();
        }
    }

    this.SetupIncorrect = function (nn) {
        var me;
        if (!graphSe.incorrectActive[nn]) {
            if (this.correct[0] != null) {
                var ca = this.correct[0];
                this.IncorrectMe(ca, nn, ca.type);
            }
        }

        if (this.incorrect[nn] != null) {
            var ca = this.incorrect[nn];
            if (ca.type == undefined || ca.type[1] != "area" && this.interactive) {
                this.xg = ca.xg;
                this.yg = ca.yg;
            } else if (!this.interactive && graphSe.mode == "designer") this.IncorrectMe();
            else if (ca.type[1] == "relative") {
                var ro = graphSe.FindInGraph(ca.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    this.xg = me.xg;
                    this.yg = me.yg;
                }
            }
            this.SnapMe();
        }
    }

    this.SetupStudent = function () {
        if (this.ghost) {
            var gh = this.ghost;
            this.xg = gh.xg;
            this.yg = gh.yg;
            this.sxg = gh.sxg;
            this.syg = gh.syg;
        }
    }

    this.SnapMe = function () {
        this.sxg = graphSe.SnapX(this.xg);
        this.syg = graphSe.SnapY(this.yg);
    }

    this.PlumbLine = function () {
        this.PathMe();
        var ln = graphMe.length;
        for (var j = 0; j < ln; j++) {
            var gj = graphMe[j];
            if (gj == this) continue;

            if (gj instanceof Point) {
                if (this.HitMe(gj)) {
                    var xpx = graphSe.ConvertXgToXpx(gj.xg);
                    var ypx = graphSe.ConvertYgToYpx(gj.yg);

                    var clr = 'lightblue';
                    DrawLine(clr, this.width, xpx, ypx, 0, ypx, [4, 4]);
                    DrawLine(clr, this.width, xpx, ypx, xpx, can.height - 3, [4, 4]);
                }
            } else if (gj instanceof Line) {
                var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);

                if (gj.HitMe({ x: xepx, y: yepx })) {
                    var xpx = graphSe.ConvertXgToXpx(this.xg);
                    var ypx = graphSe.ConvertYgToYpx(this.yg);

                    var clr = 'grey';
                    DrawLine(clr, this.width, xpx, ypx, 0, ypx, [4, 4]);
                    DrawLine(clr, this.width, xpx, ypx, xpx, can.height - 3, [4, 4]);

                    var text = new paper.PointText(new paper.Point(15, yepx - 10));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertYpxToYg(yepx) * 10) / 10;

                    var text = new paper.PointText(new paper.Point(xepx + 14, 375));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertXpxToXg(xepx) * 10) / 10;

                }
            }
        }
    }

    this.HitMe = function (mpt) {
        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
        var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);

        var dx = xpx - mpt.x;
        var dy = ypx - mpt.y;

        return Math.sqrt(dx * dx + dy * dy) < graphSe.handleRadius;
    }

    //For Point
    this.MoveMe = function (typ, dx, dy, undoCount, Redo) {
        //Changes for SWG-81 (5-07-2017)  related to undo reset - By Akash
        if (graphSe.opsRedo != undefined && Redo == undefined) {
            var redoLength = graphSe.opsRedo.length;
            graphSe.opsRedo[redoLength - 1].xg = this.xg;
            graphSe.opsRedo[redoLength - 1].yg = this.yg;
        }
        if (Redo != undefined) {
            var lastCord = {};
            lastCord.x = this.xg;
            lastCord.y = this.yg;
            var pushLength = this.prevCords.length - 1;
            (this.prevCords).splice(pushLength, 0, lastCord);
            this.xg = Redo.xg;
            this.yg = Redo.yg;
        }
        else {
            if (undoCount == 0) {
                this.xg = this.MyFirstGhost.xg;
                this.yg = this.MyFirstGhost.yg;
                //Changes for SWG-81 Reset fails in second attempt.
                ////SWG - 203 Changes
                // this.MyFirstGhost = {};
                // this.prevCords = [];
                //SWG - 203 Changes
            }
            else {

                this.xg -= dx;
                this.yg -= dy;

                //Changes for SWG-81 (5-07-2017)  related to undo reset - By Akash
                if (this.taelement != "None") {
                    var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                    if (tracToElement != undefined && tracToElement.what == 'curve' && this.what == 'point') {
                        var removeIndex = this.prevCords.length - 2;
                        var lastCords = this.prevCords[removeIndex];
                        this.xg = lastCords.x;
                        this.yg = lastCords.y;
                        this.prevCords.splice(removeIndex, 1);
                    }
                }

            }
        }
        if (graphSe.mode == "designer" && this.interactive) {
            this.GhostMe();
            this.posMoved = true;
        }
        else {
            this.posMoved = false;
        }
        this.SnapMe();
    }

    this.ControlMe = function (tf) {

    }

    //For point
    this.DragMe = function (mpt, drgSt) {
        if (drgSt != undefined) this.dragState = drgSt;

        switch (this.dragState) {
            case "off":
                if (graphSe.boo && this.interactive && !this.ghost && graphSe.mode != "student") this.GhostMe();
                if ((this.MyFirstGhost.xg == undefined && this.MyFirstGhost.yg == undefined) || graphSe.mode != this.MyFirstGhost.mode) {
                    this.MyFirstGhost.xg = this.xg;
                    this.MyFirstGhost.yg = this.yg;
                    this.MyFirstGhost.mode = graphSe.mode;
                }
                dragObj = this;
                this.dragState = "drag";
                this.dragstart = mpt;
                this.dragDxDy = { dx: 0, dy: 0 };
                if (graphSe.mode == "student") this.studentdrag = true;
                //if(graphSe.mode=="correct")Precise(true);
                this.SetSettings();
                break;
            case "drag":
                var dsxg = graphSe.ConvertXpxToXg(mpt.x) - graphSe.ConvertXpxToXg(this.dragstart.x);
                var dsyg = graphSe.ConvertYpxToYg(mpt.y) - graphSe.ConvertYpxToYg(this.dragstart.y);
                var minX = null;
                var maxX = null;
                var minY = null;
                var maxY = null;

                //var trackValue = ((minX != maxX) && (minY != maxY)) ? dsxg : ((dsxg == 0) ? dsyg : dsxg);
                //var trackValue = (dsxg == 0) ? dsyg : dsxg;
                // console.log("trackvalue : " + trackValue);
                if (this.taelement != "None") {
                    this.TrackAlong();
                    var s = this.Track(dsxg);
                    var s1 = this.Track(dsyg);
                    dsxg = s.sx;
                    dsyg = s.sy;
                    // changes to track point against line and curve - By Akash
                    var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                    if (tracToElement != undefined) {

                        if (tracToElement.what != 'curve' && tracToElement.what != 'line') {
                            this.xg += dsxg;
                            this.yg += dsyg;
                        }
                        if (tracToElement.what == 'line') {
                            minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                            maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                            minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                            maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                            if ((minX == maxX) || (minY == maxY)) {
                                if (minX == maxX) {
                                    dsyg = s1.sy;
                                    this.yg += dsyg;
                                    dsxg = 0;

                                }
                                else {
                                    this.xg += dsxg;
                                    dsyg = 0;
                                }
                                // var dX = (mpt.x - this.myPath.position.x);
                                // var dY = (mpt.y - this.myPath.position.y);
                                // this.myPath.position.x += dX;
                                // this.myPath.position.y += dY;
                                // this.xg = graphSe.ConvertXpxToXg(this.myPath.position.x);
                                // this.yg = graphSe.ConvertYpxToYg(this.myPath.position.y);
                            }
                            else {
                                //Chage for SWG-81(12-07-2017) - By Akash
                                var multiplayer = parseFloat(tracToElement.m) < 0 ? -1 : 1;
                                dsxg = s1.sx * multiplayer;
                                dsyg = s1.sy * multiplayer;
                                if ((parseFloat(tracToElement.m) >= -0.70 && parseFloat(tracToElement.m) < 0) || (parseFloat(tracToElement.m) <= 0.70 && parseFloat(tracToElement.m) > 0)) {
                                    multiplayer = 1;
                                    dsxg = s.sx * multiplayer;
                                    dsyg = s.sy * multiplayer;
                                    this.xg += dsxg;
                                    this.yg += dsyg;
                                }
                                else {
                                    this.xg += dsxg;
                                    this.yg += dsyg;
                                }
                                //End chage for SWG-81(12-07-2017)
                            }

                            if ((this.xg > maxX)) {
                                this.xg = maxX;
                                //this.yg = tracToElement.yeg;
                            }

                            if ((this.xg < minX)) {
                                this.xg = minX;
                                //this.yg = tracToElement.ysg;
                            }
                            if ((this.yg > maxY)) {
                                this.yg = maxY;
                                //this.yg = tracToElement.yeg;
                            }

                            if ((this.yg < minY)) {
                                this.yg = minY;
                                //this.yg = tracToElement.ysg;
                            }

                        }
                        else if (tracToElement.what == 'curve') {
                            var dX = dsxg = (mpt.x - this.myPath.position.x);
                            var dY = dsyg = (mpt.y - this.myPath.position.y);
                            this.myPath.position.x += dX;
                            this.myPath.position.y += dY;
                            var nearestPoint = tracToElement.myPath.getNearestPoint(this.myPath.position.x, this.myPath.position.y);
                            this.xg = graphSe.ConvertXpxToXg(nearestPoint.x);
                            this.yg = graphSe.ConvertYpxToYg(nearestPoint.y);
                        }
                    }
                }
                else {
                    this.xg += dsxg;
                    this.yg += dsyg;
                }
                if (this.mode == 'student') {//SWG_426 changes
                    this.xg = this.xg < graphSe.xmin ? graphSe.xmin : (this.xg > graphSe.xmax ? graphSe.xmax : this.xg);//SWG_426 changes
                    this.yg = this.yg < graphSe.ymin ? graphSe.ymin : (this.yg > graphSe.ymax ? graphSe.ymax : this.yg);//SWG_426 changes
                }
                //this.myPath.smooth();
                // changes to track point against line and curve end
                this.SnapMe();
                this.SetElementPoints();
                //SWG-128 changes
                if (graphSe.mode == 'student') {
                    this.upadeteStudLabelPossitiopn();
                }
                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx -= dsxg, dy: this.dragDxDy.dy -= dsyg };
                this.SetSettings();
                break;
            case "drop":
                dragObj = null;
                var prev = {};
                prev.x = this.xg;
                prev.y = this.yg;
                this.prevCords.push(prev);
                //Added to shift object again when come back from correct tab to designe and move the object - By Akash
                if (graphSe.mode == "designer" && this.interactive) {
                    this.posMoved = true;
                }
                else {
                    this.posMoved = false;
                }

                this.dragState = "off"
                if (this.dragDxDy.dx != 0 || this.dragDxDy.dy != 0) {
                    graphSe.OpsMoveElement(this, "all", -this.dragDxDy.dx, -this.dragDxDy.dy);
                    if (graphSe.mode == "correct" || graphSe.mode.substring(0, 9) == "incorrect")
                        this.PreciseMe(true);
                    if (graphSe.mode.substring(0, 9) == "incorrect") this.IncorrectMe();
                    if (graphSe.mode == "correct") this.CorrectMe();
                    //if( graphSe.mode == "student" )
                    //    { if( !this.CheckIsCorrect( ) ) this.CheckIsIncorrect( ); }
                    //if( graphSe.mode == "student" ) this.CheckIsCorrect( );
                    if (graphSe.mode == "designer" && this.interactive) {
                        this.GhostMe();
                        this.UpdateIncorrects()
                    }
                    if (graphSe.mode == "designer" && this.interactive && this.correct[0] != null)
                        this.CorrectMe(this.correct[0].type);
                }
                this.SetSettings();

                break;
        }
    }
    //SWG-128 changes
    this.upadeteStudLabelPossitiopn = function () {
        var selectObje = $('#' + this.studentlabelid);
        if (selectObje) {
            if ($(selectObje).children().attr('data-uniqueid') == this.uniqueLabel) {
                var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);
                var left = xpx + 37 + 'px';
                var top = ypx + 179 + 'px';

                ///SWG-221 Changes
                if (graphSe.titleshow && graphSe.title != "") top = ypx + 164 + 'px';
                else top = ypx + 112 + 'px';
                ////SWG-221 Changes end

                $('#' + this.studentlabelid).css('left', left);
                $('#' + this.studentlabelid).css('top', top);
            }
        }
    }
    //For Point
    this.CorrectMe = function (type) {
        var aa = type != undefined ? type[1] == "area" : false;
        //changes to shift object again when come back from correct tab to designe and move the object - By Akash
        if ((type != undefined) && (type[1] == 'left' || type[1] == 'right' || type[1] == 'up' || type[1] == 'down') && this.posMoved && graphSe.mode == "correct") {
            var shifValue = (type[1] == 'left' || type[1] == 'down') ? -2 : 2;
            var xincrement = 1;
            if (document.getElementById('xinc') != null) xincrement = document.getElementById('xinc').value;
            var yincrement = 1;
            if (document.getElementById('yinc') != null) yincrement = document.getElementById('yinc').value;

            //Changes for SWG-60 by Akash (added if else condition)
            if (this.taelement != "None") {
                var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                if (tracToElement.what == 'curve' || tracToElement.what == 'line') {
                    if (tracToElement.what == 'curve') {
                        var dX = this.xg + (addValue * parseInt(xincrement));
                        var dY = this.yg + (addValue * parseInt(yincrement));
                        dX = graphSe.ConvertXgToXpx(dX);
                        dY = graphSe.ConvertYgToYpx(dY);
                        var nearestPoint = tracToElement.myPath.getNearestPoint(dX, dY);
                        this.xg = graphSe.ConvertXpxToXg(nearestPoint.x);
                        this.yg = graphSe.ConvertYpxToYg(nearestPoint.y);
                        this.sxg = graphSe.SnapX(this.xg);
                        this.syg = graphSe.SnapY(this.yg);
                    }
                    else {
                        var minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                        var maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                        var minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                        var maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                        if (this.orignalPosition == undefined) {
                            this.orignalPosition = this.myPath.position;
                        }
                        if (minX == maxX) {
                            this.yg = this.yg + (shifValue * yincrement);
                        }
                        else if (minY == maxY) {
                            this.xg = this.xg + (shifValue * xincrement);
                        }
                        else {
                            this.TrackAlong();
                            var s = this.Track(shifValue);
                            var dsxg = s.sx;
                            var dsyg = s.sy;
                            this.xg = this.xg + dsxg;
                            this.yg = this.yg + dsyg;
                        }
                        this.sxg = graphSe.SnapX(this.xg);
                        this.syg = graphSe.SnapY(this.yg);
                    }
                }
                else {
                    if (type[1] == 'left' || type[1] == 'right') {
                        this.xg = this.ghost.xg + (shifValue * xincrement);
                        this.sxg = this.ghost.sxg + (shifValue * xincrement);
                    }
                    if (type[1] == 'up' || type[1] == 'down') {
                        this.yg = this.ghost.yg + (shifValue * xincrement);
                        this.syg = this.ghost.syg + (shifValue * xincrement);
                    }
                }
            }
            else {
                if (type[1] == 'left' || type[1] == 'right') {
                    this.xg = this.ghost.xg + (shifValue * xincrement);
                    this.sxg = this.ghost.sxg + (shifValue * xincrement);
                }
                if (type[1] == 'up' || type[1] == 'down') {
                    this.yg = this.ghost.yg + (shifValue * xincrement);
                    this.syg = this.ghost.syg + (shifValue * xincrement);
                }
            }
            this.posMoved = false;
            this.originalCoordinates = { sxg: this.ghost.sxg, xg: this.ghost.xg, syg: this.ghost.syg, yg: this.ghost.yg };
            this.leftCoordinatesUpdated = type[1] == 'left' ? true : undefined;
            this.rightCoordinatesUpdated = type[1] == 'right' ? true : undefined;
            this.upCoordinatesUpdated = type[1] == 'up' ? true : undefined;
            this.downCoordinatesUpdated = type[1] == 'down' ? true : undefined;
        }
        if (type == undefined)
            this.posMoved = false;
        //changes to shift object again when come back from correct tab to designe and move the object end
        if (this.relementlabel != "Accepted Area") {
            this.correct[0] = {
                type: type == undefined ? "precise" : type,
                lbl: aa ? this.correct[0].lbl : this.label,
                uniqueLabel: aa ? this.correct[0].uniqueLabel : this.uniqueLabel, ////SWG-357 Changes
                xg: this.xg,
                yg: this.yg,
                sxg: this.sxg,
                syg: this.syg,
                match: false
            };
        }

    }

    this.IncorrectMe = function (ca, nn, type) {
        var n = nn == undefined ? Number(graphSe.mode[9]) : nn;
        var ca = ca == undefined ? this : ca;
        var lbl = ca == this ? ca.label : ca.lbl;
        var uniqueLabel = ca.uniqueLabel; //SWG-64 changes
        this.incorrect[n] = {
            nn: n,
            type: type == undefined ? "precise" : type,
            lbl: lbl,
            uniqueLabel: uniqueLabel,
            xg: ca.xg,
            yg: ca.yg,
            sxg: ca.sxg,
            syg: ca.syg,
            match: false
        };
    }

    this.UpdateIncorrects = function () {
        for (var i = 1; i < 4; i++) {
            if (this.incorrect[i] != null) {
                if (this.incorrect[i].type[0] == "relative") this.IncorrectMe(undefined, i, this.incorrect[i].type);
            }
        }
    }
    //for Point
    this.CheckIsCorrect = function (mode, answer) {
        var tst;
        var labelcorrect = true;
        var correct, nn;

        if (answer == undefined) correct = this.correct[0]
        else {
            correct = answer;
            nn = correct.nn
        }

        if (correct != undefined && mode == undefined) {
            var typ = correct.type;
            var area = (typ != undefined) && (typ.length == 3);
            if (typ == "precise" || typ == undefined || area) {
                var ca = correct;
                var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);
                switch (ca.lbl[0]) {
                    case 'P':
                        var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxg : ca.xg);
                        var cpy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syg : ca.yg);
                        var dxs = xpx - cpx;
                        var dys = ypx - cpy;

                        tst = Math.sqrt(dxs * dxs + dys * dys) < this.correctTolerance;

                        //tst = !tst ? this.FindMatch( ) : tst;
                        break;
                    case 'A':
                        var aao = graphSe.FindInGraph(ca.lbl);
                        aao.PathMe();
                        tst = aao.path.contains(new paper.Point(xpx, ypx));
                }
            } else if (typ.length == 2) {
                var ca = this;
                var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxg : ca.xg);
                var cpy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syg : ca.yg);

                rele = graphSe.FindInGraph(nn == undefined ? this.relementlabel : this.relementlabelinc[nn]);
                if (rele instanceof Point) {
                    if (rele == this) rele = correct;

                    //var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxg : rele.xg);
                    //Changes for SWG81 - Submiting answer without moving point give correct answer
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.ghost.sxg : this.ghost.xg);
                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);

                    //Changes for SWG81 - Submiting answer without moving point give correct answer
                    var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                    if (tracToElement != undefined) {
                        if (tracToElement.what == 'line') {
                            minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                            maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                            minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                            maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                            if (minX == maxX) {
                                xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.ghost.syg : this.ghost.yg);
                                cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.syg : this.yg);
                            }
                        }
                    }

                    var lfrt = typ[1];
                    if (lfrt == "left" && cpx < xpx) tst = true;
                    else if (lfrt == "right" && cpx > xpx) tst = true;
                    else tst = false;
                } else if (rele instanceof Line) {
                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxsg : rele.xsg);
                    var cpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxeg : rele.xeg);
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                    var lfrt = typ[1];
                    if (lfrt == "left" || lfrt == "right") {

                        if (lfrt == "left" && cpx > xpx && cpxe > xpx) tst = true;
                        else if (lfrt == "right" && cpx < xpx && cpxe < xpx) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        var ypx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sysg : rele.ysg);
                        var ypxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.syeg : rele.yeg);

                        var isInside = (cpx < xpxe && cpy < ypx) || (cpx < xpx && cpy < ypxe)

                        if (lfrt == "inward" && isInside) tst = true;
                        else if (lfrt == "outward" && !isInside) tst = true;
                        else tst = false;
                    }
                } else if (rele instanceof Curve) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[0] : rele.pts[0]);
                    var xpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[4] : rele.pts[4]);
                    if (xpxe < xpx) {
                        var t = xpx;
                        xpx = xpxe;
                        xpxe = t;
                    }

                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                    var cpy = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.syg : this.yg);

                    var lfrt = typ[1]
                    if (lfrt == "left" || lfrt == "right") {
                        if (lfrt == "left" && cpx < xpx && cpx < xpxe) tst = true;
                        else if (lfrt == "right" && cpx > xpx && cpx > xpxe) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        var ypx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[1] : rele.pts[1]);
                        var ypxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[5] : rele.pts[5]);

                        var isInside = (cpx < xpxe && cpy < ypx) || (cpx < xpx && cpy < ypxe)

                        if (lfrt == "inward" && isInside) tst = true;
                        else if (lfrt == "outward" && !isInside) tst = true;
                        else tst = false;
                    }
                } else if (rele instanceof Polyline) {
                    for (var i = 0, ln = rele.pts.length - 2, xmn = 10000, xmx = 0; i < ln; i += 2) {
                        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[i] : rele.pts[i]);
                        if (xpx < xmn) xmn = xpx;
                        else if (xpx > xmx) xmx = xpx;
                    }

                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);

                    var lfrt = typ[1];
                    if (lfrt == "left" && cpx < xmn) tst = true;
                    else if (lfrt == "right" && cpx > xmx) tst = true;
                    else tst = false;
                }
            }
        } else if (mode == "drawing" || mode == undefined) {
            for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
                var gi = graphMe[i];
                if (gi instanceof Point) {
                    var giCorrect = gi.mode == "correct";
                    var giIncorrect = gi.mode.indexOf("incorrect") != -1;

                    if ((giCorrect || giIncorrect) && gi.what == this.what) {
                        if (answer != undefined) correct = answer;
                        else if (giCorrect) correct = gi.correct[0];
                        else if (giIncorrect) {
                            nn = Number(gi.mode[9]);
                            correct = gi.incorrect[nn];
                        }

                        var ca = correct;
                        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                        var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);
                        var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxg : ca.xg);
                        var cpy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syg : ca.yg);
                        var dxs = xpx - cpx;
                        var dys = ypx - cpy;
                        tst = Math.sqrt(dxs * dxs + dys * dys) < this.correctTolerance;

                        //ca.match = tst;

                        if (tst) correct.match = { match: tst };
                    }
                }
            }
        }

        var correctgraph = tst;
        //SWG-64 changes
        if (!this._correctObj)
            this._correctObj = {};
        if (correctgraph) {
            this._correctObj.objCorrect = true;
        }
        //SWG-64 changes end
        if (this.mode != "student") var cc = this;
        //SWG-64 changes
        //else var cc = graphSe.FindInGraph(ca.lbl);
        else var cc = graphSe.FindInGraph(ca.uniqueLabel != undefined ? ca.uniqueLabel : ca.lbl);

        var requiredlabel = nn == undefined ? cc.requiredlabel : cc.requiredlabelinc[nn];
        if (requiredlabel) {
            var correctlabel = nn == undefined ? cc.correctlabel : (cc.correctlabelinc[nn] == "b" ? "None" : cc.correctlabelinc[nn]);
            labelcorrect = correctlabel == (this.studentcorrectlabel == "a" ? "None" : this.studentcorrectlabel);
            //SWG-64 changes - Akash
            if ((this.studentcorrectlabel == undefined || this.studentcorrectlabel == "a") && correctgraph && !labelcorrect) {
                this._correctObj.isLabelMissed = true;
            }
            //SWG-64 changes end
        }

        var allCorrect = correctgraph && labelcorrect;

        if (answer == undefined && correct != undefined) correct.match = allCorrect;

        return allCorrect;
    }

    this.FindMatch = function () {
        var correct;
        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Point) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;
                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                    var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);
                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxg : ca.xg);
                    var cpy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syg : ca.yg);
                    var dxs = xpx - cpx;
                    var dys = ypx - cpy;
                    tst = Math.sqrt(dxs * dxs + dys * dys) < this.correctTolerance;

                    ca.match = tst;
                }
            }
        }

        return tst;
    }

    this.FindMatchObject = function () {
        var correct;
        var finalobject = null;

        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Point) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;
                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
                    var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);
                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxg : ca.xg);
                    var cpy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syg : ca.yg);
                    var dxs = xpx - cpx;
                    var dys = ypx - cpy;
                    tst = Math.sqrt(dxs * dxs + dys * dys) < this.correctTolerance;

                    if (tst) finalobject = gi;
                }
            }
        }

        return finalobject;
    }


    this.CheckIsIncorrect = function (mode) {
        var ninc = this.incorrect.length;

        for (var j = 0; j < graphMe.length; j++) {
            gj = graphMe[j];
            for (var i = 1, cc = 0; i < ninc; i++) {
                if (gj.incorrect[i] != null) {
                    if (this.CheckIsCorrect(mode, gj.incorrect[i])) {
                        gj.incorrect[i].match = true;
                        cc++
                    } else gj.incorrect[i].match = false;
                }
            }
        }

        if (cc == 0) this.incorrect[0] = { match: true };
    }

    this.Subtract = function (v) {
        return new paper.Point(this.x - v.x, this.y - v.y)
    }

    this.LabelMe = function (tf) {
        this.labelLine = tf;
    }

    this.labelangle = 20.4;
    this.labelradius = 20;

    this.LabelLine = function () {
        pt = graphSe.snapIt ? { x: this.sxg, y: this.syg } : { x: this.xg, y: this.yg };

        var xoffset = 0;
        var yoffset = 20;

        pt.x = graphSe.ConvertXgToXpx(pt.x) //+xoffset;
        pt.y = graphSe.ConvertYgToYpx(pt.y) //+yoffset;

        var newx = pt.x + this.labelradius * Math.cos(this.labelangle); //+ d * (pt.x - spt.x) / mag
        var newy = pt.y + this.labelradius * Math.sin(this.labelangle); //+ d * (pt.y - spt.y) / mag


        var clr = this.iscurrent == true ? this.cc : this.ccus;

        //console.log(clr);
        /*ctx2.fillStyle = clr;
        ctx2.font="14px sans-serif";
        ctx2.fillText(this.label,pt.x,pt.y);
        ctx2.font="10px sans-serif";*/

        if (graphSe.mode == "correct" && this.dragstart != undefined) {
            templabel = this.labelam;
        } else if (graphSe.boo && this.ghost && this.mode != "correct" && this.mode != "student" && this.evalshift != null && this.precise == false) {
            templabel = this.labelam;
        } else {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "designer") {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "student" && this.studentdrag != null) {
            templabel = this.labelam;
        }
        //SWG-87
        if (graphMe.length > 0 && graphSe.mode != 'designer' && this.tempLableLine && !this.labelLine && this.elementlabel != 'None') {
            templabel = graphSe.mode == "student" ? "" : this.elementlabel;
        }
        if (graphSe.mode == 'designer' && this.tempLableLine && !this.labelLine) {
            templabel = '';
        }
        //end SWG-87
        //SWG-275
        if (graphSe.mode == "student" && (this.studentcorrectlabel != null && this.studentcorrectlabel != "a" && this.studentcorrectlabel != "")) {
            templabel = "";
        }
        ////SWG-140 Changes
        var ObjPtPosition = this.LabelPosition(newx, newy);
        var text = new paper.PointText(new paper.Point(ObjPtPosition.x, ObjPtPosition.y));
        text.justification = ObjPtPosition.alignment;
        ////SWG-140 Changes
        text.fillColor = clr;
        if (this.myPath.visible)
            text.content = templabel;

    }

    ////SWG - 140 Changes Start
    this.LabelPosition = function (newxVal, newyVal) {

        // var xIncVal, yIncVal;
        // if (document.getElementById('xinc') != undefined) xIncVal = document.getElementById('xinc').value;
        // if (document.getElementById('yinc') != undefined) yIncVal = document.getElementById('yinc').value;

        // var xMin = $('#xmin').val();
        var yMin = $('#ymin').val();
        // var xMax = $('#xmax').val();
        // var yMax = $('#ymax').val();

        // var xAxisMinVal = 1 * parseFloat(xIncVal) + parseFloat(xMin);
        // var xAxisMaxVal = 15 * parseFloat(xIncVal) + parseFloat(xMin);
        // var yAxisMinVal = 1 * parseFloat(yIncVal) + parseFloat(yMin);
        // var yAxisMaxVal = 15 * parseFloat(yIncVal) + parseFloat(yMin);

        var endPt = graphSe.snapIt ? { x: this.sxg, y: this.syg } : { x: this.xg, y: this.yg };

        var ObjLabelStyle = { x: 0, y: 0, alignment: '' };

        //    var xMultipy = graphSe.ConvertXpxToXg(newxVal) < 0 ? -1 : 1
        //    var yMultipy = graphSe.ConvertYpxToYg(newyVal) < 0 ? -1 : 1

        switch (true) {
            case endPt.y <= yMin:
                ObjLabelStyle.x = newxVal + 12;
                ObjLabelStyle.y = newyVal - 30;
                ObjLabelStyle.alignment = 'right';
                break;
            //    case endPt.x == xMin && endPt.y == yMin:
            //        ObjLabelStyle.x = newxVal + 24;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y > yMin:
            //        ObjLabelStyle.x = newxVal + (10 * xMultipy);
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xAxisMinVal && endPt.y >= yAxisMinVal:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x >= xAxisMaxVal && endPt.y >= yAxisMinVal:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y >= yMax && endPt.x > xAxisMinVal:
            //        ObjLabelStyle.x = newxVal + 20;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y == yMin && endPt.x == xMax:
            //        ObjLabelStyle.x = newxVal - 60;
            //        ObjLabelStyle.y = newyVal - 36;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            default: ObjLabelStyle.x = newxVal;
                ObjLabelStyle.y = newyVal;
                ObjLabelStyle.alignment = 'center';
                break;
        }
        return ObjLabelStyle;

    }
    ////SWG - 140 Changes End

    this.Magnitude = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    this.PathMe = function () {
        this.path = this.myPath;
    }

    this.GhostMe = function () {
        this.SnapMe();
        this.ghost = { clr: "#D0D0D0", rd: this.radius, xg: this.xg, yg: this.yg, sxg: this.sxg, syg: this.syg }

    }

    this.PlumbMe = function (tf) {
        this.plumbLine = tf;
    }
    this.RequiredLabelMe = function (tf) {

        if (graphSe.mode == 'correct') {
            this.requiredlabel = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.requiredlabelinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.requiredlabelinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.requiredlabelinc[3] = tf;
        }

        if (tf) {
            $('#requiredlabelinputs').removeClass("hide");
            $('#requiredlabeltools').removeClass("hide");
        } else {
            $('#requiredlabelinputs').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
        }
    }

    this.checkBoxes = function () {
        if (graphSe.mode == 'correct') {
            var cbtemp = graphSe.pointCustomLabelValuesChkStatus;
        } else if (graphSe.mode == 'incorrect1') {
            var cbtemp = this.checkboxesinc1;
        } else if (graphSe.mode == 'incorrect2') {
            var cbtemp = this.checkboxesinc2;
        } else if (graphSe.mode == 'incorrect3') {
            var cbtemp = this.checkboxesinc3;
        } else {
            var cbtemp = graphSe.pointCustomLabelValuesChkStatus;
        }

        if (graphSe.mode == 'correct') {
            var cltemp = graphSe.pointCustomLabelValues;
        } else if (graphSe.mode == 'incorrect1') {
            var cltemp = this.customlabelsinc1;
        } else if (graphSe.mode == 'incorrect2') {
            var cltemp = this.customlabelsinc2;
        } else if (graphSe.mode == 'incorrect3') {
            var cltemp = this.customlabelsinc3;
        } else {
            var cltemp = graphSe.pointCustomLabelValues;
        }

        if (document.getElementById('equilibrium').checked) { cbtemp[0] = true } else { cbtemp[0] = false };

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str).checked) { cbtemp[1 + i + 1] = true } else { cbtemp[1 + i + 1] = false };

            //html += '<input type="checkbox" id="'+str+'" checked> '+this.customlabels[i]+'<br>'
            //this.checkboxes[i+9] = false;
        }


        this.CorrectLabelDropdown();

        //this.SetSettings();

    }

    this.checkBoxHTML = function () {
        var html = '';
        var cbtemp = graphSe.pointCustomLabelValuesChkStatus;
        // if (graphSe.mode == 'correct') {
        //     var cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var cbtemp = this.checkboxes;
        // } else {
        //     var cbtemp = this.checkboxes;
        // }

        var cltemp = graphSe.pointCustomLabelValues;
        // if (graphSe.mode == 'correct') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var cltemp = this.customlabels;
        // } else {
        //     var cltemp = this.customlabels;
        // }

        //console.log(cbtemp);


        if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
            disabled = " disabled";
        } else {
            disabled = "";
        }

        if (cbtemp[0]) {
            html += '<input type="checkbox" id="equilibrium" checked' + disabled + '> Equilibrium<br>'
        } else {
            html += '<input type="checkbox" id="equilibrium"' + disabled + '> Equilibrium<br>'
        }

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (cbtemp[i + 2] == undefined) cbtemp[i + 2] = true;

            if (cbtemp[i + 2]) {
                html += '<input type="checkbox" id="' + str + '" checked' + disabled + '> ' + cltemp[i].split("xexse")[0] + '<br>'
            } else {
                html += '<input type="checkbox" id="' + str + '"' + disabled + '> ' + cltemp[i].split("xexse")[0] + '<br>'
            }

            //this.checkboxes[i+9] = false;
        }

        this.checkboxhtml = html;
        // if (graphSe.mode == 'correct') {
        //     this.checkboxhtml = html;
        //     //document.getElementById('checkform').innerHTML = this.checkboxhtml;
        // } else if (graphSe.mode == 'incorrect1') {
        //     this.checkboxhtml = html;
        //     //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[1];
        // } else if (graphSe.mode == 'incorrect2') {
        //     this.checkboxhtml = html;
        //     //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[2];
        // } else if (graphSe.mode == 'incorrect3') {
        //     this.checkboxhtml = html;
        //     //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[3];
        // }


        //document.getElementById('checkform').innerHTML = this.checkboxhtml;
    }

    this.addLabel = function () {
        var cltemp = graphSe.pointCustomLabelValues;
        // if (graphSe.mode == 'correct') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var cltemp = this.customlabels;
        // }

        if (document.getElementById('newlabel').value == "") {
            tempol = "Custom Label"
        } else {
            tempol = document.getElementById('newlabel').value;
        }

        cltemp.push(tempol);

        //cltemp.push(tempol)

        var str = tempol;
        var lwr = str.toLowerCase();
        str = lwr.replace(/\s+/g, '');

        this.checkBoxHTML();

        var temphtml = this.checkboxhtml;
        var lotemp = this.clabeloffset;

        // if (graphSe.mode == 'correct') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // }

        document.getElementById('checkform').innerHTML = temphtml;

        this.CorrectLabelDropdown();

        var fstr = document.getElementById("cltext2").style.paddingTop;
        var fstr2 = fstr.split("px");
        fstr = fstr2[0];
        fstr = Number(fstr) + 20;
        document.getElementById("cltext2").style.paddingTop = fstr + "px";

        if (graphSe.mode == 'correct') {
            this.clabeloffset = fstr + "px";
        } else if (graphSe.mode == 'incorrect1') {
            this.clabeloffsetinc[1] = fstr + "px";
        } else if (graphSe.mode == 'incorrect2') {
            this.clabeloffsetinc[2] = fstr + "px";
        } else if (graphSe.mode == 'incorrect3') {
            this.clabeloffsetinc[3] = fstr + "px";
        }


    }

    this.CorrectLabelDropdown = function () {
        if (graphSe.mode == 'correct') {
            var cltemp = graphSe.pointCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var cltemp = graphSe.pointCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var cltemp = graphSe.pointCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var cltemp = graphSe.pointCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[3];
        } else {
            var cltemp = graphSe.pointCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        }


        var html = '<option value="None">None</option>'

        if (document.getElementById('equilibrium').checked) { html += '<option value="Equilibrium">Equilibrium</option>' } else { };

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str)) {
                if (document.getElementById(str).checked) { html += '<option value="' + cltemp[i] + '">' + cltemp[i].split("xexse")[0] + '</option>' } else { }
            }
            //this.checkboxes[i+9] = false;
        }

        this.clselects = html;
        // if (graphSe.mode == 'correct') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect1') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect2') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect3') {
        //     this.clselects = html;
        // }


        clselectstemp = html;

        document.getElementById("cldropdown").innerHTML = clselectstemp;
        document.getElementById('cldropdown').value = tmpclabel;
        document.getElementById('inccldropdown').value = tmpincclabel;

    }

    this.returnPoint = function (point) {
        if (point == "xpoint" || point == "xpointd") return graphSe.snapIt ? this.sxg : this.xg;
        if (point == "ypoint" || point == "ypointd") return graphSe.snapIt ? this.syg : this.yg;
    }

    this.returnStep = function (id) {
        if (id == "x") return graphSe.snapIt ? graphSe.xmax / 32 : graphSe.xmax / Number(graphSe.wdPx);
        if (id == "y") return graphSe.snapIt ? graphSe.ymax / 32 : graphSe.ymax / Number(graphSe.htPx);
    }
    //Point settings
    this.SetSettings = function () {
        //this.SetMaxes();

        this.TrackAgainstDropdown();
        this.RelativeDropdown();
        this.checkBoxHTML();

        $('#bottomtools').removeClass("hide");

        var html = '<div class="sectionhead"><span id="elementhead">Element Settings </span><button id="bgleft" class="glyphicon glyphicon-left" aria-hidden="true" style="margin-left: 30px; background: none; border: none;" onclick="leftArrow();"></button><span id="toplabel' + this.labelvalueedit + '" class="elementid">' + this.labeledit + '</span><button id="bgright"  class="glyphicon glyphicon-right" aria-hidden="true" onclick="rightArrow();" style="background: none; border: none;"></span></div>'
        html += '<div class="hrm"></div>'
        html += '<div class="row" style="margin-left: 20px;">'
        html += '<div class="col-xs-6">'
        html += '<div id="designertools">'
        html += '<div class="tool">Element Type</div>'
        html += '<div class="tool"></div>'
        html += '<div class="tool">Label</div>'
        html += '<div class="tool">Show Label</div>'
        html += '<div class="tool">Coordinates</div>'
        html += '<div class="tool">Show Plumbs</div>'
        html += '</div>'
        html += '</div>'
        html += '<div class="col-xs-6" style="padding-top: 8px;">'
        html += '<div id="designerinputs">'
        html += '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Equilibrium">Equilibrium</option></select></div>'
        html += '<button id="bcbutton" aria-hidden="true" onclick="bookColor();">Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span></button>'
        html += '<div><input id="xlabel' + this.labelvalueedit + '" type="text" class="small-label" placeholder="' + this.labeledit + '" onkeyup="labelUpdate(this.value)" maxlength="8"></div>'
        html += '<div><label class="switch tool" style="margin-left: 0px;left:-60px"><input id="labeltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label><button id="movelabelbutton" class="btn btn-econ-sw5" onclick="moveLabelC()" onmousedown="moveLabel()" onmouseup="moveLabelClear()" onmouseout="moveLabelClear()"><span class="glyphicon glyphicon-labelright" aria-hidden="true"></span></button><button id="movelabelbutton2" class="btn btn-econ-sw5" onclick="moveLabelRIC()" onmousedown="moveLabelRadiusIn()" onmouseup="moveLabelRIClear()" onmouseout="moveLabelRIClear()"><span class="glyphicon glyphicon-labelin" aria-hidden="true"></span></button><button id="movelabelbutton3" class="btn btn-econ-sw5" onclick="moveLabelROC()" onmousedown="moveLabelRadiusOut()" onmouseup="moveLabelROClear()" onmouseout="moveLabelROClear()"><span class="glyphicon glyphicon-labelout" aria-hidden="true"></span></button><button id="movelabelbutton4" class="btn btn-econ-sw5" onclick="moveLabelOtherC()" onmousedown="moveLabelOther()" onmouseup="moveLabelClearOther()" onmouseout="moveLabelClearOther()"><span class="glyphicon glyphicon-labelleft" aria-hidden="true"></span></button> </div>'
        html += '<div>(<input id="xpoint" type="number" class="point-input" value="' + this.returnPoint("xpoint") + '" step="' + this.returnStep("x") + '" oninput="xUpdate(this.value)" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">,<input id="ypoint" type="number" class="point-input" value="' + this.returnPoint("ypoint") + '" oninput="yUpdate(this.value)" step="' + this.returnStep("y") + '" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">)</div>'
        html += '<div><label class="switch tool"><input id="plumbtoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'

        $('#interactive').removeClass("hide");

        var html2 = '<div id="sectionpadding" class="sectionhead"></div>'
        html2 += '<div class="row" style="margin-left: 20px;">'
        html2 += '<div id="intleft" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="binteractive" onclick="Interactive(true);"> <div class="radio-off"><div id="binteractivero" class="radio-on hide"></div></div>Interactive</button><br>'
        html2 += '<div id="ilabels" class="hide"><div class="tool">Label after move</div>'
        html2 += '<div class="tool">Track against</div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="intright" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="bstatic" onclick="Interactive(false);"> <div class="radio-off"><div id="bstaticro" class="radio-on"></div></div>Static<br></button>'
        html2 += '<div id="iinputs" class="hide"><div><input id="labelam" type="text" value="' + this.labelam + '" oninput="labelAMUpdate(this.value)" style="margin-top: 10px; width: 75px"></div>'
        html2 += '<div class="styled-select"><select id="tadropdown" class="select-class" onchange="TAElement(this.value)" value="' + this.taelement + '" style="margin-top:10px">' + this.taselects + '</select></div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="elabel" class="row hide">'
        html2 += '<div class="col-xs-6">'
        html2 += '<div class="tool"><strong>Evaluated on</strong></div>'
        html2 += '</div>'
        html2 += '<div class="col-xs-6">'
        html2 += '<div id="elabelmode" class="" style="margin-top: 11px;">Interaction</div>'
        html2 += '</div>'
        html2 += '</div>'

        var html3 = '<div class="row" style="margin-left: 20px;">'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="bprecise" onclick="Precise(true);"> <div class="radio-off"><div id="bprecisero" class="radio-on hide"></div></div>Precise</button><br>'
        html3 += '<div id="precisetools" class="hide">'
        html3 += '<div class="tool">Coordinates</div>'
        html3 += '</div>'
        html3 += '<div id="relativetools" class="hide">'
        html3 += '<div class="tool">Relative to:</div>'
        html3 += '<div id="relativetools2" class="hide">'
        html3 += '<div class="tool">Shift from origin</div>'
        html3 += '</div>'
        html3 += '<div id="drawarea" class="hide" style="width: 200px; margin-top: 10px; margin-left: 10px; position:relative; top: 10px;"><button type="button" class="btn btn-econ-sw5" onclick="DoAcceptedArea(gmloc-1)"><span class="glyphicon glyphicon-pentagon" aria-hidden="true"></span><img id="areashade" src="./images/areashade.png"></img></button><span style="padding-left: 5px;">Draw Accepted Area</span></div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="brelative" onclick="Precise(false);"> <div class="radio-off"><div id="brelativero" class="radio-on"></div></div>Relative<br></button>'
        html3 += '<div id="preciseinputs" class="hide" style="position:relative; top: 10px">'
        html3 += '<div>(<input id="xpointd" type="number" class="point-input" value="' + this.returnPoint("xpointd") + '" step="' + this.returnStep("x") + '" oninput="xUpdate(this.value)" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">,<input id="ypointd" type="number" class="point-input" value="' + this.returnPoint("ypointd") + '" oninput="yUpdate(this.value)" step="' + this.returnStep("y") + '" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">)</div>'
        html3 += '</div>'
        html3 += '<div id="relativeinputs" class="hide">'
        html3 += '<div class="styled-select" style="margin-top:9px"><select id="reldropdown" class="select-class" onchange="GetRelativeElement(this.value)"></span>' + this.relselects + '</select></div>'
        html3 += '<div id="relativeinputs2" class="hide">'
        html3 += '<button class="fake-radio" id="sleft" onclick="ShiftLeft();" style="margin-top:13px;"> <div class="radio-off"><div id="sleftro" class="radio-on hide"></div></div>Left</button><br>'
        html3 += '<button class="fake-radio" id="sright" onclick="ShiftRight();" style="margin-top:0px;"> <div class="radio-off"><div id="srightro" class="radio-on hide"></div></div>Right</button><br>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'

        if (graphSe.mode == 'correct') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect1') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect2') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect3') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'student' && graphSe.doLabelMode) {
            this.CorrectLabelDropdown();
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        }
        else {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        }

        var html4 = '<div class="row" style="margin-left: 20px;">'
        html4 += '<div class="col-xs-6">'
        html4 += '<div class="tool" style="margin-top: 0px;">Required label</div>'
        html4 += '<div id="requiredlabeltools" class="hide">'
        html4 += '<div class="tool">Label Choices</div>'
        html4 += '<div id="cltext2" class="tool" style="padding-top: ' + tempclo + '">Correct Label</div>'
        html4 += '<div id="inccl1" class="tool" style="">Incorrect Label</div>'
        html4 += '</div>'
        html4 += '</div>'
        html4 += '<div class="col-xs-6">'
        html4 += '<div id="rtoggleshell" style="margin-top:10px;"><label class="switch tool"><input id="rltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html4 += '<div id="requiredlabelinputs" class="hide">'
        html4 += '<form id="checkform" onclick="checkBoxes();">' + tempcbh + '</form>'
        html4 += '<div><input id="newlabel" type="text" class="" placeholder="Custom label" onkeyup="" style="width: 100px; margin-top: 10px;"><button id="addbutton" class="btn-nothing" onclick="addLabel()"> <span class="glyphicon glyphicon-cplus"></span></button></div>'
        html4 += '<div class="styled-select" style="margin-top: 10px"><select id="cldropdown" class="select-class" onchange="GetCorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '<div id="inccl2" class="styled-select" style="margin-top: 10px"><select id="inccldropdown" class="select-class" onchange="GetIncorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '</div>'
        html4 += '</div>'

        var html5 = '<div class="row" style="margin-left: 20px;">'
        html5 += '<div class="col-xs-6">'
        html5 += '<div class="tool">Element Type</div>'
        html5 += '<div class="tool">Coordinates</div>'
        html5 += '</div>'
        html5 += '<div class="col-xs-6" style="padding-top: 8px;">'
        html5 += '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value);"></span><option value="None">None</option><option value="Equilibrium">Equilibrium</option></select></div>'
        html5 += '<div style="margin-top: 10px;">(<input id="xpoint" type="number" class="point-input" value="' + this.returnPoint("xpoint") + '" step="' + this.returnStep("x") + '" oninput="xUpdate(this.value)" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">,<input id="ypoint" type="number" class="point-input" value="' + this.returnPoint("ypoint") + '" oninput="yUpdate(this.value)" step="' + this.returnStep("y") + '" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">)</div>'
        html5 += '</div>'
        html5 += '</div>'

        var html6 = '<div class="row" style="margin-left: 20px;">'
        html6 += '<div class="col-xs-6">'
        html6 += '<div class="tool">Coordinates</div>'
        html6 += '</div>'
        html6 += '<div class="col-xs-6">'
        html6 += '<div>(<input id="xpointd" type="number" class="point-input" value="' + this.returnPoint("xpointd") + '" step="' + this.returnStep("x") + '" oninput="xUpdate(this.value)" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">,<input id="ypointd" type="number" class="point-input" value="' + this.returnPoint("ypointd") + '" oninput="yUpdate(this.value)" step="' + this.returnStep("y") + '" onkeypress="return event.charCode >= 48 && event.charCode <= 57 && event.charCode = 110">)</div>'
        html6 += '</div>'
        html6 += '</div>'

        document.getElementById("bottomtools").innerHTML = html;
        document.getElementById("interactive").innerHTML = html2;
        document.getElementById("interactivetools").innerHTML = html3;
        document.getElementById("labeldetails").innerHTML = html4;
        document.getElementById("drawingtools").innerHTML = html5;
        document.getElementById("incdetails").innerHTML = html6;

        document.getElementById('eldropdown').value = this.elementlabel;
        document.getElementById('plumbtoggle').checked = this.plumbLine;

        if (graphSe.mode == 'correct') {
            var temprl = this.requiredlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[1] != undefined) ? this.requiredlabelinc[1] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect2') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[2] != undefined) ? this.requiredlabelinc[2] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect3') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[3] != undefined) ? this.requiredlabelinc[3] : this.requiredlabel; //SWG-64 changes
        }

        document.getElementById('rltoggle').checked = temprl;

        document.getElementById('tadropdown').value = this.taelement;

        if (graphSe.mode == 'correct') {
            var rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var rlltemp = this.relementlabelinc[3];
        }

        document.getElementById('reldropdown').value = rlltemp;
        document.getElementById('cldropdown').value = this.correctlabel;

        this.InteractiveMe(this.interactive);

        if (graphSe.mode == 'correct') {
            this.PreciseMe(this.precise);
            if (!this.precise) {
                this.EvalShift(this.evalshift);
            }
        } else if (graphSe.mode == 'incorrect1') {
            this.PreciseMe(this.preciseinc[1]);
            if (!this.preciseinc[1]) {
                this.EvalShift(this.evalshiftinc[1]);
            }
        } else if (graphSe.mode == 'incorrect2') {
            this.PreciseMe(this.preciseinc[2]);
            if (!this.preciseinc[2]) {
                this.EvalShift(this.evalshiftinc[2]);
            }
        } else if (graphSe.mode == 'incorrect3') {
            this.PreciseMe(this.preciseinc[3]);
            if (!this.preciseinc[3]) {
                this.EvalShift(this.evalshiftinc[3]);
            }
        }


        this.SetElementPoints();

        this.DisplayBookColor();

        this.HighLight();

        this.InteractiveReset();

        this.CheckRLabel();

        this.CorrectTools();

        this.checkBoxes();

        $('#emptydesigner').addClass("hide");

        if (this.labelLine == true) {
            document.getElementById("labeltoggle").checked = true;
        } else {
            document.getElementById("labeltoggle").checked = false;
        }

        if (graphMe.length < 1) {
            document.getElementById("bgleft").style.opacity = "0";
            document.getElementById("bgright").style.opacity = "0";
        } else {
            document.getElementById("bgleft").style.opacity = "1";
            document.getElementById("bgright").style.opacity = "1";
        }

        if (graphSe.mode == 'correct') {
            document.getElementById('cldropdown').value = this.correctlabel;
        } else if (graphSe.mode == 'incorrect1') {
            document.getElementById('cldropdown').value = this.correctlabel;
            document.getElementById('inccldropdown').value = this.correctlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            document.getElementById('cldropdown').value = this.correctlabel;
            document.getElementById('inccldropdown').value = this.correctlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            document.getElementById('cldropdown').value = this.correctlabel;
            document.getElementById('inccldropdown').value = this.correctlabelinc[3];
        } else {
            document.getElementById('cldropdown').value = this.correctlabel;
        }

        if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
            document.getElementById("cldropdown").disabled = true;
            document.getElementById("newlabel").disabled = true;
            document.getElementById("addbutton").disabled = true;
            $('#inccl1').removeClass("hide");
            $('#inccl2').removeClass("hide");
        } else {
            document.getElementById("cldropdown").disabled = false;
            document.getElementById("newlabel").disabled = false;
            document.getElementById("addbutton").disabled = false;
            $('#inccl1').addClass("hide");
            $('#inccl2').addClass("hide");
        }

        //SWG - 200 Changes
        if (graphSe.mode != 'designer') {
            HideElementTypeDropdown();
        }
    }

    this.SetElementPoints = function () {
        if (graphSe.mode != "student") {
            document.getElementById('xpoint').value = graphSe.snapIt ? this.sxg : this.xg;
            document.getElementById('ypoint').value = graphSe.snapIt ? this.syg : this.yg;

            document.getElementById('xpointd').value = graphSe.snapIt ? this.sxg : this.xg;
            document.getElementById('ypointd').value = graphSe.snapIt ? this.syg : this.yg;
        }
    }

    this.SetCorrectPoints = function () {
        if (this.precise) {
            this.correctx = graphSe.snapIt ? this.sxg : this.xg;
            this.correcty = graphSe.snapIt ? this.syg : this.yg;

            if (document.getElementById('xpointc') != null) {
                document.getElementById('xpointc').value = this.correctx;
                document.getElementById('ypointc').value = this.correcty;
            }
        }
    }

    this.SetElementLabel = function (text) {
        this.elementlabel = text;
        //SWG-87
        if (graphSe.mode != "designer" && this.elementlabel != "None") {
            this.tempbookColor = "Yes";
            this.tempLableLine = true;
        }
        //end SWG-87
        this.SetColor();

        //console.log("the text:"+text);
        var newstring = text;
        var nssplit = text.split("");
        var letter = nssplit[0].toUpperCase();
        if (text != "None") {
            this.shortlabel = letter;

            //this.LabelFromPulldown(); commenting this line, as it was throiwing exception, didnt find any other referecne to this function
            this.SetSettings();
        }

    }

    this.SetCorrectStudentLabel = function (text) {
        this.studentcorrectlabel = text;

        //this.CheckIsCorrect("label");
    }

    this.SetRelativeElementLabel = function (text) {

        if (graphSe.mode == 'correct') {
            this.relementlabel = text;
            this.relementlabelinc[1] = text;
            this.relementlabelinc[2] = text;
            this.relementlabelinc[3] = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.relementlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.relementlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.relementlabelinc[3] = text;
        }


        this.CheckRLabel();
    }

    this.SetCorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }

    }

    this.SetIncorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }
    }


    this.CheckRLabel = function () {

        if (graphSe.mode == 'correct') {
            var rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var rlltemp = this.relementlabelinc[3];
        }

        if (rlltemp == "Accepted Area") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').removeClass("hide");
        } else if (rlltemp == "None") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').addClass("hide");
        } else {
            $('#relativetools2').removeClass("hide");
            $('#relativeinputs2').removeClass("hide");
            $('#drawarea').addClass("hide");
        }
    }

    this.SetBookColor = function (text) {
        this.bookcolor = text;

        this.SetColor();
    }

    this.GetBookColor = function (text) {
        return this.bookcolor;
    }

    this.DisplayBookColor = function () {
        if (this.bookcolor == "Yes") {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-checkedmm"></span>';
        } else {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span>';
        }
    }

    this.HighLight = function () {
        for (i = 0; i < graphMe.length; i++) {
            graphMe[i].iscurrent = false
        }

        this.iscurrent = true
    }

    this.UpdateLabelText = function () {
        //console.log(document.getElementById('xlabel'+this.labelvalue).value);
        document.getElementById('xlabel' + this.labelvalueedit).value = this.labeledit;
        document.getElementById('toplabel' + this.labelvalueedit).innerHTML = this.labeledit;
    }

    this.InteractiveMe = function (tf) {
        this.interactive = tf;
        if (tf) {
            $("#binteractivero").removeClass("hide");
            $("#bstaticro").addClass("hide");
        } else {
            $("#binteractivero").addClass("hide");
            $("#bstaticro").removeClass("hide");
        }
    }


    this.CorrectTools = function () {
        //if(graphSe.mode=='correct')
        if (graphSe.mode.indexOf('correct') != -1) {

            if (this.interactive != false) $('#labeldetails').removeClass("hide");
            $('#designertools').addClass("hide");
            $('#designerinputs').addClass("hide");
            $('#elabel').removeClass("hide");
            $('#elabelmode').removeClass("hide");
            $('#intleft').addClass("hide");
            $('#intright').addClass("hide");
            document.getElementById("elementhead").innerHTML = "Evaluation Settings";
            document.getElementById("interactive").style.background = "#fbfbfb";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').addClass("hide");

            $('#incdetails').addClass("hide");

            if (this.interactive) {
                document.getElementById("elabelmode").innerHTML = "Interactive";
                this.elabelmode = "Interactive";
                //SWG-246 changes
                //$('#interactivetools').removeClass("hide");
                $('#interactivetools,#labeldetails').removeClass("hide");

                if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
                    $('#drawingtools').addClass("hide");
                    $('#interactivetools').removeClass("hide");
                    $('#labeldetails').removeClass("hide");
                    $('#incdetails').addClass("hide");
                } else {
                    $('#incdetails').addClass("hide");
                }

            } else {
                document.getElementById("elabelmode").innerHTML = "Static";
                this.elabelmode = "Static";
                //SWG-246 changes
                //$('#interactivetools').addClass("hide");
                $('#interactivetools,#labeldetails').addClass("hide");
            }

            //if(this.mode=="correct")
            if (this.mode.indexOf("correct") != -1) {
                document.getElementById("elabelmode").innerHTML = "Drawing";
                this.elabelmode = "Drawing";
                $('#interactivetools').addClass("hide");
                $('#drawingtools').removeClass("hide");
                $('#labeldetails').removeClass("hide");
            }
            if (document.getElementById('rltoggle').checked) {
                $('#requiredlabeltools').removeClass("hide");
                $('#requiredlabelinputs').removeClass("hide");
                document.getElementById('cldropdown').value = this.correctlabel;
            } else {
                $('#requiredlabeltools').addClass("hide");
                $('#requiredlabelinputs').addClass("hide");
            }
            if (this.elabelmode == "Drawing") {
                $('#drawingtools').removeClass("hide");
            } else {
                $('#drawingtools').addClass("hide");
            }

        } else if (graphSe.mode == 'student') {
            $('#interactive').addClass("hide");
            $('#bottomtools').addClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");
            $('#incdetails').addClass("hide");


        } else {
            $('#labeldetails').addClass("hide");
            $('#designertools').removeClass("hide");
            $('#designerinputs').removeClass("hide");
            //$('#elabel').addClass("hide");
            $('#elabelmode').addClass("hide");
            $('#intleft').removeClass("hide");
            $('#intright').removeClass("hide");
            document.getElementById("elementhead").innerHTML = "Element Settings";
            document.getElementById("interactive").style.background = "#f6f6f6";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').removeClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");
            $('#incdetails').addClass("hide");

        }

    }

    this.InteractiveReset = function () {
        if (this.interactive) {
            $('#ilabels').removeClass("hide");
            $('#iinputs').removeClass("hide");
        } else {
            $('#ilabels').addClass("hide");
            $('#iinputs').addClass("hide");
        }
    }

    this.TrackAgainstDropdown = function () {
        var html = '<option value="None">None</option>'
        for (i = 0; i < graphMe.length; i++) {
            var gi = graphMe[i];
            var gitype = gi.constructor.name;
            if (gi.labeledit != this.labeledit && gitype != "Point") {
                var graphlabel = gi.labeledit;
                html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
            }
        }

        this.taselects = html;
    }

    this.RelativeDropdown = function () {
        var html = '<option value="None">None</option>'
        html += '<option value="Accepted Area">Accepted Area</option>'
        for (i = 0; i < graphMe.length; i++) {
            var graphlabel = graphMe[i].labeledit;
            html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
        }

        this.relselects = html;
    }

    this.EvalShift = function (text) {
        //SWG_312 and SWG_313 changes
        if (evaltemp == "left")
            this.leftCoordinatesUpdated = undefined;
        if (evaltemp == "right")
            this.rightCoordinatesUpdated = undefined;
        if (graphSe.mode == 'correct') {
            this.evalshift = text;
            var evaltemp = this.evalshift;
        } else if (graphSe.mode == 'incorrect1') {
            this.evalshiftinc[1] = text;
            var evaltemp = this.evalshiftinc[1] == undefined ? this.evalshift : this.evalshiftinc[1]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect2') {
            this.evalshiftinc[2] = text;
            var evaltemp = this.evalshiftinc[2] == undefined ? this.evalshift : this.evalshiftinc[2]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect3') {
            this.evalshiftinc[3] = text;
            var evaltemp = this.evalshiftinc[3] == undefined ? this.evalshift : this.evalshiftinc[3]; ////SWG-312, 313
        }

        if (evaltemp == "left") {
            $("#sleftro").removeClass("hide");
            $("#srightro").addClass("hide");
        } else if (evaltemp == null) {
            $("#sleftro").addClass("hide");
            $("#srightro").addClass("hide");
        } else {
            $("#sleftro").addClass("hide");
            $("#srightro").removeClass("hide");
            //$('#relativetools').removeClass("hide");
            //$('#relativeinputs').removeClass("hide");
        }

        if (text != null) {
            if (graphSe.mode == 'correct') this.CorrectMe(["relative", text]);
            else if (graphSe.mode.substring(0, 9) == "incorrect")
                this.IncorrectMe(undefined, undefined, ["relative", text]);
        }
    }

    this.PreciseMe = function (tf) {
        if (graphSe.mode == 'correct') {
            this.precise = tf;
            this.preciseinc[1] = tf;
            this.preciseinc[2] = tf;
            this.preciseinc[3] = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.preciseinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.preciseinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.preciseinc[3] = tf;
        }

        if (tf) {
            $("#bprecisero").removeClass("hide");
            $("#brelativero").addClass("hide");
            $('#relativetools').addClass("hide");
            $('#relativeinputs').addClass("hide");
            $('#precisetools').removeClass("hide");
            $('#preciseinputs').removeClass("hide");
        } else if (tf == null) {
            $("#bprecisero").addClass("hide");
            $("#brelativero").addClass("hide");
        } else {
            $("#bprecisero").addClass("hide");
            $("#brelativero").removeClass("hide");
            $('#relativetools').removeClass("hide");
            $('#relativeinputs').removeClass("hide");
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#precisetools').addClass("hide");
            $('#preciseinputs').addClass("hide");
        }

    }

    this.LabelMeDrop = function () {
        if (this.droppedlabel == 0 && this.interactive) {
            //console.log("label me drop");
            var uniqueLabel = this.uniqueLabel; // 3.7 changes
            var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
            var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);

            var xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
            var yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
            var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
            var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

            var div = document.createElement("div");
            this.studentlabelid = 'dlabel' + this.divid;
            div.id = this.studentlabelid;
            div.style.position = "absolute";
            div.style.left = xpx + 37 + 'px';

            ////SWG-221 Changes
            if (graphSe.titleshow && graphSe.title != "") div.style.top = ypx + 170 + 'px';
            else div.style.top = ypx + 115 + 'px';
            ////SWG-221 Changes end

            div.style.zIndex = "1000"; ////SWFB-2269
            div.className = 'styled-select';

            var clselectsrt;

            if (this.mode == "student") {
                if (this.FindMatchObject() == null) {
                    clselectsrt = this.clselects;
                } else {
                    clselectsrt = this.FindMatchObject().clselects;
                }
            } else {
                clselectsrt = this.clselects;
            }
            //release 3.7 changes
            //div.innerHTML = '<select id="elabel' + this.divid + '" class="select-class" onchange="GetCorrectStudentLabel(this.value, this.id)"></span>' + clselectsrt + '</select>'
            div.innerHTML = '<select id="elabel' + this.divid + '" data-uniqueid =' + uniqueLabel + ' class="select-class" onchange="GetCorrectStudentLabel(this.value, this.id, this)"></span>' + clselectsrt + '</select>'
            document.getElementById('graphcontainer').appendChild(div);

            //$('#elabel').removeClass("hide");
            studentlabel++;
            graphSe.OpsAddStudentLabel(gmloc);

            //console.log("hello");

            //this.droppedlabel = 1; ////SWG-451
        }

    }

    this.deleteStudentLabel = function () {
        this.savedstudentlabel = document.getElementById(this.studentlabelid);
        this.savedstudentcorrectlabel = this.studentcorrectlabel;
        var studentcorrectlabel = this.designerLabel != undefined ? this.designerLabel : "None"; ////Preview mode object color disappear after undo

        this.SetCorrectStudentLabel(studentcorrectlabel); ////Set default designer mode color
        document.getElementById(this.studentlabelid).remove();
        this.droppedlabel = 0;

        this.setStudentColor();
    }

    this.replaceStudentLabel = function () {
        var div = this.savedstudentlabel;
        this.studentcorrectlabel = this.savedstudentcorrectlabel;

        document.getElementById('graphcontainer').appendChild(div);

        this.droppedlabel = 1;

        this.setStudentColor();
    }

    this.IsPPF = function () {
        return false;
    }

    this.removeLastCheckBox = function () {

        var customlength = this.customlabels.length;
        var customlength2 = this.checkboxes.length;

        if (customlength > 0) {
            this.removedcheckboxes.push(this.customlabels[customlength - 1]);
            this.removedcheckboxesstate.push(this.checkboxes[customlength2 - 1]);

            this.customlabels.pop();
            this.checkboxes.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) - 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }

    this.replaceLastCheckBox = function () {
        var customlength = this.removedcheckboxes.length;
        if (customlength > 0) {
            this.customlabels.push(this.removedcheckboxes[customlength - 1]);
            this.checkboxes.push(this.removedcheckboxesstate[customlength - 1]);

            this.removedcheckboxes.pop();
            this.removedcheckboxesstate.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) + 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }


    this.SetSettings();

    ////SWG-139 Changes
    this.ResetMe = function () {
        this.xg = this.ghost.xg;
        this.yg = this.ghost.yg;
        this.SnapMe();
    }
    ////SWG-139 Changes Ends
}

var studentlabel = 0;

function Line(clr, xxs, yys, xxe, yye, szz) {
    this.what = "line";
    //SWG-124 changes
    this.uniqueLabel = Math.floor(Math.random() * 90000) + 10000;

    this.droppedlabel = 0;

    this.mo;

    this.studentcorrectlabel = "a";

    this.requiredlabelinc = [];

    this.iscorrect = null;
    this.correctgraph;
    this.labelcorrect;
    this.correctlabel = "b";

    this.ang = null;

    this.xs = xxs;
    this.ys = yys;
    this.xe = xxe;
    this.ye = yye;

    this.xsg = graphSe.ConvertXpxToXg(xxs);
    this.ysg = graphSe.ConvertYpxToYg(yys);
    this.xeg = graphSe.ConvertXpxToXg(xxe);
    this.yeg = graphSe.ConvertYpxToYg(yye);

    this.sxsg = graphSe.SnapX(this.xsg);
    this.sysg = graphSe.SnapY(this.ysg);
    this.sxeg = graphSe.SnapX(this.xeg);
    this.syeg = graphSe.SnapY(this.yeg);

    this.uvPx;

    this.color = clr;
    this.width = 2;

    this.elementlabel = "None";
    this.relementlabel = "None";
    this.relementlabelinc = ["None", "None", "None", "None"]
    this.bookcolor = "No";
    this.iscurrent = true;
    this.interactive = graphSe.mode.indexOf("correct") != -1 || graphSe.mode == "student" ? true : false;
    this.precise = null;
    this.preciseinc = [null, null, null]
    this.evalshift = null;
    this.evalshiftinc = [null, null, null];
    this.labelam = '';
    this.taelement = 'None';
    this.labelLine = false;
    this.relselects = '';
    this.correctlabelinc = ["b", "b", "b", "b"];

    this.correct = [];
    this.correctTolerance = 4;
    this.correctFeedback = "Line Correct!";
    this.notCorrectFeedback = "Line Not Correct!";
    this.feedback = "";

    this.incorrect = [null, null, null, null];
    this.isIncorrect = [null, null, null, null];

    this.m = 0;
    this.distance = 0;
    this.labelam = '';
    this.taelement = 'None';
    this.locked = false;

    lpoints++;
    highIndex = 0;
    //gmloc = lpoints;
    this.label = "L" + lpoints;
    this.divid = this.label;

    this.labelvalue = lpoints;
    this.trackAlongLabel = null;
    this.trackAng = 0;

    this.labeledit = this.label;
    this.labelvalueedit = this.labelvalue;

    this.plumbLine = false;
    this.labelLine = false;

    this.dragState = "off";
    this.dragStart = null;
    this.dragDxDy = { dx: 0, dy: 0 };

    this.studentdrag = null;

    this.ghost = null;
    //this.incGhost =  [ null, null, null, null ];

    this.showControl = false;

    this.mode = graphSe.mode;

    this.taselects = '';
    this.relselects = '';

    var startstring = '</span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option><option value="PPF">PPF</option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option>'

    this.clselectsinc = [startstring, startstring, startstring, startstring];
    this.clselects = startstring


    this.cc = 'rgba(0, 0, 0, 1)'
    this.ccus = 'rgba(0, 0, 0, .5)'

    ////SWG - 55 Changes
    //this.checkboxes = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc1 = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc2 = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc3 = [true, true, true, true, true, true, true, true, true];
    this.customlabels = [];
    this.customlabelsinc1 = [];
    this.customlabelsinc2 = [];
    this.customlabelsinc3 = [];
    this.clabeloffsetinc = ["202px", "202px", "202px", "202px",];
    this.checkboxhtmlinc = [];

    this.clabeloffset = "202px";
    this.elabelmode = "";

    this.npdropdown = '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option></option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option></select></div>'
    this.pdropdown = '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option><option value="PPF">PPF</option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option></select></div>'

    this.removedcheckboxes = [];
    this.removedcheckboxesstate = [];

    this.path;

    ////Prod issue SWG-332
    this.designerLabel = "";
    ////Prod issue SWG-332

    this.isshiftdirectionchanged = false; ////SWG-457

    //SWG-87 added tempbookcolor condition
    this.SetColor = function () {
        if (this.elementlabel == "None") {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        } else if (this.elementlabel == "PPF" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(170, 95, 166, 1)';
            this.ccus = 'rgba(170, 95, 166, .5)';
        } else if (this.elementlabel == "Demand" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(0, 131, 173, 1)';
            this.ccus = 'rgba(0, 131, 173, .5)';
        } else if (this.elementlabel == "Supply" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Fixed Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(188, 189, 192, 1)';
            this.ccus = 'rgba(188, 189, 192, .5)';
        } else if (this.elementlabel == "Indifference" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Revenue" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(35, 31, 32, 1)';
            this.ccus = 'rgba(35, 31, 32, .5)';
        } else if (this.elementlabel == "Total Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Variable Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(238, 165, 122, 1)';
            this.ccus = 'rgba(238, 165, 122, .5)';
        } else {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        }
    }

    this.setStudentColor = function () {
        if (this.studentcorrectlabel == "None") {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        } else if (this.studentcorrectlabel == "PPF") {
            this.cc = 'rgba(170, 95, 166, 1)';
            this.ccus = 'rgba(170, 95, 166, .5)';
        } else if (this.studentcorrectlabel == "Demand") {
            this.cc = 'rgba(0, 131, 173, 1)';
            this.ccus = 'rgba(0, 131, 173, .5)';
        } else if (this.studentcorrectlabel == "Supply") {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.studentcorrectlabel == "Fixed Cost") {
            this.cc = 'rgba(188, 189, 192, 1)';
            this.ccus = 'rgba(188, 189, 192, .5)';
        } else if (this.studentcorrectlabel == "Indifference") {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.studentcorrectlabel == "Marginal Cost") {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.studentcorrectlabel == "Marginal Revenue") {
            this.cc = 'rgba(35, 31, 32, 1)';
            this.ccus = 'rgba(35, 31, 32, .5)';
        } else if (this.studentcorrectlabel == "Total Cost") {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.studentcorrectlabel == "Variable Cost") {
            this.cc = 'rgba(238, 165, 122, 1)';
            this.ccus = 'rgba(238, 165, 122, .5)';
        } else {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        }
    }
    this.getCords = function () {
        var xpx = graphSe.ConvertXpxToXg(graphSe.snapIt ? this.sxg : this.xg);
        var ypx = graphSe.ConvertYpxToYg(graphSe.snapIt ? this.syg : this.yg);

        return { xpx: xpx, ypx: ypx };
    }
    // get evalshift based on current tab
    this.getEvalShift = function () {
        if (graphSe.mode == 'correct') return this.evalshift;
        if (graphSe.mode == 'incorrect1') return this.evalshiftinc[1];
        if (graphSe.mode == 'incorrect2') return this.evalshiftinc[2];
        if (graphSe.mode == 'incorrect3') return this.evalshiftinc[3];
        return '';
    };
    //Changes for SWG-312 and 313
    // get precise based on current tab
    this.getPrecise = function () {
        if (graphSe.mode == 'correct') return this.precise;
        if (graphSe.mode == 'incorrect1') return this.preciseinc[1];
        if (graphSe.mode == 'incorrect2') return this.preciseinc[2];
        if (graphSe.mode == 'incorrect3') return this.preciseinc[3];
        return '';
    };
    //Changes for SWG-312 and 313 end
    // drawme of a line
    this.DrawMe = function (ctx) {
        var yincrement = 1;
        var xincrement = 1;
        if (document.getElementById('yinc') != undefined) yincrement = document.getElementById('yinc').value;
        if (document.getElementById('xinc') != undefined) xincrement = document.getElementById('xinc').value;

        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxg : this.xg);
        var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syg : this.yg);

        var xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
        var yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
        var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
        var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

        //this.SetColor();
        var clr = this.iscurrent == true ? this.cc : this.ccus;

        if (graphSe.mode == "student") clr = this.cc;

        if (graphSe.boo && this.ghost && (this.mode.indexOf("correct") == -1) && this.mode != "student") {
            var gh = this.ghost;
            var gxspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? gh.sxsg : gh.xsg);
            var gyspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? gh.sysg : gh.ysg);
            var gxepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? gh.sxeg : gh.xeg);
            var gyepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? gh.syeg : gh.yeg);

            var dsx = xspx - gxspx;
            var dsy = yspx - gyspx;
            var dex = xepx - gxepx;
            var dey = yepx - gyepx;

            /*var tol = 4;
            if( (Math.sqrt(dsx*dsx+dsy*dsy) > tol) && (Math.sqrt(dex*dex+dey*dey) > tol) )*/
            // this drawline creates the ghost state object
            //Changes for SWG-199
            if (this.deletedFrom == undefined || this.deletedFrom.indexOf(graphSe.mode) == -1) {
                DrawLine(gh.clr, gh.wd, gxspx, gyspx, gxepx, gyepx, [2, 2]);
            }
            //DrawLine(gh.clr, gh.wd, gxspx, gyspx, gxepx, gyepx, [2, 2]);
            //End changes for SWG-199
        }

        if (xepx != undefined) {
            // Chetan code edit starts:
            if (graphSe.boo && this.ghost && this.mode != "correct" && this.mode != "student") {
                var shiftVal = this.getEvalShift();
                shiftVal = shiftVal == undefined ? this.evalshift : shiftVal; ////SWG-312, 313
                var isPrecise = this.getPrecise();
                if (!isPrecise && shiftVal) {
                    if (shiftVal == "up") {
                        // preserve original Coordinates
                        if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                            this.originalCoordinates = { sxsg: gh.sxsg, sysg: gh.sysg, sxeg: gh.sxeg, syeg: gh.syeg, xsg: gh.xsg, ysg: gh.ysg, xeg: gh.xeg, yeg: gh.yeg };
                        }
                        if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                            // Coordinates should update only once , after that never
                            if (this.resetCoordinates || this.upCoordinatesUpdated == undefined || this.upCoordinatesUpdated == null) {
                                if (this.originalCoordinates.sysg != this.sysg && this.originalCoordinates.ysg != this.ysg &&
                                    this.originalCoordinates.syeg != this.syeg && this.originalCoordinates.yeg != this.yeg) {
                                    // reset the Coordinates
                                    this.sysg = this.originalCoordinates.sysg;
                                    this.ysg = this.originalCoordinates.ysg;
                                    this.syeg = this.originalCoordinates.syeg;
                                    this.yeg = this.originalCoordinates.yeg;
                                    // -- update the x axis coord as well
                                    this.sxsg = this.originalCoordinates.sxsg;
                                    this.xsg = this.originalCoordinates.xsg;
                                    this.sxeg = this.originalCoordinates.sxeg;
                                    this.xeg = this.originalCoordinates.xeg;
                                }
                                this.sysg += 2 * yincrement;
                                this.ysg += 2 * yincrement;
                                this.syeg += 2 * yincrement;
                                this.yeg += 2 * yincrement;
                                this.upCoordinatesUpdated = true;
                                this.downCoordinatesUpdated = undefined;
                                this.leftCoordinatesUpdated = undefined;
                                this.rightCoordinatesUpdated = undefined;
                                this.inwardCoordinatesUpdated = undefined;
                                this.outwardCoordinatesUpdated = undefined;
                                this.resetCoordinates = false;
                            }
                        }
                        xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                        yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                        xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                        yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                        //SWG_312 and SWG_313 changes
                        if (graphSe.mode.includes('incorrect'))
                            this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                    } else if (shiftVal == "down") {
                        // preserve original Coordinates
                        if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                            this.originalCoordinates = { sxsg: gh.sxsg, sysg: gh.sysg, sxeg: gh.sxeg, syeg: gh.syeg, xsg: gh.xsg, ysg: gh.ysg, xeg: gh.xeg, yeg: gh.yeg };
                        }
                        if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                            // Coordinates should update only once
                            if (this.resetCoordinates || this.downCoordinatesUpdated == undefined || this.downCoordinatesUpdated == null) {
                                if (this.originalCoordinates.sysg != this.sysg && this.originalCoordinates.ysg != this.ysg &&
                                    this.originalCoordinates.syeg != this.syeg && this.originalCoordinates.yeg != this.yeg) {
                                    // reset the Coordinates
                                    this.sysg = this.originalCoordinates.sysg;
                                    this.ysg = this.originalCoordinates.ysg;
                                    this.syeg = this.originalCoordinates.syeg;
                                    this.yeg = this.originalCoordinates.yeg;
                                    // -- update the x axis coord as well
                                    this.sxsg = this.originalCoordinates.sxsg;
                                    this.xsg = this.originalCoordinates.xsg;
                                    this.sxeg = this.originalCoordinates.sxeg;
                                    this.xeg = this.originalCoordinates.xeg;
                                }
                                this.sysg -= 2 * yincrement;
                                this.ysg -= 2 * yincrement;
                                this.syeg -= 2 * yincrement;
                                this.yeg -= 2 * yincrement;
                                this.downCoordinatesUpdated = true;
                                this.upCoordinatesUpdated = undefined;
                                this.leftCoordinatesUpdated = undefined;
                                this.rightCoordinatesUpdated = undefined;
                                this.inwardCoordinatesUpdated = undefined;
                                this.outwardCoordinatesUpdated = undefined;
                                this.resetCoordinates = false;
                            }
                        }
                        xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                        yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                        xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                        yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                        //SWG_312 and SWG_313 changes
                        if (graphSe.mode.includes('incorrect'))
                            this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                    } // end -elseif
                    else if (shiftVal == "left") {
                        // preserve original Coordinates
                        if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                            this.originalCoordinates = { sxsg: gh.sxsg, sysg: gh.sysg, sxeg: gh.sxeg, syeg: gh.syeg, xsg: gh.xsg, ysg: gh.ysg, xeg: gh.xeg, yeg: gh.yeg };
                        }
                        if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                            // Coordinates should update only once
                            if (this.resetCoordinates || this.leftCoordinatesUpdated == undefined || this.leftCoordinatesUpdated == null) {
                                if (this.originalCoordinates.sxsg != this.sxsg && this.originalCoordinates.xsg != this.xsg &&
                                    this.originalCoordinates.sxeg != this.sxeg && this.originalCoordinates.xeg != this.xeg) {
                                    // reset the Coordinates
                                    this.sxsg = this.originalCoordinates.sxsg;
                                    this.xsg = this.originalCoordinates.xsg;
                                    this.sxeg = this.originalCoordinates.sxeg;
                                    this.xeg = this.originalCoordinates.xeg;
                                    // -- update y axis cord as well

                                    this.sysg = this.originalCoordinates.sysg;
                                    this.ysg = this.originalCoordinates.ysg;
                                    this.syeg = this.originalCoordinates.syeg;
                                    this.yeg = this.originalCoordinates.yeg;

                                }
                                this.sxsg -= 2 * xincrement;
                                this.xsg -= 2 * xincrement;
                                this.sxeg -= 2 * xincrement;
                                this.xeg -= 2 * xincrement;
                                this.leftCoordinatesUpdated = true;
                                this.rightCoordinatesUpdated = undefined;
                                this.upCoordinatesUpdated = undefined;
                                this.downCoordinatesUpdated = undefined;
                                this.inwardCoordinatesUpdated = undefined;
                                this.outwardCoordinatesUpdated = undefined;
                                this.resetCoordinates = false;
                            }
                        }
                        xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                        yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                        xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                        yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                        //SWG_312 and SWG_313 changes
                        if (graphSe.mode.includes('incorrect'))
                            this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                    } // end -elseif - left
                    else if (shiftVal == "right") {
                        // preserve original Coordinates
                        if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                            this.originalCoordinates = { sxsg: gh.sxsg, sysg: gh.sysg, sxeg: gh.sxeg, syeg: gh.syeg, xsg: gh.xsg, ysg: gh.ysg, xeg: gh.xeg, yeg: gh.yeg };
                        }
                        if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                            // Coordinates should update only once
                            if (this.resetCoordinates || this.rightCoordinatesUpdated == undefined || this.rightCoordinatesUpdated == null) {
                                if (this.originalCoordinates.sxsg != this.sxsg && this.originalCoordinates.xsg != this.xsg &&
                                    this.originalCoordinates.sxeg != this.sxeg && this.originalCoordinates.xeg != this.xeg) {
                                    // reset the Coordinates
                                    this.sxsg = this.originalCoordinates.sxsg;
                                    this.xsg = this.originalCoordinates.xsg;
                                    this.sxeg = this.originalCoordinates.sxeg;
                                    this.xeg = this.originalCoordinates.xeg;

                                    // -- update y axis cord as well

                                    this.sysg = this.originalCoordinates.sysg;
                                    this.ysg = this.originalCoordinates.ysg;
                                    this.syeg = this.originalCoordinates.syeg;
                                    this.yeg = this.originalCoordinates.yeg;
                                }
                                this.sxsg += 2 * xincrement;
                                this.xsg += 2 * xincrement;
                                this.sxeg += 2 * xincrement;
                                this.xeg += 2 * xincrement;
                                this.rightCoordinatesUpdated = true;
                                this.leftCoordinatesUpdated = undefined;
                                this.upCoordinatesUpdated = undefined;
                                this.downCoordinatesUpdated = undefined;
                                this.inwardCoordinatesUpdated = undefined;
                                this.outwardCoordinatesUpdated = undefined;
                                this.resetCoordinates = false;
                            }
                        }
                        xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                        yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                        xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                        yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                        //SWG_312 and SWG_313 changes
                        if (graphSe.mode.includes('incorrect'))
                            this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                    } // end -elseif - right
                    else if (shiftVal == "inward") {
                        // preserve original Coordinates
                        if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                            this.originalCoordinates = { sxsg: gh.sxsg, sysg: gh.sysg, sxeg: gh.sxeg, syeg: gh.syeg, xsg: gh.xsg, ysg: gh.ysg, xeg: gh.xeg, yeg: gh.yeg };
                        }
                        if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                            // Coordinates should update only once
                            if (this.resetCoordinates || this.inwardCoordinatesUpdated == undefined || this.inwardCoordinatesUpdated == null) {
                                if (this.originalCoordinates.sysg != this.sysg && this.originalCoordinates.ysg != this.ysg &&
                                    this.originalCoordinates.sxeg != this.sxeg && this.originalCoordinates.xeg != this.xeg) {
                                    // reset the Coordinates
                                    this.sxsg = this.originalCoordinates.sxsg;
                                    this.xsg = this.originalCoordinates.xsg;
                                    this.sxeg = this.originalCoordinates.sxeg;
                                    this.xeg = this.originalCoordinates.xeg;

                                    // -- update y axis cord as well

                                    this.sysg = this.originalCoordinates.sysg;
                                    this.ysg = this.originalCoordinates.ysg;
                                    this.syeg = this.originalCoordinates.syeg;
                                    this.yeg = this.originalCoordinates.yeg;
                                }
                                this.sysg -= 2 * xincrement;
                                this.ysg -= 2 * xincrement;
                                this.sxeg -= 2 * xincrement;
                                this.xeg -= 2 * xincrement;

                                this.inwardCoordinatesUpdated = true;
                                this.outwardCoordinatesUpdated = undefined;
                                this.rightCoordinatesUpdated = undefined;
                                this.leftCoordinatesUpdated = undefined;
                                this.upCoordinatesUpdated = undefined;
                                this.downCoordinatesUpdated = undefined;
                                this.resetCoordinates = false;
                            }
                        }
                        xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                        yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                        xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                        yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                        //SWG_312 and SWG_313 changes
                        if (graphSe.mode.includes('incorrect'))
                            this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                    } // end -elseif - inward
                    else if (shiftVal == "outward") {
                        // preserve original Coordinates
                        if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                            this.originalCoordinates = { sxsg: gh.sxsg, sysg: gh.sysg, sxeg: gh.sxeg, syeg: gh.syeg, xsg: gh.xsg, ysg: gh.ysg, xeg: gh.xeg, yeg: gh.yeg };
                        }
                        if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                            // Coordinates should update only once
                            if (this.resetCoordinates || this.outwardCoordinatesUpdated == undefined || this.outwardCoordinatesUpdated == null) {
                                if (this.originalCoordinates.sysg != this.sysg && this.originalCoordinates.ysg != this.ysg &&
                                    this.originalCoordinates.sxeg != this.sxeg && this.originalCoordinates.xeg != this.xeg) {
                                    // reset the Coordinates
                                    this.sxsg = this.originalCoordinates.sxsg;
                                    this.xsg = this.originalCoordinates.xsg;
                                    this.sxeg = this.originalCoordinates.sxeg;
                                    this.xeg = this.originalCoordinates.xeg;

                                    // -- update y axis cord as well

                                    this.sysg = this.originalCoordinates.sysg;
                                    this.ysg = this.originalCoordinates.ysg;
                                    this.syeg = this.originalCoordinates.syeg;
                                    this.yeg = this.originalCoordinates.yeg;
                                }
                                this.sysg += 2 * xincrement;
                                this.ysg += 2 * xincrement;
                                this.sxeg += 2 * xincrement;
                                this.xeg += 2 * xincrement;

                                this.outwardCoordinatesUpdated = true;
                                this.inwardCoordinatesUpdated = undefined;
                                this.rightCoordinatesUpdated = undefined;
                                this.leftCoordinatesUpdated = undefined;
                                this.upCoordinatesUpdated = undefined;
                                this.downCoordinatesUpdated = undefined;
                                this.resetCoordinates = false;
                            }
                        }
                        xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                        yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                        xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                        yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                        //SWG_312 and SWG_313 changes
                        if (graphSe.mode.includes('incorrect'))
                            this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                    } // end -elseif - inward
                } else {
                    ////SWG-391 Changes
                    if (graphSe.mode.includes('incorrect')) { ////SWG-139 Changes
                        var nn = Number(graphSe.mode.charAt(9));
                        if (this.relementlabelinc[nn] != "Accepted Area")
                            ////SWG-391 Changes Ends
                            this.IncorrectMe();
                    }
                    ////SWG-139 Changes
                    if (this.resetCoordinates) {
                        this.ResetMe();
                        this.resetCoordinates = false;
                    }
                    ////SWG-139 Changes End
                }
            }
            // chtean code edit end
            this.path = DrawLine(clr, this.width, xspx, yspx, xepx, yepx);
            ////SWG - 199
            if (graphSe.mode.includes("incorrect")) {
                var nn = Number(graphSe.mode.charAt(9));
                if (this.deletedFrom != undefined && this.deletedFrom[nn] != undefined) {
                    this.path.visible = false;
                }
                else {
                    this.path.visible = true;
                }
            }
        }

        if (this.plumbLine) this.PlumbLine();

        if (this.iscurrent) this.ControlPoints();
        //SWG-87
        // if(this.tempLableLine == undefined && this.elementlabel!='' && this.mode!='designer'){
        //     this.SetElementLabel(this.elementlabel);
        // }
        //SWG-87
        if ((this.labelLine || this.tempLableLine) && this.path.visible) this.LabelLine();

    }

    this.UnitMe = function () {
        var xsPx = graphSe.ConvertXpxToXg(this.xsg);
        var ysPx = graphSe.ConvertYpxToYg(this.ysg);
        var xePx = graphSe.ConvertXpxToXg(this.xeg);
        var yePx = graphSe.ConvertYpxToYg(this.yeg);

        var ps = new paper.Point(xsPx, ysPx);
        var pe = new paper.Point(xePx, yePx);
        this.uvPx = pe.subtract(ps).normalize();

        return this.uvPx;
    }

    this.UnitNormal = function () {
        var xsPx = graphSe.ConvertXpxToXg(this.xsg);
        var ysPx = graphSe.ConvertYpxToYg(this.ysg);
        var xePx = graphSe.ConvertXpxToXg(this.xeg);
        var yePx = graphSe.ConvertYpxToYg(this.yeg);

        var ps = new paper.Point(xsPx, ysPx);
        var pe = new paper.Point(xePx, yePx);

        this.unPx = pe.subtract(ps).rotate(-90.0).normalize();

        return this.unPx;
    }

    this.TrackAlong = function (lbl) {
        if (lbl != undefined) this.trackAlongLabel = lbl;

        var trackElement = graphSe.FindInGraph(this.trackAlongLabel);

        if (trackElement != null) {
            var t = trackElement;
            s = t.SwapPoints();
            switch (t.constructor.name) {
                case "Line":
                    s = t.SwapPoints();
                    this.ang = Math.atan2(this.yeg - this.ysg, this.xeg - this.xsg);
                    //this.trackAng = Math.atan2(s.yeg - s.ysg, s.xeg - s.xsg);
                    this.trackAng = Math.atan2(s.ye - s.ys, s.xe - s.xs);
                    this.Track = this.TrackLine;
                    break;
                case "Curve":
                case "Polyline":
                    if (lbl != undefined) {
                        this.trackOffset = -1;
                        this.trackXg = s.pts != undefined ? s.pts[0] : s.xs;
                        this.trackYg = s.pts != undefined ? s.pts[1] : s.ys;
                        this.Track = this.TrackPath;
                    }
                    break;
            }
        }
    }

    this.TrackLine = function (dist) {
        var ang = this.trackAng;
        var dx = Math.cos(ang) * dist;
        var dy = Math.sin(ang) * dist;

        return { sx: dx, sy: dy };
    }

    this.TrackPath = function (dist) {
        var pt;

        var te = graphSe.FindInGraph(this.trackAlongLabel);

        var path = te.myPath;
        if (path == undefined) path = te.path;

        this.UnitMe();

        if (this.trackOffset == -1) {
            this.PathMe();
            var gii = this.path.getIntersections(path);
            var g0 = gii[0];
            if (g0 != undefined) {
                this.trackOffset = path.getOffsetOf(g0.point) / path.length;

                this.ds = g0.point.getDistance(this.path.segments[0].point);
                this.de = g0.point.getDistance(this.path.segments[1].point);
            }
        }

        if (this.trackOffset >= 0) {
            var pathOffset = this.trackOffset * path.length;
            pt = path.getPointAt(pathOffset);

            if (this.ds >= this.de) {
                var psx = pt.subtract(this.uvPx.multiply(this.ds));
                var txsg = graphSe.ConvertXpxToXg(psx.x);
                var tysg = graphSe.ConvertYpxToYg(psx.y);
                var tdx = txsg - this.xsg;
                var tdy = tysg - this.ysg;
            } else {
                var pex = pt.add(this.uvPx.multiply(this.de));
                var txeg = graphSe.ConvertXpxToXg(pex.x);
                var tyeg = graphSe.ConvertYpxToYg(pex.y);
                var tdx = txeg - this.xeg;
                var tdy = tyeg - this.yeg;
            }

            if (dist > 0 && this.trackOffset < .985) this.trackOffset += .015;
            else if (dist < 0 && this.trackOffset > .015) this.trackOffset -= .015;
        } else {
            tdx = 0;
            tdy = 0;
        }

        return { sx: tdx, sy: tdy };
    }

    this.Track = this.TrackLine;

    this.SetupDesigner = function () {
        if (this.ghost) {
            var gh = this.ghost;
            this.xsg = gh.xsg;
            this.ysg = gh.ysg;
            this.xeg = gh.xeg;
            this.yeg = gh.yeg;
            this.sxsg = gh.sxsg;
            this.sysg = gh.sysg;
            this.sxeg = gh.sxeg;
            this.syeg = gh.syeg;
        }
    }

    this.SetupCorrect = function () {
        var me;
        if (this.correct.length > 0) {
            var ca = this.correct[0];
            if (ca.type == undefined || ca.type[1] != "area" && this.interactive) {
                this.xsg = ca.xsg;
                this.ysg = ca.ysg;
                this.xeg = ca.xeg;
                this.yeg = ca.yeg;
            } else if (!this.interactive && graphSe.mode == "designer") this.CorrectMe();
            else if (ca.type[1] == "relative") {
                var ro = graphSe.FindInGraph(ca.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    this.xsg = me.xsg;
                    this.ysg = me.ysg;
                    this.xeg = me.xeg;
                    this.yeg = me.yeg;
                }
            }

            this.SnapMe();
        }
    }

    this.SetupIncorrect = function (nn) {
        var me;
        if (!graphSe.incorrectActive[nn]) {
            if (this.correct[0] != null) {
                var ca = this.correct[0];
                this.IncorrectMe(ca, nn, ca.type);
            }
        }

        if (this.incorrect[nn] != null) {
            var ca = this.incorrect[nn];
            if (ca.type == undefined || ca.type[1] != "area" && this.interactive) {
                this.xsg = ca.xsg;
                this.ysg = ca.ysg;
                this.xeg = ca.xeg;
                this.yeg = ca.yeg;
            } else if (!this.interactive && graphSe.mode == "designer") this.IncorrectMe();
            else if (ca.type[1] == "relative") {
                var ro = graphSe.FindInGraph(ca.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    this.xsg = me.xsg;
                    this.ysg = me.ysg;
                    this.xeg = me.xeg;
                    this.yeg = me.yeg;
                }
            }
            this.SnapMe();
        }
    }

    this.SetupStudent = function () {
        if (this.ghost) {
            var gh = this.ghost;
            this.xsg = gh.xsg;
            this.ysg = gh.ysg;
            this.xeg = gh.xeg;
            this.yeg = gh.yeg;
            this.sxsg = gh.sxsg;
            this.sysg = gh.sysg;
            this.sxeg = gh.sxeg;
            this.syeg = gh.syeg;
        }
    }

    this.ControlPoints = function () {
        //Changes for SWG-117
        var xStart = graphSe.snapIt ? this.sxsg : this.xsg;
        var yStart = graphSe.snapIt ? this.sysg : this.ysg;
        xStart = xStart == graphSe.xmin ? xStart + 0.2 * graphSe.xinc : (xStart == graphSe.xmax ? xStart - 0.2 * graphSe.xinc : xStart); ////SWG - 233 -- * graphSe.xinc & graphSe.yinc
        yStart = yStart == graphSe.ymax ? yStart - 0.2 * graphSe.yinc : yStart; ////SWG - 233 -- * graphSe.xinc & graphSe.yinc

        var pt = graphSe.snapIt ? { x: xStart, y: yStart } : { x: xStart, y: yStart };
        var ps = new paper.Path.Circle(new paper.Point(graphSe.ConvertXgToXpx(pt.x), graphSe.ConvertYgToYpx(pt.y)), graphSe.handleRadius);
        ps.strokeColor = graphSe.handleColor;
        ps.strokeWidth = 1;

        if (this.xeg != undefined) {
            //Changes for SWG-117
            var xEnd = graphSe.snapIt ? this.sxeg : this.xeg;
            var yEnd = graphSe.snapIt ? this.syeg : this.yeg;
            xEnd = xEnd == graphSe.xmin ? xEnd + 0.2 * graphSe.xinc : (xEnd == graphSe.xmax ? xEnd - 0.2 * graphSe.xinc : xEnd); ////SWG - 233 -- * graphSe.xinc & graphSe.yinc
            yEnd = yEnd == graphSe.ymax ? yEnd - 0.2 * graphSe.yinc : yEnd;  ////SWG - 233 -- * graphSe.xinc & graphSe.yinc

            pt = graphSe.snapIt ? { x: xEnd, y: yEnd } : { x: xEnd, y: yEnd };
            var pe = new paper.Path.Circle(new paper.Point(graphSe.ConvertXgToXpx(pt.x), graphSe.ConvertYgToYpx(pt.y)), graphSe.handleRadius);
            pe.strokeColor = graphSe.handleColor;
            pe.strokeWidth = 1;
        }

        ////SWG - 199 Changes
        if (graphSe.mode.includes("incorrect")) {
            var nn = Number(graphSe.mode.charAt(9));
            if (this.deletedFrom != undefined && this.deletedFrom[nn] != undefined) {
                ps.visible = false;
                if (pe) pe.visible = false; ////SWG - 295 Changes

            }
            else {
                ps.visible = true;
                if (pe) pe.visible = true; ////SWG - 295 Changes
            }
        }
        else {
            ps.visible = true;
            if (pe) pe.visible = true; ////SWG - 295 Changes
        }
    }

    this.SnapMe = function () {
        this.sxsg = graphSe.SnapX(this.xsg);
        this.sysg = graphSe.SnapY(this.ysg);
        this.sxeg = graphSe.SnapX(this.xeg);
        this.syeg = graphSe.SnapY(this.yeg);
    }

    this.AddEndPt = function (xxe, yye, done) {
        this.xeg = graphSe.ConvertXpxToXg(xxe);
        this.yeg = graphSe.ConvertYpxToYg(yye);

        this.sxeg = graphSe.SnapX(this.xeg);
        this.syeg = graphSe.SnapY(this.yeg);

        this.UnitMe();
        this.UnitNormal();

        if (graphSe.mode.substring(0, 9) == "incorrect") this.IncorrectMe();
        if (graphSe.mode == "correct") this.CorrectMe();
        //if( graphSe.mode == "student" && done )
        //    { if( !this.CheckIsCorrect("drawing") ) this.CheckIsIncorrect("drawing"); }
        //this.CheckIsCorrect( "drawing" );

        this.SetSettings();
    }

    this.PathMe = function () {
        this.path = new paper.Path();

        var xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
        var yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
        var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
        var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

        this.path.add(new paper.Point(xspx, yspx));
        this.path.add(new paper.Point(xepx, yepx));
    }

    this.HitMe = function (pxy, tol) {
        var hitCp = false;
        var xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
        var yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
        var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
        var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

        if (tol == undefined) tol = 4;

        var a = new paper.Point(xspx, yspx);
        var b = new paper.Point(xepx, yepx);
        var p = new paper.Point(pxy.x, pxy.y);
        var ab = b.subtract(a).length;
        var ap = p.subtract(a).length;
        var pb = b.subtract(p).length;

        //var onLine = Math.abs(ab - ap - pb) < tol;
        //SWG_409 changes start
        var mypt = new paper.Path.Circle(new paper.Point(pxy.x, pxy.y), 4);
        this.PathMe();
        var onLine = this.path.getIntersections(mypt);
        //SWG_409 changes end
        //paper.settings.hitTolerance = graphSe.handleRadius;
        //var onLine = this.path.hitTest(p) != null
        //paper.settings.hitTolerance = 0;
        if (!onLine) {
            var xsg = graphSe.snapIt ? this.sxsg : this.xsg;
            var ysg = graphSe.snapIt ? this.sysg : this.ysg;
            var xeg = graphSe.snapIt ? this.sxeg : this.xeg;
            var yeg = graphSe.snapIt ? this.syeg : this.yeg;

            hitCp = graphSe.HitPt(pxy, xsg, ysg, graphSe.handleRadius) ||
                graphSe.HitPt(pxy, xeg, yeg, graphSe.handleRadius);
        }

        return onLine || hitCp;
    }

    this.MoveMe = function (type, dx, dy) {
        if (type == "start" || type == "all") {
            this.xsg -= dx;
            this.ysg -= dy;
        }
        if (type == "end" || type == "all") {
            this.xeg -= dx;
            this.yeg -= dy;
        }
        // if (graphSe.mode == "designer" && this.interactive) {
        //     this.GhostMe();
        //     this.posMoved = true;
        // }
        // else {
        //     this.posMoved = false;
        // }
        this.SnapMe();
    }

    this.ControlMe = function (tf) {
        this.showControl = tf;
    }

    // shouldstartDrag only comes form vritual clickElement function
    this.DragMe = function (mpt, drgSt, shouldstartDrag) {
        if (drgSt != undefined) this.dragState = drgSt;
        switch (this.dragState) {
            case "off":
                if (graphSe.boo && this.interactive && !this.ghost && graphSe.mode != "student") this.GhostMe();
                dragObj = this;
                this.dragstart = mpt;
                this.dragDxDy = { dx: 0, dy: 0 };
                var pts = graphSe.snapIt ? { x: this.sxsg, y: this.sysg } : { x: this.xsg, y: this.ysg };
                var pte = graphSe.snapIt ? { x: this.sxeg, y: this.syeg } : { x: this.xeg, y: this.yeg };
                if (graphSe.HitPt(mpt, pts.x, pts.y, graphSe.handleRadius) && !this.locked) {
                    if (shouldstartDrag == undefined)
                        this.dragState = "dragStart";
                    //SWG-248 changes
                    if (this.mode != graphSe.mode)
                        this.dragState = "dragLine";
                    // //Shashikant:Added lines to fix SWG-43
                    // for (var i = 0; i < graphMe.length; i++) {
                    //     if (graphMe[i].mode == "designer" && graphMe[i].label == dragObj.label && shouldstartDrag == undefined && graphSe.mode != "designer")
                    //         this.dragState = "dragLine";
                    // }
                } else if (graphSe.HitPt(mpt, pte.x, pte.y, graphSe.handleRadius) && !this.locked) {
                    this.dragState = "dragEnd";
                    //SWG-248 changes
                    // //Shashikant:Added lines to fix SWG-43
                    // for (var i = 0; i < graphMe.length; i++) {
                    //     if (graphMe[i].mode == "designer" && graphMe[i].label == dragObj.label && graphSe.mode != "designer")
                    //         this.dragState = "dragLine";
                    // }
                    if (this.mode != graphSe.mode)
                        this.dragState = "dragLine";
                }
                else this.dragState = "dragLine";
                this.SetElementPoints();

                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect2") this.SetCorrectPoints();
                //if(graphSe.mode=="correct") Precise(true);
                if (graphSe.mode == "student") this.studentdrag = true;
                if (this.taelement != "None") {
                    this.trackSegment = {};
                    var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                    if (tracToElement.what == 'poly') {
                        var intersection = (tracToElement.path).getIntersections(this.path);
                        for (var i = 0; i < tracToElement.path.segments.length; i++) {

                        }
                    }
                }
                this.CalculateSlope();
                this.UpdateSlope();
                this.SetSettings();
                break;

            case "dragStart":
                //if( graphSe.boo && !this.ghost ) this.GhostMe( );

                var dsxg = graphSe.ConvertXpxToXg(this.dragstart.x) - graphSe.ConvertXpxToXg(mpt.x);
                var dsyg = graphSe.ConvertYpxToYg(this.dragstart.y) - graphSe.ConvertYpxToYg(mpt.y);
                this.xsg -= dsxg;
                this.ysg -= dsyg;
                if (this.mode == 'student') {//SWG_426 changes
                    this.xsg = this.xsg < graphSe.xmin ? graphSe.xmin : (this.xsg > graphSe.xmax ? graphSe.xmax : this.xsg);//SWG_426 changes
                    this.ysg = this.ysg < graphSe.ymin ? graphSe.ymin : (this.ysg > graphSe.ymax ? graphSe.ymax : this.ysg);//SWG_426 changes
                }
                //Changes for SWG-47 By Akash
                this.SnapMe();
                if (graphSe.mode == "designer" && this.ghost != undefined) {
                    this.ghost.xsg = this.xsg;
                    this.ghost.ysg = this.ysg;
                    this.ghost.sxsg = this.sxsg;
                    this.ghost.sysg = this.sysg;
                }
                //this.SnapMe();
                //End of changes SWG-47
                this.SetElementPoints();
                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect2") this.SetCorrectPoints();
                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx += dsxg, dy: this.dragDxDy.dy += dsyg };
                this.dragPt = "start"
                this.CalculateSlope();
                this.UpdateSlope();
                this.SetSettings();
                break;

            case "dragEnd":
                //if( graphSe.boo && !this.ghost ) this.GhostMe( );
                var dsxg = graphSe.ConvertXpxToXg(this.dragstart.x) - graphSe.ConvertXpxToXg(mpt.x);
                var dsyg = graphSe.ConvertYpxToYg(this.dragstart.y) - graphSe.ConvertYpxToYg(mpt.y);
                this.xeg -= dsxg;
                this.yeg -= dsyg;
                if (this.mode == 'student') {//SWG_426 changes
                    this.xeg = this.xeg < graphSe.xmin ? graphSe.xmin : (this.xeg > graphSe.xmax ? graphSe.xmax : this.xeg);//SWG_426 changes
                    this.yeg = this.yeg < graphSe.ymin ? graphSe.ymin : (this.yeg > graphSe.ymax ? graphSe.ymax : this.yeg);//SWG_426 changes
                }
                //Changes for SWG-47 By Akash
                this.SnapMe();
                if (graphSe.mode == "designer" && this.ghost != undefined) {
                    this.ghost.xeg = this.xeg;
                    this.ghost.yeg = this.yeg;
                    this.ghost.sxeg = this.sxeg;
                    this.ghost.syeg = this.syeg;
                }
                //this.SnapMe();
                //End of changes SWG-47
                this.SetElementPoints();
                //Swg-128 Changes
                if (graphSe.mode == "student") {
                    this.upadeteStudLabelPossitiopn();
                }
                //Swg-128 Changes end
                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect2") this.SetCorrectPoints();
                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx += dsxg, dy: this.dragDxDy.dy += dsyg };
                this.dragPt = "end";
                this.CalculateSlope();
                this.UpdateSlope();
                this.SetSettings();
                break;

            case "dragLine":
                var dsxg = graphSe.ConvertXpxToXg(mpt.x) - graphSe.ConvertXpxToXg(this.dragstart.x);
                var dsyg = graphSe.ConvertYpxToYg(mpt.y) - graphSe.ConvertYpxToYg(this.dragstart.y);
                if ((this.elementlabel == "PPF") && this.IsPPF()) {
                    var xs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                    var ys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                    var xe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                    var ye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

                    if (xs <= 3) {
                        this.ysg += dsxg * this.unPx[1];
                        this.xeg -= dsxg * this.unPx[2];
                    } else {
                        this.yeg -= dsxg * this.unPx[1];
                        this.xsg += dsxg * this.unPx[2];
                    }
                } else {
                    if (this.taelement != "None") {
                        var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                        if (tracToElement != undefined) {
                            if (tracToElement.what == 'poly' && this.mo != undefined) {
                                if (this.mo.indexOf('-') != -1) {
                                    dsxg = dsxg * (-1);
                                    dsyg = dsyg * (-1);
                                }
                            }
                            var minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                            var maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                            var minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                            var maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                            this.TrackAlong();
                            var s = this.Track(dsxg);
                            var s1 = this.Track(dsyg);
                            //Chage for SWG-22(12-07-2017) - By Akash
                            if (((minX == maxX) || (minY == maxY)) && (minX != undefined && maxX != undefined && minY != undefined && maxY != undefined)) {
                                if (minX == maxX) {
                                    dsxg = 0;
                                    dsyg = tracToElement.sysg < tracToElement.syeg ? (s1.sy) * (-1) : s1.sy; //For Prod QID:30808
                                }
                                else {
                                    dsxg = s.sx;
                                    dsyg = 0;
                                }
                            }
                            else {
                                dsxg = s1.sx;
                                dsyg = s1.sy;
                                //Changes for Line tracking against the line when x-increment >= 5
                                var yincrement = 1;
                                var xincrement = 1;
                                if (document.getElementById('yinc') != undefined) yincrement = document.getElementById('yinc').value;
                                if (document.getElementById('xinc') != undefined) xincrement = document.getElementById('xinc').value;
                                //End of changes for Line tracking against the line when x-increment >= 5
                                if (parseFloat(tracToElement.m) < 0) {
                                    //Changed if condition for Line tracking against the line when x-increment >= 5
                                    if (parseFloat(tracToElement.m) >= -0.70 && yincrement <= xincrement) {
                                        dsxg = s.sx;
                                        dsyg = s.sy;
                                    }
                                    else {
                                        dsxg *= -1;
                                        dsyg *= -1;
                                    }
                                }
                                else {
                                    //Changed if condition for Line tracking against the line when x-increment >= 5
                                    if ((parseFloat(tracToElement.m) <= 0.70 && yincrement <= xincrement) || (parseFloat(tracToElement.m) < 0.15 && yincrement > xincrement)) {
                                        dsxg = s.sx;
                                        dsyg = s.sy;
                                    }
                                }
                                //Changes for Line tracking against the line when x-increment >= 5
                                if (xincrement > yincrement) {
                                    dsxg = (xincrement > yincrement) ? s.sx : s1.sx;
                                    dsyg = (xincrement > yincrement) ? s.sy : s1.sy;
                                }
                                //End of changes for Line tracking against the line when x-increment >= 5
                            }
                            //End chage for SWG-22(12-07-2017)
                            if (tracToElement.what == 'curve' || tracToElement.what == 'poly') {
                                var dX = (mpt.x - this.path.position.x);
                                var dY = (mpt.y - this.path.position.y);
                                this.path.position.x += dX;
                                this.path.position.y += dY;
                                dsxg = graphSe.ConvertXpxToXg(dX);
                                dsyg = graphSe.ConvertYpxToYg(dY);
                                if (tracToElement.what == 'curve') {
                                    var nearestPoint = tracToElement.myPath.getNearestPoint(this.path.position.x, this.path.position.y);
                                    this.path.position.x = nearestPoint.x;
                                    this.path.position.y = nearestPoint.y;
                                    this.xsg = graphSe.ConvertXpxToXg(this.path.segments[0].point.x);
                                    this.ysg = graphSe.ConvertYpxToYg(this.path.segments[0].point.y);
                                    this.xeg = graphSe.ConvertXpxToXg(this.path.segments[1].point.x);
                                    this.yeg = graphSe.ConvertYpxToYg(this.path.segments[1].point.y);
                                }

                                if (tracToElement.what == 'poly') {
                                    var intersections = (tracToElement.path).getIntersections(this.path);
                                    if (intersections[0] != undefined) {
                                        this.path.position.x = intersections.length > 1 ? intersections[1].point.x : intersections[0].point.x;
                                        this.path.position.y = intersections.length > 1 ? intersections[1].point.y : intersections[0].point.y;
                                        this.xsg = graphSe.ConvertXpxToXg(this.path.segments[0].point.x);
                                        this.ysg = graphSe.ConvertYpxToYg(this.path.segments[0].point.y);
                                        this.xeg = graphSe.ConvertXpxToXg(this.path.segments[1].point.x);
                                        this.yeg = graphSe.ConvertYpxToYg(this.path.segments[1].point.y);
                                    }
                                }
                            }
                            else {
                                this.xsg += dsxg;
                                this.ysg += dsyg;
                                this.xeg += dsxg;
                                this.yeg += dsyg;
                            }
                        } else {
                            //SWG_426 changes
                            if (this.mode == 'student') {
                                if ((this.xsg <= graphSe.xmin || this.xsg >= graphSe.xmax || this.xeg <= graphSe.xmin || this.xeg >= graphSe.xmax) && (this.xsg + dsxg < graphSe.xmin || this.xsg + dsxg > graphSe.xmax || this.xeg + dsxg < graphSe.xmin || this.xeg + dsxg > graphSe.xmax))
                                    return;
                                if ((this.ysg <= graphSe.ymin || this.ysg >= graphSe.ymax || this.yeg <= graphSe.ymin || this.yeg >= graphSe.ymax) && (this.ysg + dsyg < graphSe.ymin || this.ysg + dsyg > graphSe.ymax || this.yeg + dsyg < graphSe.ymin || this.yeg + dsyg > graphSe.ymax))
                                    return;
                            }
                            //SWG_426 changes end
                            this.xsg += dsxg;
                            this.ysg += dsyg;
                            this.xeg += dsxg;
                            this.yeg += dsyg;
                        }
                    }
                    else {
                        //SWG_426 changes
                        if (this.mode == 'student') {
                            if ((this.xsg <= graphSe.xmin || this.xsg >= graphSe.xmax || this.xeg <= graphSe.xmin || this.xeg >= graphSe.xmax) && (this.xsg + dsxg < graphSe.xmin || this.xsg + dsxg > graphSe.xmax || this.xeg + dsxg < graphSe.xmin || this.xeg + dsxg > graphSe.xmax))
                                return;
                            if ((this.ysg <= graphSe.ymin || this.ysg >= graphSe.ymax || this.yeg <= graphSe.ymin || this.yeg >= graphSe.ymax) && (this.ysg + dsyg < graphSe.ymin || this.ysg + dsyg > graphSe.ymax || this.yeg + dsyg < graphSe.ymin || this.yeg + dsyg > graphSe.ymax))
                                return;
                        }
                        //SWG_426 changes end
                        this.xsg += dsxg;
                        this.ysg += dsyg;
                        this.xeg += dsxg;
                        this.yeg += dsyg;
                    }

                    this.path.smooth();
                    //var dX = (mpt.x - this.path.position.x);
                    //var dY = (mpt.y - this.path.position.y);
                    // this.path.position.x += dX;
                    // this.path.position.y += dY;
                    // this.xsg = graphSe.ConvertXpxToXg(this.path.segments[0].point.x);
                    // this.ysg = graphSe.ConvertYpxToYg(this.path.segments[0].point.y);
                    // this.xeg = graphSe.ConvertXpxToXg(this.path.segments[1].point.x);
                    // this.yeg = graphSe.ConvertYpxToYg(this.path.segments[1].point.y);
                }
                if (this.mode == 'student') {//SWG_426 changes
                    this.xsg = this.xsg < graphSe.xmin ? graphSe.xmin : (this.xsg > graphSe.xmax ? graphSe.xmax : this.xsg);//SWG_426 changes
                    this.ysg = this.ysg < graphSe.ymin ? graphSe.ymin : (this.ysg > graphSe.ymax ? graphSe.ymax : this.ysg);//SWG_426 changes
                    this.xeg = this.xeg < graphSe.xmin ? graphSe.xmin : (this.xeg > graphSe.xmax ? graphSe.xmax : this.xeg);//SWG_426 changes
                    this.yeg = this.yeg < graphSe.ymin ? graphSe.ymin : (this.yeg > graphSe.ymax ? graphSe.ymax : this.yeg);//SWG_426 changes
                }
                this.SnapMe();

                this.SetElementPoints();
                //Swg-128 Changes
                if (graphSe.mode == "student") {
                    this.upadeteStudLabelPossitiopn();
                }
                //Swg-128 Changes end
                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect2") this.SetCorrectPoints();


                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx -= dsxg, dy: this.dragDxDy.dy -= dsyg };
                this.dragPt = "all";
                break;
            case "drop":
                dragObj = null;
                //Added to shift object again when come back from correct tab to designe and move the object - By Akash
                if (graphSe.mode == "designer" && this.interactive) {
                    this.posMoved = true;
                }
                else {
                    this.posMoved = false;
                }
                if (this.taelement != "None") this.TrackAlong(this.taelement);
                this.dragState = "off";
                this.dragStart = null;
                if (this.dragDxDy.dx != 0 || this.dragDxDy.dy != 0) {
                    this.SetElementPoints();
                    if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect2") this.SetCorrectPoints();
                    if (graphSe.mode == "correct" || graphSe.mode.substring(0, 9) == "incorrect") this.PreciseMe(true);
                    graphSe.OpsMoveElement(this, this.dragPt, -this.dragDxDy.dx, -this.dragDxDy.dy);
                    if (graphSe.mode.substring(0, 9) == "incorrect") this.IncorrectMe();
                    if (graphSe.mode == "correct") this.CorrectMe();
                    //if( graphSe.mode == "student" )
                    //    { if( !this.CheckIsCorrect( ) ) this.CheckIsIncorrect( ); }
                    //this.CheckIsCorrect( );
                    if (graphSe.mode == "designer" && this.interactive) {
                        this.GhostMe();
                        this.UpdateIncorrects();
                    }
                    if (graphSe.mode == "designer" && this.interactive && this.correct[0] != null)
                        this.CorrectMe(this.correct[0].type);
                }
                this.CalculateSlope();
                this.UpdateSlope();
                this.SetSettings();
                break;
        }
    }
    //Swg-128 Changes
    this.upadeteStudLabelPossitiopn = function () {
        var selectObje = $('#' + this.studentlabelid);
        if (selectObje) {
            if ($(selectObje).children().attr('data-uniqueid') == this.uniqueLabel) {
                var pt = graphSe.snapIt ? { x: this.sxeg, y: this.syeg } : { x: this.xeg, y: this.yeg };
                spt = graphSe.snapIt ? { x: this.sxsg, y: this.sysg } : { x: this.xsg, y: this.ysg };

                var xoffset = 0;
                var yoffset = 0;

                pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
                pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
                spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
                spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

                var d = 20;

                var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
                var newx = pt.x + d * (pt.x - spt.x) / mag
                var newy = pt.y + d * (pt.y - spt.y) / mag

                var left = newx + 37 + 'px';
                var top = newy + 179 + 'px';

                ///SWG-221 Changes
                if (graphSe.titleshow && graphSe.title != "") top = newy + 158 + 'px';
                else top = newy + 105 + 'px';
                ////SWG-221 Changes end

                $('#' + this.studentlabelid).css('left', left);
                $('#' + this.studentlabelid).css('top', top);
            }
        }
    }
    //For Line
    this.CorrectMe = function (type) {
        var aa = type != undefined ? type[1] == "area" : false;
        //changes to shift object again when come back from correct tab to designe and move the object - By Akash
        if ((type != undefined) && (type[1] == 'left' || type[1] == 'right' || type[1] == 'up' || type[1] == 'down' || type[1] == 'inward' || type[1] == 'outward') && (this.posMoved || this.isshiftdirectionchanged) && graphSe.mode == "correct") { ////SWG-457 Changes
            var shifValue = (type[1] == 'left' || type[1] == 'down' || type[1] == 'inward') ? -2 : 2; ////SWG-457 Changes
            var yincrement = 1;
            var xincrement = 1;
            if (document.getElementById('yinc') != undefined) yincrement = document.getElementById('yinc').value;
            if (document.getElementById('xinc') != undefined) xincrement = document.getElementById('xinc').value;
            if (type[1] == 'left' || type[1] == 'right') {
                this.sxsg = this.ghost.sxsg + (shifValue * xincrement);
                this.xsg = this.ghost.xsg + (shifValue * xincrement);
                this.sxeg = this.ghost.sxeg + (shifValue * xincrement);
                this.xeg = this.ghost.xeg + (shifValue * xincrement);
                this.leftCoordinatesUpdated = type[1] == 'left' ? true : undefined;
                this.rightCoordinatesUpdated = type[1] == 'right' ? true : undefined;
            }
            if (type[1] == 'up' || type[1] == 'down') {

                this.ysg = this.ghost.ysg + (shifValue * yincrement);
                this.yeg = this.ghost.yeg + (shifValue * yincrement);

                this.SnapMe(); ////SWG-457 Changes

                this.upCoordinatesUpdated = type[1] == 'up' ? true : undefined;
                this.downCoordinatesUpdated = type[1] == 'down' ? true : undefined;
            }

            ////SWG-457 Changes
            if (type[1] == 'inward' || type[1] == 'outward') {
                this.xeg = this.ghost.xeg + (shifValue * xincrement);
                this.ysg = this.ghost.ysg + (shifValue * yincrement);

                this.SnapMe();

                this.inwardCoordinatesUpdated = type[1] == 'inward' ? true : undefined;
                this.outwardCoordinatesUpdated = type[1] == 'outward' ? true : undefined;
            }
            ////SWG-457 Changes end

            this.posMoved = false;
            this.isshiftdirectionchanged = false; ////SWG-457 Changes
            var gh = this.ghost;
            this.originalCoordinates = { sxsg: gh.sxsg, sysg: gh.sysg, sxeg: gh.sxeg, syeg: gh.syeg, xsg: gh.xsg, ysg: gh.ysg, xeg: gh.xeg, yeg: gh.yeg };
        }
        if (type == undefined) {
            this.posMoved = false;
            this.isshiftdirectionchanged = false; ////SWG-457 Changes
        }
        //changes to shift object again when come back from correct tab to designe and move the object end
        //this.correct[0] = {}; ////SWG-357 Changes
        if (this.relementlabel != "Accepted Area") {
            this.correct[0] = {
                type: type == undefined ? "precise" : type,
                lbl: aa ? this.correct[0].lbl : this.label,
                uniqueLabel: aa ? this.correct[0].uniqueLabel : this.uniqueLabel, ////SWG-357 Changes
                xsg: this.xsg,
                ysg: this.ysg,
                xeg: this.xeg,
                yeg: this.yeg,
                sxsg: this.sxsg,
                sysg: this.sysg,
                sxeg: this.sxeg,
                syeg: this.syeg,
                match: false
            };
        }
    }

    this.IncorrectMe = function (ca, nn, type) {
        var n = nn == undefined ? Number(graphSe.mode[9]) : nn;
        var ca = ca == undefined ? this : ca;
        var lbl = ca == this ? ca.label : ca.lbl;
        var uniqueLabel = ca.uniqueLabel;
        this.incorrect[n] = {
            nn: n,
            type: type == undefined ? "precise" : type,
            lbl: lbl,
            uniqueLabel: uniqueLabel,
            ckeText: graphSe.ckeText[n],
            xsg: ca.xsg,
            ysg: ca.ysg,
            xeg: ca.xeg,
            yeg: ca.yeg,
            sxsg: ca.sxsg,
            sysg: ca.sysg,
            sxeg: ca.sxeg,
            syeg: ca.syeg,
            match: false
        };

        if (graphSe.incorrectActive[n] == false) this.preciseinc[n] = this.precise;
    }

    this.UpdateIncorrects = function () {
        for (var i = 1; i < 4; i++) {
            if (this.incorrect[i] != null) {
                if (this.incorrect[i].type[0] == "relative") this.IncorrectMe(undefined, i, this.incorrect[i].type);
            }
        }
    }
    //for Line
    this.CheckIsCorrect = function (mode, answer) {
        var tst;
        var labelcorrect = true;
        var correct, nn;
        var ca;

        if (answer == undefined) correct = this.correct[0]
        else {
            correct = answer;
            nn = correct.nn
        }

        if (correct != undefined && mode == undefined) {
            var typ = correct.type;
            var area = (typ != undefined) && (typ.length == 3);
            if (typ == "precise" || typ == undefined || area) {
                ca = correct;
                var pxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                var pys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                var pxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                var pye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                switch (ca.lbl[0]) {
                    case 'L':
                        var cxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxsg : ca.xsg);
                        var cys = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.sysg : ca.ysg);
                        var cxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxeg : ca.xeg);
                        var cye = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syeg : ca.yeg);
                        var dxs = pxs - cxs;
                        var dys = pys - cys;
                        var dxe = pxe - cxe;
                        var dye = pye - cye;

                        var ds = Math.sqrt(dxs * dxs + dys * dys);
                        var de = Math.sqrt(dxe * dxe + dye * dye);

                        var dxsr = pxs - cxe;
                        var dysr = pys - cye;
                        var dxer = pxe - cxs;
                        var dyer = pye - cys;

                        var dsr = Math.sqrt(dxsr * dxsr + dysr * dysr);
                        var der = Math.sqrt(dxer * dxer + dyer * dyer);

                        ds = Math.min(ds, dsr);
                        de = Math.min(de, der);

                        tst = ds < this.correctTolerance && de < this.correctTolerance;

                        //tst = !tst ? this.FindMatch( ) : tst;
                        break;
                    case 'A':
                        //SWG-64 changes
                        //var aao = graphSe.FindInGraph(ca.lbl);
                        var aao = graphSe.FindInGraph(ca.uniqueLabel != undefined ? ca.uniqueLabel : ca.lbl);
                        aao.PathMe();
                        tst = aao.path.contains(new paper.Point(pxs, pys)) &&
                            aao.path.contains(new paper.Point(pxe, pye));
                        break;

                    default:
                        tst = false;
                        break;
                }
            } else if (typ.length == 2) {
                var ca = this;
                var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxsg : ca.xsg);
                var cpy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.sysg : ca.ysg);
                var cpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxeg : ca.xeg);
                var cpye = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syeg : ca.yeg);

                rele = graphSe.FindInGraph(nn == undefined ? this.relementlabel : this.relementlabelinc[nn]);

                if (rele instanceof Line) {
                    if (rele == this) rele = correct;

                    // hack to replace correct position with original coordinates
                    if (this.originalCoordinates !== undefined && this.originalCoordinates !== null) {
                        rele.sxeg = this.ghost.sxeg;
                        rele.xeg = this.ghost.xeg;
                        rele.sxsg = this.ghost.sxsg;
                        rele.xsg = this.ghost.xsg;

                        ////INT - issue 56978
                        rele.syeg = this.ghost.syeg;
                        rele.yeg = this.ghost.yeg;
                        rele.sysg = this.ghost.sysg;
                        rele.ysg = this.ghost.ysg;
                        ////INT - issue 56978 end
                    }

                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxsg : rele.xsg);
                    var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? rele.sysg : rele.ysg);
                    var xpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxeg : rele.xeg);
                    var ypxe = graphSe.ConvertYgToYpx(graphSe.snapIt ? rele.syeg : rele.yeg);

                    var lfrt = typ[1];
                    if (lfrt == "left" || lfrt == "right") {
                        var s = new paper.Point(xpx, ypx);
                        var e = new paper.Point(xpxe, ypxe);
                        var cs = new paper.Point(cpx, cpy);
                        var ce = new paper.Point(cpxe, cpye);

                        var dxs = cs.x - s.x;
                        var dys = cs.y - s.y;
                        var dxe = ce.x - e.x;
                        var dye = ce.y - e.y;
                        var dds = Math.sqrt(dxs * dxs + dys * dys);
                        var dde = Math.sqrt(dxe * dxe + dye * dye);

                        var dxsr = ce.x - s.x;
                        var dysr = ce.y - s.y;
                        var dxer = cs.x - e.x;
                        var dyer = cs.y - e.y;
                        var drs = Math.sqrt(dxsr * dxsr + dysr * dysr);
                        var dre = Math.sqrt(dxer * dxer + dyer * dyer);

                        if ((dds > drs) && (dde > dre)) {
                            dxs = dxsr;
                            dxe = dxer;
                        }

                        //var ptLeft = this.IsPtLeft( xpx, ypx );
                        //console.log( this.m, ptLeft );

                        var isLeft = false,
                            isRight = false,
                            isEqual = false;
                        //Changes for SWG-37 - By Akash
                        if (this.m == '0.00' || this.m == 'Infinity' || (dxs != 0 && dxe != 0)) {
                            if ((dxs < 0) && (dxe < 0)) isLeft = true;
                            else if ((dxs > 0) && (dxe > 0)) isRight = true;
                            else isEqual = true;
                        }
                        else {
                            if (lfrt == "left" && (dxs == 0 || dxe == 0) && (dys > 0 || dye > 0) && this.m.indexOf('-') != -1) {
                                isLeft = true;
                            }
                            else if (lfrt == "right" && (dxs == 0 || dxe == 0) && (dys < 0 || dye < 0) && this.m.indexOf('-') != -1) {
                                isRight = true;
                            }
                            else if (lfrt == "left" && (dxs == 0 || dxe == 0) && (dys < 0 || dye < 0) && this.m.indexOf('-') == -1) {
                                isLeft = true;
                            }
                            else if (lfrt == "right" && (dxs == 0 || dxe == 0) && (dys > 0 || dye > 0) && this.m.indexOf('-') == -1) {
                                isRight = true;
                            }
                            else {
                                isEqual = true;
                            }
                        }
                        //End changes for SWG-37
                        if (lfrt == "left" && isLeft) tst = true;
                        else if (lfrt == "right" && isRight) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        var relep;
                        if (rele == correct) {
                            relep = new paper.Path();
                            relep.add(new paper.Point(xpx, ypx));
                            relep.add(new paper.Point(xpxe, ypxe));
                        } else {
                            rele.PathMe();
                            relep = rele.path.clone();
                        }
                        relep.add(new paper.Point(0, graphSe.htPx));
                        relep.closed = true;

                        var isInside = relep.contains(new paper.Point(cpx, cpy)) &&
                            relep.contains(new paper.Point(cpxe, cpye));

                        var isOff = (relep.hitTest(new paper.Point(cpx, cpy)) == null) &&
                            (relep.hitTest(new paper.Point(cpxe, cpye)) == null)

                        if (lfrt == "inward" && isInside && isOff) tst = true;
                        else if (lfrt == "outward" && !isInside && isOff) tst = true;
                        else tst = false;
                    } else if (lfrt == "up" || lfrt == "down") {
                        ////SWG-457 Changes Changes
                        var gh = this.ghost;
                        var isUp = (graphSe.snapIt) ? (this.sysg > gh.sysg && this.syeg > gh.syeg) : (this.ysg > gh.ysg && this.yeg > gh.yeg);
                        var isDwn = (graphSe.snapIt) ? (this.sysg < gh.sysg && this.syeg < gh.syeg) : (this.ysg < gh.ysg && this.yeg < gh.yeg);
                        ////SWG-457 Changes Changes  end

                        if (lfrt == "up" && isUp) tst = true;
                        else if (lfrt == "down" && isDwn) tst = true;
                        else tst = false;
                    }
                } else if (rele instanceof Point) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxg : rele.xg);
                    var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? rele.syg : rele.yg);
                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                    var cpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);

                    var lfrt = typ[1];
                    if (lfrt == "left" && cpx < xpx && cpxe < xpx) tst = true;
                    else if (lfrt == "right" && cpx > xpx && cpxe > xpx) tst = true;
                    else tst = false;
                } else if (rele instanceof Curve) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[0] : rele.pts[0]);
                    var xpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[4] : rele.pts[4]);
                    if (xpxe < xpx) {
                        var t = xpx;
                        xpx = xpxe;
                        xpxe = t;
                    }
                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                    var cpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);

                    var r = rele.SwapPoints();
                    var c = ca.SwapPoints();

                    var lfrt = typ[1];
                    if (lfrt == "left" || lfrt == "right") {
                        if (lfrt == "left" && cpx < xpx && cpxe < xpx) tst = true;
                        else if (lfrt == "right" && cpx > xpxe && cpxe > xpxe) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        var relep;
                        rele.PathMe();
                        relep = rele.path.clone();
                        relep.add(new paper.Point(0, graphSe.htPx));
                        relep.closed = true;

                        var isInside = relep.contains(new paper.Point(cpx, cpy)) &&
                            relep.contains(new paper.Point(cpxe, cpye));

                        var isOff = (relep.hitTest(new paper.Point(cpx, cpy)) == null) &&
                            (relep.hitTest(new paper.Point(cpxe, cpye)) == null)

                        if (lfrt == "inward" && isInside && isOff) tst = true;
                        else if (lfrt == "outward" && !isInside && isOff) tst = true;
                        else tst = false;
                    } else if (lfrt == "up" || lfrt == "down") {
                        var isUp = c.ys > r.ys && c.ye > r.ye;
                        var isDwn = c.ys < r.ys && c.ye < r.ye;
                        if (lfrt == "up" && isUp) tst = true;
                        else if (lfrt == "down" && isDwn) tst = true;
                        else tst = false;
                    }

                } else if (rele instanceof Polyline) {
                    for (var i = 0, ln = rele.pts.length - 2, xmn = 10000, xmx = 0; i < ln; i += 2) {
                        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[i] : rele.pts[i]);
                        if (xpx < xmn) xmn = xpx;
                        else if (xpx > xmx) xmx = xpx;
                    }

                    var cpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                    var cpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);


                    var lfrt = typ[1];
                    if (lfrt == "left" && cpx < xmn && cpxe < xmn) tst = true;
                    else if (lfrt == "right" && cpx > xmx && cpxe > xmx) tst = true;
                    else tst = false;
                }

            }
        } else if (mode == "drawing" || mode == undefined) {
            //var gimode = answer == undefined ? "correct" : "incorrect" + answer.nn;
            for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
                var gi = graphMe[i];
                if (gi instanceof Line && this != gi) {
                    var giCorrect = gi.mode == "correct";
                    var giIncorrect = gi.mode.indexOf("incorrect") != -1;

                    if ((giCorrect || giIncorrect) && gi.what == this.what) {
                        if (answer != undefined) correct = answer;
                        else if (giCorrect) correct = gi.correct[0];
                        else if (giIncorrect) {
                            nn = Number(gi.mode[9]);
                            correct = gi.incorrect[nn];
                        }

                        ca = correct;
                        var pxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                        var pys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                        var pxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                        var pye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                        var cxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxsg : ca.xsg);
                        var cys = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.sysg : ca.ysg);
                        var cxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxeg : ca.xeg);
                        var cye = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syeg : ca.yeg);

                        var dxs = pxs - cxs;
                        var dys = pys - cys;
                        var dxe = pxe - cxe;
                        var dye = pye - cye;

                        var ds = Math.sqrt(dxs * dxs + dys * dys);
                        var de = Math.sqrt(dxe * dxe + dye * dye);

                        var dxsr = pxs - cxe;
                        var dysr = pys - cye;
                        var dxer = pxe - cxs;
                        var dyer = pye - cys;

                        var dsr = Math.sqrt(dxsr * dxsr + dysr * dysr);
                        var der = Math.sqrt(dxer * dxer + dyer * dyer);

                        ds = Math.min(ds, dsr);
                        de = Math.min(de, der);

                        tst = ds < this.correctTolerance && de < this.correctTolerance;

                        //ca.match = tst;

                        if (tst) correct.match = { match: tst };

                    }
                }
            }
        }

        var correctgraph = tst;
        //SWG-64 changes - Akash
        if (!this._correctObj)
            this._correctObj = {};
        if (correctgraph) {
            this._correctObj.objCorrect = true;
        }
        //SWG-64 changes end
        if (this.mode != "student") var cc = this;
        //SWG-64 changes
        //else var cc = graphSe.FindInGraph(ca.lbl);
        else var cc = graphSe.FindInGraph(ca.uniqueLabel != undefined ? ca.uniqueLabel : ca.lbl);

        var requiredlabel = nn == undefined ? cc.requiredlabel : cc.requiredlabelinc[nn];
        if (requiredlabel) {
            var correctlabel = nn == undefined ? cc.correctlabel : (cc.correctlabelinc[nn] == "b" ? "None" : cc.correctlabelinc[nn]);
            labelcorrect = correctlabel == (this.studentcorrectlabel == "a" ? "None" : this.studentcorrectlabel);
            //SWG-64 changes - Akash
            if ((this.studentcorrectlabel == undefined || this.studentcorrectlabel == "a") && correctgraph && !labelcorrect) {
                this._correctObj.isLabelMissed = true;
            }
            //SWG-64 changes end
        }

        var allCorrect = correctgraph && labelcorrect;

        if (answer == undefined && correct != undefined) correct.match = allCorrect;

        return allCorrect;
    }

    this.IsPtLeft = function (ctx, cty) {
        var pxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
        var pys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
        var pxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
        var pye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

        return Math.sign((pxe - pxs) * (cty - pys) - (pye - pys) * (ctx - pxs));
    }

    this.FindMatch = function () {
        var correct;
        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Line) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;
                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    var pxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                    var pys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                    var pxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                    var pye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                    var cxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxsg : ca.xsg);
                    var cys = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.sysg : ca.ysg);
                    var cxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxeg : ca.xeg);
                    var cye = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syeg : ca.yeg);
                    var dxs = pxs - cxs;
                    var dys = pys - cys;
                    var dxe = pxe - cxe;
                    var dye = pye - cye;

                    tst = Math.sqrt(dxs * dxs + dys * dys) < this.correctTolerance &&
                        Math.sqrt(dxe * dxe + dye * dye) < this.correctTolerance
                }
            }
        }

        return tst;
    }

    this.FindMatchObject = function () {
        var correct;
        var finalobject = null;

        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Line) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;
                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    var pxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
                    var pys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
                    var pxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
                    var pye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);
                    var cxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxsg : ca.xsg);
                    var cys = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.sysg : ca.ysg);
                    var cxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.sxeg : ca.xeg);
                    var cye = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.syeg : ca.yeg);
                    var dxs = pxs - cxs;
                    var dys = pys - cys;
                    var dxe = pxe - cxe;
                    var dye = pye - cye;

                    tst = Math.sqrt(dxs * dxs + dys * dys) < this.correctTolerance &&
                        Math.sqrt(dxe * dxe + dye * dye) < this.correctTolerance

                    if (tst) finalobject = gi;
                }
            }
        }

        return finalobject;
    }


    this.CheckIsIncorrect = function (mode) {
        var ninc = this.incorrect.length;

        for (var j = 0; j < graphMe.length; j++) {
            gj = graphMe[j];
            for (var i = 1, cc = 0; i < ninc; i++) {
                if (gj.incorrect[i] != null) {
                    if (this.CheckIsCorrect(mode, gj.incorrect[i])) {
                        gj.incorrect[i].match = true;
                        cc++
                    } else gj.incorrect[i].match = false;
                }
            }
        }

        if (cc == 0) this.incorrect[0] = { match: true };
    }

    this.SwapPoints = function () {
        var xs, ys, xe, ye;
        if (this.sxsg < this.sxeg) {
            xs = this.xsg;
            ys = this.ysg;
            xe = this.xeg;
            ye = this.yeg;
        } else {
            xs = this.xeg;
            ys = this.yeg;
            xe = this.xsg;
            ye = this.ysg;
        }

        return { xs: xs, ys: ys, xe: xe, ye: ye }
    }

    this.SwapCorrectPoints = function () {
        var xs, ys, xe, ye;
        if (this.correct.length > 0) {
            var t = this.correct[0];

            if (this.xsg <= this.xeg) {
                xs = t.xsg;
                ys = t.ysg;
                xe = t.xeg;
                ye = t.yeg;
            } else {
                xs = t.xeg;
                ys = t.yeg;
                xe = t.xsg;
                ye = t.ysg;
            }

            return { xs: xs, ys: ys, xe: xe, ye: ye }
        }

        return null;
    }

    this.GhostMe = function () {
        this.SnapMe();
        this.ghost = {
            clr: "darkgray",
            wd: this.width,
            xsg: this.xsg,
            ysg: this.ysg,
            sxsg: this.sxsg,
            sysg: this.sysg,
            xeg: this.xeg,
            yeg: this.yeg,
            sxeg: this.sxeg,
            syeg: this.syeg
        };
    }

    this.IncGhostMe = function (gh, nn) {
        if (gh == undefined) {
            gh = this;
            nn = Number(graphSe.mode[9]);
        }

        this.SnapMe()
        this.incGhost[nn] = {
            clr: "darkgray",
            wd: this.width,
            xsg: this.xsg,
            ysg: this.ysg,
            sxsg: this.sxsg,
            sysg: this.sysg,
            xeg: this.xeg,
            yeg: this.yeg,
            sxeg: this.sxeg,
            syeg: this.syeg
        };
    }

    this.PlumbMe = function (tf) {
        this.plumbLine = tf;
    }

    this.LabelMe = function (tf) {
        this.labelLine = tf;
    }

    this.PlumbLine = function () {
        this.PathMe();
        var ln = graphMe.length;
        for (var j = 0; j < ln; j++) {
            var gj = graphMe[j];
            if (gj == this) continue;

            if (gj instanceof Point) {
                var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? gj.sxg : gj.xg);
                var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? gj.syg : gj.yg);

                if (this.HitMe({ x: px, y: py }, .2)) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? gj.sxg : gj.xg);
                    var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? gj.syg : gj.yg);

                    var clr = 'grey';
                    DrawLine(clr, this.width, xpx, ypx, 0, ypx, [4, 4]);
                    DrawLine(clr, this.width, xpx, ypx, xpx, can.height - 3, [4, 4]);
                }

            } else if (!gj.acceptedArea) {
                gj.PathMe();
                var gii = this.path.getIntersections(gj.path);

                for (var k = 0; k < gii.length; k++) {
                    var clr = 'grey';
                    var giik = gii[k];
                    DrawLine(clr, 1, giik.point.x, giik.point.y, 0, giik.point.y, [4, 4]);
                    DrawLine(clr, 1, giik.point.x, giik.point.y, giik.point.x, can.height - 3, [4, 4]);


                    var text = new paper.PointText(new paper.Point(15, giik.point.y - 10));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertYpxToYg(giik.point.y) * 10) / 10;

                    var text = new paper.PointText(new paper.Point(giik.point.x + 14, 375));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertXpxToXg(giik.point.x) * 10) / 10
                }
            }
        }
    }

    this.checkBoxes = function () {
        if (graphSe.mode == 'correct') {
            var cbtemp = graphSe.lineCustomLabelValuesChkStatus;
        } else if (graphSe.mode == 'incorrect1') {
            var cbtemp = this.checkboxesinc1;
        } else if (graphSe.mode == 'incorrect2') {
            var cbtemp = this.checkboxesinc2;
        } else if (graphSe.mode == 'incorrect3') {
            var cbtemp = this.checkboxesinc3;
        } else {
            var cbtemp = graphSe.lineCustomLabelValuesChkStatus;
        }

        if (graphSe.mode == 'correct') {
            var cltemp = graphSe.lineCustomLabelValues;
        } else if (graphSe.mode == 'incorrect1') {
            var cltemp = this.customlabelsinc1;
        } else if (graphSe.mode == 'incorrect2') {
            var cltemp = this.customlabelsinc2;
        } else if (graphSe.mode == 'incorrect3') {
            var cltemp = this.customlabelsinc3;
        } else {
            var cltemp = graphSe.lineCustomLabelValues;
        }

        if (document.getElementById('demand').checked) { cbtemp[0] = true } else { cbtemp[0] = false };
        if (document.getElementById('fixedcost').checked) { cbtemp[1] = true } else { cbtemp[1] = false };
        if (document.getElementById('indifference').checked) { cbtemp[2] = true } else { cbtemp[2] = false };
        if (document.getElementById('marginalcost').checked) { cbtemp[3] = true } else { cbtemp[3] = false };
        if (document.getElementById('marginalrevenue').checked) { cbtemp[4] = true } else { cbtemp[4] = false };
        if (document.getElementById('ppf').checked) { cbtemp[5] = true } else { cbtemp[5] = false };
        if (document.getElementById('supply').checked) { cbtemp[6] = true } else { cbtemp[6] = false };
        if (document.getElementById('totalcost').checked) { cbtemp[7] = true } else { cbtemp[7] = false };
        if (document.getElementById('variablecost').checked) { cbtemp[8] = true } else { cbtemp[8] = false };

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str).checked) { cbtemp[8 + i + 1] = true } else { cbtemp[8 + i + 1] = false };

            //html += '<input type="checkbox" id="'+str+'" checked> '+this.customlabels[i]+'<br>'
            //this.checkboxes[i+9] = false;
        }


        this.CorrectLabelDropdown();

        //this.SetSettings();

    }

    ////Code cleanup


    this.checkBoxHTML = function () {
        var html = '';
        var cbtemp = graphSe.lineCustomLabelValuesChkStatus;
        // if (graphSe.mode == 'correct') {
        //     var cbtemp = graphSe.lineCustomLabelValuesChkStatus;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var cbtemp = this.checkboxes;
        // } else {
        //     var cbtemp = this.checkboxes;
        // }

        var cltemp = graphSe.lineCustomLabelValues;
        // if (graphSe.mode == 'correct') {
        //     var cltemp = graphSe.lineCustomLabelValues;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var cltemp = this.customlabels;
        // } else {
        //     var cltemp = this.customlabels;
        // }

        //console.log(cbtemp);

        if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
            disabled = " disabled";
        } else {
            disabled = "";
        }

        if (cbtemp[0]) {
            html += '<input type="checkbox" id="demand" checked' + disabled + '> Demand<br>'
        } else {
            html += '<input type="checkbox" id="demand"' + disabled + '> Demand<br>'
        }

        if (cbtemp[1]) {
            html += '<input type="checkbox" id="fixedcost" checked' + disabled + '> Fixed Cost<br>'
        } else {
            html += '<input type="checkbox" id="fixedcost"' + disabled + '> Fixed Cost<br>'
        }

        if (cbtemp[2]) {
            html += '<input type="checkbox" id="indifference" checked' + disabled + '> Indifference<br>'
        } else {
            html += '<input type="checkbox" id="indifference"' + disabled + '> Indifference<br>'
        }

        if (cbtemp[3]) {
            html += '<input type="checkbox" id="marginalcost" checked' + disabled + '> Marginal Cost<br>'
        } else {
            html += '<input type="checkbox" id="marginalcost"' + disabled + '> Marginal Cost<br>'
        }

        if (cbtemp[4]) {
            html += '<input type="checkbox" id="marginalrevenue" checked' + disabled + '> Marginal Revenue<br>'
        } else {
            html += '<input type="checkbox" id="marginalrevenue"' + disabled + '> Marginal Revenue<br>'
        }

        if (cbtemp[5]) {
            html += '<input type="checkbox" id="ppf" checked' + disabled + '> PPF<br>'
        } else {
            html += '<input type="checkbox" id="ppf"' + disabled + '> PPF<br>'
        }

        if (cbtemp[6]) {
            html += '<input type="checkbox" id="supply" checked' + disabled + '> Supply<br>'
        } else {
            html += '<input type="checkbox" id="supply"' + disabled + '> Supply<br>'
        }

        if (cbtemp[7]) {
            html += '<input type="checkbox" id="totalcost" checked' + disabled + '> Total Cost<br>'
        } else {
            html += '<input type="checkbox" id="totalcost"' + disabled + '> Total Cost<br>'
        }

        if (cbtemp[8]) {
            html += '<input type="checkbox" id="variablecost" checked' + disabled + '> Variable Cost<br>'
        } else {
            html += '<input type="checkbox" id="variablecost"' + disabled + '> Variable Cost<br>'
        }


        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (cbtemp[i + 9] == undefined) cbtemp[i + 9] = true;

            if (cbtemp[i + 9]) {
                html += '<input type="checkbox" id="' + str + '" checked' + disabled + '> ' + cltemp[i].split("xexse")[0] + '<br>'
            } else {
                html += '<input type="checkbox" id="' + str + '"' + disabled + '> ' + cltemp[i].split("xexse")[0] + '<br>'
            }

            //this.checkboxes[i+9] = false;
        }

        if (graphSe.mode == 'correct') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtml;
        } else if (graphSe.mode == 'incorrect1') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[3];
        } else {
            this.checkboxhtml = html;
        }


        //document.getElementById('checkform').innerHTML = this.checkboxhtml;
    }


    /*this.checkBoxHTML = function()
	 {
	 	var html = '';

	 	if(this.checkboxes[0])
	 	{
	 		html += '<input type="checkbox" id="demand" checked> Demand<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="demand"> Demand<br>'
	 	}

	 	if(this.checkboxes[1])
	 	{
	 		html += '<input type="checkbox" id="fixedcost" checked> Fixed Cost<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="fixedcost"> Fixed Cost<br>'
	 	}

	 	if(this.checkboxes[2])
	 	{
	 		html += '<input type="checkbox" id="indifference" checked> Indifference<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="indifference"> Indifference<br>'
	 	}

	 	if(this.checkboxes[3])
	 	{
	 		html += '<input type="checkbox" id="marginalcost" checked> Marginal Cost<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="marginalcost"> Marginal Cost<br>'
	 	}

	 	if(this.checkboxes[4])
	 	{
	 		html += '<input type="checkbox" id="marginalrevenue" checked> Marginal Revenue<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="marginalrevenue"> Marginal Revenue<br>'
	 	}

	 	if(this.checkboxes[5])
	 	{
	 		html += '<input type="checkbox" id="ppf" checked> PPF<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="ppf"> PPF<br>'
	 	}

	 	if(this.checkboxes[6])
	 	{
	 		html += '<input type="checkbox" id="supply" checked> Supply<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="supply"> Supply<br>'
	 	}

	 	if(this.checkboxes[7])
	 	{
	 		html += '<input type="checkbox" id="totalcost" checked> Total Cost<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="totalcost"> Total Cost<br>'
	 	}

	 	if(this.checkboxes[8])
	 	{
	 		html += '<input type="checkbox" id="variablecost" checked> Variable Cost<br>'
	 	} else
	 	{
	 		html += '<input type="checkbox" id="variablecost"> Variable Cost<br>'
	 	}

		for(var i=0; i<this.customlabels.length; i++)
		{
		 	var str = this.customlabels[i];
		 	var lwr = str.toLowerCase();
		 	str = lwr.replace(/\s+/g, '');

		 	html += '<input type="checkbox" id="'+str+'" checked> '+this.customlabels[i]+'<br>'
		 	//this.checkboxes[i+9] = false;
		}

	 	this.checkboxhtml = html;

	 	//document.getElementById('checkform').innerHTML = this.checkboxhtml;
	 }*/

    this.returnPoint = function (point) {
        if (point == "xspoint") return graphSe.snapIt ? this.sxsg : this.xsg;
        if (point == "yspoint") return graphSe.snapIt ? this.sysg : this.ysg;
        if (point == "xepoint") return graphSe.snapIt ? this.sxeg : this.xeg;
        if (point == "yepoint") return graphSe.snapIt ? this.syeg : this.yeg;

        if (point == "xspointc") return graphSe.snapIt ? this.sxsg : this.xsg;
        if (point == "yspointc") return graphSe.snapIt ? this.sysg : this.ysg;
        if (point == "xepointc") return graphSe.snapIt ? this.sxeg : this.xeg;
        if (point == "yepointc") return graphSe.snapIt ? this.syeg : this.yeg;
    }

    this.returnStep = function (id) {
        if (id == "x") return graphSe.snapIt ? graphSe.xmax / 32 : graphSe.xmax / Number(graphSe.wdPx);
        if (id == "y") return graphSe.snapIt ? graphSe.ymax / 32 : graphSe.ymax / Number(graphSe.htPx);
    }

    // setsettings of a line
    this.SetSettings = function () {
        this.CalculateSlope();
        //this.LineUpdate();

        this.TrackAgainstDropdown();
        this.RelativeDropdown();
        this.checkBoxHTML();

        $('#bottomtools').removeClass("hide");

        var html = '<div class="sectionhead"><span id="elementhead">Element Settings</span><button id="bgleft" class="glyphicon glyphicon-left" aria-hidden="true" style="margin-left: 30px; background: none; border: none;" onclick="leftArrow();"></button><span id="toplabel' + this.labelvalueedit + '" class="elementid">' + this.labeledit + '</span><button id="bgright" class="glyphicon glyphicon-right" aria-hidden="true" onclick="rightArrow();" style="background: none; border: none;"></span></div>'
        html += '<div class="hrm"></div>'
        html += '<div class="row" style="margin-left: 20px;">'
        html += '<div class="col-xs-6">'
        html += '<div id="designertools">'
        html += '<div class="tool">Element Type</div>'
        html += '<div class="tool"></div>'
        html += '<div class="tool">Label</div>'
        html += '<div class="tool">Show Label</div>'
        html += '<div class="tool">Slope</div>'
        html += '<div class="tool">Origin Point</div>'
        html += '<div class="tool">End Point</div>'
        html += '<div class="tool">Show Plumbs</div>'
        html += '</div>'
        html += '</div>'
        html += '<div class="col-xs-6" style="padding-top: 8px;">'
        html += '<div id="designerinputs">'
        html += '<span id="ppfdropdown">' + this.npdropdown + '</span>'
        html += '<button id="bcbutton" aria-hidden="true" onclick="bookColor();">Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span></button>'
        html += '<div><input id="xlabel' + this.labelvalueedit + '" type="text" class="small-label" placeholder="' + this.labeledit + '" onkeyup="labelUpdate(this.value)" maxlength="5"></div>'
        html += '<div><label class="switch tool" style="margin-left: 0px;left:-60px"><input id="labeltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label><button id="movelabelbutton" class="btn btn-econ-sw5" onclick="moveLabelC()" onmousedown="moveLabel()" onmouseup="moveLabelClear()" onmouseout="moveLabelClear()"><span class="glyphicon glyphicon-labelright" aria-hidden="true"></span></button><button id="movelabelbutton2" class="btn btn-econ-sw5" onclick="moveLabelRIC()" onmousedown="moveLabelRadiusIn()" onmouseup="moveLabelRIClear()" onmouseout="moveLabelRIClear()"><span class="glyphicon glyphicon-labelin" aria-hidden="true"></span></button><button id="movelabelbutton3" class="btn btn-econ-sw5" onclick="moveLabelROC()" onmousedown="moveLabelRadiusOut()" onmouseup="moveLabelROClear()" onmouseout="moveLabelROClear()"><span class="glyphicon glyphicon-labelout" aria-hidden="true"></span></button><button id="movelabelbutton4" class="btn btn-econ-sw5" onclick="moveLabelOtherC()" onmousedown="moveLabelOther()" onmouseup="moveLabelClearOther()" onmouseout="moveLabelClearOther()"><span class="glyphicon glyphicon-labelleft" aria-hidden="true"></span></button> </div>'
        html += '<div><input id="slope" type="number" step="0.01" class="slope-input" placeholder="' + this.m + '" value="' + this.m + '" oninput="slopeUpdate(this.value)"></div>'
        html += '<div>(<input id="xspoint" type="number" class="point-input" value="' + this.returnPoint("xspoint") + '" step="' + this.returnStep("x") + '" oninput="xsUpdate(this.value)">,<input id="yspoint" type="number" class="point-input" value="' + this.returnPoint("yspoint") + '" step="' + this.returnStep("y") + '" oninput="ysUpdate(this.value)" >)</div>'
        html += '<div>(<input id="xepoint" type="number" class="point-input" value="' + this.returnPoint("xepoint") + '" step="' + this.returnStep("x") + '"oninput="xeUpdate(this.value)" >,<input id="yepoint" type="number" class="point-input" value="' + this.returnPoint("yepoint") + '" step="' + this.returnStep("y") + '" oninput="yeUpdate(this.value)" >)</div>'
        html += '<div><label class="switch tool"><input id="plumbtoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'

        $('#interactive').removeClass("hide");

        var html2 = '<div id="sectionpadding" class="sectionhead"></div>'
        html2 += '<div class="row" style="margin-left: 20px;">'
        html2 += '<div id="intleft" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="binteractive" onclick="Interactive(true);"> <div class="radio-off"><div id="binteractivero" class="radio-on hide"></div></div>Interactive</button><br>'
        html2 += '<div id="ilabels" class="hide"><div class="tool">Label after move</div>'
        html2 += '<div class="tool">Track against</div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="intright" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="bstatic" onclick="Interactive(false);"> <div class="radio-off"><div id="bstaticro" class="radio-on"></div></div>Static<br></button>'
        html2 += '<div id="iinputs" class="hide"><div><input id="labelam" type="text" value="' + this.labelam + '" oninput="labelAMUpdate(this.value)" style="margin-top: 10px; width: 75px"></div>'
        html2 += '<div class="styled-select"><select id="tadropdown" class="select-class" onchange="TAElement(this.value)" value="' + this.taelement + '" style="margin-top:10px">' + this.taselects + '</select></div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="elabel" class="row hide">'
        html2 += '<div class="col-xs-6">'
        html2 += '<div class="tool"><strong>Evaluated on</strong></div>'
        html2 += '</div>'
        html2 += '<div class="col-xs-6">'
        html2 += '<div id="elabelmode" class="" style="margin-top: 11px;">Interaction</div>'
        html2 += '</div>'
        html2 += '</div>'

        var html3 = '<div class="row" style="margin-left: 20px;">'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="bprecise" onclick="Precise(true);"> <div class="radio-off"><div id="bprecisero" class="radio-on hide"></div></div>Precise</button><br>'
        html3 += '<div id="precisetools" class="hide">'
        html3 += '<div class="tool">Slope</div>'
        html3 += '<div class="tool">Origin Point</div>'
        html3 += '<div class="tool">End Point</div>'
        html3 += '</div>'
        html3 += '<div id="relativetools" class="hide">'
        html3 += '<div class="tool">Relative to:</div>'
        html3 += '<div id="relativetools2" class="hide">'
        html3 += '<div class="tool">Shift from origin</div>'
        html3 += '</div>'
        html3 += '<div id="drawarea" class="hide" style="width: 200px; margin-top: 10px; margin-left: 10px; position:relative; top: 10px;"><button type="button" onclick="DoAcceptedArea(gmloc-1)" class="btn btn-econ-sw5"><span class="glyphicon glyphicon-pentagon" aria-hidden="true"></span><img id="areashade" src="./images/areashade.png"></img></button><span style="padding-left: 5px;">Draw Accepted Area</span></div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="brelative" onclick="Precise(false);"> <div class="radio-off"><div id="brelativero" class="radio-on"></div></div>Relative<br></button>'
        html3 += '<div id="preciseinputs" class="hide" style="position:relative; top: 10px">'
        html3 += '<div><input id="slopec" type="number" step="0.01" class="slope-input" placeholder="' + this.m + '" value="' + this.m + '" oninput="slopeUpdate(this.value)"></div>'
        html3 += '<div>(<input id="xspointc" type="number" class="point-input" value="' + this.returnPoint("xspointc") + '" step="' + this.returnStep("x") + '" oninput="xsUpdate(this.value)">,<input id="yspointc" type="number" class="point-input" value="' + this.returnPoint("yspointc") + '" step="' + this.returnStep("y") + '" oninput="ysUpdate(this.value)" >)</div>'
        html3 += '<div>(<input id="xepointc" type="number" class="point-input" value="' + this.returnPoint("xepointc") + '" step="' + this.returnStep("x") + '" oninput="xeUpdate(this.value)" >,<input id="yepointc" type="number" class="point-input" value="' + this.returnPoint("yepointc") + '" step="' + this.returnStep("y") + '" oninput="yeUpdate(this.value)" >)</div>'
        html3 += '</div>'
        html3 += '<div id="relativeinputs" class="hide">'
        html3 += '<div class="styled-select" style="margin-top:9px"><select id="reldropdown" class="select-class" onchange="GetRelativeElement(this.value)"></span>' + this.relselects + '</select></div>'
        html3 += '<div id="relativeinputs2" class="hide">'
        html3 += '<button class="fake-radio" id="sleft" onclick="ShiftLeft();" style="margin-top:13px;"> <div class="radio-off"><div id="sleftro" class="radio-on hide"></div></div><span id="lefttext">Left</span></button><br>'
        html3 += '<button class="fake-radio" id="sright" onclick="ShiftRight();" style="margin-top:0px;"> <div class="radio-off"><div id="srightro" class="radio-on hide"></div></div><span id="righttext">Right</span></button><br>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'

        if (graphSe.mode == 'correct') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect1') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect2') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect3') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'student' && graphSe.doLabelMode) {
            this.CorrectLabelDropdown();
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        }

        var html4 = '<div class="row" style="margin-left: 20px;">'
        html4 += '<div class="col-xs-6">'
        html4 += '<div class="tool" style="margin-top: 0px;">Required label</div>'
        html4 += '<div id="requiredlabeltools" class="hide">'
        html4 += '<div class="tool">Label Choices</div>'
        html4 += '<div id="cltext2" class="tool" style="padding-top: ' + tempclo + '">Correct Label</div>'
        html4 += '<div id="inccl1" class="tool" style="">Incorrect Label</div>'
        html4 += '</div>'
        html4 += '</div>'
        html4 += '<div class="col-xs-6">'
        html4 += '<div id="rtoggleshell" style="margin-top:10px;"><label class="switch tool"><input id="rltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html4 += '<div id="requiredlabelinputs" class="hide">'
        html4 += '<form id="checkform" onclick="checkBoxes();">' + tempcbh + '</form>'
        html4 += '<div><input id="newlabel" type="text" class="" placeholder="Custom label" onkeyup="" style="width: 100px; margin-top: 10px;"><button id="addbutton" class="btn-nothing" onclick="addLabel()"> <span class="glyphicon glyphicon-cplus"></span></button></div>'
        html4 += '<div class="styled-select" style="margin-top: 10px"><select id="cldropdown" class="select-class" onchange="GetCorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '<div id="inccl2" class="styled-select" style="margin-top: 10px"><select id="inccldropdown" class="select-class" onchange="GetIncorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '</div>'
        html4 += '</div>'

        var html5 = '<div class="row" style="margin-left: 20px;">'
        html5 += '<div class="col-xs-6">'
        html5 += '<div class="tool">Element Type</div>'
        html5 += '<div class="tool">Slope</div>'
        html5 += '<div class="tool">Origin Point</div>'
        html5 += '<div class="tool">End Point</div>'
        html5 += '</div>'
        html5 += '<div class="col-xs-6" style="padding-top: 8px;">'
        html5 += '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option><option value="PPF">PPF</option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option></select></div>'
        html5 += '<div style="margin-top:12px;"><input id="slope" type="number" step="0.01" class="slope-input" placeholder="' + this.m + '" value="' + this.m + '" oninput="slopeUpdate(this.value)"></div>'
        html5 += '<div>(<input id="xspointd" type="number" class="point-input" value="' + this.returnPoint("xspointc") + '" step="' + this.returnStep("x") + '" oninput="xsUpdate(this.value)">,<input id="yspointd" type="number" class="point-input" value="' + this.returnPoint("yspointc") + '" step="' + this.returnStep("y") + '" oninput="ysUpdate(this.value)" >)</div>'
        html5 += '<div>(<input id="xepointd" type="number" class="point-input" value="' + this.returnPoint("xepointc") + '" step="' + this.returnStep("x") + '" oninput="xeUpdate(this.value)" >,<input id="yepointd" type="number" class="point-input" value="' + this.returnPoint("yepointc") + '" step="' + this.returnStep("y") + '" oninput="yeUpdate(this.value)" >)</div>'
        html5 += '</div>'
        html5 += '</div>'

        var html6 = '<div class="row" style="margin-left: 20px;">'
        html6 += '<div class="col-xs-6">'
        html6 += '<div class="tool">Slope</div>'
        html6 += '<div class="tool">Origin Point</div>'
        html6 += '<div class="tool">End Point</div>'
        html6 += '</div>'
        html6 += '<div class="col-xs-6">'
        html6 += '<div><input id="slopec" type="number" step="0.01" class="slope-input" placeholder="' + this.m + '" value="' + this.m + '" oninput="slopeUpdate(this.value)"></div>'
        html6 += '<div>(<input id="xspointc" type="number" class="point-input" value="' + this.returnPoint("xspointc") + '" step="' + this.returnStep("x") + '" oninput="xsUpdate(this.value)">,<input id="yspointc" type="number" class="point-input" value="' + this.returnPoint("yspointc") + '" step="' + this.returnStep("y") + '" oninput="ysUpdate(this.value)" >)</div>'
        html6 += '<div>(<input id="xepointc" type="number" class="point-input" value="' + this.returnPoint("xepointc") + '" step="' + this.returnStep("x") + '" oninput="xeUpdate(this.value)" >,<input id="yepointc" type="number" class="point-input" value="' + this.returnPoint("yepointc") + '" step="' + this.returnStep("y") + '" oninput="yeUpdate(this.value)" >)</div>'
        html6 += '</div>'
        html6 += '</div>'

        document.getElementById("bottomtools").innerHTML = html;
        document.getElementById("interactive").innerHTML = html2;
        document.getElementById("interactivetools").innerHTML = html3;
        document.getElementById("labeldetails").innerHTML = html4;
        document.getElementById("drawingtools").innerHTML = html5;
        document.getElementById("incdetails").innerHTML = html6;

        if (this.IsPPF()) {
            document.getElementById("ppfdropdown").innerHTML = this.pdropdown;
            //console.log("pp");
        } else {
            document.getElementById("ppfdropdown").innerHTML = this.npdropdown;
            //console.log("np");
        }

        document.getElementById('eldropdown').value = this.elementlabel;
        document.getElementById('plumbtoggle').checked = this.plumbLine;

        if (graphSe.mode == 'correct') {
            var temprl = this.requiredlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[1] != undefined) ? this.requiredlabelinc[1] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect2') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[2] != undefined) ? this.requiredlabelinc[2] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect3') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[2] != undefined) ? this.requiredlabelinc[2] : this.requiredlabel; //SWG-64 changes
        }

        document.getElementById('rltoggle').checked = temprl;


        document.getElementById('tadropdown').value = this.taelement;

        if (graphSe.mode == 'correct') {
            var rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var rlltemp = this.relementlabelinc[3];
        }

        document.getElementById('reldropdown').value = rlltemp;

        document.getElementById('cldropdown').value = this.correctlabel;

        this.InteractiveMe(this.interactive);

        if (graphSe.mode == 'correct') {
            this.PreciseMe(this.precise);
            if (!this.precise) {
                this.EvalShift(this.evalshift);
            }
        } else if (graphSe.mode == 'incorrect1') {
            this.PreciseMe(this.preciseinc[1]);
            if (!this.preciseinc[1]) {
                this.EvalShift(this.evalshiftinc[1]);
            }
        } else if (graphSe.mode == 'incorrect2') {
            this.PreciseMe(this.preciseinc[2]);
            if (!this.preciseinc[2]) {
                this.EvalShift(this.evalshiftinc[2]);
            }
        } else if (graphSe.mode == 'incorrect3') {
            this.PreciseMe(this.preciseinc[3]);
            if (!this.preciseinc[3]) {
                this.EvalShift(this.evalshiftinc[3]);
            }
        }


        this.SetElementPoints();

        this.DisplayBookColor();

        this.HighLight();

        this.InteractiveReset();

        this.CheckRLabel();

        this.CorrectTools();

        this.checkBoxes();

        $('#emptydesigner').addClass("hide");

        if (this.labelLine == true) {
            document.getElementById("labeltoggle").checked = true;
        } else {
            document.getElementById("labeltoggle").checked = false;
        }

        if (graphSe.mode == "student") {
            $('#bottomtools').addClass("hide");
            $('#interactive').addClass("hide");
            $('#interactivetools').addClass("hide");
            $('#labeldetails').addClass("hide");
            $('#drawingtools').addClass("hide");
        }

        if (graphMe.length < 2) {
            document.getElementById("bgleft").style.opacity = "0";
            document.getElementById("bgright").style.opacity = "0";
        } else {
            document.getElementById("bgleft").style.opacity = "1";
            document.getElementById("bgright").style.opacity = "1";
        }

        if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
            document.getElementById("cldropdown").disabled = true;
            document.getElementById("newlabel").disabled = true;
            document.getElementById("addbutton").disabled = true;
            $('#inccl1').removeClass("hide");
            $('#inccl2').removeClass("hide");
        } else {
            document.getElementById("cldropdown").disabled = false;
            document.getElementById("newlabel").disabled = false;
            document.getElementById("addbutton").disabled = false;
            $('#inccl1').addClass("hide");
            $('#inccl2').addClass("hide");
        }

        if (graphSe.mode == "incorrect1" && this.incorrect[1] != null) {

            if (this.incorrect[1].type[1] == "left") {
                ShiftLeft();
            } else if (this.incorrect[1].type[1] == "right") {
                ShiftRight();
            }

        } else if (graphSe.mode == "incorrect2" && this.incorrect[2] != null) {
            if (this.incorrect[2].type[1] == "left") {
                ShiftLeft();
            } else if (this.incorrect[2].type[1] == "right") {
                ShiftRight();
            }
        } else if (graphSe.mode == "incorrect3" && this.incorrect[3] != null) {
            if (this.incorrect[3].type[1] == "left") {
                ShiftLeft();
            } else if (this.incorrect[3].type[1] == "right") {
                ShiftRight();
            }
        }

        if (this.locked == true) {
            document.getElementById("slope").disabled = true;
            document.getElementById("slopec").disabled = true;
        } else {
            document.getElementById("slope").disabled = false;
            document.getElementById("slopec").disabled = false;
        }

        if (this.interactive && graphSe.mode != "designer") { //SWG-452 changes
            $("#labeldetails").removeClass("hide");
        } else {
            $("#labeldetails").addClass("hide");
        }

        //SWG - 199 Changes
        if (graphSe.mode != 'designer') {
            HideElementTypeDropdown();
        }
    }

    this.addLabel = function () {
        var cltemp = graphSe.lineCustomLabelValues;
        // if (graphSe.mode == 'correct' ) {
        //     var cltemp = graphSe.lineCustomLabelValues;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var cltemp = this.customlabelsinc1;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var cltemp = this.customlabelsinc2;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var cltemp = this.customlabelsinc3;
        // }

        if (document.getElementById('newlabel').value == "") {
            tempol = "Custom Label"
        } else {
            tempol = document.getElementById('newlabel').value;
        }

        cltemp.push(tempol);

        var str = tempol;
        var lwr = str.toLowerCase();
        str = lwr.replace(/\s+/g, '');

        this.checkBoxHTML();

        var temphtml = this.checkboxhtml;
        var lotemp = this.clabeloffset;

        // if (graphSe.mode == 'correct') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var temphtml = this.checkboxhtmlinc[1];
        //     var lotemp = this.clabeloffsetinc[1];
        // } else if (graphSe.mode == 'incorrect2') {
        //     var temphtml = this.checkboxhtmlinc[2];
        //     var lotemp = this.clabeloffsetinc[2];
        // } else if (graphSe.mode == 'incorrect3') {
        //     var temphtml = this.checkboxhtmlinc[3];
        //     var lotemp = this.clabeloffsetinc[3];
        // }

        document.getElementById('checkform').innerHTML = temphtml;

        this.CorrectLabelDropdown();

        var fstr = document.getElementById("cltext2").style.paddingTop;
        var fstr2 = fstr.split("px");
        fstr = fstr2[0];
        fstr = Number(fstr) + 20;
        document.getElementById("cltext2").style.paddingTop = fstr + "px";

        if (graphSe.mode == 'correct') {
            this.clabeloffset = fstr + "px";
        } else if (graphSe.mode == 'incorrect1') {
            this.clabeloffsetinc[1] = fstr + "px";
        } else if (graphSe.mode == 'incorrect2') {
            this.clabeloffsetinc[2] = fstr + "px";
        } else if (graphSe.mode == 'incorrect3') {
            this.clabeloffsetinc[3] = fstr + "px";
        }


    }


    /*this.addLabel = function()
     {
     	this.customlabels.push(document.getElementById('newlabel').value)

     	var str = document.getElementById('newlabel').value;
		var lwr = str.toLowerCase();
		str = lwr.replace(/\s+/g, '');

     	this.checkBoxHTML();

     	document.getElementById('checkform').innerHTML = this.checkboxhtml;

		this.CorrectLabelDropdown();

		var fstr = document.getElementById("cltext2").style.paddingTop;
		var fstr2 = fstr.split("px");
		fstr = fstr2[0];
		fstr = Number(fstr)+20;
		document.getElementById("cltext2").style.paddingTop = fstr+"px";
		this.clabeloffset = fstr+"px";
     }*/

    this.CorrectTools = function () {
        //if(graphSe.mode=='correct')
        if (graphSe.mode.indexOf('correct') != -1) {
            if (this.interactive != false) $('#labeldetails').removeClass("hide");
            $('#designertools').addClass("hide");
            $('#designerinputs').addClass("hide");
            $('#elabel').removeClass("hide");
            $('#elabelmode').removeClass("hide");
            $('#intleft').addClass("hide");
            $('#intright').addClass("hide");
            document.getElementById("elementhead").innerHTML = "Evaluation Settings";
            document.getElementById("interactive").style.background = "#fbfbfb";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').addClass("hide");

            $('#incdetails').addClass("hide");

            if (this.interactive) {
                document.getElementById("elabelmode").innerHTML = "Interactive";
                this.elabelmode = "Interactive";
                $('#interactivetools').removeClass("hide");

                if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
                    $('#drawingtools').addClass("hide");
                    $('#interactivetools').removeClass("hide");
                    $('#labeldetails').removeClass("hide");
                    $('#incdetails').addClass("hide");
                }

            } else {
                document.getElementById("elabelmode").innerHTML = "Static";
                this.elabelmode = "Static";
                $('#interactivetools').addClass("hide");
            }

            //if(this.mode=="correct")
            if (this.mode.indexOf("correct") != -1) {
                document.getElementById("elabelmode").innerHTML = "Drawing";
                this.elabelmode = "Drawing";
                $('#interactivetools').addClass("hide");
                $('#drawingtools').removeClass("hide");
                $('#labeldetails').removeClass("hide");
            }
            if (document.getElementById('rltoggle').checked) {
                $('#requiredlabeltools').removeClass("hide");
                $('#requiredlabelinputs').removeClass("hide");
                document.getElementById('cldropdown').value = this.correctlabel;
            } else {
                $('#requiredlabeltools').addClass("hide");
                $('#requiredlabelinputs').addClass("hide");
            }
            if (this.elabelmode == "Drawing") {
                $('#drawingtools').removeClass("hide");
            } else {
                $('#drawingtools').addClass("hide");
            }

        } else if (graphSe.mode == 'student') {
            $('#interactive').addClass("hide");
            $('#bottomtools').addClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");
            $('#incdetails').addClass("hide");
        } else {
            $('#labeldetails').addClass("hide");
            $('#designertools').removeClass("hide");
            $('#designerinputs').removeClass("hide");
            //$('#elabel').addClass("hide");
            $('#elabelmode').addClass("hide");
            $('#intleft').removeClass("hide");
            $('#intright').removeClass("hide");
            document.getElementById("elementhead").innerHTML = "Element Settings";
            document.getElementById("interactive").style.background = "#f6f6f6";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').removeClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");
            $('#incdetails').addClass("hide");
        }
    }

    this.InteractiveReset = function () {
        if (this.interactive) {
            $('#ilabels').removeClass("hide");
            $('#iinputs').removeClass("hide");
        } else {
            $('#ilabels').addClass("hide");
            $('#iinputs').addClass("hide");
        }
    }

    this.TrackAgainstDropdown = function () {
        var html = '<option value="None">None</option>'
        for (i = 0; i < graphMe.length; i++) {
            var gi = graphMe[i];
            var gitype = gi.constructor.name;
            if (gi.labeledit != this.labeledit && gitype != "Point") {
                var graphlabel = gi.labeledit;
                html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
            }
        }

        this.taselects = html;
    }

    this.RelativeDropdown = function () {
        var html = '<option value="None">None</option>'
        html += '<option value="Accepted Area">Accepted Area</option>'
        for (i = 0; i < graphMe.length; i++) {
            var graphlabel = graphMe[i].labeledit;
            html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
        }

        this.relselects = html;
    }

    this.CorrectLabelDropdown = function () {
        if (graphSe.mode == 'correct') {
            var cltemp = graphSe.lineCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var cltemp = graphSe.lineCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var cltemp = graphSe.lineCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var cltemp = graphSe.lineCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[3];
        } else {
            //var cltemp = this.customlabels;
            var cltemp = graphSe.lineCustomLabelValues;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        }

        var html = '<option value="None">None</option>'

        if (document.getElementById('demand').checked) { html += '<option value="Demand">Demand</option>' } else { };
        if (document.getElementById('fixedcost').checked) { html += '<option value="Fixed Cost">Fixed Cost</option>' } else { };
        if (document.getElementById('indifference').checked) { html += '<option value="Indifference">Indifference</option>' } else { };
        if (document.getElementById('marginalcost').checked) { html += '<option value="Marginal Cost">Marginal Cost</option>' } else { };
        if (document.getElementById('marginalrevenue').checked) { html += '<option value="Marginal Revenue">Marginal Revenue</option>' } else { };
        if (document.getElementById('ppf').checked) { html += '<option value="PPF">PPF</option>' } else { };
        if (document.getElementById('supply').checked) { html += '<option value="Supply">Supply</option>' } else { };
        if (document.getElementById('totalcost').checked) { html += '<option value="Total Cost">Total Cost</option>' } else { };
        if (document.getElementById('variablecost').checked) { html += '<option value="Variable Cost">Variable Cost</option>' } else { };

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str)) {
                if (document.getElementById(str).checked) { html += '<option value="' + cltemp[i] + '">' + cltemp[i].split("xexse")[0] + '</option>' } else { }
            }
            //this.checkboxes[i+9] = false;
        }

        this.clselects = html;
        // if (graphSe.mode == 'correct') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect1') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect2') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect3') {
        //     this.clselects = html;
        // }


        clselectstemp = html;

        document.getElementById("cldropdown").innerHTML = clselectstemp;
        document.getElementById('cldropdown').value = tmpclabel;
        document.getElementById('inccldropdown').value = tmpincclabel;
    }


    /*this.CorrectLabelDropdown = function ()
     {
     		var html = '<option value="None">None</option>'

			if(document.getElementById('demand').checked) {html += '<option value="Demand">Demand</option>'} else {};
			if(document.getElementById('fixedcost').checked) {html += '<option value="Fixed Cost">Fixed Cost</option>'} else {};
			if(document.getElementById('indifference').checked) {html += '<option value="Indifference">Indifference</option>'} else {};
			if(document.getElementById('marginalcost').checked) {html += '<option value="Marginal Cost">Marginal Cost</option>'} else {};
			if(document.getElementById('marginalrevenue').checked) {html += '<option value="Marginal Revenue">Marginal Revenue</option>'} else {};
			if(document.getElementById('ppf').checked) {html += '<option value="PPF">PPF</option>'} else {};
			if(document.getElementById('supply').checked) {html += '<option value="Supply">Supply</option>'} else {};
			if(document.getElementById('totalcost').checked) {html += '<option value="Total Cost">Total Cost</option>'} else {};
			if(document.getElementById('variablecost').checked) {html += '<option value="Variable Cost">Variable Cost</option>'} else {};

			for(var i=0; i<this.customlabels.length; i++)
			{
				var str = this.customlabels[i];
				var lwr = str.toLowerCase();
				str = lwr.replace(/\s+/g, '');

				if(document.getElementById(str)) {
					if(document.getElementById(str).checked) {html += '<option value="'+this.customlabels[i]+'">'+this.customlabels[i]+'</option>'} else {}
				}
				//this.checkboxes[i+9] = false;
			}

     		this.clselects = html;

     	    document.getElementById("cldropdown").innerHTML = html;
		 	document.getElementById('cldropdown').value = this.correctlabel;

     }     */



    this.SetElementPoints = function () {
        if (graphSe.mode == "designer" && document.getElementById('xspoint') != null) {
            document.getElementById('xspoint').value = graphSe.snapIt ? this.sxsg : this.xsg;
            document.getElementById('yspoint').value = graphSe.snapIt ? this.sysg : this.ysg;
            document.getElementById('xepoint').value = graphSe.snapIt ? this.sxeg : this.xeg;
            document.getElementById('yepoint').value = graphSe.snapIt ? this.syeg : this.yeg;

            this.CalculateSlope();
            //this.UpdateSlope( );
        }

        if (graphSe.mode == "correct" && document.getElementById('xspointd') != null) {
            document.getElementById('xspointd').value = graphSe.snapIt ? this.sxsg : this.xsg;
            document.getElementById('yspointd').value = graphSe.snapIt ? this.sysg : this.ysg;
            document.getElementById('xepointd').value = graphSe.snapIt ? this.sxeg : this.xeg;
            document.getElementById('yepointd').value = graphSe.snapIt ? this.syeg : this.yeg;
        }
    }

    this.SetElementLabel = function (text) {
        this.elementlabel = text;
        //SWG-87
        if (graphSe.mode != "designer" && this.elementlabel != "None") {
            this.tempbookColor = "Yes";
            this.tempLableLine = true;
        }
        //end SWG-87
        this.SetColor();
    }

    this.SetRelativeElementLabel = function (text) {

        if (graphSe.mode == 'correct') {
            this.relementlabel = text;
            this.relementlabelinc[1] = text;
            this.relementlabelinc[2] = text;
            this.relementlabelinc[3] = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.relementlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.relementlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.relementlabelinc[3] = text;
        }


        this.CheckRLabel();
    }

    this.CheckRLabel = function () {
        var rlltemp;

        if (graphSe.mode == 'correct') {
            rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            rlltemp = this.relementlabelinc[3];
        }

        if (graphSe.FindInGraph(rlltemp) && (graphSe.FindInGraph(rlltemp).correctlabel == undefined || graphSe.FindInGraph(rlltemp).correctlabel == 'b')) { ////SWG-139 Changes
            if (graphSe.FindInGraph(rlltemp).IsPPF() && graphSe.FindInGraph(rlltemp).elementlabel == 'PPF') { ////SWG-139 Changes
                document.getElementById("lefttext").innerHTML = 'Inward';
                document.getElementById("righttext").innerHTML = 'Outward';
            } else if (graphSe.FindInGraph(rlltemp).elementlabel == 'Marginal Cost' || graphSe.FindInGraph(rlltemp).elementlabel == 'Fixed Cost' || graphSe.FindInGraph(rlltemp).elementlabel == 'Variable Cost' || graphSe.FindInGraph(rlltemp).elementlabel == 'Total Cost') {
                document.getElementById("lefttext").innerHTML = 'Up';
                document.getElementById("righttext").innerHTML = 'Down';
            } else {
                document.getElementById("lefttext").innerHTML = 'Left';
                document.getElementById("righttext").innerHTML = 'Right';
            }
        }
        ////SWG-139 Changes
        else if (graphSe.FindInGraph(rlltemp) && graphSe.FindInGraph(rlltemp).correctlabel != undefined && graphSe.FindInGraph(rlltemp).correctlabel != 'b') {
            if (graphSe.FindInGraph(rlltemp).correctlabel == 'PPF') {
                document.getElementById("lefttext").innerHTML = 'Inward';
                document.getElementById("righttext").innerHTML = 'Outward';
            } else if (graphSe.FindInGraph(rlltemp).correctlabel == 'Marginal Cost' || graphSe.FindInGraph(rlltemp).correctlabel == 'Fixed Cost' || graphSe.FindInGraph(rlltemp).correctlabel == 'Variable Cost' || graphSe.FindInGraph(rlltemp).correctlabel == 'Total Cost') {
                document.getElementById("lefttext").innerHTML = 'Up';
                document.getElementById("righttext").innerHTML = 'Down';
            } else {
                document.getElementById("lefttext").innerHTML = 'Left';
                document.getElementById("righttext").innerHTML = 'Right';
            }
        }
        ////SWG-139 Changes

        if (rlltemp == "Accepted Area") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').removeClass("hide");
        } else if (rlltemp == "None") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').addClass("hide");
        } else {
            $('#relativetools2').removeClass("hide");
            $('#relativeinputs2').removeClass("hide");
            $('#drawarea').addClass("hide");
        }
    }

    this.SetBookColor = function (text) {
        this.bookcolor = text;

        this.SetColor();
    }

    this.GetBookColor = function (text) {
        return this.bookcolor;
    }

    this.DisplayBookColor = function () {
        if (this.bookcolor == "Yes") {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-checkedmm"></span>';
        } else {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span>';
        }
    }

    this.HighLight = function () {
        for (i = 0; i < graphMe.length; i++) {
            graphMe[i].iscurrent = false
        }

        this.iscurrent = true
    }

    this.labelangle;
    this.labelradius;

    // labelline of a line
    this.LabelLine = function () {

        pt = graphSe.snapIt ? { x: this.sxeg, y: this.syeg } : { x: this.xeg, y: this.yeg };
        spt = graphSe.snapIt ? { x: this.sxsg, y: this.sysg } : { x: this.xsg, y: this.ysg };

        var xoffset = 0;
        var yoffset = 0;

        pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
        pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
        spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
        spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

        var d = 20;

        var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
        if (this.labelangle == undefined && this.labelradius == undefined) {
            var newx = pt.x + d * (pt.x - spt.x) / mag
            var newy = pt.y + d * (pt.y - spt.y) / mag

            this.labelangle = Math.atan2(newy - pt.y, newx - pt.x)
            this.labelradius = Math.sqrt((pt.x - newx) * (pt.x - newx) + (pt.y - newy) * (pt.y - newy));

            document.getElementById("movelabelbutton").disabled = false
            document.getElementById("movelabelbutton2").disabled = false
            document.getElementById("movelabelbutton3").disabled = false
            document.getElementById("movelabelbutton4").disabled = false

        } else {
            var newx = pt.x + this.labelradius * Math.cos(this.labelangle); //+ d * (pt.x - spt.x) / mag
            var newy = pt.y + this.labelradius * Math.sin(this.labelangle); //+ d * (pt.y - spt.y) / mag
        }

        var clr = this.iscurrent == true ? this.cc : this.ccus;

        //console.log(clr);
        /*ctx2.fillStyle = clr;
        ctx2.font="14px sans-serif";
        ctx2.fillText(this.label,newx,newy);
        ctx2.font="10px sans-serif";*/

        var templabel;

        if (graphSe.mode == "correct" && this.dragstart != undefined) {
            templabel = this.labelam != '' ? this.labelam : this.labeledit;
        } else if (graphSe.boo && this.ghost && this.mode != "correct" && this.mode != "student" && this.evalshift != null && this.precise == false && graphSe.mode == "designer") {
            templabel = this.labelam;
        } else {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "designer") {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "student" && this.studentdrag != null) {
            templabel = this.labelam != '' ? this.labelam : this.labeledit;
        }

        //SWG-87
        if (graphMe.length > 0 && graphSe.mode != "designer" && this.tempLableLine && !this.labelLine && this.elementlabel != 'None') {
            templabel = graphSe.mode == "student" ? "" : this.elementlabel;
        }
        if (graphSe.mode == 'designer' && this.tempLableLine && !this.labelLine) {
            templabel = '';
        }
        //end SWG-87
        //SWG-275
        if (graphSe.mode == "student" && (this.studentcorrectlabel != null && this.studentcorrectlabel != "a" && this.studentcorrectlabel != "")) {
            templabel = "";
        }
        ////SWG - 140 Changes
        var ObjPosition = this.LabelPosition(newx, newy);
        var text = new paper.PointText(new paper.Point(ObjPosition.x, ObjPosition.y));
        text.justification = ObjPosition.alignment;
        ////SWG - 140
        text.fillColor = clr;
        if (this.path.visible)
            text.content = templabel;

    }

    this.UpdateLabelText = function () {
        document.getElementById('xlabel' + this.labelvalueedit).value = this.labeledit;
        document.getElementById('toplabel' + this.labelvalueedit).innerHTML = this.labeledit;
    }

    this.InteractiveMe = function (tf) {
        this.interactive = tf;
        if (tf) {
            $("#binteractivero").removeClass("hide");
            $("#bstaticro").addClass("hide");
        } else {
            $("#binteractivero").addClass("hide");
            $("#bstaticro").removeClass("hide");
        }
    }

    this.EvalShift = function (text) {
        //SWG_312 and SWG_313 changes
        if (this.upCoordinatesUpdated != undefined)
            this.upCoordinatesUpdated = undefined;
        if (this.downCoordinatesUpdated != undefined)
            this.downCoordinatesUpdated = undefined;
        if (this.inwardCoordinatesUpdated != undefined)
            this.inwardCoordinatesUpdated = undefined;
        if (this.outwardCoordinatesUpdated != undefined)
            this.outwardCoordinatesUpdated = undefined;
        this.rightCoordinatesUpdated = undefined;
        this.leftCoordinatesUpdated = undefined;
        if (graphSe.mode == 'correct') {
            this.evalshift = text;
            var veshift = this.evalshift;
        } else if (graphSe.mode == 'incorrect1') {
            this.evalshiftinc[1] = text;
            var veshift = this.evalshiftinc[1] == undefined ? this.evalshift : this.evalshiftinc[1]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect2') {
            this.evalshiftinc[2] = text;
            var veshift = this.evalshiftinc[2] == undefined ? this.evalshift : this.evalshiftinc[2]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect3') {
            this.evalshiftinc[3] = text;
            var veshift = this.evalshiftinc[3] == undefined ? this.evalshift : this.evalshiftinc[3]; ////SWG-312, 313
        }

        if (veshift == "left" || veshift == "up" || veshift == "inward") {
            $("#sleftro").removeClass("hide");
            $("#srightro").addClass("hide");
        } else if (veshift == null) {
            $("#sleftro").addClass("hide");
            $("#srightro").addClass("hide");
        } else {
            $("#sleftro").addClass("hide");
            $("#srightro").removeClass("hide");
            //$('#relativetools').removeClass("hide");
            //$('#relativeinputs').removeClass("hide");
        }

        if (text != null) {
            if (graphSe.mode == 'correct') this.CorrectMe(["relative", text]);
            else if (graphSe.mode.substring(0, 9) == "incorrect")
                this.IncorrectMe(undefined, undefined, ["relative", text]);
        }
    }

    this.PreciseMe = function (tf) {
        //this.evalshift = null;
        tf = tf != undefined ? tf : true;

        if (graphSe.mode == 'correct') {
            this.precise = tf;
            //this.preciseinc[1] = tf;
            //this.preciseinc[2] = tf;
            //this.preciseinc[3] = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.preciseinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.preciseinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.preciseinc[3] = tf;
        }

        if (tf) {
            $("#bprecisero").removeClass("hide");
            $("#brelativero").addClass("hide");
            $('#relativetools').addClass("hide");
            $('#relativeinputs').addClass("hide");
            $('#precisetools').removeClass("hide");
            $('#preciseinputs').removeClass("hide");
        } else if (tf == null) {
            $("#bprecisero").addClass("hide");
            $("#brelativero").addClass("hide");
        } else {
            $("#bprecisero").addClass("hide");
            $("#brelativero").removeClass("hide");
            $('#relativetools').removeClass("hide");
            $('#relativeinputs').removeClass("hide");
            $('#precisetools').addClass("hide");
            $('#preciseinputs').addClass("hide");
        }

    }

    this.CalculateSlope = function () {
        var xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
        var yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
        var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
        var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

        var dx = xepx - xspx;
        var slope = Math.abs(dx) > .000001 ? -(yepx - yspx) / dx : Number.POSITIVE_INFINITY;

        //this.m = Math.round(slope * 100) / 100;
        if (slope != undefined) this.m = slope.toFixed(2);
        else this.m = slope;
    }

    this.LineUpdate = function () {
        var xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
        var yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
        var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
        var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

        var dx = this.xeg - this.xsg;
        var dy = this.yeg - this.ysg;

        this.distance = Math.sqrt(dx * dx + dy * dy);

        var ang = Math.atan(this.m)

        if (this.xeg > this.xsg) {
            this.xeg = (this.distance) * Math.cos(ang) + this.xsg;
            this.yeg = (this.distance) * Math.sin(ang) + this.ysg
        }

        if (this.xeg < this.xsg) {
            this.xsg = (this.distance) * Math.cos(Math.atan(this.m)) + this.xeg;
            this.ysg = (this.distance) * Math.sin(Math.atan(this.m)) + this.yeg
        }

        this.SnapMe();
        this.SetElementPoints();

    }

    this.UpdateSlope = function () {
        //console.log(Number(this.m));

        if (document.getElementById('slope')) {
            document.getElementById('slope').value = Number(this.m);
        }

        if (document.getElementById('slopec')) {
            document.getElementById('slopec').value = Number(this.m);
        }

        //console.log(document.getElementById('slopec').value);

        //if(graphSe.mode == "correct") document.getElementById('slopec').value = Number(this.m);
    }

    this.RequiredLabelMe = function (tf) {

        if (graphSe.mode == 'correct') {
            this.requiredlabel = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.requiredlabelinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.requiredlabelinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.requiredlabelinc[3] = tf;
        }

        if (tf) {
            $('#requiredlabelinputs').removeClass("hide");
            $('#requiredlabeltools').removeClass("hide");
        } else {
            $('#requiredlabelinputs').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
        }
    }


    this.LabelMeDrop = function () {
        if (this.droppedlabel == 0 && this.interactive) {
            //console.log("label me drop");

            /*console.log("label me drop");
			var xpx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxg : this.xg );
			var ypx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.syg : this.yg );

			var xspx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxsg : this.xsg );
			var yspx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.sysg : this.ysg );
			var xepx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxeg : this.xeg );
			var yepx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.syeg : this.yeg );*/
            var uniqueLabel = this.uniqueLabel;//3.7 changes
            pt = graphSe.snapIt ? { x: this.sxeg, y: this.syeg } : { x: this.xeg, y: this.yeg };
            spt = graphSe.snapIt ? { x: this.sxsg, y: this.sysg } : { x: this.xsg, y: this.ysg };

            var xoffset = 0;
            var yoffset = 0;

            pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
            pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
            spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
            spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

            var d = 20;

            var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
            var newx = pt.x + d * (pt.x - spt.x) / mag
            var newy = pt.y + d * (pt.y - spt.y) / mag

            var div = document.createElement("div");
            this.studentlabelid = 'dlabel' + this.divid;
            div.id = this.studentlabelid;
            div.style.position = "absolute";
            div.style.left = newx + 37 + 'px';

            ////SWG-221 Changes
            if (graphSe.titleshow && graphSe.title != "") div.style.top = newy + 158 + 'px';
            else div.style.top = newy + 105 + 'px';
            ////SWG-221 Changes end

            div.style.zIndex = "1000"; ////SWFB-2269
            div.className = 'styled-select';

            var clselectsrt;

            if (this.mode == "student") {
                if (this.FindMatchObject() == null) {
                    clselectsrt = this.clselects;
                } else {
                    clselectsrt = this.FindMatchObject().clselects;
                }
            } else {
                clselectsrt = this.clselects;
            }

            div.innerHTML = '<select id="elabel' + this.divid + '" data-uniqueid =' + uniqueLabel + ' class="select-class" onchange="GetCorrectStudentLabel(this.value, this.id, this)"></span>' + clselectsrt + '</select>'
            document.getElementById('graphcontainer').appendChild(div);

            //$('#elabel').removeClass("hide");
            studentlabel++;
            graphSe.OpsAddStudentLabel(gmloc);

            //console.log("hello");

            //this.droppedlabel = 1; ////SWG-451
        }

    }

    this.deleteStudentLabel = function () {
        this.savedstudentlabel = document.getElementById(this.studentlabelid);
        this.savedstudentcorrectlabel = this.studentcorrectlabel;
        var studentcorrectlabel = this.designerLabel != undefined ? this.designerLabel : "None"; ////Preview mode object color disappear after undo

        this.SetCorrectStudentLabel(studentcorrectlabel); ////Set default designer mode color
        document.getElementById(this.studentlabelid).remove();
        this.droppedlabel = 0;

        this.setStudentColor();
    }

    this.replaceStudentLabel = function () {
        var div = this.savedstudentlabel;
        this.studentcorrectlabel = this.savedstudentcorrectlabel;

        document.getElementById('graphcontainer').appendChild(div);

        this.droppedlabel = 1;

        this.setStudentColor();
    }

    this.SetCorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }
    }

    this.SetIncorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }
    }

    this.SetCorrectStudentLabel = function (text) {
        this.studentcorrectlabel = text;

        //this.CheckIsCorrect("label");
        //if( !this.CheckIsCorrect("label") ) this.CheckIsIncorrect("label");
    }

    this.SetCorrectPoints = function () {
        if (this.precise) {
            this.correctxs = graphSe.snapIt ? this.sxsg : this.xsg;
            this.correctys = graphSe.snapIt ? this.sysg : this.ysg;
            this.correctxe = graphSe.snapIt ? this.sxeg : this.xeg;
            this.correctye = graphSe.snapIt ? this.syeg : this.yeg;

            this.CalculateOSlope();
            this.UpdateOSlope();

            if (document.getElementById('xspointc')) document.getElementById('xspointc').value = this.correctxs;
            if (document.getElementById('yspointc')) document.getElementById('yspointc').value = this.correctys;
            if (document.getElementById('xepointc')) document.getElementById('xepointc').value = this.correctxe;
            if (document.getElementById('yepointc')) document.getElementById('yepointc').value = this.correctye;
        }
    }

    this.CalculateOSlope = function () {
        var xspx = this.correctxs;
        var yspx = this.correctys;
        var xepx = this.correctxe;
        var yepx = this.correctye;

        var dx = xepx - xspx;
        var slope = Math.abs(dx) > .000001 ? -(yepx - yspx) / dx : Number.POSITIVE_INFINITY;

        //this.m = Math.round(slope * 100) / 100;
        if (slope != undefined) this.mo = slope.toFixed(2);
        else this.mo = slope;
    }

    this.UpdateOSlope = function () {
        if (document.getElementById('slopec') != null)
            document.getElementById('slopec').value = this.mo != 'Infinity' ? Number(this.mo) : null;
    }

    this.IsPPF = function () {
        var xspx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxsg : this.xsg);
        var yspx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.sysg : this.ysg);
        var xepx = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.sxeg : this.xeg);
        var yepx = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.syeg : this.yeg);

        return (xspx <= 3 && yepx >= graphSe.htPx - 2) || (xepx <= 3 && yspx >= graphSe.htPx - 2);
    }

    this.removeLastCheckBox = function () {

        var customlength = this.customlabels.length;
        var customlength2 = this.checkboxes.length;

        if (customlength > 0) {
            this.removedcheckboxes.push(this.customlabels[customlength - 1]);
            this.removedcheckboxesstate.push(this.checkboxes[customlength2 - 1]);

            this.customlabels.pop();
            this.checkboxes.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) - 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }

    this.replaceLastCheckBox = function () {
        var customlength = this.removedcheckboxes.length;
        if (customlength > 0) {
            this.customlabels.push(this.removedcheckboxes[customlength - 1]);
            this.checkboxes.push(this.removedcheckboxesstate[customlength - 1]);

            this.removedcheckboxes.pop();
            this.removedcheckboxesstate.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) + 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }


    //this.SetSettings();
    this.UnitNormal();
    ////SWG - 140 Changes Start
    this.LabelPosition = function (newxVal, newyVal) {

        // var xIncVal, yIncVal;
        // if (document.getElementById('xinc') != undefined) xIncVal = document.getElementById('xinc').value;
        // if (document.getElementById('yinc') != undefined) yIncVal = document.getElementById('yinc').value;

        // var xMin = $('#xmin').val();
        var yMin = $('#ymin').val();
        // var xMax = $('#xmax').val();
        // var yMax = $('#ymax').val();

        // var xAxisMinVal = 2 * parseFloat(xIncVal) + parseFloat(xMin);
        // var xAxisMaxVal = 12 * parseFloat(xIncVal) + parseFloat(xMin);
        // var yAxisMinVal = 2 * parseFloat(yIncVal) + parseFloat(yMin);
        // var yAxisMaxVal = 12 * parseFloat(yIncVal) + parseFloat(yMin);


        // var startPt = graphSe.snapIt ? { x: this.sxsg, y: this.sysg } : { x: this.xsg, y: this.ysg };
        var endPt = graphSe.snapIt ? { x: this.sxeg, y: this.syeg } : { x: this.xeg, y: this.yeg };

        var ObjLabelStyle = { x: 0, y: 0, alignment: '' };

        //    var xMultipy = graphSe.ConvertXpxToXg(newxVal) < 0 ? -1 : 1
        //    var yMultipy = graphSe.ConvertYpxToYg(newyVal) < 0 ? -1 : 1

        switch (true) {
            case endPt.y <= yMin || endPt.y <= 0.5:
                ObjLabelStyle.x = (this.m == "Infinity" ? newxVal - 5 : newxVal - 22);
                ObjLabelStyle.y = newyVal - 24;
                ObjLabelStyle.alignment = 'right';
                break;
            //    case endPt.y == yMin && endPt.x >= xAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y == yMin && endPt.x < xAxisMinVal && endPt.x != xMin:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y == yMin:
            //        ObjLabelStyle.x = newxVal + 24;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y >= yAxisMinVal && endPt.y < yAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - (24 * xMultipy);
            //        ObjLabelStyle.y = newyVal + 10;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y >= yAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - (24 * xMultipy);
            //        ObjLabelStyle.y = newyVal + 30;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x >= xAxisMaxVal && endPt.y <= yAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y >= yMax && endPt.x > xAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal + 30;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //   case endPt.y >= yMax && endPt.x >= xAxisMinVal:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal + 36;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x >= xMax && endPt.y > yAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            default: ObjLabelStyle.x = newxVal;
                ObjLabelStyle.y = newyVal;
                ObjLabelStyle.alignment = 'center';
                break;
        }
        return ObjLabelStyle;

    }
    ////SWG - 140 Changes End

    ////SWG-139 Changes
    this.ResetMe = function () {
        this.xsg = this.ghost.xsg;
        this.ysg = this.ghost.ysg;
        this.xeg = this.ghost.xeg;
        this.yeg = this.ghost.yeg;
        this.SnapMe();
    }
    ////SWG-139 Changes End
}

function Curve(clr, szz, showPts) {
    this.what = 'curve';
    //SWG-124 changes
    this.uniqueLabel = Math.floor(Math.random() * 90000) + 10000;
    this.color = clr;
    this.width = szz;
    this.pts = [];
    this.spts = [];
    this.tension = 0.5;
    this.segments = 128;
    this.showPoints = showPts;
    this.ptSpacing = 8;
    this.selectingPts = false;
    this.swipingPts = false;
    this.clickingPts = false;
    this.plumbLine = false;
    this.preciseinc = [null, null, null]

    this.droppedlabel = 0;
    this.requiredlabelinc = [];
    this.correctlabelinc = ["b", "b", "b", "b"];

    this.relementlabel = "None";
    this.relementlabelinc = ["None", "None", "None", "None"]
    this.elementlabel = "None";
    this.bookcolor = "No";
    this.iscurrent = true;
    cpoints++;
    this.label = "C" + cpoints;

    this.divid = this.label;

    this.labelvalue = cpoints;

    this.labeledit = this.label;
    this.labelvalueedit = this.labelvalue;

    this.evalshift = null;
    this.evalshiftinc = [null, null, null];

    this.studentdrag = null;

    this.studentcorrectlabel = "a";

    this.iscorrect = null;
    this.correctgraph;
    this.labelcorrect;
    this.correctlabel = "b";

    this.ang = null;

    this.plumbLine = false;
    this.labelLine = false;

    this.ghost = null;

    this.correct = [];
    this.correctTolerance = 4;
    this.correctFeedback = "Curve Correct!";
    this.notCorrectFeedback = "Curve Not Correct!";
    this.feedback = "";

    this.incorrect = [null, null, null, null];
    this.isIncorrect = [null, null, null, null];

    this.dragState = "off";
    this.dragStart = null;
    this.dragDxDy = { dx: 0, dy: 0 };

    this.interactive = graphSe.mode.indexOf("correct") != -1 || graphSe.mode == "student" ? true : false;
    this.precise = null;
    this.preciseinc = [null, null, null]
    this.labelam = '';
    this.taelement = 'None';
    this.relselects = '';

    var startstring = '</span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option><option value="PPF">PPF</option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option>'

    this.clselectsinc = [startstring, startstring, startstring, startstring];
    this.clselects = startstring;

    this.locked = false;

    this.showControl = false;

    this.mode = graphSe.mode;

    this.cc = 'rgba(0, 0, 0, 1)'
    this.ccus = 'rgba(0, 0, 0, .5)'

    ////SWG - 55 Changes
    //this.checkboxes = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc1 = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc2 = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc3 = [true, true, true, true, true, true, true, true, true];
    this.customlabels = [];
    this.customlabelsinc1 = [];
    this.customlabelsinc2 = [];
    this.customlabelsinc3 = [];
    this.clabeloffsetinc = ["202px", "202px", "202px", "202px",];
    this.checkboxhtmlinc = [];

    this.clabeloffset = "202px";
    this.elabelmode = "";

    this.npdropdown = '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option></option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option></select></div>'
    this.pdropdown = '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option><option value="PPF">PPF</option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option></select></div>'

    this.removedcheckboxes = [];
    this.removedcheckboxesstate = [];

    ////Prod issue SWG-332
    this.designerLabel = "";
    ////Prod issue SWG-332

    this.isshiftdirectionchanged = false; ////SWG-457

    //SWG-87 added tempbookcolor condition
    this.SetColor = function () {
        if (this.elementlabel == "None") {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        } else if (this.elementlabel == "PPF" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(170, 95, 166, 1)';
            this.ccus = 'rgba(170, 95, 166, .5)';
        } else if (this.elementlabel == "Demand" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(0, 131, 173, 1)';
            this.ccus = 'rgba(0, 131, 173, .5)';
        } else if (this.elementlabel == "Supply" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Fixed Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(188, 189, 192, 1)';
            this.ccus = 'rgba(188, 189, 192, .5)';
        } else if (this.elementlabel == "Indifference" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Revenue" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(35, 31, 32, 1)';
            this.ccus = 'rgba(35, 31, 32, .5)';
        } else if (this.elementlabel == "Total Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Variable Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(238, 165, 122, 1)';
            this.ccus = 'rgba(238, 165, 122, .5)';
        } else {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        }
    }

    this.setStudentColor = function () {
        if (this.studentcorrectlabel == "None") {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        } else if (this.studentcorrectlabel == "PPF") {
            this.cc = 'rgba(170, 95, 166, 1)';
            this.ccus = 'rgba(170, 95, 166, .5)';
        } else if (this.studentcorrectlabel == "Demand") {
            this.cc = 'rgba(0, 131, 173, 1)';
            this.ccus = 'rgba(0, 131, 173, .5)';
        } else if (this.studentcorrectlabel == "Supply") {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.studentcorrectlabel == "Fixed Cost") {
            this.cc = 'rgba(188, 189, 192, 1)';
            this.ccus = 'rgba(188, 189, 192, .5)';
        } else if (this.studentcorrectlabel == "Indifference") {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.studentcorrectlabel == "Marginal Cost") {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.studentcorrectlabel == "Marginal Revenue") {
            this.cc = 'rgba(35, 31, 32, 1)';
            this.ccus = 'rgba(35, 31, 32, .5)';
        } else if (this.studentcorrectlabel == "Total Cost") {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.studentcorrectlabel == "Variable Cost") {
            this.cc = 'rgba(238, 165, 122, 1)';
            this.ccus = 'rgba(238, 165, 122, .5)';
        } else {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        }
    }
    this.AreIdentical = function (a, b) {
        var i = a.length;
        if (i != b.length) return false;
        while (i--) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };
    // get evalshift based on current tab
    this.getEvalShift = function () {
        if (graphSe.mode == 'correct') return this.evalshift;
        if (graphSe.mode == 'incorrect1') return this.evalshiftinc[1];
        if (graphSe.mode == 'incorrect2') return this.evalshiftinc[2];
        if (graphSe.mode == 'incorrect3') return this.evalshiftinc[3];
        return '';
    };
    //Changes for SWG-312 and 313
    // get precise based on current tab
    this.getPrecise = function () {
        if (graphSe.mode == 'correct') return this.precise;
        if (graphSe.mode == 'incorrect1') return this.preciseinc[1];
        if (graphSe.mode == 'incorrect2') return this.preciseinc[2];
        if (graphSe.mode == 'incorrect3') return this.preciseinc[3];
        return '';
    };
    //Changes for SWG-312 and 313 end
    // drawme of a curve
    this.DrawMe = function (ctx) {
        var xincrement = 1;
        if (document.getElementById('xinc') != null) xincrement = document.getElementById('xinc').value;
        var yincrement = 1;
        if (document.getElementById('yinc') != null) yincrement = document.getElementById('yinc').value;

        if (graphSe.boo && this.ghost && (this.mode.indexOf("correct") == -1) && this.mode != "student") {
            //Changes for SWG-201
            if (this.deletedFrom == undefined || this.deletedFrom.indexOf(graphSe.mode) == -1) {
                this.DrawGhost();
            }
            //this.DrawGhost();
            //End changes for SWG-201
            var shiftVal = this.getEvalShift();
            shiftVal = shiftVal == undefined ? this.evalshift : shiftVal; ////SWG-312, 313
            var isPrecise = this.getPrecise();
            if (!isPrecise && shiftVal) {
                if (shiftVal == "left") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.resetCoordinates || this.leftCoordinatesUpdated == undefined || this.leftCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            // loop through all the points and increase/decrease based on selections
                            for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
                                this.pts[p] -= 2 * xincrement;
                                this.spts[p] -= 2 * xincrement;
                                //this.pts[p+1] -= 2 * xincrement; this.spts[p+1] -= 2 * xincrement;
                            } // end for loop
                            this.leftCoordinatesUpdated = true;
                            this.rightCoordinatesUpdated = undefined;
                            this.upCoordinatesUpdated = undefined;
                            this.downCoordinatesUpdated = undefined;
                            this.inwardCoordinatesUpdated = undefined;
                            this.outwardCoordinatesUpdated = undefined;
                            this.resetCoordinates = false;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                } // end if left condition
                else if (shiftVal == "right") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.resetCoordinates || this.rightCoordinatesUpdated == undefined || this.rightCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            // loop through all the points and increase/decrease based on selections
                            for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
                                this.pts[p] += 2 * xincrement;
                                this.spts[p] += 2 * xincrement;
                                //this.pts[p+1] += 2 * xincrement; this.spts[p+1] += 2 * xincrement;
                            } // end for loop
                            this.rightCoordinatesUpdated = true;
                            this.leftCoordinatesUpdated = undefined;
                            this.upCoordinatesUpdated = undefined;
                            this.downCoordinatesUpdated = undefined;
                            this.inwardCoordinatesUpdated = undefined;
                            this.outwardCoordinatesUpdated = undefined;
                            this.resetCoordinates = false;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                } else if (shiftVal == "up") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.resetCoordinates || this.upCoordinatesUpdated == undefined || this.upCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            // loop through all the points and increase/decrease based on selections
                            for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
                                //this.pts[p] += 2 * xincrement; this.spts[p] += 2 * xincrement;
                                this.pts[p + 1] += 2 * xincrement;
                                this.spts[p + 1] += 2 * xincrement;
                            } // end for loop
                            this.upCoordinatesUpdated = true;
                            this.downCoordinatesUpdated = undefined;
                            this.leftCoordinatesUpdated = undefined;
                            this.rightCoordinatesUpdated = undefined;
                            this.inwardCoordinatesUpdated = undefined;
                            this.outwardCoordinatesUpdated = undefined;
                            this.resetCoordinates = false;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                } else if (shiftVal == "down") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.resetCoordinates || this.downCoordinatesUpdated == undefined || this.downCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            // loop through all the points and increase/decrease based on selections
                            for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
                                //this.pts[p] += 2 * xincrement; this.spts[p] += 2 * xincrement;
                                this.pts[p + 1] -= 2 * xincrement;
                                this.spts[p + 1] -= 2 * xincrement;
                            } // end for loop
                            this.downCoordinatesUpdated = true;
                            this.upCoordinatesUpdated = undefined;
                            this.leftCoordinatesUpdated = undefined;
                            this.rightCoordinatesUpdated = undefined;
                            this.inwardCoordinatesUpdated = undefined;
                            this.outwardCoordinatesUpdated = undefined;
                            this.resetCoordinates = false;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                } else if (shiftVal == 'inward') {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.resetCoordinates || this.inwardCoordinatesUpdated == undefined || this.inwardCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            if (this.pts.length == 6) {
                                this.pts[1] -= 2 * yincrement;
                                // mid point logic
                                this.pts[2] -= 2 * xincrement * .75;
                                this.pts[3] -= 2 * xincrement * .75;
                                this.pts[4] -= 2 * xincrement;
                            }
                            if (this.spts.length == 6) {
                                this.spts[1] -= 2 * yincrement;
                                // mid point logic
                                this.spts[2] -= 2 * xincrement * .75;
                                this.spts[3] -= 2 * xincrement * .75;
                                this.spts[4] -= 2 * xincrement;
                            }
                            this.inwardCoordinatesUpdated = true;
                            this.outwardCoordinatesUpdated = undefined;
                            this.leftCoordinatesUpdated = undefined;
                            this.rightCoordinatesUpdated = undefined;
                            this.upCoordinatesUpdated = undefined;
                            this.downCoordinatesUpdated = undefined;
                            this.resetCoordinates = false;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                } // end if inward
                else if (shiftVal == 'outward') {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.resetCoordinates || this.outwardCoordinatesUpdated == undefined || this.outwardCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            if (this.pts.length == 6) {
                                this.pts[1] += 2 * yincrement;
                                // mid point logic
                                this.pts[2] += 2 * xincrement * .75;
                                this.pts[3] += 2 * xincrement * .75;
                                this.pts[4] += 2 * xincrement;
                            }
                            if (this.spts.length == 6) {
                                this.spts[1] += 2 * yincrement;
                                // mid point logic
                                this.spts[2] += 2 * xincrement * .75;
                                this.spts[3] += 2 * xincrement * .75;
                                this.spts[4] += 2 * xincrement;
                            }

                            this.outwardCoordinatesUpdated = true;
                            this.inwardCoordinatesUpdated = undefined;
                            this.leftCoordinatesUpdated = undefined;
                            this.rightCoordinatesUpdated = undefined;
                            this.upCoordinatesUpdated = undefined;
                            this.downCoordinatesUpdated = undefined;
                            this.resetCoordinates = false;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                } // end if outward
            } //end if precise condition
            else {
                if (graphSe.mode.includes('incorrect')) { ////SWG-139 Changes
                    ////SWG-391 Changes
                    var nn = Number(graphSe.mode.charAt(9));
                    if (this.relementlabelinc[nn] != "Accepted Area")
                        ////SWG-391 Changes Ends
                        this.IncorrectMe();
                }

                ////SWG-139 Changes
                if (this.resetCoordinates) {
                    this.ResetMe();
                    this.resetCoordinates = false;
                }
                ////SWG-139 Changes end
            }
        }
        var clr = this.iscurrent == true ? this.cc : this.ccus;
        this.myPath = new paper.Path();
        this.myPath.strokeColor = clr;
        this.myPath.strokeWidth = this.width;


        for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
            if (mouseIsDown && this == theCurve && this.swipingPts && p > 6) {
                var xpt = graphSe.ConvertXgToXpx(this.pts[p]);
                var ypt = graphSe.ConvertYgToYpx(this.pts[p + 1]);
            } else {
                var xpt = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[p] : this.pts[p]);
                var ypt = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[p + 1] : this.pts[p + 1]);
            }

            this.myPath.add(new paper.Point(xpt, ypt));
            this.myPath.smooth();
        }

        ////SWG - 199
        if (graphSe.mode.includes("incorrect")) {
            var nn = Number(graphSe.mode.charAt(9));
            if (this.deletedFrom != undefined && this.deletedFrom[nn] != undefined) {
                this.myPath.visible = false;
            }
            else {
                this.myPath.visible = true;
            }
        }

        if (this.myPath.segments.length >= 2) {
            this.myPath.segments[0].handleIn = [0, 0];
            this.myPath.segments[0].handleOut = [0, 0];

            //this.myPath.segments[1].handleIn = [-30,0];
            //this.myPath.segments[1].handleOut = [30,0];
        }

        if (this.myPath.segments.length >= 3) {
            var dx = this.myPath.segments[2].point.x - this.myPath.segments[0].point.x;
            var dy = this.myPath.segments[2].point.y - this.myPath.segments[0].point.y;

            var sf = 4;

            this.myPath.segments[1].handleIn = [-dx / sf, -dy / sf];
            this.myPath.segments[1].handleOut = [dx / sf, dy / sf];

            this.myPath.segments[2].handleIn = [0, 0];
            this.myPath.segments[2].handleOut = [0, 0];
        }

        if (this.plumbLine) this.PlumbLine();

        if (this.iscurrent) this.ControlPoints();
        //SWG-87
        // if(this.tempLableLine == undefined && this.elementlabel!='' && this.mode!='designer'){
        //     this.SetElementLabel(this.elementlabel);
        // }
        if ((this.labelLine || this.tempLableLine) && this.myPath.visible) this.LabelLine();

        //this.myPath.smooth();
        //this.myPath.simplify(1.0);
    }

    this.TrackAlong = function (lbl) {
        if (lbl != undefined) this.trackAlongLabel = lbl;

        var trackElement = graphSe.FindInGraph(this.trackAlongLabel);

        if (trackElement != null) {
            var t = trackElement;
            var s = t.SwapPoints();
            this.trackAng = Math.atan2(s.ye - s.ys, s.xe - s.xs);
        }
    }

    this.Track = function (dist) {
        var ang = this.trackAng;
        var dx = Math.cos(ang) * dist;
        var dy = Math.sin(ang) * dist;
        return { sx: dx, sy: dy };
    }

    this.SetupDesigner = function () {
        if (this.ghost) {
            var gh = this.ghost;
            for (var i = 0, ln = gh.pts.length; i < ln; i++) {
                this.pts[i] = gh.pts[i];
                this.spts[i] = gh.spts[i];
            }
        }
    }

    this.SetupCorrect = function () {
        var me;
        if (this.correct.length > 0) {
            var cr = this.correct[0];
            if (cr.type == undefined || cr.type[1] != "area" && this.interactive) {
                for (var i = 0, ln = cr.pts.length; i < ln; i++) {
                    this.pts[i] = cr.pts[i];
                    this.spts[i] = cr.spts[i];
                }
            } else if (!this.interactive && graphSe.mode == "designer") this.CorrectMe();
            else if (cr.type[1] == "relative") {
                var ro = graphSe.FindInGraph(cr.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    for (var i = 0, ln = me.pts.length; i < ln; i++) {
                        this.pts[i] = me.pts[i];
                        this.spts[i] = me.spts[i];
                    }
                }
            }
        }
    }

    this.SetupIncorrect = function (nn) {
        var me;
        if (!graphSe.incorrectActive[nn]) {
            if (this.correct[0] != null) {
                var ca = this.correct[0];
                this.IncorrectMe(ca, nn, ca.type);
            }
        }

        if (this.incorrect[nn] != null) {
            var cr = this.incorrect[nn];
            if (cr.pts != undefined && (cr.type == undefined || cr.type[1] != "area")) {
                for (var i = 0, ln = cr.pts.length; i < ln; i++) {
                    this.pts[i] = cr.pts[i];
                    this.spts[i] = cr.spts[i];
                }
            } else if (!this.interactive && graphSe.mode == "designer") this.IncorrectMe();
            else if (cr.type[1] == "relative") {
                var ro = graphSe.FindInGraph(ca.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    for (var i = 0, ln = me.pts.length; i < ln; i++) {
                        this.pts[i] = me.pts[i];
                        this.spts[i] = me.spts[i];
                    }
                }
            }
        }
    }

    this.SetupStudent = function () {
        if (this.ghost) {
            var gh = this.ghost;
            for (var i = 0, ln = gh.pts.length; i < ln; i++) {
                this.pts[i] = gh.pts[i];
                this.spts[i] = gh.spts[i];
            }
        }
    }

    // drawghost of a curve
    this.DrawGhost = function () {
        var gh = this.ghost;
        var ghPath = new paper.Path();
        ghPath.strokeColor = gh.clr;
        ghPath.strokeWidth = this.width;
        ghPath.dashArray = [2, 2];
        clr = this.iscurrent == true ? this.cc : this.ccus;

        for (var p = 0, ln = gh.pts.length; p < ln; p += 2) {
            var xpt = graphSe.ConvertXgToXpx(graphSe.snapIt ? gh.spts[p] : gh.pts[p]);
            var ypt = graphSe.ConvertYgToYpx(graphSe.snapIt ? gh.spts[p + 1] : gh.pts[p + 1]);
            ghPath.add(new paper.Point(xpt, ypt));
        }

        ghPath.segments[0].handleIn = [0, 0];
        ghPath.segments[0].handleOut = [0, 0];

        var dx = ghPath.segments[2].point.x - ghPath.segments[0].point.x;
        var dy = ghPath.segments[2].point.y - ghPath.segments[0].point.y;

        var sf = 4;

        ghPath.segments[1].handleIn = [-dx / sf, -dy / sf];
        ghPath.segments[1].handleOut = [dx / sf, dy / sf];

        ghPath.segments[2].handleIn = [0, 0];
        ghPath.segments[2].handleOut = [0, 0];

        var spt = graphSe.snapIt ? { x: this.ghost.spts[2], y: this.ghost.spts[3] } : { x: this.ghost.pts[2], y: this.ghost.pts[3] };
        var pt = graphSe.snapIt ? { x: this.ghost.spts[4], y: this.ghost.spts[5] } : { x: this.ghost.pts[4], y: this.ghost.pts[5] };

        var xoffset = 0;
        var yoffset = 0;

        pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
        pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
        spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
        spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

        var d = 20;

        var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
        var newx = pt.x + d * (pt.x - spt.x) / mag
        var newy = pt.y + d * (pt.y - spt.y) / mag

        if (this.labelLine == true) {
            text = new paper.PointText(new paper.Point(newx, newy));
            text.justification = 'center';
            text.fillColor = this.ccus;
            text.content = this.labeledit;
        }

    }

    this.AddPoint = function (pt, event) {
        //var ln = this.pts.length;
        //var dx = this.pts[ln-2] - pt.x;
        //var dy = this.pts[ln-1] - pt.y;
        //if( (dx*dx + dy*dy) < 28 ) return;

        var lastindex = this.spts.length - 1;
        var ptxg = graphSe.ConvertXpxToXg(pt.x);
        var ptyg = graphSe.ConvertYpxToYg(pt.y);

        var myCurvePointObj = {};
        myCurvePointObj.X = ptxg;
        myCurvePointObj.Y = ptyg;
        myCurvePointObj.snapX = graphSe.SnapX(ptxg);
        myCurvePointObj.snapY = graphSe.SnapY(ptyg);

        if (this.pts.length > 0 && event) {
            var pointDistance = Math.sqrt((pt.x - graphSe.ConvertXgToXpx(this.pts[lastindex - 1])) * (pt.x - graphSe.ConvertXgToXpx(this.pts[lastindex - 1])) + ((pt.y - graphSe.ConvertYgToYpx(this.pts[lastindex])) * (pt.y - graphSe.ConvertYgToYpx(this.pts[lastindex]))));
            if (pointDistance < 25)
                myCurvePointObj = checkPointDifferance(myCurvePointObj, theCurve);
        }

        this.pts.push(myCurvePointObj.X);
        this.pts.push(myCurvePointObj.Y);

        this.spts.push(graphSe.SnapX(myCurvePointObj.X));
        this.spts.push(graphSe.SnapY(myCurvePointObj.Y));

        this.SetElementPoints();
    }

    this.MidPoint = function () {
        var mx, my, dst;
        var ax = graphSe.ConvertXgToXpx(this.pts[0]);
        var ay = graphSe.ConvertYgToYpx(this.pts[1]);

        var ib = this.pts.length - 2;
        var bx = graphSe.ConvertXgToXpx(this.pts[ib]);
        var by = graphSe.ConvertYgToYpx(this.pts[ib + 1]);

        var a = new paper.Point(ax, ay);
        var b = new paper.Point(bx, by);

        var ab = b.subtract(a);

        for (var i = 2, mxdst = 0, ln = this.pts.length - 2; i < ln; i += 2) {
            var cx = graphSe.ConvertXgToXpx(this.pts[i]);
            var cy = graphSe.ConvertYgToYpx(this.pts[i + 1]);
            var c = new paper.Point(cx, cy);
            var ac = c.subtract(a);

            var dst = Math.abs(ac.cross(ab)) / ab.length;
            if (dst > mxdst) {
                mxdst = dst;
                mx = cx, my = cy
            }
        }

        this.pts[2] = graphSe.ConvertXpxToXg(mx);
        this.pts[3] = graphSe.ConvertYpxToYg(my);
        this.pts[4] = this.pts[ib];
        this.pts[5] = this.pts[ib + 1];
        this.pts.splice(6, ib);
        this.spts.splice(6, ib);
        this.SnapMe();
        this.SetSettings();
    }

    this.HitMe = function (mpt) {
        var hitCp = false;
        var mypt = new paper.Path.Circle(new paper.Point(mpt.x, mpt.y), graphSe.handleRadius);

        this.PathMe();

        var gii = this.path.getIntersections(mypt);
        var giiln = gii.length;

        if (!giiln) {
            var icp = [0, 2, 4];
            for (var i = 0, ln = icp.length; i < ln && !hitCp; i++) {
                var k = icp[i];
                var pxg = graphSe.snapIt ? this.spts[k] : this.pts[k];
                var pyg = graphSe.snapIt ? this.spts[k + 1] : this.pts[k + 1];

                hitCp = graphSe.HitPt(mpt, pxg, pyg, graphSe.handleRadius);
            }
        }

        return giiln || hitCp;
    }

    //For Curve
    this.MoveMe = function (type, dx, dy) {
        if (type == "start" || type == "all") {
            this.pts[0] -= dx;
            this.pts[1] -= dy;
        };
        if (type == "middle" || type == "all") {
            this.pts[2] -= dx;
            this.pts[3] -= dy;
        };
        if (type == "end" || type == "all") {
            this.pts[4] -= dx;
            this.pts[5] -= dy;
        }
        if (graphSe.mode == "designer" && this.interactive) {
            this.GhostMe();
            this.posMoved = true;
        }
        else {
            this.posMoved = false;
        }
        this.SnapMe();
    }

    this.ControlMe = function (tf) {
        this.showControl = tf;
    }

    //For curve
    this.DragMe = function (mpt, drgSt) {
        if (drgSt != undefined) this.dragState = drgSt;

        switch (this.dragState) {
            case "off":
                if (graphSe.boo && this.interactive && !this.ghost && graphSe.mode != "student") this.GhostMe();
                dragObj = this;
                this.dragstart = mpt;
                this.dragDxDy = { dx: 0, dy: 0 };
                var pts = graphSe.snapIt ? { x: this.spts[0], y: this.spts[1] } : { x: this.pts[0], y: this.pts[1] };
                var ptm = graphSe.snapIt ? { x: this.spts[2], y: this.spts[3] } : { x: this.pts[2], y: this.pts[3] };
                var pte = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };
                if (graphSe.HitPt(mpt, pts.x, pts.y, graphSe.handleRadius) && !this.locked) {
                    this.dragState = "dragStart";
                    //SWG-248 changes
                    // //Shashikant:Added lines to fix SWG-43
                    // for (var i = 0; i < graphMe.length; i++) {
                    //     if (graphMe[i].mode == "designer" && graphMe[i].label == dragObj.label && graphSe.mode != "designer")
                    //         this.dragState = "dragCurve";
                    // }
                    if (this.mode != graphSe.mode)
                        this.dragState = "dragCurve";
                }
                else if (graphSe.HitPt(mpt, ptm.x, ptm.y, graphSe.handleRadius) && !this.locked) {
                    this.dragState = "dragMiddle";
                    //SWG-248 changes
                    // //Shashikant:Added lines to fix SWG-43
                    // for (var i = 0; i < graphMe.length; i++) {
                    //     if (graphMe[i].mode == "designer" && graphMe[i].label == dragObj.label && graphSe.mode != "designer")
                    //         this.dragState = "dragCurve";
                    // }
                    if (this.mode != graphSe.mode)
                        this.dragState = "dragCurve";
                }
                else if (graphSe.HitPt(mpt, pte.x, pte.y, graphSe.handleRadius) && !this.locked) {
                    this.dragState = "dragEnd";
                    //SWG-248 changes
                    // //Shashikant:Added lines to fix SWG-43
                    // for (var i = 0; i < graphMe.length; i++) {
                    //     if (graphMe[i].mode == "designer" && graphMe[i].label == dragObj.label && graphSe.mode != "designer")
                    //         this.dragState = "dragCurve";
                    // }
                    if (this.mode != graphSe.mode)
                        this.dragState = "dragCurve";
                }
                else this.dragState = "dragCurve";
                //if(graphSe.mode=="correct")Precise(true);
                if (graphSe.mode == "student") this.studentdrag = true;

                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") this.SetCorrectPoints();
                break;

            case "dragStart":
                var dsxg = graphSe.ConvertXpxToXg(this.dragstart.x) - graphSe.ConvertXpxToXg(mpt.x);
                var dsyg = graphSe.ConvertYpxToYg(this.dragstart.y) - graphSe.ConvertYpxToYg(mpt.y);
                this.pts[0] -= dsxg;
                this.pts[1] -= dsyg;
                if (this.mode == 'student') {//SWG_426 changes
                    this.pts[0] = this.pts[0] < graphSe.xmin ? graphSe.xmin : (this.pts[0] > graphSe.xmax ? graphSe.xmax : this.pts[0]);//SWG_426 changes
                    this.pts[1] = this.pts[1] < graphSe.ymin ? graphSe.ymin : (this.pts[1] > graphSe.ymax ? graphSe.ymax : this.pts[1]);//SWG_426 changes
                }
                //Changes for SWG-47 By Akash
                this.SnapMe();
                if (graphSe.mode == "designer" && this.ghost != undefined) {
                    this.ghost.pts[0] = this.pts[0];
                    this.ghost.pts[1] = this.pts[1];
                    this.ghost.spts[0] = this.spts[0];
                    this.ghost.spts[1] = this.spts[1];
                }
                //End of changes SWG-47

                this.SetElementPoints();

                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") this.SetCorrectPoints();
                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx += dsxg, dy: this.dragDxDy.dy += dsyg };
                this.dragPt = "start"
                break;

            case "dragMiddle":
                var dsxg = graphSe.ConvertXpxToXg(this.dragstart.x) - graphSe.ConvertXpxToXg(mpt.x);
                var dsyg = graphSe.ConvertYpxToYg(this.dragstart.y) - graphSe.ConvertYpxToYg(mpt.y);
                this.pts[2] -= dsxg;
                this.pts[3] -= dsyg;
                if (this.mode == 'student') {//SWG_426 changes
                    this.pts[2] = this.pts[2] < graphSe.xmin ? graphSe.xmin : (this.pts[2] > graphSe.xmax ? graphSe.xmax : this.pts[2]);//SWG_426 changes
                    this.pts[3] = this.pts[3] < graphSe.ymin ? graphSe.ymin : (this.pts[3] > graphSe.ymax ? graphSe.ymax : this.pts[3]);//SWG_426 changes
                }
                //Changes for SWG-47 By Akash
                this.SnapMe();
                if (graphSe.mode == "designer" && this.ghost != undefined) {
                    this.ghost.pts[2] = this.pts[2];
                    this.ghost.pts[3] = this.pts[3];
                    this.ghost.spts[2] = this.spts[2];
                    this.ghost.spts[3] = this.spts[3];
                }
                //End of changes SWG-47
                this.SetElementPoints();

                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") this.SetCorrectPoints();
                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx += dsxg, dy: this.dragDxDy.dy += dsyg };
                this.dragPt = "middle"
                break;

            case "dragEnd":
                var dsxg = graphSe.ConvertXpxToXg(this.dragstart.x) - graphSe.ConvertXpxToXg(mpt.x);
                var dsyg = graphSe.ConvertYpxToYg(this.dragstart.y) - graphSe.ConvertYpxToYg(mpt.y);
                this.pts[4] -= dsxg;
                this.pts[5] -= dsyg;
                if (this.mode == 'student') {//SWG_426 changes
                    this.pts[4] = this.pts[4] < graphSe.xmin ? graphSe.xmin : (this.pts[4] > graphSe.xmax ? graphSe.xmax : this.pts[4]);//SWG_426 changes
                    this.pts[5] = this.pts[5] < graphSe.ymin ? graphSe.ymin : (this.pts[5] > graphSe.ymax ? graphSe.ymax : this.pts[5]);//SWG_426 changes
                }
                //Changes for SWG-47 By Akash
                this.SnapMe();
                if (graphSe.mode == "designer" && this.ghost != undefined) {
                    this.ghost.pts[4] = this.pts[4];
                    this.ghost.pts[5] = this.pts[5];
                    this.ghost.spts[4] = this.spts[4];
                    this.ghost.spts[5] = this.spts[5];
                }
                //End of changes SWG-47
                this.SetElementPoints();
                //Swg-128 Changes
                if (graphSe.mode == 'student') {
                    this.upadeteStudLabelPossitiopn();
                }

                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") this.SetCorrectPoints();
                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx += dsxg, dy: this.dragDxDy.dy += dsyg };
                this.dragPt = "end"
                break;

            case "dragCurve":

                //var dsxg = graphSe.ConvertXpxToXg( this.dragstart.x ) - graphSe.ConvertXpxToXg( mpt.x );
                //var dsyg = graphSe.ConvertYpxToYg( this.dragstart.y ) - graphSe.ConvertYpxToYg( mpt.y );

                var dsxg = graphSe.ConvertXpxToXg(mpt.x) - graphSe.ConvertXpxToXg(this.dragstart.x);
                var dsyg = graphSe.ConvertYpxToYg(mpt.y) - graphSe.ConvertYpxToYg(this.dragstart.y);
                //console.log("mpt.y and dragstart.y: (" + mpt.y +','+ dsyg +")");
                if ((this.elementlabel == "PPF") && this.IsPPF()) {
                    var xs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[0] : this.pts[0]);
                    var ys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[1] : this.pts[1]);
                    var xe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[4] : this.pts[4]);
                    var ye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[5] : this.pts[5]);

                    if (xs <= 3) {
                        this.pts[1] += dsxg;
                        this.pts[4] += dsxg;
                    } else {
                        this.pts[5] -= dsxg;
                        this.pts[0] += dsxg;
                    }

                    this.pts[2] += dsxg * .8;
                    this.pts[3] += dsxg * .8;
                } else {
                    if (this.taelement != "None") {
                        var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                        var slope = null;
                        if (tracToElement.what == 'line') {
                            if ((tracToElement.m).indexOf('-') != -1) {
                                dsxg = dsxg * (-1);
                                dsyg = dsyg * (-1);
                            }
                        }
                        var minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                        var maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                        var minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                        var maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                        this.TrackAlong();
                        var s = this.Track(dsxg);
                        var s1 = this.Track(dsyg);
                        if (minY == maxY) {
                            dsxg = s.sx;
                            dsyg = s.sy;
                        }
                        else {
                            dsxg = s1.sx;
                            dsyg = s1.sy;
                        }

                        if (minX == maxX) {
                            //this.pts[0] += dsxg;
                            this.pts[1] += dsyg;
                            //this.pts[2] += dsxg;
                            this.pts[3] += dsyg;
                            //this.pts[4] += dsxg;
                            this.pts[5] += dsyg;
                        }
                        else if (minY == maxY) {
                            this.pts[0] += dsxg;
                            //this.pts[1] += dsyg;
                            this.pts[2] += dsxg;
                            //this.pts[3] += dsyg;
                            this.pts[4] += dsxg;
                            //this.pts[5] += dsyg;
                        }
                        else {
                            this.pts[0] += dsxg;
                            this.pts[1] += dsyg;
                            this.pts[2] += dsxg;
                            this.pts[3] += dsyg;
                            this.pts[4] += dsxg;
                            this.pts[5] += dsyg;
                        }
                    }
                    else {
                        //SWG_426 changes
                        if (this.mode == 'student') {
                            for (var i = 0; i < 6; i += 2) {
                                if ((this.pts[i] <= graphSe.xmin || this.pts[i] >= graphSe.xmax) && (this.pts[i] + dsxg < graphSe.xmin || this.pts[i] + dsxg > graphSe.xmax))
                                    return;
                                if ((this.pts[i + 1] <= graphSe.ymin || this.pts[i + 1] >= graphSe.ymax) && (this.pts[i + 1] + dsyg < graphSe.ymin || this.pts[i + 1] + dsyg > graphSe.ymax))
                                    return;
                            }
                        }
                        //SWG_426 changes end
                        this.pts[0] += dsxg;
                        this.pts[1] += dsyg;
                        this.pts[2] += dsxg;
                        this.pts[3] += dsyg;
                        this.pts[4] += dsxg;
                        this.pts[5] += dsyg;
                    }
                }

                if (this.mode == 'student') {//SWG_426 changes
                    this.pts[0] = this.pts[0] < graphSe.xmin ? graphSe.xmin : (this.pts[0] > graphSe.xmax ? graphSe.xmax : this.pts[0]);//SWG_426 changes
                    this.pts[1] = this.pts[1] < graphSe.ymin ? graphSe.ymin : (this.pts[1] > graphSe.ymax ? graphSe.ymax : this.pts[1]);//SWG_426 changes
                    this.pts[2] = this.pts[2] < graphSe.xmin ? graphSe.xmin : (this.pts[2] > graphSe.xmax ? graphSe.xmax : this.pts[2]);//SWG_426 changes
                    this.pts[3] = this.pts[3] < graphSe.ymin ? graphSe.ymin : (this.pts[3] > graphSe.ymax ? graphSe.ymax : this.pts[3]);//SWG_426 changes
                    this.pts[4] = this.pts[4] < graphSe.xmin ? graphSe.xmin : (this.pts[4] > graphSe.xmax ? graphSe.xmax : this.pts[4]);//SWG_426 changes
                    this.pts[5] = this.pts[5] < graphSe.ymin ? graphSe.ymin : (this.pts[5] > graphSe.ymax ? graphSe.ymax : this.pts[5]);//SWG_426 changes
                }
                this.path.smooth();
                this.SnapMe();

                this.SetElementPoints();
                //Swg-128 Changes
                if (graphSe.mode == 'student') {
                    this.upadeteStudLabelPossitiopn();
                }

                if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") this.SetCorrectPoints();

                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx -= dsxg, dy: this.dragDxDy.dy -= dsyg };
                this.dragPt = "all";
                break;

            case "drop":
                dragObj = null;
                //Added to shift object again when come back from correct tab to designe and move the object - By Akash
                if (graphSe.mode == "designer" && this.interactive) {
                    this.posMoved = true;
                }
                else {
                    this.posMoved = false;
                }
                this.dragState = "off";
                this.dragStart = null;
                if (this.dragDxDy.dx != 0 || this.dragDxDy.dy != 0) {
                    this.SetElementPoints();
                    if (graphSe.mode == "correct" || graphSe.mode.substring(0, 9) == "incorrect") this.PreciseMe(true);
                    if (graphSe.mode == "correct" || graphSe.mode.substring(0, 9) == "incorrect") this.SetCorrectPoints();
                    graphSe.OpsMoveElement(this, this.dragPt, -this.dragDxDy.dx, -this.dragDxDy.dy);
                    if (graphSe.mode.substring(0, 9) == "incorrect") this.IncorrectMe();
                    if (graphSe.mode == "correct") this.CorrectMe();
                    //if( graphSe.mode == "student" )
                    //    { if( !this.CheckIsCorrect( ) ) this.CheckIsIncorrect( ); }
                    if (graphSe.mode == "designer" && this.interactive) {
                        this.GhostMe();
                        this.UpdateIncorrects()
                    }
                    if (graphSe.mode == "designer" && this.interactive && this.correct[0] != null)
                        this.CorrectMe(this.correct[0].type);
                }
                break;
        }
    }
    //Swg-128 Changes
    this.upadeteStudLabelPossitiopn = function () {
        var selectObje = $('#' + this.studentlabelid);
        if (selectObje) {
            if ($(selectObje).children().attr('data-uniqueid') == this.uniqueLabel) {
                var spt = graphSe.snapIt ? { x: this.spts[2], y: this.spts[3] } : { x: this.pts[2], y: this.pts[3] };
                var pt = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };

                var xoffset = 0;
                var yoffset = 0;

                pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
                pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
                spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
                spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

                var d = 20;

                var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2));
                var newx = pt.x + d * (pt.x - spt.x) / mag;
                var newy = pt.y + d * (pt.y - spt.y) / mag;
                var left = newx + 37 + 'px';
                var top = newy + 179 + 'px';

                ///SWG-221 Changes
                if (graphSe.titleshow && graphSe.title != "") top = newy + 158 + 'px';
                else top = newy + 105 + 'px';
                ////SWG-221 Changes end

                $('#' + this.studentlabelid).css('left', left);
                $('#' + this.studentlabelid).css('top', top);
            }
        }
    }

    this.ControlPoints = function () {
        var pts = graphSe.snapIt ? { x: this.spts[0], y: this.spts[1] } : { x: this.pts[0], y: this.pts[1] };
        pts.x = pts.x == graphSe.xmin ? pts.x + 0.2 * graphSe.xinc : (pts.x == graphSe.xmax ? pts.x - 0.2 * graphSe.xinc : pts.x); ////SWG - 233 -- * graphSe.xinc & graphSe.yinc
        pts.y = pts.y == graphSe.ymax ? pts.y - 0.2 * graphSe.yinc : pts.y; ////SWG - 233 -- * graphSe.xinc & graphSe.yinc

        var ptm = graphSe.snapIt ? { x: this.spts[2], y: this.spts[3] } : { x: this.pts[2], y: this.pts[3] };
        ptm.x = ptm.x == graphSe.xmin ? ptm.x + 0.2 * graphSe.xinc : (ptm.x == graphSe.xmax ? ptm.x - 0.2 * graphSe.xinc : ptm.x); ////SWG - 233 -- * graphSe.xinc & graphSe.yinc
        ptm.yx = ptm.y == graphSe.ymax ? ptm.y - 0.2 * graphSe.yinc : ptm.y; ////SWG - 233 -- * graphSe.xinc & graphSe.yinc

        var pte = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };
        pte.x = pte.x == graphSe.xmin ? pte.x + 0.2 * graphSe.xinc : (pte.x == graphSe.xmax ? pte.x - 0.2 * graphSe.xinc : pte.x); ////SWG - 233 -- * graphSe.xinc & graphSe.yinc
        pte.y = pte.y == graphSe.ymax ? pte.y - 0.2 * graphSe.yinc : pte.y; ////SWG - 233 -- * graphSe.xinc & graphSe.yinc

        var ps = new paper.Path.Circle(new paper.Point(graphSe.ConvertXgToXpx(pts.x), graphSe.ConvertYgToYpx(pts.y)), graphSe.handleRadius);
        ps.strokeColor = graphSe.handleColor;
        ps.strokeWidth = 1;

        if (!mouseIsDown || !drawCurveMode || (this.dragState != "off")) {
            var pm = new paper.Path.Circle(new paper.Point(graphSe.ConvertXgToXpx(ptm.x), graphSe.ConvertYgToYpx(ptm.y)), graphSe.handleRadius);
            pm.strokeColor = graphSe.handleColor;
            pm.strokeWidth = 1;

            var pe = new paper.Path.Circle(new paper.Point(graphSe.ConvertXgToXpx(pte.x), graphSe.ConvertYgToYpx(pte.y)), graphSe.handleRadius);
            pe.strokeColor = graphSe.handleColor;
            pe.strokeWidth = 1;
        }

        ////SWG - 199 Changes
        if (graphSe.mode.includes("incorrect")) {
            var nn = Number(graphSe.mode.charAt(9));
            if (this.deletedFrom != undefined && this.deletedFrom[nn] != undefined) {
                ps.visible = false;
                if (pm) pm.visible = false; ////SWG - 295 Changes
                if (pe) pe.visible = false; ////SWG - 295 Changes
            }
        }
    }

    this.SnapMe = function () {
        for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
            this.spts[p] = graphSe.SnapX(this.pts[p]);
            this.spts[p + 1] = graphSe.SnapY(this.pts[p + 1]);
        }
    }

    this.PathMe = function () {
        this.path = this.myPath;
    }

    //for curve
    this.CorrectMe = function (type) {
        var aa = type != undefined ? type[1] == "area" : false;
        this.correct[0] = {
            type: type == undefined ? "precise" : type,
            lbl: aa ? this.correct[0].lbl : this.label,
            uniqueLabel: aa ? this.correct[0].uniqueLabel : this.uniqueLabel, ////SWG-357 Changes
            pts: [],
            spts: [],
            match: false
        };

        //changes to shift object again when come back from correct tab to designe and move the object - By Akash
        if ((type != undefined) && (type[1] == 'left' || type[1] == 'right' || type[1] == 'up' || type[1] == 'down' || type[1] == 'inward' || type[1] == 'outward') && (this.posMoved || this.isshiftdirectionchanged) && graphSe.mode == "correct") { ////SWG-457
            var shifValue = (type[1] == 'left' || type[1] == 'down' || type[1] == 'inward') ? -2 : 2; ////SWG-457
            var xincrement = 1;
            if (document.getElementById('xinc') != null) xincrement = document.getElementById('xinc').value;
            var yincrement = 1;
            if (document.getElementById('yinc') != null) yincrement = document.getElementById('yinc').value;

            if (type[1] == 'left' || type[1] == 'right') {
                // loop through all the points and increase/decrease based on selections
                for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
                    this.pts[p] = this.ghost.pts[p] + (shifValue * xincrement);
                    this.spts[p] = this.ghost.spts[p] + (shifValue * xincrement);
                } // end for loop
                this.leftCoordinatesUpdated = type[1] == 'left' ? true : undefined;
                this.rightCoordinatesUpdated = type[1] == 'right' ? true : undefined;
            }
            if (type[1] == 'up' || type[1] == 'down') {
                // loop through all the points and increase/decrease based on selections
                for (var p = 1, ln = this.pts.length; p < ln; p += 2) {
                    this.pts[p] = this.ghost.pts[p] + (shifValue * xincrement);
                    this.spts[p] = this.ghost.spts[p] + (shifValue * xincrement);
                } // end for loop
                this.upCoordinatesUpdated = type[1] == 'up' ? true : undefined;
                this.downCoordinatesUpdated = type[1] == 'down' ? true : undefined;
            }
            ////SWG-457 changes
            if (type[1] == 'inward' || type[1] == 'outward') {
                if (this.pts.length == 6) {
                    this.pts[1] = this.ghost.pts[1] + (shifValue * yincrement);
                    this.pts[2] = this.ghost.pts[2] + (shifValue * xincrement * 0.75);
                    this.pts[3] = this.ghost.pts[3] + (shifValue * xincrement * 0.75);
                    this.pts[4] = this.ghost.pts[4] + (shifValue * xincrement);
                    this.SnapMe();
                }
                this.inwardCoordinatesUpdated = type[1] == 'inward' ? true : undefined;
                this.outwardCoordinatesUpdated = type[1] == 'outward' ? true : undefined;
            }
            ////SWG-457 changes end

            this.posMoved = false;
            this.isshiftdirectionchanged = false; ////SWG-457
            this.originalCoordinates = { pts: this.ghost.pts, spts: this.ghost.spts };

        }
        if (type == undefined) {
            this.posMoved = false;
            this.isshiftdirectionchanged = false; ////SWG-457
        }
        //changes to shift object again when come back from correct tab to designe and move the object end
        for (var i = 0, ln = this.pts.length; i < ln; i++) {
            this.correct[0].pts[i] = this.pts[i];
            this.correct[0].spts[i] = this.spts[i];
        }
    }

    this.IncorrectMe = function (ca, nn, type) {
        var n = nn == undefined ? Number(graphSe.mode[9]) : nn;
        var ca = ca == undefined ? this : ca;
        var lbl = ca == this ? ca.label : ca.lbl;

        this.incorrect[n] = { nn: n, type: type == undefined ? "precise" : type, lbl: lbl, uniqueLabel: ca.uniqueLabel, pts: [], spts: [], match: false };

        for (var i = 0, ln = ca.pts.length; i < ln; i++) {
            this.incorrect[n].pts[i] = ca.pts[i];
            this.incorrect[n].spts[i] = ca.spts[i];
        }
    }

    this.UpdateIncorrects = function () {
        for (var i = 1; i < 4; i++) {
            if (this.incorrect[i] != null) {
                if (this.incorrect[i].type[0] == "relative") this.IncorrectMe(undefined, i, this.incorrect[i].type);
            }
        }
    }
    //for Curve
    this.CheckIsCorrect = function (mode, answer) {
        var tst;
        var labelcorrect = true;
        var correct, nn;
        var ca;

        if (answer == undefined) correct = this.correct[0]
        else {
            correct = answer;
            nn = correct.nn
        }

        if (correct != undefined && mode == undefined) {
            var typ = correct.type;
            var area = (typ != undefined) && (typ.length == 3);
            if (typ == "precise" || typ == undefined || area) {
                ca = correct;
                switch (ca.lbl[0]) {
                    case 'C':
                        tst = this.IsEqual(ca);

                        //tst = !tst ? this.FindMatch( ) : tst;
                        break;

                    case 'A':
                        //SWG-64 changes
                        //var aao = graphSe.FindInGraph(ca.lbl);
                        var aao = graphSe.FindInGraph(ca.uniqueLabel != undefined ? ca.uniqueLabel : ca.lbl);
                        aao.PathMe();
                        for (var i = 0, ssq = 0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                            var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
                            var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);

                            tst = tst && aao.path.contains(new paper.Point(px, py));
                        }
                        break;

                    default:
                        tst = false;
                        break;
                }
            } else if (typ.length == 2) {
                var lfrt = typ[1];
                ca = this;
                //SWG-340 Changes
                //var pca = graphSe.snapIt ? ca.spts : ca.pts;
                var pca = ca.pts;
                var cpx = graphSe.ConvertXgToXpx(pca[0]);
                var cpy = graphSe.ConvertYgToYpx(pca[1]);
                var cpxm = graphSe.ConvertXgToXpx(pca[2]);
                var cpym = graphSe.ConvertYgToYpx(pca[3]);
                var cpxe = graphSe.ConvertXgToXpx(pca[4]);
                var cpye = graphSe.ConvertYgToYpx(pca[5]);

                rele = graphSe.FindInGraph(nn == undefined ? this.relementlabel : this.relementlabelinc[nn]);

                var c = ca.SwapPoints();
                var r = rele.SwapPoints();
                if (rele == this) r = this.SwapCorrectPoints();

                if (rele instanceof Curve) {
                    if (rele == this) rele = correct;

                    //Changes for Production issue correct ans as Incorrect
                    if (this.originalCoordinates != undefined && this.originalCoordinates != null) {
                        rele.pts = this.ghost.pts;
                        rele.spts = this.ghost.spts;
                    }
                    //Changes for Production issue correct ans as Incorrect end
                    //SWG-340 Changes
                    // var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[0] : rele.pts[0]);
                    // var ypx = graphSe.ConvertYgToYpx(graphSe.snapIt ? rele.spts[1] : rele.pts[1]);
                    // var xpm = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[2] : rele.pts[2]);
                    // var ypm = graphSe.ConvertYgToYpx(graphSe.snapIt ? rele.spts[3] : rele.pts[3]);
                    // var xpe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[4] : rele.pts[4]);
                    // var ype = graphSe.ConvertYgToYpx(graphSe.snapIt ? rele.spts[5] : rele.pts[5]);
                    var xpx = graphSe.ConvertXgToXpx(rele.pts[0]);
                    var ypx = graphSe.ConvertYgToYpx(rele.pts[1]);
                    var xpm = graphSe.ConvertXgToXpx(rele.pts[2]);
                    var ypm = graphSe.ConvertYgToYpx(rele.pts[3]);
                    var xpe = graphSe.ConvertXgToXpx(rele.pts[4]);
                    var ype = graphSe.ConvertYgToYpx(rele.pts[5]);

                    if (lfrt == "left" || lfrt == "right") {
                        var isLeft = cpx < xpx && cpxm < xpm && cpxe < xpe;
                        var isRight = cpx > xpx && cpxm > xpm && cpxe > xpe;

                        if (lfrt == "left" && isLeft) tst = true;
                        else if (lfrt == "right" && isRight) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        ////SWG-457 changes
                        var isInward = false;
                        var isOutward = false;
                        var myCoordinates = graphSe.snapIt ? this.spts : this.pts;

                        isInward = (myCoordinates[1] < this.ghost.spts[1] && myCoordinates[2] < this.ghost.spts[2] && myCoordinates[3] < this.ghost.spts[3]
                            && myCoordinates[4] < this.ghost.spts[4]);

                        isOutward = (myCoordinates[1] > this.ghost.spts[1] && myCoordinates[2] > this.ghost.spts[2] && myCoordinates[3] > this.ghost.spts[3]
                            && myCoordinates[4] > this.ghost.spts[4]);

                        if (lfrt == "inward" && isInward) tst = true;
                        else if (lfrt == "outward" && isOutward) tst = true;
                        else tst = false;
                        ////SWG-457 changes ends
                    } else if (lfrt == "up" || lfrt == "down") {
                        var s = new paper.Point(xpx, ypx);
                        var m = new paper.Point(xpm, ypm);
                        var e = new paper.Point(xpe, ype);

                        var cs = new paper.Point(cpx, cpy);
                        var cm = new paper.Point(cpxm, cpym);
                        var ce = new paper.Point(cpxe, cpye);

                        var dxs = cs.x - s.x;
                        var dys = cs.y - s.y;
                        var dxm = cm.x - m.x;
                        var dym = cm.y - m.y;
                        var dxe = ce.x - e.x;
                        var dye = ce.y - e.y;
                        var dds = Math.sqrt(dxs * dxs + dys * dys);
                        var dde = Math.sqrt(dxe * dxe + dye * dye);

                        var dxsr = ce.x - s.x;
                        var dysr = ce.y - s.y;
                        var dxer = cs.x - e.x;
                        var dyer = cs.y - e.y;
                        var drs = Math.sqrt(dxsr * dxsr + dysr * dysr);
                        var dre = Math.sqrt(dxer * dxer + dyer * dyer);

                        if ((dds > drs) && (dde > dre)) {
                            dys = dysr;
                            dye = dyer;
                        }

                        var isUp = dys < 0 && dym < 0 && dye < 0;
                        var isDwn = dys > 0 && dym > 0 && dye > 0;
                        if (lfrt == "up" && isUp) tst = true;
                        else if (lfrt == "down" && isDwn) tst = true;
                        else tst = false;
                    }
                } else if (rele instanceof Point) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxg : rele.xg);

                    var cmn = Math.min(cpx, cpxm, cpxe);
                    var cmx = Math.max(cpx, cpxm, cpxe);


                    if (lfrt == "left" && cmx < xpx) tst = true;
                    else if (lfrt == "right" && cmn > xpx) tst = true;
                    else tst = false;
                } else if (rele instanceof Line) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxsg : rele.xsg);
                    var xpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxeg : rele.xeg);

                    if (lfrt == "left" || lfrt == "right") {
                        var xmn = Math.min(xpx, xpxe);
                        var xmx = Math.max(xpx, xpxe);

                        var cmn = Math.min(cpx, cpxm, cpxe);
                        var cmx = Math.max(cpx, cpxm, cpxe);

                        if (lfrt == "left" && cmx < xmn) tst = true;
                        else if (lfrt == "right" && cmn > xmx) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        var relep;
                        if (rele == correct) {
                            relep = new paper.Path();
                            relep.add(new paper.Point(xpx, ypx));
                            relep.add(new paper.Point(xpxe, ypxe));
                        } else {
                            rele.PathMe();
                            relep = rele.path.clone();
                        }
                        relep.add(new paper.Point(0, graphSe.htPx));
                        relep.closed = true;

                        var isInside = relep.contains(new paper.Point(cpx, cpy)) &&
                            relep.contains(new paper.Point(cpxm, cpym)) &&
                            relep.contains(new paper.Point(cpxe, cpye));

                        var isOff = (relep.hitTest(new paper.Point(cpx, cpy)) == null) &&
                            (relep.hitTest(new paper.Point(cpxm, cpym)) == null) &&
                            (relep.hitTest(new paper.Point(cpxe, cpye)) == null);

                        if (lfrt == "inward" && isInside && isOff) tst = true;
                        else if (lfrt == "outward" && !isInside && isOff) tst = true;
                        else tst = false;
                    } else if (lfrt == "up" || lfrt == "down") {
                        var r = rele.SwapPoints();
                        var dys = c.ys - r.ys;
                        var dye = c.ye - r.ye;

                        var isUp = dys > 0 && dye > 0;
                        var isDwn = dys < 0 && dye < 0;
                        if (lfrt == "up" && isUp) tst = true;
                        else if (lfrt == "down" && isDwn) tst = true;
                        else tst = false;
                    }
                } else if (rele instanceof Polyline) {
                    for (var i = 0, ln = rele.pts.length - 2, xmn = 10000, xmx = 0; i < ln; i += 2) {
                        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[i] : rele.pts[i]);
                        if (xpx < xmn) xmn = xpx;
                        else if (xpx > xmx) xmx = xpx;
                    }

                    var cmn = Math.min(cpx, cpxm, cpxe);
                    var cmx = Math.max(cpx, cpxm, cpxe);

                    if (lfrt == "left" && cmx < xmn) tst = true;
                    else if (lfrt == "right" && cmn > xmx) tst = true;
                    else tst = false;
                }
            }
        } else if (mode == "drawing" || mode == undefined) {
            for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
                var gi = graphMe[i];
                if (gi instanceof Curve && this != gi) {
                    var giCorrect = gi.mode == "correct";
                    var giIncorrect = gi.mode.indexOf("incorrect") != -1;

                    if ((giCorrect || giIncorrect) && gi.what == this.what) {
                        if (answer != undefined) correct = answer;
                        else if (giCorrect) correct = gi.correct[0];
                        else if (giIncorrect) {
                            nn = Number(gi.mode[9]);
                            correct = gi.incorrect[nn];
                        }

                        ca = correct;
                        var tst = this.IsEqual(correct);

                        //ca.match = tst;

                        if (tst) correct.match = { match: tst };
                    }
                }
            }
        }

        var correctgraph = tst;
        //SWG-64 changes
        if (!this._correctObj)
            this._correctObj = {};
        if (correctgraph) {
            this._correctObj.objCorrect = true;
        }
        //SWG-64 changes end
        if (this.mode != "student") var cc = this;
        //SWG-64 changes
        //else var cc = graphSe.FindInGraph(ca.lbl);
        else var cc = graphSe.FindInGraph(ca.uniqueLabel != undefined ? ca.uniqueLabel : ca.lbl);

        var requiredlabel = nn == undefined ? cc.requiredlabel : cc.requiredlabelinc[nn];
        if (requiredlabel) {
            var correctlabel = nn == undefined ? cc.correctlabel : (cc.correctlabelinc[nn] == "b" ? "None" : cc.correctlabelinc[nn]);
            labelcorrect = correctlabel == (this.studentcorrectlabel == "a" ? "None" : this.studentcorrectlabel);
            //SWG-64 changes
            if ((this.studentcorrectlabel == undefined || this.studentcorrectlabel == "a") && correctgraph && !labelcorrect) {
                this._correctObj.isLabelMissed = true;
            }
            //SWG-64 changes end
        }

        var allCorrect = correctgraph && labelcorrect;

        if (answer == undefined && correct != undefined) correct.match = allCorrect;

        return allCorrect;
    }

    this.IsEqual = function (ca) {
        var pxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[0] : this.pts[0]);
        var pys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[1] : this.pts[1]);
        var pxm = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[2] : this.pts[2]);
        var pym = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[3] : this.pts[3]);
        var pxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[4] : this.pts[4]);
        var pye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[5] : this.pts[5]);

        var cxs = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[0] : ca.pts[0]);
        var cys = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[1] : ca.pts[1]);
        var cxm = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[2] : ca.pts[2]);
        var cym = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[3] : ca.pts[3]);
        var cxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[4] : ca.pts[4]);
        var cye = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[5] : ca.pts[5]);

        var dxs = pxs - cxs;
        var dys = pys - cys;
        var dxsr = pxs - cxe;
        var dysr = pys - cye;
        var ds = Math.min(Math.sqrt(dxs * dxs + dys * dys), Math.sqrt(dxsr * dxsr + dysr * dysr));

        var dxe = pxe - cxe;
        var dye = pye - cye;
        var dxer = pxe - cxs;
        var dyer = pye - cys;
        var de = Math.min(Math.sqrt(dxe * dxe + dye * dye), Math.sqrt(dxer * dxer + dyer * dyer));

        var dxm = pxm - cxm;
        var dym = pym - cym;
        var dm = Math.sqrt(dxm * dxm + dym * dym);

        return ds < this.correctTolerance && de < this.correctTolerance && dm < this.correctTolerance;
    }

    this.FindMatch = function () {
        var correct;
        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Curve) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;
                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    for (var i = 0, ssq = 0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                        var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
                        var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);
                        var cx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[i] : ca.pts[i]);
                        var cy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[i + 1] : ca.pts[i + 1]);
                        var dpx = px - cx;
                        var dpy = py - cy;

                        tst = tst && (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance);
                    }
                }
            }
        }

        return tst;
    }

    this.FindMatchObject = function () {
        var correct;
        var finalobject = null;

        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Curve) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;
                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    for (var i = 0, ssq = 0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                        var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
                        var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);
                        var cx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[i] : ca.pts[i]);
                        var cy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[i + 1] : ca.pts[i + 1]);
                        var dpx = px - cx;
                        var dpy = py - cy;

                        if (tst) finalobject = gi;
                    }
                }
            }
        }

        return finalobject;
    }


    this.CheckIsIncorrect = function (mode) {
        var ninc = this.incorrect.length;

        for (var j = 0; j < graphMe.length; j++) {
            gj = graphMe[j];
            for (var i = 1, cc = 0; i < ninc && cc == 0; i++) {
                if (gj.incorrect[i] != null) {
                    if (this.CheckIsCorrect(mode, gj.incorrect[i])) {
                        gj.incorrect[i].match = true;
                        cc++
                    } else gj.incorrect[i].match = false;
                }
            }
        }

        if (cc == 0) this.incorrect[0] = { match: true };
    }

    this.GhostMe = function () {
        this.SnapMe();
        this.ghost = { clr: "lightgray", wd: this.width, pts: [], spts: [] };
        for (var i = 0, ln = this.pts.length; i < ln; i++) {
            this.ghost.pts[i] = this.pts[i];
            this.ghost.spts[i] = this.spts[i];
        }
    }

    this.SwapPoints = function () {
        var xs, ys, xe, ye;
        if (this.pts[0] <= this.pts[4]) {
            xs = this.pts[0];
            ys = this.pts[1];
            xe = this.pts[4];
            ye = this.pts[5];
        } else {
            xs = this.pts[4];
            ys = this.pts[5];
            xe = this.pts[0];
            ye = this.pts[1];
        }

        return { xs: xs, ys: ys, xe: xe, ye: ye }
    }

    this.SwapCorrectPoints = function () {
        var xs, ys, xe, ye;
        if (this.correct.length > 0) {
            var t = this.correct[0];

            if (this.pts[0] <= this.pts[4]) {
                xs = this.pts[0];
                ys = this.pts[1];
                xe = this.pts[4];
                ye = this.pts[5];
            } else {
                xs = this.pts[4];
                ys = this.pts[5];
                xe = this.pts[0];
                ye = this.pts[1];
            }

            return { xs: xs, ys: ys, xe: xe, ye: ye }
        }
    }

    this.PlumbMe = function (tf) {
        this.plumbLine = tf;
    }

    this.PlumbLine = function () {
        this.PathMe();
        var ln = graphMe.length;
        for (var j = 0; j < ln; j++) {
            var gj = graphMe[j];
            if (gj == this || gj.acceptedArea) continue;

            gj.PathMe();
            var gii = this.path.getIntersections(gj.path);
            var giiln = gii.length;
            if ((gj instanceof Point) && giiln > 0) {
                var clr = 'grey';
                DrawLine(clr, this.width, gj.x, gj.y, 0, gj.y, [4, 4]);
                DrawLine(clr, this.width, gj.x, gj.y, gj.x, can.height - 3, [4, 4]);
            } else {
                for (var k = 0; k < giiln; k++) {
                    var clr = 'grey';
                    var giik = gii[k];
                    DrawLine(clr, 1, giik.point.x, giik.point.y, 0, giik.point.y, [4, 4]);
                    DrawLine(clr, 1, giik.point.x, giik.point.y, giik.point.x, can.height - 3, [4, 4]);

                    var text = new paper.PointText(new paper.Point(15, giik.point.y - 10));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertYpxToYg(giik.point.y) * 10) / 10;

                    var text = new paper.PointText(new paper.Point(giik.point.x + 14, 375));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertXpxToXg(giik.point.x) * 10) / 10

                    /*
                    			ctx2.fillStyle = "grey";
                    			ctx2.fillText(Math.round(graphSe.ConvertYpxToYg(giik.point.y)*10)/10,55,giik.point.y+10);

                    		        ctx2.fillStyle = "grey";
                    			ctx2.fillText(Math.round(graphSe.ConvertXpxToXg(giik.point.x)*10)/10,giik.point.x+54,395);	*/

                }
            }
        }
    }

    this.checkBoxes = function () {
        if (graphSe.mode == 'correct') {
            var cbtemp = graphSe.curveCustomLabelValuesChkStatus;
        } else if (graphSe.mode == 'incorrect1') {
            var cbtemp = this.checkboxesinc1;
        } else if (graphSe.mode == 'incorrect2') {
            var cbtemp = this.checkboxesinc2;
        } else if (graphSe.mode == 'incorrect3') {
            var cbtemp = this.checkboxesinc3;
        } else {
            var cbtemp = graphSe.curveCustomLabelValuesChkStatus;
        }

        if (graphSe.mode == 'correct') {
            var cltemp = graphSe.curveCustomLabelValues;
        } else if (graphSe.mode == 'incorrect1') {
            var cltemp = this.customlabelsinc1;
        } else if (graphSe.mode == 'incorrect2') {
            var cltemp = this.customlabelsinc2;
        } else if (graphSe.mode == 'incorrect3') {
            var cltemp = this.customlabelsinc3;
        } else {
            var cltemp = graphSe.curveCustomLabelValues;
        }

        if (document.getElementById('demand').checked) { cbtemp[0] = true } else { cbtemp[0] = false };
        if (document.getElementById('fixedcost').checked) { cbtemp[1] = true } else { cbtemp[1] = false };
        if (document.getElementById('indifference').checked) { cbtemp[2] = true } else { cbtemp[2] = false };
        if (document.getElementById('marginalcost').checked) { cbtemp[3] = true } else { cbtemp[3] = false };
        if (document.getElementById('marginalrevenue').checked) { cbtemp[4] = true } else { cbtemp[4] = false };
        if (document.getElementById('ppf').checked) { cbtemp[5] = true } else { cbtemp[5] = false };
        if (document.getElementById('supply').checked) { cbtemp[6] = true } else { cbtemp[6] = false };
        if (document.getElementById('totalcost').checked) { cbtemp[7] = true } else { cbtemp[7] = false };
        if (document.getElementById('variablecost').checked) { cbtemp[8] = true } else { cbtemp[8] = false };

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str).checked) { cbtemp[8 + i + 1] = true } else { cbtemp[8 + i + 1] = false };

            //html += '<input type="checkbox" id="'+str+'" checked> '+this.customlabels[i]+'<br>'
            //this.checkboxes[i+9] = false;
        }


        this.CorrectLabelDropdown();

        //this.SetSettings();

    }

    this.checkBoxHTML = function () {
        var cbtemp = graphSe.curveCustomLabelValuesChkStatus;
        var cltemp = graphSe.curveCustomLabelValues;

        var html = '';


        // if (graphSe.mode == 'correct') {
        //     cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect1') {
        //     cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect2') {
        //     cbtemp = this.checkboxes;
        // } else if (graphSe.mode == 'incorrect3') {
        //     cbtemp = this.checkboxes;
        // } else {
        //     cbtemp = this.checkboxes;
        // }


        // if (graphSe.mode == 'correct') {
        //     cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect1') {
        //     cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect2') {
        //     cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect3') {
        //     cltemp = this.customlabels;
        // } else {
        //     cltemp = this.customlabels;
        // }

        //console.log(cbtemp);

        if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
            disabled = " disabled";
        } else {
            disabled = "";
        }

        if (cbtemp[0]) {
            html += '<input type="checkbox" id="demand" checked' + disabled + '> Demand<br>'
        } else {
            html += '<input type="checkbox" id="demand"' + disabled + '> Demand<br>'
        }

        if (cbtemp[1]) {
            html += '<input type="checkbox" id="fixedcost" checked' + disabled + '> Fixed Cost<br>'
        } else {
            html += '<input type="checkbox" id="fixedcost"' + disabled + '> Fixed Cost<br>'
        }

        if (cbtemp[2]) {
            html += '<input type="checkbox" id="indifference" checked' + disabled + '> Indifference<br>'
        } else {
            html += '<input type="checkbox" id="indifference"' + disabled + '> Indifference<br>'
        }

        if (cbtemp[3]) {
            html += '<input type="checkbox" id="marginalcost" checked' + disabled + '> Marginal Cost<br>'
        } else {
            html += '<input type="checkbox" id="marginalcost"' + disabled + '> Marginal Cost<br>'
        }

        if (cbtemp[4]) {
            html += '<input type="checkbox" id="marginalrevenue" checked' + disabled + '> Marginal Revenue<br>'
        } else {
            html += '<input type="checkbox" id="marginalrevenue"' + disabled + '> Marginal Revenue<br>'
        }

        if (cbtemp[5]) {
            html += '<input type="checkbox" id="ppf" checked' + disabled + '> PPF<br>'
        } else {
            html += '<input type="checkbox" id="ppf"' + disabled + '> PPF<br>'
        }

        if (cbtemp[6]) {
            html += '<input type="checkbox" id="supply" checked' + disabled + '> Supply<br>'
        } else {
            html += '<input type="checkbox" id="supply"' + disabled + '> Supply<br>'
        }

        if (cbtemp[7]) {
            html += '<input type="checkbox" id="totalcost" checked' + disabled + '> Total Cost<br>'
        } else {
            html += '<input type="checkbox" id="totalcost"' + disabled + '> Total Cost<br>'
        }

        if (cbtemp[8]) {
            html += '<input type="checkbox" id="variablecost" checked' + disabled + '> Variable Cost<br>'
        } else {
            html += '<input type="checkbox" id="variablecost"' + disabled + '> Variable Cost<br>'
        }


        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (cbtemp[i + 9] == undefined) cbtemp[i + 9] = true;

            if (cbtemp[i + 9]) {
                html += '<input type="checkbox" id="' + str + '" checked' + disabled + '> ' + cltemp[i].split("xexse")[0] + '<br>'
            } else {
                html += '<input type="checkbox" id="' + str + '"' + disabled + '> ' + cltemp[i].split("xexse")[0] + '<br>'
            }

            //this.checkboxes[i+9] = false;
        }

        if (graphSe.mode == 'correct') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtml;
        } else if (graphSe.mode == 'incorrect1') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[3];
        } else {
            this.checkboxhtml = html;
        }


        //document.getElementById('checkform').innerHTML = this.checkboxhtml;
    }

    this.addLabel = function () {
        var cltemp = graphSe.curveCustomLabelValues;
        // if (graphSe.mode == 'correct') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var cltemp = this.customlabels;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var cltemp = this.customlabels;
        // }

        if (document.getElementById('newlabel').value == "") {
            tempol = "Custom Label"
        } else {
            tempol = document.getElementById('newlabel').value;
        }

        cltemp.push(tempol);

        //cltemp.push(tempol)

        var str = tempol;
        var lwr = str.toLowerCase();
        str = lwr.replace(/\s+/g, '');

        this.checkBoxHTML();

        var temphtml = this.checkboxhtml;
        var lotemp = this.clabeloffset;

        // if (graphSe.mode == 'correct') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // } else if (graphSe.mode == 'incorrect1') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // } else if (graphSe.mode == 'incorrect2') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // } else if (graphSe.mode == 'incorrect3') {
        //     var temphtml = this.checkboxhtml;
        //     var lotemp = this.clabeloffset;
        // }

        document.getElementById('checkform').innerHTML = temphtml;

        this.CorrectLabelDropdown();

        var fstr = document.getElementById("cltext2").style.paddingTop;
        var fstr2 = fstr.split("px");
        fstr = fstr2[0];
        fstr = Number(fstr) + 20;
        document.getElementById("cltext2").style.paddingTop = fstr + "px";

        if (graphSe.mode == 'correct') {
            this.clabeloffset = fstr + "px";
        } else if (graphSe.mode == 'incorrect1') {
            this.clabeloffsetinc[1] = fstr + "px";
        } else if (graphSe.mode == 'incorrect2') {
            this.clabeloffsetinc[2] = fstr + "px";
        } else if (graphSe.mode == 'incorrect3') {
            this.clabeloffsetinc[3] = fstr + "px";
        }
    }

    this.CorrectLabelDropdown = function () {
        var cltemp = graphSe.curveCustomLabelValues;
        var clselectstemp = this.clselects;
        if (graphSe.mode == 'correct') {
            //var cltemp = this.customlabels;
            //var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        } else if (graphSe.mode == 'incorrect1') {
            // var cltemp = this.customlabels;
            // var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            // var cltemp = this.customlabels;
            // var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            // var cltemp = this.customlabels;
            // var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[3];
        } else {
            // var cltemp = this.customlabels;
            // var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        }

        var html = '<option value="None">None</option>'

        if (document.getElementById('demand').checked) { html += '<option value="Demand">Demand</option>' } else { };
        if (document.getElementById('fixedcost').checked) { html += '<option value="Fixed Cost">Fixed Cost</option>' } else { };
        if (document.getElementById('indifference').checked) { html += '<option value="Indifference">Indifference</option>' } else { };
        if (document.getElementById('marginalcost').checked) { html += '<option value="Marginal Cost">Marginal Cost</option>' } else { };
        if (document.getElementById('marginalrevenue').checked) { html += '<option value="Marginal Revenue">Marginal Revenue</option>' } else { };
        if (document.getElementById('ppf').checked) { html += '<option value="PPF">PPF</option>' } else { };
        if (document.getElementById('supply').checked) { html += '<option value="Supply">Supply</option>' } else { };
        if (document.getElementById('totalcost').checked) { html += '<option value="Total Cost">Total Cost</option>' } else { };
        if (document.getElementById('variablecost').checked) { html += '<option value="Variable Cost">Variable Cost</option>' } else { };

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str)) {
                if (document.getElementById(str).checked) { html += '<option value="' + cltemp[i] + '">' + cltemp[i].split("xexse")[0] + '</option>' } else { }
            }
            //this.checkboxes[i+9] = false;
        }

        this.clselects = html;
        // if (graphSe.mode == 'correct') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect1') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect2') {
        //     this.clselects = html;
        // } else if (graphSe.mode == 'incorrect3') {
        //     this.clselects = html;
        // }


        clselectstemp = html;

        document.getElementById("cldropdown").innerHTML = clselectstemp;
        document.getElementById('cldropdown').value = tmpclabel;
        document.getElementById('inccldropdown').value = tmpincclabel;

    }

    this.returnStep = function (id) {
        if (id == "x") return graphSe.snapIt ? graphSe.xmax / 32 : graphSe.xmax / Number(graphSe.wdPx);
        if (id == "y") return graphSe.snapIt ? graphSe.ymax / 32 : graphSe.ymax / Number(graphSe.htPx);
    }
    //For Curve
    this.SetSettings = function () {
        //this.CalculateSlope();
        //this.LineUpdate();

        this.TrackAgainstDropdown();
        this.RelativeDropdown();
        this.checkBoxHTML();

        $('#bottomtools').removeClass("hide");

        var html = '<div class="sectionhead"><span id="elementhead">Element Settings </span><button id="bgleft" class="glyphicon glyphicon-left" aria-hidden="true" style="margin-left: 30px; background: none; border: none;" onclick="leftArrow();"></button><span id="toplabel' + this.labelvalueedit + '" class="elementid">' + this.labeledit + '</span><button id="bgright"  class="glyphicon glyphicon-right" aria-hidden="true" onclick="rightArrow();" style="background: none; border: none;"></span></div>'
        html += '<div class="hrm"></div>'
        html += '<div class="row" style="margin-left: 20px;">'
        html += '<div class="col-xs-6">'
        html += '<div id="designertools">'
        html += '<div class="tool">Element Type</div>'
        html += '<div class="tool"></div>'
        html += '<div class="tool">Label</div>'
        html += '<div class="tool">Show Label</div>'
        html += '<div class="tool">Origin Point</div>'
        html += '<div class="tool">Mid Point</div>'
        html += '<div class="tool">End Point</div>'
        html += '<div class="tool">Show Plumbs</div>'
        html += '</div>'
        html += '</div>'
        html += '<div class="col-xs-6" style="padding-top: 8px;">'
        html += '<div id="designerinputs">'
        html += '<span id="ppfdropdown">' + this.npdropdown + '</span>'
        html += '<button id="bcbutton" aria-hidden="true" onclick="bookColor();">Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span></button>'
        html += '<div><input id="xlabel' + this.labelvalueedit + '" type="text" class="small-label" placeholder="' + this.labeledit + '" onkeyup="labelUpdate(this.value)" maxlength="5"></div>'
        html += '<div><label class="switch tool" style="margin-left: 0px;left:-60px"><input id="labeltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label><button id="movelabelbutton" class="btn btn-econ-sw5" onclick="moveLabelC()" onmousedown="moveLabel()" onmouseup="moveLabelClear()" onmouseout="moveLabelClear()"><span class="glyphicon glyphicon-labelright" aria-hidden="true"></span></button><button id="movelabelbutton2" class="btn btn-econ-sw5" onclick="moveLabelRIC()" onmousedown="moveLabelRadiusIn()" onmouseup="moveLabelRIClear()" onmouseout="moveLabelRIClear()"><span class="glyphicon glyphicon-labelin" aria-hidden="true"></span></button><button id="movelabelbutton3" class="btn btn-econ-sw5" onclick="moveLabelROC()" onmousedown="moveLabelRadiusOut()" onmouseup="moveLabelROClear()" onmouseout="moveLabelROClear()"><span class="glyphicon glyphicon-labelout" aria-hidden="true"></span></button><button id="movelabelbutton4" class="btn btn-econ-sw5" onclick="moveLabelOtherC()" onmousedown="moveLabelOther()" onmouseup="moveLabelClearOther()" onmouseout="moveLabelClearOther()"><span class="glyphicon glyphicon-labelleft" aria-hidden="true"></span></button> </div>'
        html += '<div>(<input id="cxspoint" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxsUpdate(this.value)">,<input id="cyspoint" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cysUpdate(this.value)" >)</div>'
        html += '<div>(<input id="cxmpoint" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxmUpdate(this.value)">,<input id="cympoint" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cymUpdate(this.value)" >)</div>'
        html += '<div>(<input id="cxepoint" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxeUpdate(this.value)">,<input id="cyepoint" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cyeUpdate(this.value)" >)</div>'
        html += '<div><label class="switch tool"><input id="plumbtoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'

        $('#interactive').removeClass("hide");

        var html2 = '<div id="sectionpadding" class="sectionhead"></div>'
        html2 += '<div class="row" style="margin-left: 20px;">'
        html2 += '<div id="intleft" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="binteractive" onclick="Interactive(true);"> <div class="radio-off"><div id="binteractivero" class="radio-on hide"></div></div>Interactive</button><br>'
        html2 += '<div id="ilabels" class="hide"><div class="tool">Label after move</div>'
        html2 += '<div class="tool">Track against</div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="intright" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="bstatic" onclick="Interactive(false);"> <div class="radio-off"><div id="bstaticro" class="radio-on"></div></div>Static<br></button>'
        html2 += '<div id="iinputs" class="hide"><div><input id="labelam" type="text" value="' + this.labelam + '" oninput="labelAMUpdate(this.value)" style="margin-top: 10px; width: 75px"></div>'
        html2 += '<div class="styled-select"><select id="tadropdown" class="select-class" onchange="TAElement(this.value)" value="' + this.taelement + '" style="margin-top:10px">' + this.taselects + '</select></div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="elabel" class="row hide">'
        html2 += '<div class="col-xs-6">'
        html2 += '<div class="tool"><strong>Evaluated on</strong></div>'
        html2 += '</div>'
        html2 += '<div class="col-xs-6">'
        html2 += '<div id="elabelmode" class="" style="margin-top: 11px;">Interaction</div>'
        html2 += '</div>'
        html2 += '</div>'

        var html3 = '<div class="row" style="margin-left: 20px;">'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="bprecise" onclick="Precise(true);"> <div class="radio-off"><div id="bprecisero" class="radio-on hide"></div></div>Precise</button><br>'
        html3 += '<div id="precisetools" class="hide">'
        html3 += '<div class="tool">Origin Point</div>'
        html3 += '<div class="tool">Mid Point</div>'
        html3 += '<div class="tool">End Point</div>'
        html3 += '</div>'
        html3 += '<div id="relativetools" class="hide">'
        html3 += '<div class="tool">Relative to:</div>'
        html3 += '<div id="relativetools2" class="hide">'
        html3 += '<div class="tool">Shift from origin</div>'
        html3 += '</div>'
        html3 += '<div id="drawarea" class="hide" style="width: 200px; margin-top: 10px; margin-left: 10px; position:relative; top: 10px;"><button type="button" class="btn btn-econ-sw5" onclick="DoAcceptedArea(gmloc-1)"><span class="glyphicon glyphicon-pentagon" aria-hidden="true"></span><img id="areashade" src="./images/areashade.png"></img></button><span style="padding-left: 5px;">Draw Accepted Area</span></div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="brelative" onclick="Precise(false);"> <div class="radio-off"><div id="brelativero" class="radio-on"></div></div>Relative<br></button>'
        html3 += '<div id="preciseinputs" class="hide" style="position:relative; top: 10px">'
        html3 += '<div>(<input id="cxspointc" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxsUpdate(this.value)">,<input id="cyspointc" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cysUpdate(this.value)" >)</div>'
        html3 += '<div>(<input id="cxmpointc" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxmUpdate(this.value)">,<input id="cympointc" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cymUpdate(this.value)" >)</div>'
        html3 += '<div>(<input id="cxepointc" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxeUpdate(this.value)">,<input id="cyepointc" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cyeUpdate(this.value)" >)</div>'
        html3 += '</div>'
        html3 += '<div id="relativeinputs" class="hide">'
        html3 += '<div class="styled-select" style="margin-top:9px"><select id="reldropdown" class="select-class" onchange="GetRelativeElement(this.value)"></span>' + this.relselects + '</select></div>'
        html3 += '<div id="relativeinputs2" class="hide">'
        html3 += '<button class="fake-radio" id="sleft" onclick="ShiftLeft();" style="margin-top:13px;"> <div class="radio-off"><div id="sleftro" class="radio-on hide"></div></div><span id="lefttext">Left</span></button><br>'
        html3 += '<button class="fake-radio" id="sright" onclick="ShiftRight();" style="margin-top:0px;"> <div class="radio-off"><div id="srightro" class="radio-on hide"></div></div><span id="righttext">Right</span></button><br>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'

        if (graphSe.mode == 'correct') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect1') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect2') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect3') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'student' && graphSe.doLabelMode) {
            this.CorrectLabelDropdown();
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        }
        else {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        }

        var html4 = '<div class="row" style="margin-left: 20px;">'
        html4 += '<div class="col-xs-6">'
        html4 += '<div class="tool" style="margin-top: 0px;">Required label</div>'
        html4 += '<div id="requiredlabeltools" class="hide">'
        html4 += '<div class="tool">Label Choices</div>'
        html4 += '<div id="cltext2" class="tool" style="padding-top: ' + tempclo + '">Correct Label</div>'
        html4 += '<div id="inccl1" class="tool" style="">Incorrect Label</div>'
        html4 += '</div>'
        html4 += '</div>'
        html4 += '<div class="col-xs-6">'
        html4 += '<div id="rtoggleshell" style="margin-top:10px;"><label class="switch tool"><input id="rltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html4 += '<div id="requiredlabelinputs" class="hide">'
        html4 += '<form id="checkform" onclick="checkBoxes();">' + tempcbh + '</form>'
        html4 += '<div><input id="newlabel" type="text" class="" placeholder="Custom label" onkeyup="" style="width: 100px; margin-top: 10px;"><button id="addbutton" class="btn-nothing" onclick="addLabel()"> <span class="glyphicon glyphicon-cplus"></span></button></div>'
        html4 += '<div class="styled-select" style="margin-top: 10px"><select id="cldropdown" class="select-class" onchange="GetCorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '<div id="inccl2" class="styled-select" style="margin-top: 10px"><select id="inccldropdown" class="select-class" onchange="GetIncorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '</div>'
        html4 += '</div>'

        var html5 = '<div class="row" style="margin-left: 20px;">'
        html5 += '<div class="col-xs-6">'
        html5 += '<div class="tool">Element Type</div>'
        html5 += '<div class="tool">Origin Point</div>'
        html5 += '<div class="tool">Mid Point</div>'
        html5 += '<div class="tool">End Point</div>'
        html5 += '</div>'
        html5 += '<div class="col-xs-6" style="padding-top: 8px;">'
        html5 += '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Demand">Demand</option><option value="Fixed Cost">Fixed Cost</option><option value="Indifference">Indifference</option><option value="Marginal Cost">Marginal Cost</option><option value="Marginal Revenue">Marginal Revenue</option><option value="PPF">PPF</option><option value="Supply">Supply</option><option value="Total Cost">Total Cost</option><option value="Variable Cost">Variable Cost</option></select></div>'
        html5 += '<div style="margin-top: 10px">(<input id="cxspointd" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxsUpdate(this.value)">,<input id="cyspointd" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cysUpdate(this.value)" >)</div>'
        html5 += '<div>(<input id="cxmpointd" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxmUpdate(this.value)">,<input id="cympointd" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cymUpdate(this.value)" >)</div>'
        html5 += '<div>(<input id="cxepointd" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxeUpdate(this.value)">,<input id="cyepointd" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cyeUpdate(this.value)" >)</div>'
        html5 += '</div>'
        html5 += '</div>'

        var html6 = '<div class="row" style="margin-left: 20px;">'
        html6 += '<div class="col-xs-6">'
        html6 += '<div class="tool">Origin Point</div>'
        html6 += '<div class="tool">Mid Point</div>'
        html6 += '<div class="tool">End Point</div>'
        html6 += '</div>'
        html6 += '<div class="col-xs-6">'
        html6 += '<div>(<input id="cxspointe" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxsUpdate(this.value)">,<input id="cyspointe" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cysUpdate(this.value)" >)</div>'
        html6 += '<div>(<input id="cxmpointe" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxmUpdate(this.value)">,<input id="cympointe" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cymUpdate(this.value)" >)</div>'
        html6 += '<div>(<input id="cxepointe" type="number" class="point-input" value="" step="' + this.returnStep("x") + '"  oninput="cxeUpdate(this.value)">,<input id="cyepointe" type="number" class="point-input" value="" step="' + this.returnStep("y") + '" oninput="cyeUpdate(this.value)" >)</div>'
        html6 += '</div>'
        html6 += '</div>'

        document.getElementById("bottomtools").innerHTML = html;
        document.getElementById("interactive").innerHTML = html2;
        document.getElementById("interactivetools").innerHTML = html3;
        document.getElementById("labeldetails").innerHTML = html4;
        document.getElementById("drawingtools").innerHTML = html5;
        document.getElementById("incdetails").innerHTML = html6;

        if (this.IsPPF()) {
            document.getElementById("ppfdropdown").innerHTML = this.pdropdown;
            //console.log("pp");
        } else {
            document.getElementById("ppfdropdown").innerHTML = this.npdropdown;
            //console.log("np");
        }

        document.getElementById('eldropdown').value = this.elementlabel;
        document.getElementById('plumbtoggle').checked = this.plumbLine;
        document.getElementById('cldropdown').value = this.correctlabel;

        document.getElementById('tadropdown').value = this.taelement;

        if (graphSe.mode == 'correct') {
            var rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var rlltemp = this.relementlabelinc[3];
        }

        document.getElementById('reldropdown').value = rlltemp;

        if (graphSe.mode == 'correct') {
            var temprl = this.requiredlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[1] != undefined) ? this.requiredlabelinc[1] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect2') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[2] != undefined) ? this.requiredlabelinc[2] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect3') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[3] != undefined) ? this.requiredlabelinc[3] : this.requiredlabel; //SWG-64 changes
        }

        document.getElementById('rltoggle').checked = temprl;

        this.checkBoxes();

        this.InteractiveMe(this.interactive);

        if (graphSe.mode == 'correct') {
            this.PreciseMe(this.precise);
            if (!this.precise) {
                this.EvalShift(this.evalshift);
            }
        } else if (graphSe.mode == 'incorrect1') {
            this.PreciseMe(this.preciseinc[1]);
            if (!this.preciseinc[1]) {
                this.EvalShift(this.evalshiftinc[1]);
            }
        } else if (graphSe.mode == 'incorrect2') {
            this.PreciseMe(this.preciseinc[2]);
            if (!this.preciseinc[2]) {
                this.EvalShift(this.evalshiftinc[2]);
            }
        } else if (graphSe.mode == 'incorrect3') {
            this.PreciseMe(this.preciseinc[3]);
            if (!this.preciseinc[3]) {
                this.EvalShift(this.evalshiftinc[3]);
            }
        }

        this.SetElementPoints();

        this.DisplayBookColor();

        this.HighLight();

        this.InteractiveReset();

        this.CheckRLabel();

        this.CorrectTools();

        this.CorrectLabelDropdown();

        if (graphSe.mode == "correct" || graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") this.SetCorrectPoints();

        $('#emptydesigner').addClass("hide");

        if (this.labelLine == true) {
            document.getElementById("labeltoggle").checked = true;
        } else {
            document.getElementById("labeltoggle").checked = false;
        }

        if (graphMe.length < 2) {
            document.getElementById("bgleft").style.opacity = "0";
            document.getElementById("bgright").style.opacity = "0";
        } else {
            document.getElementById("bgleft").style.opacity = "1";
            document.getElementById("bgright").style.opacity = "1";
        }


        if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
            document.getElementById("cldropdown").disabled = true;
            document.getElementById("newlabel").disabled = true;
            document.getElementById("addbutton").disabled = true;
            $('#inccl1').removeClass("hide");
            $('#inccl2').removeClass("hide");
        } else {
            document.getElementById("cldropdown").disabled = false;
            document.getElementById("newlabel").disabled = false;
            document.getElementById("addbutton").disabled = false;
            $('#inccl1').addClass("hide");
            $('#inccl2').addClass("hide");
        }

        if (this.interactive && graphSe.mode != "designer") { //SWG-452 changes
            $("#labeldetails").removeClass("hide");
        } else {
            $("#labeldetails").addClass("hide");
        }

        //SWG - 199
        if (graphSe.mode != 'designer') {
            HideElementTypeDropdown();
        }

    }
    this.SetElementPoints = function () {
        if (document.getElementById('cxspoint') != null) {
            document.getElementById('cxspoint').value = graphSe.snapIt ? this.spts[0] : this.pts[0];
            document.getElementById('cyspoint').value = graphSe.snapIt ? this.spts[1] : this.pts[1];

            document.getElementById('cxspointd').value = graphSe.snapIt ? this.spts[0] : this.pts[0];
            document.getElementById('cyspointd').value = graphSe.snapIt ? this.spts[1] : this.pts[1];

            if (this.pts.length >= 2) {
                document.getElementById('cxmpoint').value = graphSe.snapIt ? this.spts[2] : this.pts[2];
                document.getElementById('cympoint').value = graphSe.snapIt ? this.spts[3] : this.pts[3];

                document.getElementById('cxmpointd').value = graphSe.snapIt ? this.spts[2] : this.pts[2];
                document.getElementById('cympointd').value = graphSe.snapIt ? this.spts[3] : this.pts[3];
            }

            if (this.pts.length >= 3) {
                document.getElementById('cxepoint').value = graphSe.snapIt ? this.spts[4] : this.pts[4];
                document.getElementById('cyepoint').value = graphSe.snapIt ? this.spts[5] : this.pts[5];

                document.getElementById('cxepointd').value = graphSe.snapIt ? this.spts[4] : this.pts[4];
                document.getElementById('cyepointd').value = graphSe.snapIt ? this.spts[5] : this.pts[5];
            }
        }
    }

    this.SetElementLabel = function (text) {
        this.elementlabel = text;
        if (graphSe.mode == "designer") {
            this.elementlabel = this.designerLabel != undefined ? this.designerLabel : "None";
        }
        //SWG-87
        if (graphSe.mode != "designer" && this.elementlabel != "None") {
            this.tempbookColor = "Yes";
            this.tempLableLine = true;
        }
        //end SWG-87
        this.SetColor();
    }

    this.SetRelativeElementLabel = function (text) {

        if (graphSe.mode == 'correct') {
            this.relementlabel = text;
            this.relementlabelinc[1] = text;
            this.relementlabelinc[2] = text;
            this.relementlabelinc[3] = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.relementlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.relementlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.relementlabelinc[3] = text;
        }


        this.CheckRLabel();
    }

    this.CheckRLabel = function () {
        var rlltemp;

        if (graphSe.mode == 'correct') {
            rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            rlltemp = this.relementlabelinc[3];
        }

        if (graphSe.FindInGraph(rlltemp) && (graphSe.FindInGraph(rlltemp).correctlabel == undefined || graphSe.FindInGraph(rlltemp).correctlabel == 'b')) { ////SWG-139 Changes
            if (graphSe.FindInGraph(rlltemp).IsPPF() && graphSe.FindInGraph(rlltemp).elementlabel == 'PPF') { ////SWG-139 Changes
                document.getElementById("lefttext").innerHTML = 'Inward';
                document.getElementById("righttext").innerHTML = 'Outward';
            } else if (graphSe.FindInGraph(rlltemp).elementlabel == 'Marginal Cost' || graphSe.FindInGraph(rlltemp).elementlabel == 'Fixed Cost' || graphSe.FindInGraph(rlltemp).elementlabel == 'Variable Cost' || graphSe.FindInGraph(rlltemp).elementlabel == 'Total Cost') {
                document.getElementById("lefttext").innerHTML = 'Up';
                document.getElementById("righttext").innerHTML = 'Down';
            } else {
                document.getElementById("lefttext").innerHTML = 'Left';
                document.getElementById("righttext").innerHTML = 'Right';
            }
        }////SWG-139 Changes
        else if (graphSe.FindInGraph(rlltemp) && graphSe.FindInGraph(rlltemp).correctlabel != undefined && graphSe.FindInGraph(rlltemp).correctlabel != 'b') {
            if (graphSe.FindInGraph(rlltemp).correctlabel == 'PPF') {
                document.getElementById("lefttext").innerHTML = 'Inward';
                document.getElementById("righttext").innerHTML = 'Outward';
            } else if (graphSe.FindInGraph(rlltemp).correctlabel == 'Marginal Cost' || graphSe.FindInGraph(rlltemp).correctlabel == 'Fixed Cost' || graphSe.FindInGraph(rlltemp).correctlabel == 'Variable Cost' || graphSe.FindInGraph(rlltemp).correctlabel == 'Total Cost') {
                document.getElementById("lefttext").innerHTML = 'Up';
                document.getElementById("righttext").innerHTML = 'Down';
            } else {
                document.getElementById("lefttext").innerHTML = 'Left';
                document.getElementById("righttext").innerHTML = 'Right';
            }
        }
        ////SWG-139 Changes

        if (rlltemp == "Accepted Area") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').removeClass("hide");
        } else if (rlltemp == "None") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').addClass("hide");
        } else {
            $('#relativetools2').removeClass("hide");
            $('#relativeinputs2').removeClass("hide");
            $('#drawarea').addClass("hide");
        }
    }


    this.SetBookColor = function (text) {
        this.bookcolor = text;

        this.SetColor();
    }

    this.LabelMe = function (tf) {
        this.labelLine = tf;
    }

    this.labelangle;
    this.labelradius;

    this.LabelLine = function () {

        var spt = graphSe.snapIt ? { x: this.spts[2], y: this.spts[3] } : { x: this.pts[2], y: this.pts[3] };
        var pt = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };

        var xoffset = 0;
        var yoffset = 0;

        pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
        pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
        spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
        spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

        var d = 20;

        var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
        if (this.labelangle == undefined && this.labelradius == undefined) {
            var newx = pt.x + d * (pt.x - spt.x) / mag
            var newy = pt.y + d * (pt.y - spt.y) / mag

            this.labelangle = Math.atan2(newy - pt.y, newx - pt.x)
            this.labelradius = Math.sqrt((pt.x - newx) * (pt.x - newx) + (pt.y - newy) * (pt.y - newy));
        } else {
            var newx = pt.x + this.labelradius * Math.cos(this.labelangle); //+ d * (pt.x - spt.x) / mag
            var newy = pt.y + this.labelradius * Math.sin(this.labelangle); //+ d * (pt.y - spt.y) / mag
        }

        var clr = this.iscurrent == true ? this.cc : this.ccus;

        //console.log(clr);
        /*ctx2.fillStyle = clr;
        ctx2.font="14px sans-serif";
        ctx2.fillText(this.label,newx,newy);
        ctx2.font="10px sans-serif";*/

        var templabel;
        if (graphSe.mode == "correct" && this.dragstart != undefined) {
            templabel = this.labelam != '' ? this.labelam : this.labeledit;
        } else if (graphSe.boo && this.ghost && this.mode != "correct" && this.mode != "student" && this.evalshift != null && this.precise == false) {
            templabel = this.labelam;
        } else {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "designer") {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "student" && this.studentdrag != null) {
            templabel = this.labelam != '' ? this.labelam : this.labeledit;
        }
        //SWG-87
        if (graphMe.length > 0 && graphSe.mode != 'designer' && this.tempLableLine && !this.labelLine && this.elementlabel != 'None') {
            templabel = graphSe.mode == "student" ? "" : this.elementlabel;
        }
        if (graphSe.mode == 'designer' && this.tempLableLine && !this.labelLine) {
            templabel = '';
        }
        //end SWG-87
        //SWG-275
        if (graphSe.mode == "student" && (this.studentcorrectlabel != null && this.studentcorrectlabel != "a" && this.studentcorrectlabel != "")) {
            templabel = "";
        }
        ////SWG-140 Changes
        var ObjCurveLblPosition = this.LabelPosition(newx, newy);
        var text = new paper.PointText(new paper.Point(ObjCurveLblPosition.x, ObjCurveLblPosition.y));
        text.justification = ObjCurveLblPosition.alignment;
        ////SWG-140 Changes
        text.fillColor = clr;
        if (this.myPath.visible)
            text.content = templabel;
        /*


        		var text = new paper.PointText(new paper.Point(newx, newy));
        		text.justification = 'center';
        		text.fillColor = clr;
        		text.content = this.label;*/

    }

    ////SWG - 140 Changes Start
    this.LabelPosition = function (newxVal, newyVal) {

        // var xIncVal, yIncVal;
        // if (document.getElementById('xinc') != undefined) xIncVal = document.getElementById('xinc').value;
        // if (document.getElementById('yinc') != undefined) yIncVal = document.getElementById('yinc').value;

        // var xMin = $('#xmin').val();
        var yMin = $('#ymin').val();
        // var xMax = $('#xmax').val();
        // var yMax = $('#ymax').val();

        // var xAxisMinVal = 2 * parseFloat(xIncVal) + parseFloat(xMin);
        // var xAxisMaxVal = 12 * parseFloat(xIncVal) + parseFloat(xMin);
        // var yAxisMinVal = 2 * parseFloat(yIncVal) + parseFloat(yMin);
        // var yAxisMaxVal = 12 * parseFloat(yIncVal) + parseFloat(yMin);

        var endPt = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };

        var ObjLabelStyle = { x: 0, y: 0, alignment: '' };

        //    var xMultipy = graphSe.ConvertXpxToXg(newxVal) < 0 ? -1 : 1
        //    var yMultipy = graphSe.ConvertYpxToYg(newyVal) < 0 ? -1 : 1

        switch (true) {
            case endPt.y == yMin || endPt.y <= 0.5:
                ObjLabelStyle.x = newxVal - 10;
                ObjLabelStyle.y = newyVal - 24;
                ObjLabelStyle.alignment = 'right';
                break;
            //    case endPt.y == yMin && endPt.x >= xAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y == yMin && endPt.x < xAxisMinVal && endPt.x != xMin:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y == yMin:
            //        ObjLabelStyle.x = newxVal + 24;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y >= yAxisMinVal && endPt.y < yAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - (24 * xMultipy);
            //        ObjLabelStyle.y = newyVal + 10;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y >= yAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - (24 * xMultipy);
            //        ObjLabelStyle.y = newyVal + 30;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x >= xAxisMaxVal && endPt.y <= yAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y >= yMax && endPt.x > xAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal + 30;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //   case endPt.y >= yMax && endPt.x >= xAxisMinVal:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal + 36;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x >= xMax && endPt.y > yAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            default: ObjLabelStyle.x = newxVal;
                ObjLabelStyle.y = newyVal;
                ObjLabelStyle.alignment = 'center';
                break;
        }
        return ObjLabelStyle;

    }
    ////SWG - 140 Changes End


    this.GetBookColor = function (text) {
        return this.bookcolor;
    }

    this.DisplayBookColor = function () {
        if (this.bookcolor == "Yes") {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-checkedmm"></span>';
        } else {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span>';
        }
    }

    this.HighLight = function () {
        for (i = 0; i < graphMe.length; i++) {
            graphMe[i].iscurrent = false
        }

        this.iscurrent = true
    }

    this.UpdateLabelText = function () {
        document.getElementById('xlabel' + this.labelvalueedit).value = this.labeledit;
        document.getElementById('toplabel' + this.labelvalueedit).innerHTML = this.labeledit;
    }

    this.InteractiveMe = function (tf) {
        this.interactive = tf;
        if (tf) {
            $("#binteractivero").removeClass("hide");
            $("#bstaticro").addClass("hide");
        } else {
            $("#binteractivero").addClass("hide");
            $("#bstaticro").removeClass("hide");
        }
    }


    this.CorrectTools = function () {
        //if(graphSe.mode=='correct')
        if (graphSe.mode.indexOf('correct') != -1) {
            if (this.interactive != false) $('#labeldetails').removeClass("hide");
            $('#designertools').addClass("hide");
            $('#designerinputs').addClass("hide");
            $('#elabel').removeClass("hide");
            $('#elabelmode').removeClass("hide");
            $('#intleft').addClass("hide");
            $('#intright').addClass("hide");
            document.getElementById("elementhead").innerHTML = "Evaluation Settings";
            document.getElementById("interactive").style.background = "#fbfbfb";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').addClass("hide");

            $('#incdetails').addClass("hide");

            if (this.interactive) {
                document.getElementById("elabelmode").innerHTML = "Interactive";
                this.elabelmode = "Interactive";
                $('#interactivetools').removeClass("hide");

                if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
                    $('#drawingtools').addClass("hide");
                    $('#interactivetools').removeClass("hide");
                    $('#labeldetails').removeClass("hide");
                    $('#incdetails').addClass("hide");
                }

            } else {
                document.getElementById("elabelmode").innerHTML = "Static";
                this.elabelmode = "Static";
                $('#interactivetools').addClass("hide");
            }

            //if(this.mode=="correct")
            if (this.mode.indexOf("correct") != -1) {
                document.getElementById("elabelmode").innerHTML = "Drawing";
                this.elabelmode = "Drawing";
                $('#interactivetools').addClass("hide");
                $('#drawingtools').removeClass("hide");
                $('#labeldetails').removeClass("hide");
            }
            if (document.getElementById('rltoggle').checked) {
                $('#requiredlabeltools').removeClass("hide");
                $('#requiredlabelinputs').removeClass("hide");
                document.getElementById('cldropdown').value = this.correctlabel;
            } else {
                $('#requiredlabeltools').addClass("hide");
                $('#requiredlabelinputs').addClass("hide");
            }
            if (this.elabelmode == "Drawing") {
                $('#drawingtools').removeClass("hide");
            } else {
                $('#drawingtools').addClass("hide");
            }

        } else if (graphSe.mode == 'student') {
            $('#interactive').addClass("hide");
            $('#bottomtools').addClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");
            $('#incdetails').addClass("hide");


        } else {
            $('#labeldetails').addClass("hide");
            $('#designertools').removeClass("hide");
            $('#designerinputs').removeClass("hide");
            //$('#elabel').addClass("hide");
            $('#elabelmode').addClass("hide");
            $('#intleft').removeClass("hide");
            $('#intright').removeClass("hide");
            document.getElementById("elementhead").innerHTML = "Element Settings";
            document.getElementById("interactive").style.background = "#f6f6f6";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').removeClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");
            $('#incdetails').addClass("hide");

        }

    }

    this.InteractiveReset = function () {
        if (this.interactive == true) {
            $('#ilabels').removeClass("hide");
            $('#iinputs').removeClass("hide");
        } else {
            $('#ilabels').addClass("hide");
            $('#iinputs').addClass("hide");
        }
    }

    this.TrackAgainstDropdown = function () {
        var html = '<option value="None">None</option>'
        for (i = 0; i < graphMe.length; i++) {
            var gi = graphMe[i];
            var gitype = gi.constructor.name;
            if (gi.labeledit != this.labeledit && gitype == "Line") {
                var graphlabel = gi.labeledit;
                html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
            }
        }

        this.taselects = html;
    }

    this.RelativeDropdown = function () {
        var html = '<option value="None">None</option>'
        html += '<option value="Accepted Area">Accepted Area</option>'
        for (i = 0; i < graphMe.length; i++) {
            var graphlabel = graphMe[i].labeledit;
            html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
        }

        this.relselects = html;
    }

    this.EvalShift = function (text) {
        //SWG_312 and SWG_313 changes
        if (this.upCoordinatesUpdated != undefined)
            this.upCoordinatesUpdated = undefined;
        if (this.downCoordinatesUpdated != undefined)
            this.downCoordinatesUpdated = undefined;
        if (this.inwardCoordinatesUpdated != undefined)
            this.inwardCoordinatesUpdated = undefined;
        if (this.outwardCoordinatesUpdated != undefined)
            this.outwardCoordinatesUpdated = undefined;
        this.rightCoordinatesUpdated = undefined;
        this.leftCoordinatesUpdated = undefined;

        if (graphSe.mode == 'correct') {
            this.evalshift = text;
            var veshift = this.evalshift;
        } else if (graphSe.mode == 'incorrect1') {
            this.evalshiftinc[1] = text;
            var veshift = this.evalshiftinc[1] == undefined ? this.evalshift : this.evalshiftinc[1]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect2') {
            this.evalshiftinc[2] = text;
            var veshift = this.evalshiftinc[2] == undefined ? this.evalshift : this.evalshiftinc[2]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect3') {
            this.evalshiftinc[3] = text;
            var veshift = this.evalshiftinc[3] == undefined ? this.evalshift : this.evalshiftinc[3]; ////SWG-312, 313
        }

        if (veshift == "left" || veshift == "up" || veshift == "inward") {
            $("#sleftro").removeClass("hide");
            $("#srightro").addClass("hide");
        } else if (veshift == null) {
            $("#sleftro").addClass("hide");
            $("#srightro").addClass("hide");
        } else {
            $("#sleftro").addClass("hide");
            $("#srightro").removeClass("hide");
            //$('#relativetools').removeClass("hide");
            //$('#relativeinputs').removeClass("hide");
        }

        if (text != null) {
            if (graphSe.mode == 'correct') this.CorrectMe(["relative", text]);
            else if (graphSe.mode.substring(0, 9) == "incorrect")
                this.IncorrectMe(undefined, undefined, ["relative", text]);
        }
    }

    this.PreciseMe = function (tf) {
        //this.evalshift = null;

        if (graphSe.mode == 'correct') {
            this.precise = tf;
            this.preciseinc[1] = tf;
            this.preciseinc[2] = tf;
            this.preciseinc[3] = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.preciseinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.preciseinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.preciseinc[3] = tf;
        }

        if (tf) {
            $("#bprecisero").removeClass("hide");
            $("#brelativero").addClass("hide");
            $('#relativetools').addClass("hide");
            $('#relativeinputs').addClass("hide");
            $('#precisetools').removeClass("hide");
            $('#preciseinputs').removeClass("hide");
        } else if (tf == null) {
            $("#bprecisero").addClass("hide");
            $("#brelativero").addClass("hide");
        } else {
            $("#bprecisero").addClass("hide");
            $("#brelativero").removeClass("hide");
            $('#relativetools').removeClass("hide");
            $('#relativeinputs').removeClass("hide");
            $('#precisetools').addClass("hide");
            $('#preciseinputs').addClass("hide");
        }

    }

    this.RequiredLabelMe = function (tf) {

        if (graphSe.mode == 'correct') {
            this.requiredlabel = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.requiredlabelinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.requiredlabelinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.requiredlabelinc[3] = tf;
        }

        if (tf) {
            $('#requiredlabelinputs').removeClass("hide");
            $('#requiredlabeltools').removeClass("hide");
        } else {
            $('#requiredlabelinputs').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
        }
    }

    this.LabelMeDrop = function () {
        if (this.droppedlabel == 0 && this.interactive) {
            //console.log("label me drop");

            /*console.log("label me drop");
			var xpx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxg : this.xg );
			var ypx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.syg : this.yg );

			var xspx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxsg : this.xsg );
			var yspx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.sysg : this.ysg );
			var xepx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxeg : this.xeg );
			var yepx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.syeg : this.yeg );*/
            var uniqueLabel = this.uniqueLabel;//3.7 changes
            var spt = graphSe.snapIt ? { x: this.spts[2], y: this.spts[3] } : { x: this.pts[2], y: this.pts[3] };
            var pt = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };

            var xoffset = 0;
            var yoffset = 0;

            pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
            pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
            spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
            spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

            var d = 20;

            var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
            var newx = pt.x + d * (pt.x - spt.x) / mag
            var newy = pt.y + d * (pt.y - spt.y) / mag

            var div = document.createElement("div");
            this.studentlabelid = 'dlabel' + this.divid;
            div.id = this.studentlabelid;
            div.style.position = "absolute";
            div.style.left = newx + 37 + 'px';

            ////SWG-221 Changes
            if (graphSe.titleshow && graphSe.title != "") div.style.top = newy + 158 + 'px';
            else div.style.top = newy + 105 + 'px';
            ////SWG-221 Changes end

            div.style.zIndex = "1000"; ////SWFB-2269
            div.className = 'styled-select';

            var clselectsrt;

            if (this.mode == "student") {
                if (this.FindMatchObject() == null) {
                    clselectsrt = this.clselects;
                } else {
                    clselectsrt = this.FindMatchObject().clselects;
                }
            } else {
                clselectsrt = this.clselects;
            }
            //release 3.7 changes
            //div.innerHTML = '<select id="elabel' + this.divid + '" class="select-class" onchange="GetCorrectStudentLabel(this.value, this.id)"></span>' + clselectsrt + '</select>'
            div.innerHTML = '<select id="elabel' + this.divid + '" data-uniqueid =' + uniqueLabel + ' class="select-class" onchange="GetCorrectStudentLabel(this.value, this.id, this)"></span>' + clselectsrt + '</select>'
            document.getElementById('graphcontainer').appendChild(div);

            //$('#elabel').removeClass("hide");
            studentlabel++;
            graphSe.OpsAddStudentLabel(gmloc);

            //this.droppedlabel = 1; ////SWG-451
        }

    }

    this.deleteStudentLabel = function () {
        this.savedstudentlabel = document.getElementById(this.studentlabelid);
        this.savedstudentcorrectlabel = this.studentcorrectlabel;
        var studentcorrectlabel = this.designerLabel != undefined ? this.designerLabel : "None"; ////Preview mode object color disappear after undo

        this.SetCorrectStudentLabel(studentcorrectlabel); ////Set default designer mode color
        document.getElementById(this.studentlabelid).remove();
        this.droppedlabel = 0;

        this.setStudentColor();
    }

    this.replaceStudentLabel = function () {
        var div = this.savedstudentlabel;
        this.studentcorrectlabel = this.savedstudentcorrectlabel;

        document.getElementById('graphcontainer').appendChild(div);

        this.droppedlabel = 1;

        this.setStudentColor();
    }

    this.SetCorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }
    }

    this.SetIncorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }
    }

    this.SetCorrectStudentLabel = function (text) {
        this.studentcorrectlabel = text;

        //this.CheckIsCorrect("label");
    }

    this.SetCorrectPoints = function () {
        if (this.precise) {

            this.correctcsx = graphSe.snapIt ? this.spts[0] : this.pts[0];
            this.correctcys = graphSe.snapIt ? this.spts[1] : this.pts[1];


            if (this.pts.length >= 2) {
                this.correctcxm = graphSe.snapIt ? this.spts[2] : this.pts[2];
                this.correctcym = graphSe.snapIt ? this.spts[3] : this.pts[3];
            }

            if (this.pts.length >= 3) {
                this.correctcxe = graphSe.snapIt ? this.spts[4] : this.pts[4];
                this.correctcye = graphSe.snapIt ? this.spts[5] : this.pts[5];
            }

        }

        if (document.getElementById('cxspointc') != null) {
            document.getElementById('cxspointc').value = this.correctcsx;
            document.getElementById('cyspointc').value = this.correctcys;
            document.getElementById('cxmpointc').value = this.correctcxm;
            document.getElementById('cympointc').value = this.correctcym;
            document.getElementById('cxepointc').value = this.correctcxe;
            document.getElementById('cyepointc').value = this.correctcye;
        }

        if (document.getElementById('cxspointe') != null) {

            this.correctcsx = graphSe.snapIt ? this.spts[0] : this.pts[0];
            this.correctcys = graphSe.snapIt ? this.spts[1] : this.pts[1];


            if (this.pts.length >= 2) {
                this.correctcxm = graphSe.snapIt ? this.spts[2] : this.pts[2];
                this.correctcym = graphSe.snapIt ? this.spts[3] : this.pts[3];
            }

            if (this.pts.length >= 3) {
                this.correctcxe = graphSe.snapIt ? this.spts[4] : this.pts[4];
                this.correctcye = graphSe.snapIt ? this.spts[5] : this.pts[5];
            }


            document.getElementById('cxspointe').value = this.correctcsx;
            document.getElementById('cyspointe').value = this.correctcys;
            document.getElementById('cxmpointe').value = this.correctcxm;
            document.getElementById('cympointe').value = this.correctcym;
            document.getElementById('cxepointe').value = this.correctcxe;
            document.getElementById('cyepointe').value = this.correctcye;
        }

    }

    this.IsPPF = function () {
        var xs = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[0] : this.pts[0]);
        var ys = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[1] : this.pts[1]);
        var xe = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[4] : this.pts[4]);
        var ye = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[5] : this.pts[5]);

        //this.SetSettings();

        return (xs <= 3 && ye >= graphSe.htPx - 2) || (xe <= 3 && ys >= graphSe.htPx - 2);
    }

    this.removeLastCheckBox = function () {

        var customlength = this.customlabels.length;
        var customlength2 = this.checkboxes.length;

        if (customlength > 0) {
            this.removedcheckboxes.push(this.customlabels[customlength - 1]);
            this.removedcheckboxesstate.push(this.checkboxes[customlength2 - 1]);

            this.customlabels.pop();
            this.checkboxes.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) - 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }

    this.replaceLastCheckBox = function () {
        var customlength = this.removedcheckboxes.length;
        if (customlength > 0) {
            this.customlabels.push(this.removedcheckboxes[customlength - 1]);
            this.checkboxes.push(this.removedcheckboxesstate[customlength - 1]);

            this.removedcheckboxes.pop();
            this.removedcheckboxesstate.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) + 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }


    this.SetSettings();

    ////SWG-139 Changes
    this.ResetMe = function () {
        for (i = 0; i < this.pts.length; i++) {
            this.pts[i] = this.ghost.pts[i];
        }
        this.SnapMe();
    }
    ////SWG-139 Changes ends
}

function Polyline(clr, fit, szz, aa) {
    this.what = "poly";
    //SWG-124 changes
    this.uniqueLabel = Math.floor(Math.random() * 90000) + 10000;
    this.myGmloc = graphMe.length;
    this.color = clr;
    this.width = szz;
    this.fillit = fit;
    this.pts = [];
    this.spts = [];
    this.doFill = false;
    this.myPath;
    this.showControl = false;
    this.inside = false;
    this.dragState = "off";
    this.dragPt = -1;
    this.dragDxDy = { dx: 0, dy: 0 };
    this.plumbLine = false;
    this.labelLine = false;

    this.droppedlabel = 0;

    this.studentdrag = null;

    this.studentcorrectlabel = "a";

    this.iscorrect = null;
    this.correctgraph;
    this.labelcorrect;
    this.correctlabel = "b";

    this.ghost = null;

    this.correct = [];
    this.correctTolerance = 4;
    this.correctFeedback = "Area Correct!";
    this.notCorrectFeedback = "Area Not Correct!";
    this.feedback = "";

    this.incorrect = [null, null, null, null];
    this.isIncorrect = [null, null, null, null];

    this.interactive = graphSe.mode.indexOf("correct") != -1 || graphSe.mode == "student" ? true : false;
    this.precise = null;
    this.evalshift = null;
    this.evalshiftinc = [null, null, null];
    this.labelam = '';
    this.taelement = 'None';
    this.relselects = '';

    var startstring = '</span><option value="None">None</option><option value="Consumer Surplus">Consumer Surplus</option><option value="Deadweight Loss">Deadweight Loss</option><option value="Loss">Loss</option><option value="Producer Surplus">Producer Surplus</option><option value="Revenue/Profit">Revenue/Profit</option>'

    this.clselectsinc = [startstring, startstring, startstring, startstring];
    this.clselects = startstring;


    this.locked = false;

    this.mode = graphSe.mode;

    this.ahtml = '';
    this.phtml = '';

    this.closed = false;
    this.closedo = false;

    this.preciseinc = [null, null, null]

    this.requiredlabelinc = [];
    this.correctlabelinc = ["b", "b", "b", "b"];

    this.relementlabel = "None";
    this.relementlabelinc = ["None", "None", "None", "None"]
    this.elementlabel = "None";
    this.bookcolor = "No";
    this.iscurrent = true;

    apoints++;
    this.label = "A" + apoints;
    this.divid = this.label;

    this.labelvalue = apoints;

    this.labeledit = this.label;
    this.labelvalueedit = this.labelvalue;

    this.cc = 'rgba(0, 0, 0, 1)';
    this.ccus = 'rgba(0, 0, 0, .5)';

    this.areapoints = 1;
    this.areapointso = 1;

    this.cc = 'rgba(0, 0, 0, 1)';
    this.ccus = 'rgba(0, 0, 0, .5)';

    this.acceptedArea = aa != undefined ? aa : false;

    this.checkboxes = [true, true, true, true, true];
    this.checkboxesinc1 = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc2 = [true, true, true, true, true, true, true, true, true];
    this.checkboxesinc3 = [true, true, true, true, true, true, true, true, true];
    this.customlabels = [];
    this.customlabelsinc1 = [];
    this.customlabelsinc2 = [];
    this.customlabelsinc3 = [];
    this.clabeloffsetinc = ["102px", "102px", "102px", "102px",];
    this.checkboxhtmlinc = [];
    this.customlabels = [];

    this.clabeloffset = "142px";
    this.elabelmode = "";

    this.ahtmltwo = '';
    this.phtmltwo = '';

    this.removedcheckboxes = [];
    this.removedcheckboxesstate = [];
    //SWG-87 -- added tempbookcolor condition
    this.SetColor = function () {
        if (this.elementlabel == "None") {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        } else if (this.elementlabel == "PPF" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(170, 95, 166, 1)';
            this.ccus = 'rgba(170, 95, 166, .5)';
        } else if (this.elementlabel == "Demand" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(0, 131, 173, 1)';
            this.ccus = 'rgba(0, 131, 173, .5)';
        } else if (this.elementlabel == "Supply" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Fixed Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(188, 189, 192, 1)';
            this.ccus = 'rgba(188, 189, 192, .5)';
        } else if (this.elementlabel == "Indifference" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.elementlabel == "Marginal Revenue" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(35, 31, 32, 1)';
            this.ccus = 'rgba(35, 31, 32, .5)';
        } else if (this.elementlabel == "Total Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.elementlabel == "Variable Cost" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(238, 165, 122, 1)';
            this.ccus = 'rgba(238, 165, 122, .5)';
        } else if (this.elementlabel == "Consumer Surplus" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(184, 228, 245, 1)';
            this.ccus = 'rgba(184, 228, 245, .5)';
        } else if (this.elementlabel == "Producer Surplus" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(249, 176, 160, 1)';
            this.ccus = 'rgba(249, 176, 160, .5)';
        } else if (this.elementlabel == "Deadweight Loss" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(254, 216, 119, 1)';
            this.ccus = 'rgba(254, 216, 119, .5)';
        } else if (this.elementlabel == "Loss" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(249, 176, 160, 1)';
            this.ccus = 'rgba(249, 176, 160, .5)';
        } else if (this.elementlabel == "Revenue/Profit" && (this.bookcolor == "Yes" || this.tempbookColor == "Yes")) {
            this.cc = 'rgba(219, 223, 167, 1)';
            this.ccus = 'rgba(219, 223, 167, .5)';
        } else {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        }
    }

    this.setStudentColor = function () {
        if (this.studentcorrectlabel == "None") {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        } else if (this.studentcorrectlabel == "PPF") {
            this.cc = 'rgba(170, 95, 166, 1)';
            this.ccus = 'rgba(170, 95, 166, .5)';
        } else if (this.studentcorrectlabel == "Demand") {
            this.cc = 'rgba(0, 131, 173, 1)';
            this.ccus = 'rgba(0, 131, 173, .5)';
        } else if (this.studentcorrectlabel == "Supply") {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.studentcorrectlabel == "Fixed Cost") {
            this.cc = 'rgba(188, 189, 192, 1)';
            this.ccus = 'rgba(188, 189, 192, .5)';
        } else if (this.studentcorrectlabel == "Indifference") {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.studentcorrectlabel == "Marginal Cost") {
            this.cc = 'rgba(247, 147, 29, 1)';
            this.ccus = 'rgba(247, 147, 29, .5)';
        } else if (this.studentcorrectlabel == "Marginal Revenue") {
            this.cc = 'rgba(35, 31, 32, 1)';
            this.ccus = 'rgba(35, 31, 32, .5)';
        } else if (this.studentcorrectlabel == "Total Cost") {
            this.cc = 'rgba(219, 92, 28, 1)';
            this.ccus = 'rgba(219, 92, 28, .5)';
        } else if (this.studentcorrectlabel == "Variable Cost") {
            this.cc = 'rgba(238, 165, 122, 1)';
            this.ccus = 'rgba(238, 165, 122, .5)';
        } else if (this.studentcorrectlabel == "Consumer Surplus") {
            this.cc = 'rgba(184, 228, 245, 1)';
            this.ccus = 'rgba(184, 228, 245, .5)';
        } else if (this.studentcorrectlabel == "Producer Surplus") {
            this.cc = 'rgba(249, 176, 160, 1)';
            this.ccus = 'rgba(249, 176, 160, .5)';
        } else if (this.studentcorrectlabel == "Deadweight Loss") {
            this.cc = 'rgba(254, 216, 119, 1)';
            this.ccus = 'rgba(254, 216, 119, .5)';
        } else if (this.studentcorrectlabel == "Loss") {
            this.cc = 'rgba(249, 176, 160, 1)';
            this.ccus = 'rgba(249, 176, 160, .5)';
        } else if (this.studentcorrectlabel == "Revenue/Profit") {
            this.cc = 'rgba(219, 223, 167, 1)';
            this.ccus = 'rgba(219, 223, 167, .5)';
        } else {
            this.cc = 'rgba(0, 0, 0, 1)';
            this.ccus = 'rgba(0, 0, 0, .5)';
        }
    }

    this.AreIdentical = function (a, b) {
        var i = a.length;
        if (i != b.length) return false;
        while (i--) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };
    // get evalshift based off current tab
    this.getEvalShift = function () {
        if (graphSe.mode == 'correct') return this.evalshift;
        if (graphSe.mode == 'incorrect1') return this.evalshiftinc[1];
        if (graphSe.mode == 'incorrect2') return this.evalshiftinc[2];
        if (graphSe.mode == 'incorrect3') return this.evalshiftinc[3];
        return '';
    };
    //Changes for SWG-312 and 313
    // get precise based on current tab
    this.getPrecise = function () {
        if (graphSe.mode == 'correct') return this.precise;
        if (graphSe.mode == 'incorrect1') return this.preciseinc[1];
        if (graphSe.mode == 'incorrect2') return this.preciseinc[2];
        if (graphSe.mode == 'incorrect3') return this.preciseinc[3];
        return '';
    };
    //Changes for SWG-312 and 313 end
    // drawme of an area
    this.DrawMe = function (ctx) {
        var clr = this.iscurrent == true ? this.cc : this.ccus;

        if (graphSe.boo && this.ghost && (this.mode.indexOf("correct") == -1) && this.mode != "student") {
            this.DrawGhost();

            var xincrement = 1;
            if (document.getElementById('xinc') != null) xincrement = document.getElementById('xinc').value;
            // if the mode is relative and if the right left is selected then shift the area by 2 points
            var shiftVal = this.getEvalShift();
            shiftVal = shiftVal == undefined ? this.evalshift : shiftVal; ////SWG-312, 313
            var isPrecise = this.getPrecise();
            if (!isPrecise && shiftVal) {
                if (shiftVal == "left") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.leftCoordinatesUpdated == undefined || this.leftCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            // loop through all the points and increase/decrease based on selections
                            for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
                                this.pts[p] -= 2 * xincrement;
                                this.spts[p] -= 2 * xincrement;
                                //this.pts[p+1] -= 2 * xincrement; this.spts[p+1] -= 2 * xincrement;
                            } // end for loop

                            this.leftCoordinatesUpdated = true;
                            this.rightCoordinatesUpdated = undefined;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                } // end if left condition
                else if (shiftVal == "right") {
                    // preserve original Coordinates
                    if (this.originalCoordinates == undefined || this.originalCoordinates == null) {
                        var pts = [];
                        var spts = [];
                        for (p = 0, l = this.pts.length; p < l; p++) {
                            pts.push(this.pts[p]);
                            spts.push(this.spts[p]);
                        }
                        this.originalCoordinates = { pts: pts, spts: spts };
                    }
                    if (this.originalCoordinates != undefined || this.originalCoordinates != null) {
                        // Coordinates should update only once , after that never
                        if (this.rightCoordinatesUpdated == undefined || this.rightCoordinatesUpdated == null) {
                            if (!(this.AreIdentical(this.pts, this.originalCoordinates.pts) && this.AreIdentical(this.spts, this.originalCoordinates.spts))) {
                                // reset the Coordinates
                                this.pts.splice(0, this.pts.length);
                                this.spts.splice(0, this.spts.length);
                                for (p = 0, l = this.originalCoordinates.pts.length; p < l; p++) {
                                    this.pts.push(this.originalCoordinates.pts[p]);
                                    this.spts.push(this.originalCoordinates.spts[p]);
                                }
                            }
                            // loop through all the points and increase/decrease based on selections
                            for (var p = 0, ln = this.pts.length; p < ln; p += 2) {
                                this.pts[p] += 2 * xincrement;
                                this.spts[p] += 2 * xincrement;
                                //this.pts[p+1] += 2 * xincrement; this.spts[p+1] += 2 * xincrement;
                            } // end for loop

                            this.rightCoordinatesUpdated = true;
                            this.leftCoordinatesUpdated = undefined;

                            //SWG_312 and SWG_313 changes
                            if (graphSe.mode.includes('incorrect'))
                                this.IncorrectMe(undefined, undefined, ['relative', shiftVal]);
                        }
                    }
                }
            } //end if precise condition
            else {
                ////SWG-391 Changes
                var nn = Number(graphSe.mode.charAt(9));
                if (this.relementlabelinc[nn] != "Accepted Area")
                    ////SWG-391 Changes Ends
                    this.IncorrectMe();
            }
        }

        this.PathMe();

        this.path.strokeColor = clr;
        this.path.strokeWidth = 2;

        if (this.doFill) {
            this.path.fillColor = clr;
            this.path.closed = true;
        }
        //this.path.smooth();
        if (this.iscurrent) this.ControlPoints();

        if (this.plumbLine) this.PlumbLine();
        //SWG-87
        // if(this.tempLableLine == undefined && this.elementlabel!='' && this.mode!='designer'){
        //     this.SetElementLabel(this.elementlabel);
        // }
        //SWG-87
        if (this.labelLine || this.tempLableLine) this.LabelLine();
    }

    this.DrawGhost = function () {
        var gh = this.ghost;
        var ghPath = new paper.Path();
        ghPath.strokeColor = gh.clr;
        ghPath.fillColor = gh.clr;
        ghPath.strokeWidth = this.width;
        ghPath.dashArray = [2, 2];

        for (var p = 0, ln = gh.pts.length; p < ln; p += 2) {
            var xpt = graphSe.ConvertXgToXpx(graphSe.snapIt ? gh.spts[p] : gh.pts[p]);
            var ypt = graphSe.ConvertYgToYpx(graphSe.snapIt ? gh.spts[p + 1] : gh.pts[p + 1]);
            ghPath.add(new paper.Point(xpt, ypt));
        }

        pt = graphSe.snapIt ? { x: this.ghost.spts[0], y: this.ghost.spts[1] } : { x: this.ghost.pts[0], y: this.ghost.pts[1] };

        var xoffset = -10;
        var yoffset = -10;

        pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
        pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;


        if (this.labelLine == true) {
            text = new paper.PointText(new paper.Point(pt.x, pt.y));
            text.justification = 'center';
            text.fillColor = this.ccus;
            text.content = this.labeledit;
        }

    }

    this.TrackAlong = function (lbl) {
        if (lbl != undefined) this.trackAlongLabel = lbl;

        var trackElement = graphSe.FindInGraph(this.trackAlongLabel);

        if (trackElement != null) {
            var t = trackElement;
            var s = t.SwapPoints();
            this.trackAng = Math.atan2(s.ye - s.ys, s.xe - s.xs);
        }
    }

    this.Track = function (dist) {
        var ang = this.trackAng;
        var dx = Math.cos(ang) * dist;
        var dy = Math.sin(ang) * dist;

        return { sx: dx, sy: dy };
    }

    this.SwapPoints = function () {
        var xs, ys, xe, ye;
        if (this.pts[0] <= this.pts[10]) {
            xs = this.pts[0];
            ys = this.pts[1];
            xe = this.pts[10];
            ye = this.pts[11];
        } else {
            xs = this.pts[10];
            ys = this.pts[11];
            xe = this.pts[0];
            ye = this.pts[1];
        }

        return { xs: xs, ys: ys, xe: xe, ye: ye }
    }

    this.SetupDesigner = function () {
        if (this.ghost && !this.acceptedArea) {
            var gh = this.ghost;
            for (var i = 0, ln = gh.pts.length; i < ln; i++) {
                this.pts[i] = gh.pts[i];
                this.spts[i] = gh.spts[i];
            }
        }
    }

    this.SetupCorrect = function () {
        var me;
        if (this.correct.length > 0) {
            var cr = this.correct[0];
            //SWG-154 changes
            //if (cr.type == undefined || cr.type[1] != "area") {
            if ((cr.type == undefined || cr.type[1] != "area") && (this.elabelmode != 'Static' && this.elabelmode != '')) {
                for (var i = 0, ln = cr.pts.length; i < ln; i++) {
                    this.pts[i] = cr.pts[i];
                    this.spts[i] = cr.spts[i];
                }
            } else if (!this.interactive && graphSe.mode == "designer") this.CorrectMe();
            else if (cr.type[1] == "relative") {
                var ro = graphSe.FindInGraph(cr.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    for (var i = 0, ln = me.pts.length; i < ln; i++) {
                        this.pts[i] = me.pts[i];
                        this.spts[i] = me.spts[i];
                    }
                }
            }
        }
    }

    this.SetupIncorrect = function (nn) {
        var me;
        if (!graphSe.incorrectActive[nn]) {
            if (this.correct[0] != null) {
                var ca = this.correct[0];
                this.IncorrectMe(ca, nn, undefined);
            }
        }

        if (this.incorrect[nn] != null) {
            var cr = this.incorrect[nn];
            if (cr.type == undefined || cr.type[1] != "area" && this.interactive) {
                for (var i = 0, ln = cr.pts.length; i < ln; i++) {
                    this.pts[i] = cr.pts[i];
                    this.spts[i] = cr.spts[i];
                }
            } else if (!this.interactive && graphSe.mode == "designer") this.IncorrectMe();
            else if (cr.type[1] == "relative") {
                var ro = graphSe.FindInGraph(cr.type[2]);
                if (ro !== null && (me = ro.ghost) != null) {
                    for (var i = 0, ln = me.pts.length; i < ln; i++) {
                        this.pts[i] = me.pts[i];
                        this.spts[i] = me.spts[i];
                    }
                }
            }
        }
    }

    this.SetupStudent = function () {
        if (this.ghost && this.mode == "designer") {
            var gh = this.ghost;
            for (var i = 0, ln = gh.pts.length; i < ln; i++) {
                this.pts[i] = gh.pts[i];
                this.spts[i] = gh.spts[i];
            }
        }
    }

    this.AddPoint = function (pt, event) {
        ////SWG-381 Changes
        // if (graphSe.mode != 'student') {
        pt.x += 4;
        pt.y += 4;
        // }////SWG-381 Changes end
        //SWG-225 changes
        var lastindex = this.spts.length - 1;
        var ptxg = graphSe.ConvertXpxToXg(pt.x);
        var ptyg = graphSe.ConvertYpxToYg(pt.y);
        var snapPtxg = graphSe.SnapX(ptxg);
        var snapPtyg = graphSe.SnapY(ptyg);

        var myPointObj = {};
        myPointObj.X = ptxg;
        myPointObj.Y = ptyg;
        myPointObj.snapX = snapPtxg;
        myPointObj.snapY = snapPtyg;
        //SWG-225 changes
        var loopStart = this.spts.length > 4 ? 2 : 0;
        for (var i = loopStart; i <= this.spts.length - 2; i += 2) {
            if (this.spts[i] == graphSe.SnapX(myPointObj.X) && this.spts[i + 1] == graphSe.SnapY(myPointObj.Y)) {
                return false;
            }
        }
        //SWG-225 changes end
        if (this.pts.length > 0 && event) {
            var pointDistance = Math.sqrt((pt.x - graphSe.ConvertXgToXpx(this.pts[lastindex - 1])) * (pt.x - graphSe.ConvertXgToXpx(this.pts[lastindex - 1])) + ((pt.y - graphSe.ConvertYgToYpx(this.pts[lastindex])) * (pt.y - graphSe.ConvertYgToYpx(this.pts[lastindex]))));
            if (pointDistance < 25)
                myPointObj = checkPointDifferance(myPointObj, thePoly);
        }
        //SWG-225 changes
        var loopStart = this.spts.length > 4 ? 2 : 0;
        for (var i = loopStart; i <= this.spts.length - 2; i += 2) {
            if (this.spts[i] == graphSe.SnapX(myPointObj.X) && this.spts[i + 1] == graphSe.SnapY(myPointObj.Y)) {
                return false;
            }
        }

        this.pts.push(myPointObj.X);
        this.pts.push(myPointObj.Y);

        this.spts.push(graphSe.SnapX(myPointObj.X));
        this.spts.push(graphSe.SnapY(myPointObj.Y));
        //SWG-225 changes end
        var n = this.pts.length;

        this.PathMe();

        if (n > 4) {
            var p0 = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[0] : this.pts[0]);
            var p1 = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[1] : this.pts[1]);
            //SWG-225 changes
            var dx = p0 - graphSe.ConvertXgToXpx(graphSe.snapIt ? graphSe.SnapX(myPointObj.X) : myPointObj.X);//SWG-381
            var dy = p1 - graphSe.ConvertYgToYpx(graphSe.snapIt ? graphSe.SnapY(myPointObj.Y) : myPointObj.Y);//SWG-381
            //SWG-225 changes end
            if ((dx * dx + dy * dy) < 32) {
                this.pts[n - 2] = this.pts[0];
                this.pts[n - 1] = this.pts[1];
                this.spts[n - 2] = this.spts[0];
                this.spts[n - 1] = this.spts[1];
                this.closed = true;
                this.doFill = true;
                //if( !this.ghost ) this.GhostMe( );
                thePoly = null;

                if ((graphSe.mode.indexOf("correct") != -1) && graphSe.drawAcceptedArea != null) {
                    if (graphSe.mode == "correct") this.CorrectMe(["relative", "area", graphSe.drawAcceptedArea.label]);
                    else if (graphSe.mode.substring(0, 9) == "incorrect")
                        this.IncorrectMe(undefined, undefined, ["relative", "area", graphSe.drawAcceptedArea.label]);
                    this.acceptedArea = true;
                } else {
                    if (graphSe.mode == "correct") this.CorrectMe();
                    if (graphSe.mode.substring(0, 9) == "incorrect") this.IncorrectMe();
                }
                //SWG-225 changes
                //DoPointer();
                //SWG-225 changes end
                //if( graphSe.mode == "student" )
                //    { if( !this.CheckIsCorrect( "drawing" ) ) this.CheckIsIncorrect( "drawing" ); }
            }
        }

        this.SetElementPoints();

    }

    this.CompleteMe = function () {
        if (this.pts.length >= 6) {
            var p0 = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[0] : this.pts[0]);
            var p1 = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[1] : this.pts[1]);
            this.AddPoint({ x: p0 - 4, y: p1 - 4 });
        } else {
            graphMe.splice(gmloc - 1, 1);
            gmloc--;
            if (gmloc <= 0) gmloc = 1;
            thePoly = null;
        }
    }

    this.DragMe = function (mpt, drgSt) {
        if (drgSt != undefined) this.dragState = drgSt;

        switch (this.dragState) {
            case "off":
                if (graphSe.boo && this.interactive && !this.ghost && graphSe.mode != "student") this.GhostMe();

                dragObj = this;
                this.dragstart = mpt;
                this.dragDxDy = { dx: 0, dy: 0 };
                for (var i = 0, ln = this.pts.length - 2; i < ln && this.dragState == "off"; i += 2) {
                    var pt = graphSe.snapIt ? { x: this.spts[i], y: this.spts[i + 1] } : { x: this.pts[i], y: this.pts[i + 1] };
                    if (graphSe.HitPt(mpt, pt.x, pt.y, graphSe.handleRadius) && !this.locked) {
                        this.dragState = "dragPoint";
                        this.dragPt = i;
                    }
                }

                if (this.dragState == "off") this.dragState = "dragPoly";
                //if(graphSe.mode=="correct")Precise(true);
                if (graphSe.mode == "student") this.studentdrag = true;

                if (graphSe.mode.indexOf("correct") != -1) {
                    if (this.acceptedArea) this.Highlight();
                    this.SetCorrectPoints();
                }

                break;

            case "dragPoint":
                var i = this.dragPt

                var dsxg = graphSe.ConvertXpxToXg(this.dragstart.x) - graphSe.ConvertXpxToXg(mpt.x);
                var dsyg = graphSe.ConvertYpxToYg(this.dragstart.y) - graphSe.ConvertYpxToYg(mpt.y);
                this.pts[i] -= dsxg;
                this.pts[i + 1] -= dsyg;
                if (this.mode == 'student') {//SWG_426 changes
                    this.pts[i] = this.pts[i] < graphSe.xmin ? graphSe.xmin : (this.pts[i] > graphSe.xmax ? graphSe.xmax : this.pts[i]);//SWG_426 changes
                    this.pts[i + 1] = this.pts[i + 1] < graphSe.ymin ? graphSe.ymin : (this.pts[i + 1] > graphSe.ymax ? graphSe.ymax : this.pts[i + 1]);//SWG_426 changes
                }
                //Changes for SWG-47 By Akash
                this.SnapMe();
                if (graphSe.mode == "designer" && this.ghost != undefined) {
                    this.ghost.pts[i] = this.pts[i];
                    this.ghost.pts[i + 1] = this.pts[i + 1];
                    this.ghost.spts[i] = this.spts[i];
                    this.ghost.spts[i + 1] = this.spts[i + 1];

                }
                //End of changes SWG-47
                if (i == 0) {
                    var n = this.pts.length;
                    this.pts[n - 2] = this.pts[0];
                    this.pts[n - 1] = this.pts[1];
                    this.spts[n - 2] = this.spts[0];
                    this.spts[n - 1] = this.spts[1];
                    //Changes for SWG-47 By Akash
                    if (graphSe.mode == "designer" && this.ghost != undefined) {
                        var n = this.pts.length;
                        this.ghost.pts[n - 2] = this.pts[0];
                        this.ghost.pts[n - 1] = this.pts[1];
                        this.ghost.spts[n - 2] = this.spts[0];
                        this.ghost.spts[n - 1] = this.spts[1];
                    }
                    //End of changes SWG-47
                }
                this.SetElementPoints();
                //Swg-128 Changes
                if (graphSe.mode == 'student') {
                    this.upadeteStudLabelPossitiopn();
                }
                //if(graphSe.mode=="correct") this.SetCorrectPoints();
                if (graphSe.mode.indexOf("correct") != -1) this.SetCorrectPoints();

                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx += dsxg, dy: this.dragDxDy.dy += dsyg }
                break;

            case "dragPoly":

                //var dsxg = graphSe.ConvertXpxToXg( this.dragstart.x ) - graphSe.ConvertXpxToXg( mpt.x );
                //var dsyg = graphSe.ConvertYpxToYg( this.dragstart.y ) - graphSe.ConvertYpxToYg( mpt.y );

                var dsxg = graphSe.ConvertXpxToXg(mpt.x) - graphSe.ConvertXpxToXg(this.dragstart.x);
                var dsyg = graphSe.ConvertYpxToYg(mpt.y) - graphSe.ConvertYpxToYg(this.dragstart.y);

                if (this.taelement != "None") {
                    this.TrackAlong();
                    var s = this.Track(dsxg);
                    var s1 = this.Track(dsyg);
                    dsxg = s.sx;
                    dsyg = s.sy;
                    var tracToElement = graphSe.FindInGraph(this.trackAlongLabel);
                    if (tracToElement.what == 'line') {
                        var minX = (tracToElement.sxsg < tracToElement.sxeg) ? tracToElement.sxsg : tracToElement.sxeg;
                        var maxX = (tracToElement.sxeg > tracToElement.sxsg) ? tracToElement.sxeg : tracToElement.sxsg;
                        var minY = (tracToElement.sysg < tracToElement.syeg) ? tracToElement.sysg : tracToElement.syeg;
                        var maxY = (tracToElement.syeg > tracToElement.sysg) ? tracToElement.syeg : tracToElement.sysg;
                        if (minX == maxX) {
                            dsyg = s1.sy;
                            for (var i = 0; i < this.pts.length / 2; i++) {
                                this.pts[i * 2 + 1] += dsyg;
                            }
                        }
                        else if (minY == maxY) {
                            for (var i = 0; i < this.pts.length / 2; i++) {
                                this.pts[i * 2] += dsxg;
                            }
                        }
                        else {
                            for (var i = 0; i < this.pts.length / 2; i++) {
                                this.pts[i * 2] += dsxg;
                                this.pts[i * 2 + 1] += dsyg;
                            }
                        }
                    }
                }
                else {
                    //SWG_426 changes
                    if (this.mode == 'student') {
                        for (var i = 0; i < this.pts.length / 2; i++) {
                            if ((this.pts[i * 2] <= graphSe.xmin || this.pts[i * 2] >= graphSe.xmax) && (this.pts[i * 2] + dsxg < graphSe.xmin || this.pts[i * 2] + dsxg > graphSe.xmax))
                                return;
                            if ((this.pts[i * 2 + 1] <= graphSe.ymin || this.pts[i * 2 + 1] >= graphSe.ymax) && (this.pts[i * 2 + 1] + dsyg < graphSe.ymin || this.pts[i * 2 + 1] + dsyg > graphSe.ymax))
                                return;
                        }
                    }
                    //SWG_426 changes end
                    for (var i = 0; i < this.pts.length / 2; i++) {
                        this.pts[i * 2] += dsxg;
                        this.pts[i * 2 + 1] += dsyg;
                    }
                }
                for (var i = 0; i < this.pts.length / 2; i++) {//SWG_426 changes
                    this.pts[i * 2] = this.pts[i * 2] < graphSe.xmin ? graphSe.xmin : (this.pts[i * 2] > graphSe.xmax ? graphSe.xmax : this.pts[i * 2]);//SWG_426 changes
                    this.pts[i * 2 + 1] = this.pts[i * 2 + 1] < graphSe.ymin ? graphSe.ymin : (this.pts[i * 2 + 1] > graphSe.ymax ? graphSe.ymax : this.pts[i * 2 + 1]);//SWG_426 changes
                }
                this.SnapMe();

                this.SetElementPoints();
                //Swg-128 Changes
                if (graphSe.mode == 'student') {
                    this.upadeteStudLabelPossitiopn();
                }
                if (graphSe.mode.indexOf("correct") != -1) this.SetCorrectPoints();
                //{
                this.SetCorrectPoints();
                this.SetSettings();
                //}

                this.dragstart = mpt;
                this.dragDxDy = { dx: this.dragDxDy.dx -= dsxg, dy: this.dragDxDy.dy -= dsyg };
                this.dragPt = -1;
                break;

            case "drop":
                //Added to shift object again when come back from correct tab to designe and move the object - By Akash
                if (graphSe.mode == "designer" && this.interactive) {
                    this.posMoved = true;
                }
                else {
                    this.posMoved = false;
                }
                dragObj = null;
                this.dragState = "off";
                this.dragPt = -1;
                if (this.dragDxDy.dx != 0 || this.dragDxDy.dy != 0) {
                    if (!this.acceptedArea) {
                        this.SetElementPoints();
                        if (graphSe.mode == "correct" || graphSe.mode.substring(0, 9) == "incorrect") this.PreciseMe(true);
                        if (graphSe.mode == "correct" || graphSe.mode.substring(0, 9) == "incorrect") this.SetCorrectPoints();

                        if (graphSe.mode.substring(0, 9) == "incorrect") this.IncorrectMe();
                        if (graphSe.mode == "correct") this.CorrectMe();
                    } else {
                        if (graphSe.mode == "correct") this.CorrectMe(["relative", "area", graphSe.drawAcceptedArea.label]);
                        else if (graphSe.mode.substring(0, 9) == "incorrect")
                            this.IncorrectMe(undefined, undefined, ["relative", "area", graphSe.drawAcceptedArea.label]);
                    }
                    graphSe.OpsMoveElement(this, this.dragPt, -this.dragDxDy.dx, -this.dragDxDy.dy);
                    //if( graphSe.mode == "student" )
                    //     { if( !this.CheckIsCorrect( ) ) this.CheckIsIncorrect( ); }
                    if (graphSe.mode == "designer" && this.interactive) {
                        this.GhostMe();
                        this.UpdateIncorrects()
                    }
                    if (graphSe.mode == "designer" && this.interactive && this.correct[0] != null)
                        this.CorrectMe(this.correct[0].type);
                }
                this.SetSettings();
                break;
        }
    }
    //Swg-128 Changes
    this.upadeteStudLabelPossitiopn = function () {
        var selectObje = $('#' + this.studentlabelid);
        if (selectObje) {
            if ($(selectObje).children().attr('data-uniqueid') == this.uniqueLabel) {
                var spt = graphSe.snapIt ? { x: this.spts[2], y: this.spts[3] } : { x: this.pts[2], y: this.pts[3] };
                var pt = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };

                var xoffset = 0;
                var yoffset = 0;

                pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
                pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
                spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
                spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

                var d = 20;

                var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
                var newx = pt.x + d * (pt.x - spt.x) / mag
                var newy = pt.y + d * (pt.y - spt.y) / mag

                var left = newx + 37 + 'px';
                var top = newy + 179 + 'px';

                ///SWG-221 Changes
                if (graphSe.titleshow && graphSe.title != "") top = newy + 158 + 'px';
                else top = newy + 105 + 'px';
                ////SWG-221 Changes end

                $('#' + this.studentlabelid).css('left', left);
                $('#' + this.studentlabelid).css('top', top);
            }
        }
    }

    this.IsDone = function () {
        return this.doFill;
    }

    this.HitMe = function (mpt) {
        var hitCp = false;
        var myline = new paper.Path.Line(new paper.Point(0, 0), new paper.Point(mpt.x, mpt.y), 2);

        this.PathMe();

        var gii = this.path.getIntersections(myline);
        var giiln = gii.length;

        if (!(giiln % 2)) {
            for (var i = 0, ln = this.pts.length; i < ln && !hitCp; i++) {
                var px = graphSe.snapIt ? this.spts[i] : this.pts[i];
                var py = graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1];

                hitCp = graphSe.HitPt(mpt, px, py, graphSe.handleRadius);
            }
        }

        return giiln % 2 || hitCp;
    }

    //For Area
    this.MoveMe = function (ipt, dx, dy) {
        if (ipt > -1) {
            this.pts[ipt] -= dx;
            this.pts[ipt + 1] -= dy;
        } else {
            for (var i = 0, ln = this.spts.length; i < ln; i += 2) {
                this.pts[i] -= dx;
                this.pts[i + 1] -= dy;
            }
        }
        if (graphSe.mode == "designer" && this.interactive) {
            this.GhostMe();
            this.posMoved = true;
        }
        else {
            this.posMoved = false;
        }
        this.SnapMe();
    }

    this.ControlMe = function (tf) {
        this.showControl = tf;
    }

    this.ControlPoints = function () {

        for (var i = 0, ln = this.doFill ? this.pts.length - 2 : this.pts.length; i < ln; i += 2) {
            // var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
            // var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);
            var px = graphSe.snapIt ? this.spts[i] : this.pts[i];
            var py = graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1];
            px = graphSe.ConvertXgToXpx(px == graphSe.xmin ? px + 0.2 * graphSe.xinc : (px == graphSe.xmax ? px - 0.2 * graphSe.xinc : px)); ////SWG - 233 -- * graphSe.xinc & graphSe.yinc
            py = graphSe.ConvertYgToYpx(py == graphSe.ymax ? py - 0.2 * graphSe.yinc : py); ////SWG - 233 -- * graphSe.xinc & graphSe.yinc
            var ps = new paper.Path.Circle(new paper.Point(px, py), graphSe.handleRadius);
            ps.strokeColor = graphSe.handleColor;
            ps.strokeWidth = 1;

            ////SWG - 199 Changes
            if (graphSe.mode.includes("incorrect")) {
                var nn = Number(graphSe.mode.charAt(9));
                if (this.deletedFrom != undefined && this.deletedFrom[nn] != undefined) {
                    ps.visible = false;
                }
                else {
                    ps.visible = true;
                }
            }
            else {
                ps.visible = true;
            }
        }
    }

    // pathme of an area
    this.PathMe = function () {
        this.path = new paper.Path();

        for (var p = 0, ln = this.doFill ? this.pts.length - 2 : this.pts.length; p < ln; p += 2) {
            var xpt = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[p] : this.pts[p]);
            var ypt = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[p + 1] : this.pts[p + 1]);
            this.path.add(new paper.Point(xpt, ypt));
        }

        if (this.closed) this.path.closed = true;


    }

    this.SnapMe = function () {
        for (var i = 0, ln = this.spts.length; i < ln; i += 2) {
            this.spts[i] = graphSe.SnapX(this.pts[i]);
            this.spts[i + 1] = graphSe.SnapY(this.pts[i + 1]);
        }
    }

    //For Area
    this.CorrectMe = function (type) {
        var lbl = this.label;
        var ca = this.correct;

        if (type != undefined) {
            if (type[0] == "relative" && type[1] == "area") {
                var ele = graphSe.FindInGraph(type[2]);
                var ca = ele.correct;
                var objPolyCorrect = this.correct; ////SWFB-2480 Changes
                objPolyCorrect[0] = { type: type == undefined ? "precise" : type, lbl: lbl, uniqueLabel: ca.uniqueLabel, pts: [], spts: [], match: false }; ////SWFB-2480 Changes.
                if (ele.label[0] == 'A') {
                    var aa = this.label.split("");
                    aa[0] = "=";
                    lbl = aa.join("");
                } else lbl = this.label;
            }
        }
        //SWG-64 changes
        //ca[0] = { type: type == undefined ? "precise" : type, lbl: lbl, pts: [], spts: [], match: false };
        ca[0] = { type: type == undefined ? "precise" : type, lbl: lbl, uniqueLabel: this.uniqueLabel, pts: [], spts: [], match: false };
        //SWG-64 changes end
        //changes to shift object again when come back from correct tab to designe and move the object - By Akash
        if ((type != undefined) && (type[1] == 'left' || type[1] == 'right' || type[1] == 'up' || type[1] == 'down') && this.posMoved && graphSe.mode == "correct") {
            var shifValue = (type[1] == 'left' || type[1] == 'down') ? -2 : 2;
            var xincrement = 1;
            if (document.getElementById('xinc') != null) xincrement = document.getElementById('xinc').value;
            var yincrement = 1;
            if (document.getElementById('yinc') != null) yincrement = document.getElementById('yinc').value;

            if (type[1] == 'left' || type[1] == 'right') {
                // loop through all the points and increase/decrease based on selections
                for (var i = 0, ln = this.pts.length; i < ln; i += 2) {
                    this.pts[i] = this.ghost.pts[i] + (shifValue * xincrement);
                    this.spts[i] = this.ghost.spts[i] + (shifValue * xincrement);
                } // end for loop
                this.leftCoordinatesUpdated = type[1] == 'left' ? true : undefined;
                this.rightCoordinatesUpdated = type[1] == 'right' ? true : undefined;
            }
            if (type[1] == 'up' || type[1] == 'down') {
                // loop through all the points and increase/decrease based on selections
                for (var i = 1, ln = this.pts.length; i < ln; i += 2) {
                    this.pts[i] = this.ghost.pts[i] + (shifValue * xincrement);
                    this.spts[i] = this.ghost.spts[i] + (shifValue * xincrement);
                } // end for loop
                this.upCoordinatesUpdated = type[1] == 'up' ? true : undefined;
                this.downCoordinatesUpdated = type[1] == 'down' ? true : undefined;
            }
            this.posMoved = false;
            this.originalCoordinates = { pts: this.ghost.pts, spts: this.ghost.spts };

        }
        if (type == undefined)
            this.posMoved = false;
        //changes to shift object again when come back from correct tab to designe and move the object end
        for (var i = 0, ln = this.pts.length; i < ln; i++) {
            ca[0].pts[i] = this.pts[i];
            ca[0].spts[i] = this.spts[i];
        }
    }

    this.IncorrectMe = function (ca, nn, type) {
        //var lbl = this.label;
        var n = nn == undefined ? Number(graphSe.mode[9]) : nn;
        var ca = ca == undefined ? this : ca;
        var lbl = ca == this ? ca.label : ca.lbl;
        var uniqueLabel = ca.uniqueLabel;
        if (type != undefined) {
            if (type[0] == "relative" && type[1] == "area") {
                var ele = graphSe.FindInGraph(type[2]);
                ca = ele.incorrect;
                //ca = ele;
                if (ele.label[0] == 'A') {
                    var aa = this.label.split("");
                    aa[0] = "=";
                    lbl = aa.join("");
                } else lbl = this.label;
            }
            ele.incorrect[n] = { nn: n, type: type == undefined ? "precise" : type, lbl: lbl, uniqueLabel: uniqueLabel, pts: [], spts: [], match: false }; ////SWG-391 Changes
            for (var i = 0, ln = this.pts.length; i < ln; i++) {
                ////SWG-391 Changes
                ele.incorrect[n].pts[i] = this.pts[i];
                ele.incorrect[n].spts[i] = this.spts[i];
                ////SWG-391 Changes Ends
            }
        } else {
            this.incorrect[n] = { nn: n, type: type == undefined ? "precise" : type, lbl: lbl, uniqueLabel: uniqueLabel, pts: [], spts: [], match: false };

            for (var i = 0, ln = ca.pts.length; i < ln; i++) {
                this.incorrect[n].pts[i] = ca.pts[i];
                this.incorrect[n].spts[i] = ca.spts[i];
            }
        }


    }

    this.FindPt = function (spts) {
        var rtk = -1
        var cx0 = graphSe.ConvertXgToXpx(spts[0]);
        var cy0 = graphSe.ConvertYgToYpx(spts[1]);
        for (var i = 0, ln = this.pts.length; i < ln && rtk == -1; i++) {
            var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
            var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);
            var dpx = px - cx0;
            var dpy = py - cy0;

            if (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance) rtk = i;
        }

        return rtk;
    }
    //for Polygon
    this.CheckIsCorrect = function (mode, answer) {
        var tst = true;
        var labelcorrect = true;
        var correct, nn;
        var ca;

        if (answer == undefined) correct = this.correct[0]
        else {
            correct = answer;
            nn = correct.nn
        }

        if (correct != undefined && mode == undefined) {
            var typ = correct.type;
            var area = (typ != undefined) && (typ.length == 3);
            if (typ == "precise" || typ == undefined || area) {
                ca = correct;
                switch (ca.lbl[0]) {
                    case 'A':
                        var pca = graphSe.snapIt ? ca.spts : ca.pts;
                        var studObj = graphSe.snapIt ? this.spts : this.pts;
                        //Changes for SWG-66
                        var removedVertices = {};
                        if (removedVertices.pts == undefined && removedVertices.spts == undefined) {
                            removedVertices.pts = this.pts.join();
                            removedVertices.spts = this.spts.join();
                        }
                        for (var i = 0; i < studObj.length && studObj.length > pca.length; i += 2) {

                            var xspx = graphSe.ConvertXgToXpx(studObj[i]);
                            var yspx = (i + 1) >= studObj.length ? undefined : graphSe.ConvertYgToYpx(studObj[i + 1]);
                            var xepx = (i + 2) >= studObj.length ? undefined : graphSe.ConvertXgToXpx(studObj[i + 2]);
                            var yepx = (i + 3) >= studObj.length ? undefined : graphSe.ConvertYgToYpx(studObj[i + 3]);

                            var slope1;
                            if (xepx == undefined || xspx == undefined) {
                                slope1 = 1;
                            }
                            else {
                                var dx = xepx - xspx;
                                slope1 = Math.abs(dx) > .000001 ? -(yepx - yspx) / dx : Number.POSITIVE_INFINITY;
                                slope1 = slope1.toFixed(2);
                            }

                            var xepx1 = (i + 2) >= studObj.length ? undefined : graphSe.ConvertXgToXpx(studObj[i + 2]);
                            var yepx1 = (i + 3) >= studObj.length ? undefined : graphSe.ConvertYgToYpx(studObj[i + 3]);
                            var xspx1 = (i + 4) >= studObj.length ? undefined : graphSe.ConvertXgToXpx(studObj[i + 4]);
                            var yspx1 = (i + 5) >= studObj.length ? undefined : graphSe.ConvertYgToYpx(studObj[i + 5]);
                            var slope2;
                            if (xepx1 == undefined || xspx1 == undefined) {
                                slope2 = 2;
                            }
                            else {
                                var dx1 = xepx1 - xspx1;
                                slope2 = Math.abs(dx1) > .000001 ? -(yepx1 - yspx1) / dx1 : Number.POSITIVE_INFINITY;
                                slope2 = slope2.toFixed(2);
                            }

                            var slopeDiff = (slope1 == "Infinity" || slope2 == "Infinity") ? 1 : (parseFloat(slope1) - parseFloat(slope2));
                            slopeDiff = (slopeDiff < 0) ? slopeDiff * -1 : slopeDiff;
                            if (slope1 == slope2) {
                                this.spts.splice(i + 2, 1);
                                this.spts.splice(i + 2, 1);
                                this.pts.splice(i + 2, 1);
                                this.pts.splice(i + 2, 1);
                                studObj = graphSe.snapIt ? this.spts : this.pts;
                                i = -2;

                            }
                        }
                        //End of SWG-66 changes
                        //SWG-503 changes
                        if (this.spts.length > ca.spts.length) {
                            for (var i = 0; i < this.spts.length - 2; i += 2) {
                                if (this.spts[i + 2] != undefined) {
                                    if ((this.spts[i] == this.spts[i + 2]) && (this.spts[i + 1] == this.spts[i + 3])) {
                                        this.spts.splice(i, 1);
                                        this.spts.splice(i, 1);
                                        this.pts.splice(i, 1);
                                        this.pts.splice(i, 1);
                                    }
                                }
                            }
                        }
                        //SWG-503 changes end
                        //SWG-206 changes
                        if (this.spts.length > ca.spts.length && this.spts.length - ca.spts.length == 2) {
                            var xspx = graphSe.ConvertXgToXpx(studObj[0]);
                            var yspx = graphSe.ConvertYgToYpx(studObj[1]);
                            var xepx = graphSe.ConvertXgToXpx(studObj[studObj.length - 4]);//SWG-503 changes
                            var yepx = graphSe.ConvertYgToYpx(studObj[studObj.length - 3]);//SWG-503 changes

                            var slope1;
                            if (xepx == undefined || xspx == undefined) {
                                slope1 = 1;
                            }
                            else {
                                var dx = xepx - xspx;
                                slope1 = Math.abs(dx) > .000001 ? -(yepx - yspx) / dx : Number.POSITIVE_INFINITY;
                                slope1 = slope1.toFixed(2);
                            }

                            var xepx1 = graphSe.ConvertXgToXpx(studObj[2]);//SWG-503 changes
                            var yepx1 = graphSe.ConvertYgToYpx(studObj[3]);//SWG-503 changes
                            var xspx1 = graphSe.ConvertXgToXpx(studObj[0]);//SWG-503 changes
                            var yspx1 = graphSe.ConvertYgToYpx(studObj[1]);//SWG-503 changes
                            var slope2;
                            if (xepx1 == undefined || xspx1 == undefined) {
                                slope2 = 2;
                            }
                            else {
                                var dx1 = xepx1 - xspx1;
                                slope2 = Math.abs(dx1) > .000001 ? -(yepx1 - yspx1) / dx1 : Number.POSITIVE_INFINITY;
                                slope2 = slope2.toFixed(2);
                            }

                            var slopeDiff = (slope1 == "Infinity" || slope2 == "Infinity") ? 1 : (parseFloat(slope1) - parseFloat(slope2));
                            slopeDiff = (slopeDiff < 0) ? slopeDiff * -1 : slopeDiff;

                            if (slope1 == slope2) {
                                this.spts.splice(0, 1);
                                this.spts.splice(0, 1);
                                this.pts.splice(0, 1);
                                this.pts.splice(0, 1);
                                //SWG-503 Changes
                                this.spts.splice(this.spts.length - 1, 1);
                                this.spts.splice(this.spts.length - 1, 1);
                                this.pts.splice(this.spts.length - 1, 1);
                                this.pts.splice(this.spts.length - 1, 1);

                                this.spts[this.spts.length] = this.spts[0];
                                this.spts[this.spts.length] = this.spts[1];

                                this.pts[this.pts.length] = this.pts[0];
                                this.pts[this.pts.length] = this.pts[1];
                                studObj = graphSe.snapIt ? this.spts : this.pts;
                                //SWG-503 Changes end
                            }
                        }
                        //SWG-206 changes end
                        var k0 = this.FindPt(pca);
                        for (var i = 0, k = k0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                            var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[k] : this.pts[k]);
                            var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[k + 1] : this.pts[k + 1]);

                            var cx = graphSe.ConvertXgToXpx(pca[i]);
                            var cy = graphSe.ConvertYgToYpx(pca[i + 1]);
                            var dpx = px - cx;
                            var dpy = py - cy;
                            //SWG-66 changes
                            if (!isNaN(dpx) || !isNaN(dpy)) {
                                tst = tst && (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance);
                            }
                            //tst = tst && (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance);

                            k = k < pca.length - 2 ? k + 2 : 2;
                        }

                        if (!tst) {
                            for (var i = 0, k = k0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                                var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[k] : this.pts[k]);
                                var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[k + 1] : this.pts[k + 1]);

                                var cx = graphSe.ConvertXgToXpx(pca[i]);
                                var cy = graphSe.ConvertYgToYpx(pca[i + 1]);
                                var dpx = px - cx;
                                var dpy = py - cy;
                                //SWG-66 changes
                                if (!isNaN(dpx) || !isNaN(dpy)) {
                                    tst = tst && (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance);
                                }
                                //tst = tst && (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance);

                                k = k == 0 ? pca.length - 4 : k - 2;
                            }
                        }
                        if (this.spts.length > ca.spts.length) { tst = false; } //SWG-503 changes
                        if (!tst) {
                            if (removedVertices.pts != undefined && removedVertices.spts != undefined) {
                                var pts = removedVertices.pts.split(',');
                                var spts = removedVertices.spts.split(',');
                                var ptsArray = [];
                                var sptsArray = [];
                                for (var j = 0; j < pts.length; j++) {
                                    ptsArray.push(parseFloat(pts[j]));
                                    sptsArray.push(parseFloat(spts[j]));
                                }
                                this.pts = ptsArray;
                                this.spts = sptsArray;
                            }
                        }
                        //tst = !tst ? this.FindMatch( ) : tst;
                        break;
                    case '=':
                        var aa = ca.lbl.split("");
                        aa[0] = "A";
                        var lbl = aa.join("");
                        var aao = graphSe.FindInGraph(lbl);
                        for (var i = 0, ssq = 0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                            var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
                            var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);

                            tst = tst && aao.path.contains(new paper.Point(px, py));
                        }
                        break;

                    default:
                        tst = false;
                        break;
                }
            } else if (typ.length == 2) {
                var lfrt = typ[1];
                ca = this;
                var pca = graphSe.snapIt ? ca.spts : ca.pts;
                for (var i = 0, ln = pca.length - 2, cmn = cymn = 10000, cmx = cymx = 0, cp = []; i < ln; i += 2) {
                    var xpx = graphSe.ConvertXgToXpx(pca[i]);
                    if (xpx < cmn) cmn = xpx;
                    else if (xpx > cmx) cmx = xpx;
                    var ypx = graphSe.ConvertYgToYpx(pca[i + 1]);
                    if (ypx < cymn) cymn = ypx;
                    else if (ypx > cymx) cymx = ypx;
                    cp[i / 2] = { x: xpx, y: ypx };
                }

                rele = graphSe.FindInGraph(nn == undefined ? this.relementlabel : this.relementlabelinc[nn]);

                if (rele instanceof Polyline) {
                    if (rele == this) rele = correct;

                    for (var i = 0, ln = rele.pts.length - 2, xmn = 10000, xmx = 0; i < ln; i += 2) {
                        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[i] : rele.pts[i]);
                        if (xpx < xmn) xmn = xpx;
                        else if (xpx > xmx) xmx = xpx;
                    }

                    if (lfrt == "left" && cmx < xmn) tst = true;
                    else if (lfrt == "right" && cmn > xmx) tst = true;
                    else tst = false;
                } else if (rele instanceof Point) {
                    if (lfrt == "left" || lfrt == "right") {
                        var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxg : rele.xg);

                        if (lfrt == "left" && cmx < xpx) tst = true;
                        else if (lfrt == "right" && cmn > xpx) tst = true;
                        else tst = false;
                    }
                } else if (rele instanceof Line) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxsg : rele.xsg);
                    var xpxe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.sxeg : rele.xeg);

                    if (lfrt == "left" || lfrt == "right") {
                        var xmn = Math.min(xpx, xpxe);
                        var xmx = Math.max(xpx, xpxe);

                        if (lfrt == "left" && cmx < xmn) tst = true;
                        else if (lfrt == "right" && cmn > xmx) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        var relep;
                        if (rele == correct) {
                            relep = new paper.Path();
                            relep.add(new paper.Point(xpx, ypx));
                            relep.add(new paper.Point(xpxe, ypxe));
                        } else {
                            rele.PathMe();
                            relep = rele.path.clone();
                        }
                        relep.add(new paper.Point(0, graphSe.htPx));
                        relep.closed = true;

                        for (var i = 0, isInside = true, isOff = true, ln = cp.length; i < ln; i++) {
                            isInside = isInside && relep.contains(new paper.Point(cp[i].x, cp[i].y));
                            isOff = isOff && (relep.hitTest(new paper.Point(cp[i].x, cp[i].y)) == null)
                        }

                        if (lfrt == "inward" && isInside && isOff) tst = true;
                        else if (lfrt == "outward" && !isInside && isOff) tst = true;
                        else tst = false;
                    } else if (lfrt == "up" || lfrt == "down") {
                        var r = rele.SwapPoints();
                        var dys = cymn - graphSe.ConvertYgToYpx(r.ys);
                        var dye = cymx - graphSe.ConvertYgToYpx(r.ye);

                        var isUp = dys < 0 && dye < 0;
                        var isDwn = dys > 0 && dye > 0;
                        if (lfrt == "up" && isUp) tst = true;
                        else if (lfrt == "down" && isDwn) tst = true;
                        else tst = false;
                    }
                } else if (rele instanceof Curve) {
                    var xpx = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[0] : rele.pts[0]);
                    var xpm = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[2] : rele.pts[2]);
                    var xpe = graphSe.ConvertXgToXpx(graphSe.snapIt ? rele.spts[4] : rele.pts[4]);

                    var xmn = Math.min(xpx, xpm, xpe);
                    var xmx = Math.max(xpx, xpm, xpe);

                    if (lfrt == "left" || lfrt == "right") {
                        if (lfrt == "left" && cmx < xmn) tst = true;
                        else if (lfrt == "right" && cmn > xmx) tst = true;
                        else tst = false;
                    } else if (lfrt == "inward" || lfrt == "outward") {
                        var relep;
                        if (rele == this.correct[0]) {
                            relep = new paper.Path();
                            relep.add(new paper.Point(xpx, ypx));
                            relep.add(new paper.Point(xpm, ypm));
                            relep.add(new paper.Point(xpe, ype));
                        } else {
                            rele.PathMe();
                            relep = rele.path.clone();
                        }
                        relep.add(new paper.Point(0, graphSe.htPx));
                        relep.closed = true;

                        for (var i = 0, isInside = true, isOff = true, ln = cp.length; i < ln; i++) {
                            isInside = isInside && relep.contains(new paper.Point(cp[i].x, cp[i].y));
                            isOff = isOff && (relep.hitTest(new paper.Point(cp[i].x, cp[i].y)) == null)
                        }

                        if (lfrt == "inward" && isInside && isOff) tst = true;
                        else if (lfrt == "outward" && !isInside && isOff) tst = true;
                        else tst = false;
                    } else if (lfrt == "up" || lfrt == "down") {
                        var r = rele.SwapPoints();
                        var dys = cymn - graphSe.ConvertYgToYpx(r.ys);
                        var dye = cymx - graphSe.ConvertYgToYpx(r.ye);

                        var isUp = dys < 0 && dye < 0;
                        var isDwn = dys > 0 && dye > 0;
                        if (lfrt == "up" && isUp) tst = true;
                        else if (lfrt == "down" && isDwn) tst = true;
                        else tst = false;
                    }
                }
            }
        } else if (mode == "drawing" || mode == undefined) {
            for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
                var gi = graphMe[i];
                if (gi instanceof Polyline) {
                    var giCorrect = gi.mode == "correct";
                    var giIncorrect = gi.mode.indexOf("incorrect") != -1;

                    if ((giCorrect || giIncorrect) && gi.what == this.what) {
                        if (answer != undefined) correct = answer;
                        else if (giCorrect) correct = gi.correct[0];
                        else if (giIncorrect) {
                            nn = Number(gi.mode[9]);
                            correct = gi.incorrect[nn];
                        }

                        ca = correct;
                        for (var j = 0, tst = true, lnj = this.pts.length; j < lnj && tst; j += 2) {
                            for (var k = 0, tst = false, lnk = ca.pts.length; k < lnk && !tst; k += 2) {
                                var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[j] : this.pts[j]);
                                var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[j + 1] : this.pts[j + 1]);
                                var cx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[k] : ca.pts[k]);
                                var cy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[k + 1] : ca.pts[k + 1]);
                                var dpx = px - cx;
                                var dpy = py - cy;

                                tst = (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance);
                            }
                        }

                        //ca.match = tst;

                        if (tst) correct.match = { match: tst };
                    }
                }
            }
        }

        var correctgraph = tst;
        //SWG-64 changes
        if (!this._correctObj)
            this._correctObj = {};
        if (correctgraph) {
            this._correctObj.objCorrect = true;
        }
        //SWG-64 changes end
        if (this.mode != "student") var cc = this;
        //SWG-64 changes
        // else var cc = graphSe.FindInGraph(ca.lbl);
        else var cc = graphSe.FindInGraph(ca.uniqueLabel != undefined ? ca.uniqueLabel : ca.lbl);

        var requiredlabel = nn == undefined ? cc.requiredlabel : cc.requiredlabelinc[nn];
        if (requiredlabel) {
            var correctlabel = nn == undefined ? cc.correctlabel : (cc.correctlabelinc[nn] == "b" ? "None" : cc.correctlabelinc[nn]);;
            labelcorrect = correctlabel == (this.studentcorrectlabel == "a" ? "None" : this.studentcorrectlabel);
            //SWG-64 changes
            if ((this.studentcorrectlabel == undefined || this.studentcorrectlabel == "a") && correctgraph && !labelcorrect) {
                this._correctObj.isLabelMissed = true;
            }
            //SWG-64 changes end
        }

        var allCorrect = correctgraph && labelcorrect;

        if (answer == undefined && correct != undefined) correct.match = allCorrect;

        return allCorrect;
    }

    this.FindMatch = function () {
        var correct;
        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Polyline) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;

                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    for (var i = 0, ssq = 0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                        var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
                        var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);
                        var cx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[i] : ca.pts[i]);
                        var cy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[i + 1] : ca.pts[i + 1]);
                        var dpx = px - cx;
                        var dpy = py - cy;

                        tst = tst && (Math.sqrt(dpx * dpx + dpy * dpy) < this.correctTolerance);
                    }
                }
            }
        }

        return tst;
    }

    this.FindMatchObject = function () {
        var correct;
        var finalobject = null;

        for (var i = 0, tst = false, ln = graphMe.length; i < ln && !tst; i++) {
            var gi = graphMe[i];
            if (gi instanceof Polyline) {
                var giCorrect = gi.mode == "correct";
                var giIncorrect = gi.mode.indexOf("incorrect") != -1;

                if ((giCorrect || giIncorrect) && gi.what == this.what) {
                    if (giCorrect) correct = gi.correct[0];
                    else if (giIncorrect) {
                        nn = Number(gi.mode[9]);
                        correct = gi.incorrect[nn];
                    }

                    var ca = correct;
                    for (var i = 0, ssq = 0, tst = true, ln = this.pts.length; i < ln; i += 2) {
                        var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? this.spts[i] : this.pts[i]);
                        var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? this.spts[i + 1] : this.pts[i + 1]);
                        var cx = graphSe.ConvertXgToXpx(graphSe.snapIt ? ca.spts[i] : ca.pts[i]);
                        var cy = graphSe.ConvertYgToYpx(graphSe.snapIt ? ca.spts[i + 1] : ca.pts[i + 1]);
                        var dpx = px - cx;
                        var dpy = py - cy;

                        if (tst) finalobject = gi;
                    }
                }
            }
        }

        return finalobject;
    }

    this.UpdateIncorrects = function () {
        for (var i = 1; i < 4; i++) {
            if (this.incorrect[i] != null) {
                if (this.incorrect[i].type[0] == "relative") this.IncorrectMe(undefined, i, this.incorrect[i].type);
            }
        }
    }

    this.CheckIsIncorrect = function (mode) {
        var ninc = this.incorrect.length;

        for (var j = 0; j < graphMe.length; j++) {
            gj = graphMe[j];
            for (var i = 1, cc = 0; i < ninc; i++) {
                if (gj.incorrect[i] != null) {
                    if (this.CheckIsCorrect(mode, gj.incorrect[i])) {
                        gj.incorrect[i].match = true;
                        cc++
                    } else gj.incorrect[i].match = false;
                }
            }
        }

        if (cc == 0) this.incorrect[0] = { match: true };
    }

    this.GhostMe = function () {
        this.SnapMe();
        this.ghost = { clr: "lightgray", wd: this.width, pts: [], spts: [] };
        for (var i = 0, ln = this.pts.length; i < ln; i++) {
            this.ghost.pts[i] = this.pts[i];
            this.ghost.spts[i] = this.spts[i];
        }
    }

    this.PlumbMe = function (tf) {
        this.plumbLine = tf;
    }

    this.PlumbLine = function () {
        this.PathMe();
        var ln = graphMe.length;
        for (var j = 0; j < ln; j++) {
            var gj = graphMe[j];
            if (gj == this) continue;

            gj.PathMe();
            var gii = this.path.getIntersections(gj.path);
            var giiln = gii.length;
            if ((gj instanceof Point) && giiln > 0) {
                var px = graphSe.ConvertXgToXpx(graphSe.snapIt ? gj.sxg : gj.xg);
                var py = graphSe.ConvertYgToYpx(graphSe.snapIt ? gj.syg : gj.yg);

                var clr = 'lightblue';
                DrawLine(clr, this.width, px, py, 0, py, [4, 4]);
                DrawLine(clr, this.width, px, py, px, can.height - 3, [4, 4]);

                ctx2.fillStyle = "grey";
                ctx2.fillText(Math.round(graphSe.ConvertYpxToYg(py) * 10) / 10, 55, py + 10);

                ctx2.fillStyle = "grey";
                ctx2.fillText(Math.round(graphSe.ConvertXpxToXg(px) * 10) / 10, px + 54, 395);
            } else if (!gj.acceptedArea) {
                for (var k = 0; k < giiln; k++) {
                    var clr = 'grey';
                    var giik = gii[k];
                    DrawLine(clr, this.width, giik.point.x, giik.point.y, 0, giik.point.y, [4, 4]);
                    DrawLine(clr, this.width, giik.point.x, giik.point.y, giik.point.x, can.height - 3, [4, 4]);

                    var text = new paper.PointText(new paper.Point(15, giik.point.y - 10));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertYpxToYg(giik.point.y) * 10) / 10;

                    var text = new paper.PointText(new paper.Point(giik.point.x + 14, 375));
                    text.justification = 'center';
                    text.fillColor = "black"; //SWG-506 changes
                    text.fontSize = 10
                    text.content = Math.round(graphSe.ConvertXpxToXg(giik.point.x) * 10) / 10
                }
            }
        }
    }

    this.LabelMe = function (tf) {
        this.labelLine = tf;
    }

    this.labelangle;
    this.labelradius;

    this.LabelLine = function () {
        pt = graphSe.snapIt ? { x: this.spts[0], y: this.spts[1] } : { x: this.pts[0], y: this.pts[1] };

        var xoffset = -10;
        var yoffset = -10;

        pt.x = graphSe.ConvertXgToXpx(pt.x) //+xoffset;
        pt.y = graphSe.ConvertYgToYpx(pt.y) //+yoffset;
        var newx = pt.x + this.labelradius * Math.cos(this.labelangle); //+ d * (pt.x - spt.x) / mag
        var newy = pt.y + this.labelradius * Math.sin(this.labelangle); //+ d * (pt.y - spt.y) / mag

        var clr = this.iscurrent == true ? this.cc : this.ccus;

        //console.log(clr);
        /*ctx.fillStyle = 'red';
        ctx.font="14px sans-serif";
        ctx.fillText(this.label,pt.x,pt.y);
        ctx.font="10px sans-serif";*/

        if (this.labelangle == undefined && this.labelradius == undefined) {
            var newx = pt.x + xoffset;
            var newy = pt.y + yoffset;

            this.labelangle = Math.atan2(newy - pt.y, newx - pt.x)
            this.labelradius = Math.sqrt((pt.x - newx) * (pt.x - newx) + (pt.y - newy) * (pt.y - newy));

        } else {
            var newx = pt.x + this.labelradius * Math.cos(this.labelangle); //+ d * (pt.x - spt.x) / mag
            var newy = pt.y + this.labelradius * Math.sin(this.labelangle); //+ d * (pt.y - spt.y) / mag

        }

        var templabel;
        if (graphSe.mode == "correct" && this.dragstart != undefined) {
            templabel = this.labelam != '' ? this.labelam : this.labeledit;
        } else if (graphSe.boo && this.ghost && this.mode != "correct" && this.mode != "student" && this.evalshift != null && this.precise == false) {
            templabel = this.labelam;
        } else {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "designer") {
            templabel = this.labeledit;
        }

        if (graphSe.mode == "student" && this.studentdrag != null) {
            templabel = this.labelam != '' ? this.labelam : this.labeledit;
        }
        //SWG-87
        if (graphMe.length > 0 && graphSe.mode != 'designer' && this.tempLableLine && !this.labelLine && this.elementlabel != 'None') {
            templabel = graphSe.mode == "student" ? "" : this.elementlabel;
        }
        if (graphSe.mode == 'designer' && this.tempLableLine && !this.labelLine) {
            templabel = '';
        }
        //SWG-275
        if (graphSe.mode == "student" && (this.studentcorrectlabel != null && this.studentcorrectlabel != "a" && this.studentcorrectlabel != "")) {
            templabel = "";
        }
        //end SWG-87
        ////SWG-140 Changes
        var ObjAreaLblPosition = this.LabelPosition(newx, newy);
        var text = new paper.PointText(new paper.Point(ObjAreaLblPosition.x, ObjAreaLblPosition.y));
        text.justification = ObjAreaLblPosition.alignment;
        ////SWG-140 Changes
        text.fillColor = clr;
        text.content = templabel;

    }

    ////SWG - 140 Changes Start
    this.LabelPosition = function (newxVal, newyVal) {

        // var xIncVal, yIncVal;
        // if (document.getElementById('xinc') != undefined) xIncVal = document.getElementById('xinc').value;
        // if (document.getElementById('yinc') != undefined) yIncVal = document.getElementById('yinc').value;

        // var xMin = $('#xmin').val();
        // var yMin = $('#ymin').val();
        // var xMax = $('#xmax').val();
        // var yMax = $('#ymax').val();

        // var xAxisMinVal = 2 * parseFloat(xIncVal) + parseFloat(xMin);
        // var xAxisMaxVal = 12 * parseFloat(xIncVal) + parseFloat(xMin);
        // var yAxisMinVal = 2 * parseFloat(yIncVal) + parseFloat(yMin);
        // var yAxisMaxVal = 12 * parseFloat(yIncVal) + parseFloat(yMin);

        // var endPt = graphSe.snapIt ? { x: this.spts[0], y: this.spts[1] } : { x: this.pts[0], y: this.pts[1] };

        var ObjLabelStyle = { x: 0, y: 0, alignment: '' };

        //    var xMultipy = graphSe.ConvertXpxToXg(newxVal) < 0 ? -1 : 1
        //    var yMultipy = graphSe.ConvertYpxToYg(newyVal) < 0 ? -1 : 1

        switch (true) {
            //    case endPt.y == yMin && endPt.x >= xAxisMinVal && endPt.x < xAxisMaxVal:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'center';
            //        break;
            //    case endPt.y == yMin && endPt.x >= xAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y == yMin && endPt.x < xAxisMinVal && endPt.x != xMin:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y == yMin:
            //        ObjLabelStyle.x = newxVal + 24;
            //        ObjLabelStyle.y = newyVal + (24 * yMultipy);
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y >= yAxisMinVal && endPt.y < yAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - (24 * xMultipy);
            //        ObjLabelStyle.y = newyVal + 10;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x == xMin && endPt.y >= yAxisMaxVal:
            //        ObjLabelStyle.x = newxVal - (24 * xMultipy);
            //        ObjLabelStyle.y = newyVal + 30;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x >= xAxisMaxVal && endPt.y <= yAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //    case endPt.y >= yMax && endPt.x > xAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal + 30;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            //   case endPt.y >= yMax && endPt.x >= xAxisMinVal:
            //        ObjLabelStyle.x = newxVal;
            //        ObjLabelStyle.y = newyVal + 36;
            //        ObjLabelStyle.alignment = 'left';
            //        break;
            //    case endPt.x >= xMax && endPt.y > yAxisMinVal:
            //        ObjLabelStyle.x = newxVal - 24;
            //        ObjLabelStyle.y = newyVal;
            //        ObjLabelStyle.alignment = 'right';
            //        break;
            default: ObjLabelStyle.x = newxVal;
                ObjLabelStyle.y = newyVal;
                ObjLabelStyle.alignment = 'center';
                break;
        }
        return ObjLabelStyle;

    }
    ////SWG - 140 Changes End

    this.checkBoxes = function () {
        var cbtemp;
        var cltemp;

        if (graphSe.mode == 'correct') {
            cbtemp = this.checkboxes;
        } else if (graphSe.mode == 'incorrect1') {
            cbtemp = this.checkboxesinc1;
        } else if (graphSe.mode == 'incorrect2') {
            cbtemp = this.checkboxesinc2;
        } else if (graphSe.mode == 'incorrect3') {
            cbtemp = this.checkboxesinc3;
        } else {
            cbtemp = this.checkboxes;
        }

        if (document.getElementById('consumersurplus').checked) { cbtemp[0] = true } else { cbtemp = false };
        if (document.getElementById('deadweightloss').checked) { cbtemp[1] = true } else { cbtemp[1] = false };
        if (document.getElementById('loss').checked) { cbtemp[2] = true } else { cbtemp[2] = false };
        if (document.getElementById('producersurplus').checked) { cbtemp[3] = true } else { this.cbtemp[3] = false };
        if (document.getElementById('revenueprofit').checked) { cbtemp[4] = true } else { cbtemp[4] = false };

        if (graphSe.mode == 'correct') {
            cltemp = this.customlabels;
        } else if (graphSe.mode == 'incorrect1') {
            cltemp = this.customlabelsinc1;
        } else if (graphSe.mode == 'incorrect2') {
            cltemp = this.customlabelsinc2;
        } else if (graphSe.mode == 'incorrect3') {
            cltemp = this.customlabelsinc3;
        } else {
            cltemp = this.customlabels;
        }

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str).checked) { cbtemp[4 + i + 1] = true } else { cbtemp[4 + i + 1] = false };

            //html += '<input type="checkbox" id="'+str+'" checked> '+this.customlabels[i]+'<br>'
            //this.checkboxes[i+9] = false;
        }


        this.CorrectLabelDropdown();

        //this.SetSettings();

    }

    this.checkBoxHTML = function () {
        var cbtemp;
        var cltemp;

        var html = '';

        if (graphSe.mode == 'correct') {
            cbtemp = this.checkboxes;
        } else if (graphSe.mode == 'incorrect1') {
            cbtemp = this.checkboxesinc1;
        } else if (graphSe.mode == 'incorrect2') {
            cbtemp = this.checkboxesinc2;
        } else if (graphSe.mode == 'incorrect3') {
            cbtemp = this.checkboxesinc3;
        } else {
            cbtemp = this.checkboxes;
        }

        if (graphSe.mode == 'correct') {
            cltemp = this.customlabels;
        } else if (graphSe.mode == 'incorrect1') {
            cltemp = this.customlabelsinc1;
        } else if (graphSe.mode == 'incorrect2') {
            cltemp = this.customlabelsinc2;
        } else if (graphSe.mode == 'incorrect3') {
            cltemp = this.customlabelsinc3;
        } else {
            cltemp = this.customlabels;
        }

        if (cbtemp[0]) {
            html += '<input type="checkbox" id="consumersurplus" checked> Consumer Surplus<br>'
        } else {
            html += '<input type="checkbox" id="consumersurplus"> Consumer Surplus<br>'
        }

        if (cbtemp[1]) {
            html += '<input type="checkbox" id="deadweightloss" checked> Deadweight Loss<br>'
        } else {
            html += '<input type="checkbox" id="deadweightloss"> Deadweight Loss<br>'
        }

        if (cbtemp[2]) {
            html += '<input type="checkbox" id="loss" checked> Loss<br>'
        } else {
            html += '<input type="checkbox" id="loss"> Loss<br>'
        }

        if (cbtemp[3]) {
            html += '<input type="checkbox" id="producersurplus" checked> Producer Surplus<br>'
        } else {
            html += '<input type="checkbox" id="producersurplus"> Producer Surplus<br>'
        }

        if (cbtemp[4]) {
            html += '<input type="checkbox" id="revenueprofit" checked> Revenue/Profit<br>'
        } else {
            html += '<input type="checkbox" id="revenueprofit"> Revenue/Profit<br>'
        }


        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            html += '<input type="checkbox" id="' + str + '" checked> ' + cltemp[i].split("xexse")[0] + '<br>'
            //this.checkboxes[i+9] = false;
        }

        if (graphSe.mode == 'correct') {
            this.checkboxhtml = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtml;
        } else if (graphSe.mode == 'incorrect1') {
            this.checkboxhtmlinc[1] = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            this.checkboxhtmlinc[2] = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            this.checkboxhtmlinc[3] = html;
            //document.getElementById('checkform').innerHTML = this.checkboxhtmlinc[3];
        } else {
            this.checkboxhtml = html;
        }

        //document.getElementById('checkform').innerHTML = this.checkboxhtml;
    }

    this.addLabel = function () {
        if (graphSe.mode == 'correct') {
            var cltemp = this.customlabels;
        } else if (graphSe.mode == 'incorrect1') {
            var cltemp = this.customlabelsinc1;
        } else if (graphSe.mode == 'incorrect2') {
            var cltemp = this.customlabelsinc2;
        } else if (graphSe.mode == 'incorrect3') {
            var cltemp = this.customlabelsinc3;
        }

        if (document.getElementById('newlabel').value == "") {
            tempol = "Custom Label"
        } else {
            tempol = document.getElementById('newlabel').value;
        }

        cltemp.push(tempol);

        //cltemp.push(tempol)

        var str = tempol;
        var lwr = str.toLowerCase();
        str = lwr.replace(/\s+/g, '');

        this.checkBoxHTML();

        if (graphSe.mode == 'correct') {
            var temphtml = this.checkboxhtml;
            var lotemp = this.clabeloffset;
        } else if (graphSe.mode == 'incorrect1') {
            var temphtml = this.checkboxhtmlinc[1];
            var lotemp = this.clabeloffsetinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var temphtml = this.checkboxhtmlinc[2];
            var lotemp = this.clabeloffsetinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var temphtml = this.checkboxhtmlinc[3];
            var lotemp = this.clabeloffsetinc[3];
        }

        document.getElementById('checkform').innerHTML = temphtml;

        this.CorrectLabelDropdown();

        var fstr = document.getElementById("cltext2").style.paddingTop;
        var fstr2 = fstr.split("px");
        fstr = fstr2[0];
        fstr = Number(fstr) + 20;
        document.getElementById("cltext2").style.paddingTop = fstr + "px";
        this.clabeloffset = fstr + "px";

        if (graphSe.mode == 'correct') {
            this.clabeloffset = fstr + "px";
        } else if (graphSe.mode == 'incorrect1') {
            this.clabeloffsetinc[1] = fstr + "px";
        } else if (graphSe.mode == 'incorrect2') {
            this.clabeloffsetinc[2] = fstr + "px";
        } else if (graphSe.mode == 'incorrect3') {
            this.clabeloffsetinc[3] = fstr + "px";
        }

        this.checkBoxes();

    }

    this.CorrectLabelDropdown = function () {

        if (graphSe.mode == 'correct') {
            var cltemp = this.customlabels;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var cltemp = this.customlabels;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var cltemp = this.customlabels;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var cltemp = this.customlabels;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
            var tmpincclabel = this.correctlabelinc[3];
        } else {
            var cltemp = this.customlabels;
            var clselectstemp = this.clselects;
            var tmpclabel = this.correctlabel;
        }

        var html = '<option value="None">None</option>'

        if (document.getElementById('consumersurplus').checked) { html += '<option value="Consumer Surplus">Consumer Surplus</option>' } else { };
        if (document.getElementById('deadweightloss').checked) { html += '<option value="Deadweight Loss">Deadweight Loss</option>' } else { };
        if (document.getElementById('loss').checked) { html += '<option value="Loss">Loss</option>' } else { };
        if (document.getElementById('producersurplus').checked) { html += '<option value="Producer Surplus">Producer Surplus</option>' } else { };
        if (document.getElementById('revenueprofit').checked) { html += '<option value="Revenue/Profit">Revenue/Profit</option>' } else { };

        for (var i = 0; i < cltemp.length; i++) {
            var str = cltemp[i];
            var lwr = str.toLowerCase();
            str = lwr.replace(/\s+/g, '');

            if (document.getElementById(str)) {
                if (document.getElementById(str).checked) { html += '<option value="' + cltemp[i] + '">' + cltemp[i].split("xexse")[0] + '</option>' } else { }
            }
            //this.checkboxes[i+9] = false;
        }

        if (graphSe.mode == 'correct') {
            this.clselects = html;
        } else if (graphSe.mode == 'incorrect1') {
            this.clselects = html;
        } else if (graphSe.mode == 'incorrect2') {
            this.clselects = html;
        } else if (graphSe.mode == 'incorrect3') {
            this.clselects = html;
        }


        clselectstemp = html;

        document.getElementById("cldropdown").innerHTML = clselectstemp;
        document.getElementById('cldropdown').value = tmpclabel;
        document.getElementById('inccldropdown').value = tmpincclabel;


    }

    this.returnStep = function (id) {
        if (id == "x") return graphSe.snapIt ? graphSe.xmax / 32 : graphSe.xmax / Number(graphSe.wdPx);
        if (id == "y") return graphSe.snapIt ? graphSe.ymax / 32 : graphSe.ymax / Number(graphSe.htPx);
    }
    //For polygon
    this.SetSettings = function () {
        //this.CalculateSlope();
        //this.LineUpdate();

        if (this.acceptedArea) return;

        this.TrackAgainstDropdown();
        this.RelativeDropdown();
        this.checkBoxHTML();

        $('#bottomtools').removeClass("hide");

        var html = '<div class="sectionhead"><span id="elementhead">Element Settings </span><button id="bgleft" class="glyphicon glyphicon-left" aria-hidden="true" style="margin-left: 30px; background: none; border: none;" onclick="leftArrow();"></button><span id="toplabel' + this.labelvalueedit + '" class="elementid">' + this.labeledit + '</span><button id="bgright"  class="glyphicon glyphicon-right" aria-hidden="true" onclick="rightArrow();" style="background: none; border: none;"></span></div>'
        html += '<div class="hrm"></div>'
        html += '<div class="row" style="margin-left: 20px;">'
        html += '<div class="col-xs-6">'
        html += '<div id="designertools">'
        html += '<div class="tool">Element Type</div>'
        html += '<div class="tool"></div>'
        html += '<div class="tool">Label</div>'
        html += '<div class="tool">Show Label</div>'
        html += '<div class="tool">Point 1</div>'
        html += '<div id="alabels"></div>'
        html += '<div class="tool">Show Plumbs</div>'
        html += '</div>'
        html += '</div>'
        html += '<div class="col-xs-6" style="padding-top: 8px;">'
        html += '<div id="designerinputs">'
        html += '<div class="styled-select"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Consumer Surplus">Consumer Surplus</option><option value="Deadweight Loss">Deadweight Loss</option><option value="Loss">Loss</option><option value="Producer Surplus">Producer Surplus</option><option value="Revenue/Profit">Revenue/Profit</option></select></div>'
        html += '<button id="bcbutton" aria-hidden="true" onclick="bookColor();">Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span></button>'
        html += '<div><input id="xlabel' + this.labelvalueedit + '" type="text" class="small-label" placeholder="' + this.labeledit + '" onkeyup="labelUpdate(this.value)" maxlength="5"></div>'
        html += '<div><label class="switch tool" style="margin-left: 0px;left:-60px"><input id="labeltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label><button id="movelabelbutton" class="btn btn-econ-sw5" onclick="moveLabelC()" onmousedown="moveLabel()" onmouseup="moveLabelClear()" onmouseout="moveLabelClear()"><span class="glyphicon glyphicon-labelright" aria-hidden="true"></span></button><button id="movelabelbutton2" class="btn btn-econ-sw5" onclick="moveLabelRIC()" onmousedown="moveLabelRadiusIn()" onmouseup="moveLabelRIClear()" onmouseout="moveLabelRIClear()"><span class="glyphicon glyphicon-labelin" aria-hidden="true"></span></button><button id="movelabelbutton3" class="btn btn-econ-sw5" onclick="moveLabelROC()" onmousedown="moveLabelRadiusOut()" onmouseup="moveLabelROClear()" onmouseout="moveLabelROClear()"><span class="glyphicon glyphicon-labelout" aria-hidden="true"></span></button><button id="movelabelbutton4" class="btn btn-econ-sw5" onclick="moveLabelOtherC()" onmousedown="moveLabelOther()" onmouseup="moveLabelClearOther()" onmouseout="moveLabelClearOther()"><span class="glyphicon glyphicon-labelleft" aria-hidden="true"></span></button> </div>'
        html += '<div>(<input id="cxpoint0" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("x") + '"  oninput="apUpdateNoFix(this.value, 0)">,<input id="cypoint0" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("y") + '" oninput="apUpdateNoFix(this.value, 1)" >)</div>'
        html += '<div id="apoints"></div>'
        html += '<div><label class="switch tool"><input id="plumbtoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html += '</div>'
        html += '</div>'
        html += '</div>'

        $('#interactive').removeClass("hide");

        var html2 = '<div id="sectionpadding" class="sectionhead"></div>'
        html2 += '<div class="row" style="margin-left: 20px;">'
        html2 += '<div id="intleft" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="binteractive" onclick="Interactive(true);"> <div class="radio-off"><div id="binteractivero" class="radio-on hide"></div></div>Interactive</button><br>'
        html2 += '<div id="ilabels" class="hide"><div class="tool">Label after move</div>'
        html2 += '<div class="tool">Track against</div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="intright" class="col-xs-6">'
        html2 += '<button class="fake-radio" id="bstatic" onclick="Interactive(false);"> <div class="radio-off"><div id="bstaticro" class="radio-on"></div></div>Static<br></button>'
        html2 += '<div id="iinputs" class="hide"><div><input id="labelam" type="text" value="' + this.labelam + '" oninput="labelAMUpdate(this.value)" style="margin-top: 10px; width: 75px"></div>'
        html2 += '<div class="styled-select"><select id="tadropdown" class="select-class" onchange="TAElement(this.value)" value="' + this.taelement + '" style="margin-top:10px">' + this.taselects + '</select></div>'
        html2 += '</div>'
        html2 += '</div>'
        html2 += '<div id="elabel" class="row hide">'
        html2 += '<div class="col-xs-6">'
        html2 += '<div class="tool"><strong>Evaluated on</strong></div>'
        html2 += '</div>'
        html2 += '<div class="col-xs-6">'
        html2 += '<div id="elabelmode" class="" style="margin-top: 11px;">Interaction</div>'
        html2 += '</div>'
        html2 += '</div>'

        var html3 = '<div class="row" style="margin-left: 20px;">'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="bprecise" onclick="Precise(true);"> <div class="radio-off"><div id="bprecisero" class="radio-on hide"></div></div>Precise</button><br>'
        html3 += '<div id="precisetools" class="hide">'
        html3 += '<div class="tool">Point 1</div>'
        html3 += '<div id="alabelsc"></div>'
        html3 += '</div>'
        html3 += '<div id="relativetools" class="hide">'
        html3 += '<div class="tool">Relative to:</div>'
        html3 += '<div id="relativetools2" class="hide">'
        html3 += '<div class="tool">Shift from origin</div>'
        html3 += '</div>'
        html3 += '<div id="drawarea" class="hide" style="width: 200px; margin-top: 10px; margin-left: 10px; position:relative; top: 10px;"><button type="button" class="btn btn-econ-sw5" onclick="DoAcceptedArea(gmloc-1)"><span class="glyphicon glyphicon-pentagon" aria-hidden="true"></span><img id="areashade" src="./images/areashade.png"></img></button><span style="padding-left: 5px;">Draw Accepted Area</span></div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '<div class="col-xs-6">'
        html3 += '<button class="fake-radio" id="brelative" onclick="Precise(false);"> <div class="radio-off"><div id="brelativero" class="radio-on"></div></div>Relative<br></button>'
        html3 += '<div id="preciseinputs" class="hide" style="position:relative; top: 10px">'
        html3 += '<div>(<input id="cxpoint0c" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("x") + '"  oninput="apUpdateNoFix(this.value, 0)">,<input id="cypoint0c" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("y") + '" oninput="apUpdateNoFix(this.value, 1)" >)</div>'
        html3 += '<div id="apointsc"></div>'
        html3 += '</div>'
        html3 += '<div id="relativeinputs" class="hide">'
        html3 += '<div class="styled-select" style="margin-top:9px"><select id="reldropdown" class="select-class" onchange="GetRelativeElement(this.value)"></span>' + this.relselects + '</select></div>'
        html3 += '<div id="relativeinputs2" class="hide">'
        html3 += '<button class="fake-radio" id="sleft" onclick="ShiftLeft();" style="margin-top:13px;"> <div class="radio-off"><div id="sleftro" class="radio-on hide"></div></div><span id="lefttext">Left</span></button><br>'
        html3 += '<button class="fake-radio" id="sright" onclick="ShiftRight();" style="margin-top:0px;"> <div class="radio-off"><div id="srightro" class="radio-on hide"></div></div><span id="righttext">Right</span></button><br>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'
        html3 += '</div>'

        if (graphSe.mode == 'correct') {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect1') {
            var tempcbh = this.checkboxhtmlinc[1];
            var tempclo = this.clabeloffset[1];
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect2') {
            var tempcbh = this.checkboxhtmlinc[2];
            var tempclo = this.clabeloffset[2];
            var clselectstemp = this.clselects;
        } else if (graphSe.mode == 'incorrect3') {
            var tempcbh = this.checkboxhtmlinc[3];
            var tempclo = this.clabeloffset[3];
            var clselectstemp = this.clselects;
        } else {
            var tempcbh = this.checkboxhtml;
            var tempclo = this.clabeloffset;
            var clselectstemp = this.clselects;
        }

        var html4 = '<div class="row" style="margin-left: 20px;">'
        html4 += '<div class="col-xs-6">'
        html4 += '<div class="tool" style="margin-top: 0px;">Required label</div>'
        html4 += '<div id="requiredlabeltools" class="hide">'
        html4 += '<div class="tool">Label Choices</div>'
        html4 += '<div id="cltext2" class="tool" style="padding-top: ' + tempclo + '">Correct Label</div>'
        html4 += '<div id="inccl1" class="tool" style="">Incorrect Label</div>'
        html4 += '</div>'
        html4 += '</div>'
        html4 += '<div class="col-xs-6">'
        html4 += '<div id="rtoggleshell" style="margin-top:10px;"><label class="switch tool"><input id="rltoggle" type="checkbox" onclick="update();"><div class="slider"><span class="ontext">ON</span><span class="offtext">OFF</span></div></label></div>'
        html4 += '<div id="requiredlabelinputs" class="hide">'
        html4 += '<form id="checkform" onclick="checkBoxes();">' + tempcbh + '</form>'
        html4 += '<div><input id="newlabel" type="text" class="" placeholder="Custom label" onkeyup="" style="width: 100px; margin-top: 10px;"><button id="addbutton" class="btn-nothing" onclick="addLabel()"> <span class="glyphicon glyphicon-cplus"></span></button></div>'
        html4 += '<div class="styled-select" style="margin-top: 10px"><select id="cldropdown" class="select-class" onchange="GetCorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '<div id="inccl2" class="styled-select" style="margin-top: 10px"><select id="inccldropdown" class="select-class" onchange="GetIncorrectLabel(this.value)">' + clselectstemp + '</select></div>'
        html4 += '</div>'
        html4 += '</div>'

        var html5 = '<div class="row" style="margin-left: 20px;">'
        html5 += '<div class="col-xs-6">'
        html5 += '<div class="tool">Element Type</div>'
        html5 += '<div class="tool">Point 1</div>'
        html5 += '<div id="alabels2"></div>'
        html5 += '</div>'
        html5 += '<div class="col-xs-6" style="padding-top: 8px;">'
        html5 += '<div class="styled-select" style="margin-bottom: 10px;"><select id="eldropdown" class="select-class" onchange="GetElement(this.value)"></span><option value="None">None</option><option value="Consumer Surplus">Consumer Surplus</option><option value="Deadweight Loss">Deadweight Loss</option><option value="Loss">Loss</option><option value="Producer Surplus">Producer Surplus</option><option value="Revenue/Profit">Revenue/Profit</option></select></div>'
        html5 += '<div>(<input id="cxpointtwo0" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("x") + '"  oninput="apUpdateNoFix(this.value, 0)">,<input id="cypointtwo0" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("y") + '" oninput="apUpdateNoFix(this.value, 1)" >)</div>'
        html5 += '<div id="apoints2"></div>'
        html5 += '</div>'
        html5 += '</div>'

        document.getElementById("bottomtools").innerHTML = html;
        document.getElementById("interactive").innerHTML = html2;
        document.getElementById("interactivetools").innerHTML = html3;
        document.getElementById("labeldetails").innerHTML = html4;
        document.getElementById("drawingtools").innerHTML = html5;

        document.getElementById('eldropdown').value = this.elementlabel;
        document.getElementById('plumbtoggle').checked = this.plumbLine;
        document.getElementById('cldropdown').value = this.correctlabel;

        document.getElementById('tadropdown').value = this.taelement;

        if (graphSe.mode == 'correct') {
            var rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            var rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            var rlltemp = this.relementlabelinc[3];
        }

        document.getElementById('reldropdown').value = rlltemp;

        if (graphSe.mode == 'correct') {
            var temprl = this.requiredlabel;
        } else if (graphSe.mode == 'incorrect1') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[1] != undefined) ? this.requiredlabelinc[1] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect2') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[2] != undefined) ? this.requiredlabelinc[3] : this.requiredlabel; //SWG-64 changes
        } else if (graphSe.mode == 'incorrect3') {
            var temprl = (this.requiredlabelinc.length > 0 && this.requiredlabelinc[3] != undefined) ? this.requiredlabelinc[3] : this.requiredlabel; //SWG-64 changes
        }

        document.getElementById('rltoggle').checked = temprl;

        this.checkBoxes();

        this.InteractiveMe(this.interactive);

        if (graphSe.mode == 'correct') {
            this.PreciseMe(this.precise);
            if (!this.precise) {
                this.EvalShift(this.evalshift);
            }
        } else if (graphSe.mode == 'incorrect1') {
            this.PreciseMe(this.preciseinc[1]);
            if (!this.preciseinc[1]) {
                this.EvalShift(this.evalshiftinc[1]);
            }
        } else if (graphSe.mode == 'incorrect2') {
            this.PreciseMe(this.preciseinc[2]);
            if (!this.preciseinc[2]) {
                this.EvalShift(this.evalshiftinc[2]);
            }
        } else if (graphSe.mode == 'incorrect3') {
            this.PreciseMe(this.preciseinc[3]);
            if (!this.preciseinc[3]) {
                this.EvalShift(this.evalshiftinc[3]);
            }
        }

        this.DisplayBookColor();

        this.Highlight();

        this.InteractiveReset();

        this.CheckRLabel();

        this.CorrectTools();

        $('#emptydesigner').addClass("hide");

        if (graphSe.mode.indexOf("correct") != -1) this.SetCorrectPoints();

        if (this.labelLine == true) {
            document.getElementById("labeltoggle").checked = true;
        } else {
            document.getElementById("labeltoggle").checked = false;
        }

        document.getElementById('alabels').innerHTML = this.ahtml;
        document.getElementById('apoints').innerHTML = this.phtml;
        document.getElementById('alabels2').innerHTML = this.ahtmltwo;
        document.getElementById('apoints2').innerHTML = this.phtmltwo;

        this.SetElementPoints();

        if (graphMe.length < 2) {
            document.getElementById("bgleft").style.opacity = "0";
            document.getElementById("bgright").style.opacity = "0";
        } else {
            document.getElementById("bgleft").style.opacity = "1";
            document.getElementById("bgright").style.opacity = "1";
        }

        if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
            document.getElementById("cldropdown").disabled = true;
            document.getElementById("newlabel").disabled = true;
            document.getElementById("addbutton").disabled = true;
            $('#inccl1').removeClass("hide");
            $('#inccl2').removeClass("hide");
        } else {
            document.getElementById("cldropdown").disabled = false;
            document.getElementById("newlabel").disabled = false;
            document.getElementById("addbutton").disabled = false;
            $('#inccl1').addClass("hide");
            $('#inccl2').addClass("hide");
        }

        if (this.interactive && graphSe.mode != "designer") { //SWG-452 changes
            $("#labeldetails").removeClass("hide");
        } else {
            $("#labeldetails").addClass("hide");
        }

    }

    this.SetElementPoints = function () {
        if (this.acceptedArea) return;


        document.getElementById('cxpoint0').value = graphSe.snapIt ? this.spts[0] : this.pts[0];
        document.getElementById('cypoint0').value = graphSe.snapIt ? this.spts[1] : this.pts[1];
        document.getElementById('cxpointtwo0').value = graphSe.snapIt ? this.spts[0] : this.pts[0];
        document.getElementById('cypointtwo0').value = graphSe.snapIt ? this.spts[1] : this.pts[1];

        if (this.pts.length >= 3 && this.closed == false) {
            var div = document.createElement("div");
            div.id = 'dlabel' + this.pts.length / 2;
            this.ahtml += '<div id="alabel' + (this.areapoints + 1) + '" class="tool">Point ' + this.pts.length / 2 + '</div>'
            this.ahtmltwo += '<div id="alabeltwo' + (this.areapoints + 1) + '" class="tool">Point ' + this.pts.length / 2 + '</div>'
            document.getElementById('alabels').innerHTML = this.ahtml;
            document.getElementById('alabels2').innerHTML = this.ahtmltwo;

            var div = document.createElement("div");
            div.id = 'dpoints2';
            this.phtml += '<div id="ptlabel' + (this.areapoints + 1) + '">(<input id="cxpoint' + this.pts.length / 2 + '" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("x") + '"  oninput="apUpdate(this.value, ' + ((this.areapoints * 2) - 2) + ')">,<input id="cypoint' + this.pts.length / 2 + '" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("y") + '" oninput="apUpdate(this.value, ' + ((this.areapoints * 2) - 1) + ')" >)</div>'
            this.phtmltwo += '<div id="ptlabeltwo' + (this.areapoints + 1) + '">(<input id="cxpointtwo' + this.pts.length / 2 + '" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("x") + '"  oninput="apUpdate(this.value, ' + ((this.areapoints * 2) - 2) + ')">,<input id="cypointtwo' + this.pts.length / 2 + '" type="number" class="point-input point-input-area" value="" step="' + this.returnStep("y") + '" oninput="apUpdate(this.value, ' + ((this.areapoints * 2) - 1) + ')" >)</div>'
            document.getElementById('apoints').innerHTML = this.phtml;
            document.getElementById('apoints2').innerHTML = this.phtmltwo;

            this.areapoints++;
        }

        for (i = 2; i <= this.areapoints; i++) {
            document.getElementById('cxpoint' + i + '').value = graphSe.snapIt ? this.spts[(i * 2) - 2] : this.pts[(i * 2) - 2];
            document.getElementById('cypoint' + i + '').value = graphSe.snapIt ? this.spts[(i * 2) - 1] : this.pts[(i * 2) - 1];
            document.getElementById('cxpointtwo' + i + '').value = graphSe.snapIt ? this.spts[(i * 2) - 2] : this.pts[(i * 2) - 2];
            document.getElementById('cypointtwo' + i + '').value = graphSe.snapIt ? this.spts[(i * 2) - 1] : this.pts[(i * 2) - 1];
        }

    }


    this.SetElementLabel = function (text) {
        this.elementlabel = text;
        //SWG-87
        if (graphSe.mode != "designer" && this.elementlabel != "None") {
            this.tempbookColor = "Yes";
            this.tempLableLine = true;
        }
        //end SWG-87
        this.SetColor();

    }

    this.SetRelativeElementLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.relementlabel = text;
            this.relementlabelinc[1] = text;
            this.relementlabelinc[2] = text;
            this.relementlabelinc[3] = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.relementlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.relementlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.relementlabelinc[3] = text;
        }

        this.CheckRLabel();
    }

    this.CheckRLabel = function () {
        var rlltemp;

        if (graphSe.mode == 'correct') {
            rlltemp = this.relementlabel;
        } else if (graphSe.mode == 'incorrect1') {
            rlltemp = this.relementlabelinc[1];
        } else if (graphSe.mode == 'incorrect2') {
            rlltemp = this.relementlabelinc[2];
        } else if (graphSe.mode == 'incorrect3') {
            rlltemp = this.relementlabelinc[3];
        }

        var rll = graphSe.FindInGraph(rlltemp);
        if (rll) {
            if (rll.IsPPF()) {
                document.getElementById("lefttext").innerHTML = 'Inward';
                document.getElementById("righttext").innerHTML = 'Outward';
            } else if (rll.elementlabel == 'Marginal Cost' || rll.elementlabel == 'Fixed Cost' ||
                rll.elementlabel == 'Variable Cost' || rll.elementlabel == 'Total Cost') {
                document.getElementById("lefttext").innerHTML = 'Up';
                document.getElementById("righttext").innerHTML = 'Down';
            } else {
                document.getElementById("lefttext").innerHTML = 'Left';
                document.getElementById("righttext").innerHTML = 'Right';
            }
        }

        if (rlltemp == "Accepted Area") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').removeClass("hide");
        } else if (rlltemp == "None") {
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#drawarea').addClass("hide");
        } else {
            $('#relativetools2').removeClass("hide");
            $('#relativeinputs2').removeClass("hide");
            $('#drawarea').addClass("hide");
        }
    }

    this.SetBookColor = function (text) {
        this.bookcolor = text;

        this.SetColor();
    }

    this.GetBookColor = function (text) {
        return this.bookcolor;
    }

    this.DisplayBookColor = function () {
        if (this.bookcolor == "Yes") {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-checkedmm"></span>';
        } else {
            document.getElementById('bcbutton').innerHTML = 'Use Book Color <span class="glyphicon glyphicon-uncheckedmm"></span>';
        }
    }

    this.Highlight = function () {
        for (i = 0; i < graphMe.length; i++) {
            graphMe[i].iscurrent = false
        }

        this.iscurrent = true
    }

    this.UpdateLabelText = function () {
        document.getElementById('xlabel' + this.labelvalueedit).value = this.labeledit;
        document.getElementById('toplabel' + this.labelvalueedit).innerHTML = this.labeledit;
    }

    this.InteractiveMe = function (tf) {
        this.interactive = tf;
        if (tf) {
            $("#binteractivero").removeClass("hide");
            $("#bstaticro").addClass("hide");
        } else {
            $("#binteractivero").addClass("hide");
            $("#bstaticro").removeClass("hide");
        }
    }


    this.CorrectTools = function () {
        if (graphSe.mode.indexOf('correct') != -1) {
            if (this.interactive != false) $('#labeldetails').removeClass("hide");
            $('#designertools').addClass("hide");
            $('#designerinputs').addClass("hide");
            $('#elabel').removeClass("hide");
            $('#elabelmode').removeClass("hide");
            $('#intleft').addClass("hide");
            $('#intright').addClass("hide");
            document.getElementById("elementhead").innerHTML = "Evaluation Settings";
            document.getElementById("interactive").style.background = "#fbfbfb";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').addClass("hide");

            $('#incdetails').addClass("hide");

            if (this.interactive) {
                document.getElementById("elabelmode").innerHTML = "Interactive";
                this.elabelmode = "Interactive";
                $('#interactivetools').removeClass("hide");

                if (graphSe.mode == "incorrect1" || graphSe.mode == "incorrect2" || graphSe.mode == "incorrect3") {
                    $('#drawingtools').addClass("hide");
                    $('#interactivetools').removeClass("hide");
                    $('#labeldetails').removeClass("hide");
                    $('#incdetails').addClass("hide");
                }
            } else {
                document.getElementById("elabelmode").innerHTML = "Static";
                this.elabelmode = "Static";
                $('#interactivetools').addClass("hide");
            }

            if (this.mode.indexOf('correct') != -1) {
                document.getElementById("elabelmode").innerHTML = "Drawing";
                this.elabelmode = "Drawing";
                $('#interactivetools').addClass("hide");
                $('#drawingtools').removeClass("hide");
                $('#labeldetails').removeClass("hide");
            }
            if (document.getElementById('rltoggle').checked) {
                $('#requiredlabeltools').removeClass("hide");
                $('#requiredlabelinputs').removeClass("hide");
                document.getElementById('cldropdown').value = this.correctlabel;
            } else {
                $('#requiredlabeltools').addClass("hide");
                $('#requiredlabelinputs').addClass("hide");
            }
            if (this.elabelmode == "Drawing") {
                $('#drawingtools').removeClass("hide");
            } else {
                $('#drawingtools').addClass("hide");
            }

        } else if (graphSe.mode == 'student') {
            $('#interactive').addClass("hide");
            $('#bottomtools').addClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");

        } else {
            $('#labeldetails').addClass("hide");
            $('#designertools').removeClass("hide");
            $('#designerinputs').removeClass("hide");
            //$('#elabel').addClass("hide");
            $('#elabelmode').addClass("hide");
            $('#intleft').removeClass("hide");
            $('#intright').removeClass("hide");
            document.getElementById("elementhead").innerHTML = "Element Settings";
            document.getElementById("interactive").style.background = "#f6f6f6";
            document.getElementById("interactive").style.marginTop = "0px";
            $('#sectionpadding').removeClass("hide");
            $('#interactivetools').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
            $('#requiredlabelinputs').addClass("hide");
        }
    }

    this.InteractiveReset = function () {
        if (this.interactive == true) {
            $('#ilabels').removeClass("hide");
            $('#iinputs').removeClass("hide");
        } else {
            $('#ilabels').addClass("hide");
            $('#iinputs').addClass("hide");
        }
    }

    this.TrackAgainstDropdown = function () {
        var html = '<option value="None">None</option>'
        for (i = 0; i < graphMe.length; i++) {
            var gi = graphMe[i];
            var gitype = gi.constructor.name;
            if (gi.labeledit != this.labeledit && gitype == "Line") {
                var graphlabel = gi.labeledit;
                html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
            }
        }

        this.taselects = html;
    }

    this.RelativeDropdown = function () {
        var html = '<option value="None">None</option>'
        html += '<option value="Accepted Area">Accepted Area</option>'
        for (i = 0; i < graphMe.length; i++) {
            var graphlabel = graphMe[i].labeledit;
            html += '<option value="' + graphlabel + '">' + graphlabel + '</option>'
        }

        this.relselects = html;
    }

    this.EvalShift = function (text) {
        //SWG_312 and SWG_313 changes
        if (this.upCoordinatesUpdated != undefined)
            this.upCoordinatesUpdated = undefined;
        if (this.downCoordinatesUpdated != undefined)
            this.downCoordinatesUpdated = undefined;
        if (this.inwardCoordinatesUpdated != undefined)
            this.inwardCoordinatesUpdated = undefined;
        if (this.outwardCoordinatesUpdated != undefined)
            this.outwardCoordinatesUpdated = undefined;
        this.rightCoordinatesUpdated = undefined;
        this.leftCoordinatesUpdated = undefined;

        var veshift
        if (graphSe.mode == 'correct') {
            this.evalshift = text;
            veshift = this.evalshift;
        } else if (graphSe.mode == 'incorrect1') {
            this.evalshiftinc[1] = text;
            veshift = this.evalshiftinc[1] == undefined ? this.evalshift : this.evalshiftinc[1]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect2') {
            this.evalshiftinc[2] = text;
            veshift = this.evalshiftinc[2] == undefined ? this.evalshift : this.evalshiftinc[2]; ////SWG-312, 313
        } else if (graphSe.mode == 'incorrect3') {
            this.evalshiftinc[3] = text;
            veshift = this.evalshiftinc[3] == undefined ? this.evalshift : this.evalshiftinc[3]; ////SWG-312, 313
        }

        if (veshift == "left" || veshift == "up" || veshift == "inward") {
            $("#sleftro").removeClass("hide");
            $("#srightro").addClass("hide");
        } else if (veshift == null) {
            $("#sleftro").addClass("hide");
            $("#srightro").addClass("hide");
        } else {
            $("#sleftro").addClass("hide");
            $("#srightro").removeClass("hide");
            //$('#relativetools').removeClass("hide");
            //$('#relativeinputs').removeClass("hide");
        }

        if (text != null) {
            if (graphSe.mode == 'correct') this.CorrectMe(["relative", text]);
            else if (graphSe.mode.substring(0, 9) == "incorrect")
                this.IncorrectMe(undefined, undefined, ["relative", text]);
        }
    }

    this.PreciseMe = function (tf) {
        if (graphSe.mode == 'correct') {
            this.precise = tf;
            this.preciseinc[1] = tf;
            this.preciseinc[2] = tf;
            this.preciseinc[3] = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.preciseinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.preciseinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.preciseinc[3] = tf;
        }

        if (tf) {
            $("#bprecisero").removeClass("hide");
            $("#brelativero").addClass("hide");
            $('#relativetools').addClass("hide");
            $('#relativeinputs').addClass("hide");
            $('#precisetools').removeClass("hide");
            $('#preciseinputs').removeClass("hide");
        } else if (tf == null) {
            $("#bprecisero").addClass("hide");
            $("#brelativero").addClass("hide");
        } else {
            $("#bprecisero").addClass("hide");
            $("#brelativero").removeClass("hide");
            $('#relativetools').removeClass("hide");
            $('#relativeinputs').removeClass("hide");
            $('#relativetools2').addClass("hide");
            $('#relativeinputs2').addClass("hide");
            $('#precisetools').addClass("hide");
            $('#preciseinputs').addClass("hide");
        }
    }

    this.RequiredLabelMe = function (tf) {
        if (graphSe.mode == 'correct') {
            this.requiredlabel = tf;
        } else if (graphSe.mode == 'incorrect1') {
            this.requiredlabelinc[1] = tf;
        } else if (graphSe.mode == 'incorrect2') {
            this.requiredlabelinc[2] = tf;
        } else if (graphSe.mode == 'incorrect3') {
            this.requiredlabelinc[3] = tf;
        }

        if (tf) {
            $('#requiredlabelinputs').removeClass("hide");
            $('#requiredlabeltools').removeClass("hide");
        } else {
            $('#requiredlabelinputs').addClass("hide");
            $('#requiredlabeltools').addClass("hide");
        }
    }

    this.LabelMeDrop = function () {
        if (this.droppedlabel == 0 && this.interactive) {
            //console.log("label me drop");

            /*console.log("label me drop");
			var xpx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxg : this.xg );
			var ypx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.syg : this.yg );

			var xspx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxsg : this.xsg );
			var yspx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.sysg : this.ysg );
			var xepx = graphSe.ConvertXgToXpx( graphSe.snapIt ? this.sxeg : this.xeg );
			var yepx = graphSe.ConvertYgToYpx( graphSe.snapIt ? this.syeg : this.yeg );*/
            var uniqueLabel = this.uniqueLabel;//3.7 changes
            var spt = graphSe.snapIt ? { x: this.spts[2], y: this.spts[3] } : { x: this.pts[2], y: this.pts[3] };
            var pt = graphSe.snapIt ? { x: this.spts[4], y: this.spts[5] } : { x: this.pts[4], y: this.pts[5] };

            var xoffset = 0;
            var yoffset = 0;

            pt.x = graphSe.ConvertXgToXpx(pt.x) + xoffset;
            pt.y = graphSe.ConvertYgToYpx(pt.y) + yoffset;
            spt.x = graphSe.ConvertXgToXpx(spt.x) + xoffset;
            spt.y = graphSe.ConvertYgToYpx(spt.y) + yoffset;

            var d = 20;

            var mag = Math.sqrt(Math.pow((pt.x - spt.x), 2) + Math.pow((pt.y - spt.y), 2))
            var newx = pt.x + d * (pt.x - spt.x) / mag
            var newy = pt.y + d * (pt.y - spt.y) / mag

            var div = document.createElement("div");
            this.studentlabelid = 'dlabel' + this.divid;
            div.id = this.studentlabelid;
            div.style.position = "absolute";
            div.style.left = newx + 37 + 'px';

            ////SWG-221 Changes
            if (graphSe.titleshow && graphSe.title != "") div.style.top = newy + 158 + 'px';
            else div.style.top = newy + 105 + 'px';
            ////SWG-221 Changes end

            div.style.zIndex = "1000"; ////SWFB-2269
            div.className = 'styled-select';

            var clselectsrt;

            if (this.mode == "student") {
                if (this.FindMatchObject() == null) {
                    clselectsrt = this.clselects;
                } else {
                    clselectsrt = this.FindMatchObject().clselects;
                }
            } else {
                clselectsrt = this.clselects;
            }

            div.innerHTML = '<select id="elabel' + this.divid + '" data-uniqueid =' + uniqueLabel + ' class="select-class" onchange="GetCorrectStudentLabel(this.value, this.id, this)"></span>' + clselectsrt + '</select>'
            document.getElementById('graphcontainer').appendChild(div);

            //$('#elabel').removeClass("hide");
            studentlabel++;
            graphSe.OpsAddStudentLabel(gmloc);

            //this.droppedlabel = 1; ////SWG-451
        }

    }

    this.deleteStudentLabel = function () {
        this.savedstudentlabel = document.getElementById(this.studentlabelid);
        this.savedstudentcorrectlabel = this.studentcorrectlabel;
        var studentcorrectlabel = this.designerLabel != undefined ? this.designerLabel : "None"; ////Preview mode object color disappear after undo

        this.SetCorrectStudentLabel(studentcorrectlabel); ////Set default designer mode color
        document.getElementById(this.studentlabelid).remove();
        this.droppedlabel = 0;

        this.setStudentColor();
    }

    this.replaceStudentLabel = function () {
        var div = this.savedstudentlabel;
        this.studentcorrectlabel = this.savedstudentcorrectlabel;

        document.getElementById('graphcontainer').appendChild(div);

        this.droppedlabel = 1;

        this.setStudentColor();
    }


    this.SetCorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }
    }

    this.SetCorrectStudentLabel = function (text) {
        this.studentcorrectlabel = text;

        //this.CheckIsCorrect("label");

        //if( !this.CheckIsCorrect( "label" ) ) this.CheckIsIncorrect( "label" );
    }

    this.SetIncorrectLabel = function (text) {
        if (graphSe.mode == 'correct') {
            this.correctlabel = text;
        } else if (graphSe.mode == 'incorrect1') {
            this.correctlabelinc[1] = text;
        } else if (graphSe.mode == 'incorrect2') {
            this.correctlabelinc[2] = text;
        } else if (graphSe.mode == 'incorrect3') {
            this.correctlabelinc[3] = text;
        }
    }

    this.SetCorrectPoints = function () {
        if (this.precise) {

            document.getElementById('cxpoint0c').value = graphSe.snapIt ? this.spts[0] : this.pts[0];
            document.getElementById('cypoint0c').value = graphSe.snapIt ? this.spts[1] : this.pts[1];

            document.getElementById('alabelsc').innerHTML = this.ahtml;
            document.getElementById('apointsc').innerHTML = this.phtml;

            /*if(this.pts.length >= 3 && this.closed == false)
			 {
				 var div = document.createElement("div");
				 div.id = 'dlabel'+this.pts.length/2;
				 this.ahtml += '<div id="alabel'+(this.areapointso+1)+'" class="tool">Point '+this.pts.length/2+'</div>'
				 document.getElementById('alabelsc').innerHTML = this.ahtml;

				 var div = document.createElement("div");
				 div.id = 'dpoints2';
				 this.phtml += '<div id="ptlabel'+(this.areapointso+1)+'">(<input id="cxpoint'+this.pts.length/2+'" type="number" class="point-input point-input-area" value="" step="'+graphSe.xmax/Number(graphSe.wdPx)+'"  oninput="apUpdate(this.value, '+((this.areapointso*2)-2)+')">,<input id="cypoint'+this.pts.length/2+'" type="number" class="point-input point-input-area" value="" step="'+graphSe.ymax/Number(385)+'" oninput="apUpdate(this.value, '+((this.areapointso*2)-1)+')" >)</div>'
				 document.getElementById('apointsc').innerHTML = this.phtml;

				 this.areapointso++;
			 }*/

            for (i = 2; i <= this.areapoints; i++) {
                document.getElementById('cxpoint' + i + '').value = graphSe.snapIt ? this.spts[(i * 2) - 2] : this.pts[(i * 2) - 2];
                document.getElementById('cypoint' + i + '').value = graphSe.snapIt ? this.spts[(i * 2) - 1] : this.pts[(i * 2) - 1];
            }


        }

        /*document.getElementById('cxspointc').value = this.correctcsx;
        document.getElementById('cyspointc').value = this.correctcys;
        document.getElementById('cxmpointc').value = this.correctcxm;
        document.getElementById('cympointc').value = this.correctcym;
        document.getElementById('cxepointc').value = this.correctcxe;
        document.getElementById('cyepointc').value = this.correctcye;*/
        //this.SetSettings();
    }

    this.IsPPF = function () {
        return false;
    }

    this.removeLastCheckBox = function () {

        var customlength = this.customlabels.length;
        var customlength2 = this.checkboxes.length;

        if (customlength > 0) {
            this.removedcheckboxes.push(this.customlabels[customlength - 1]);
            this.removedcheckboxesstate.push(this.checkboxes[customlength2 - 1]);

            this.customlabels.pop();
            this.checkboxes.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) - 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }

    this.replaceLastCheckBox = function () {
        var customlength = this.removedcheckboxes.length;
        if (customlength > 0) {
            this.customlabels.push(this.removedcheckboxes[customlength - 1]);
            this.checkboxes.push(this.removedcheckboxesstate[customlength - 1]);

            this.removedcheckboxes.pop();
            this.removedcheckboxesstate.pop();

            var fstr2 = this.clabeloffset.split("px")
            var fstr = fstr2[0];
            fstr = Number(fstr) + 20;

            this.clabeloffset = fstr + "px";
            document.getElementById("cltext2").style.paddingTop = fstr + "px";

            this.SetSettings();
        }

    }


    this.SetSettings();

}


function DoPointer(e) {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    doPointerMode = true;
    doLabelMode = false;

    drawPointMode = false;
    drawLineMode = false;
    drawCurveMode = false;
    drawFillPolylineMode = false;
    theCurve = null;

    cancursor = "pointer";
    can.style.cursor = "pointer";

    oldPt = null;
    animLine = null;

    $('#pointerBtn').addClass("btn-econ-sw5-on");
    $('#label').removeClass("btn-econ-sw5-on"); ////SWG-296
    $('#drawpointBtn').removeClass("btn-econ-sw5-on");
    $('#drawlineBtn').removeClass("btn-econ-sw5-on");
    $('#drawcurveBtn').removeClass("btn-econ-sw5-on");
    $('#drawfillpolylineBtn').removeClass("btn-econ-sw5-on");

}

function DoLabel(e) {
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    doLabelMode = true;
    doPointerMode = false;

    drawPointMode = false;
    drawLineMode = false;
    drawCurveMode = false;
    drawFillPolylineMode = false;
    theCurve = null;

    cancursor = "url(./cursorlabel.png),auto";
    can.style.cursor = cancursor;

    oldPt = null;
    animLine = null;

    $('#label').addClass("btn-econ-sw5-on");
    $('#pointerBtn').removeClass("btn-econ-sw5-on");
    $('#drawpointBtn').removeClass("btn-econ-sw5-on");
    $('#drawlineBtn').removeClass("btn-econ-sw5-on");
    $('#drawcurveBtn').removeClass("btn-econ-sw5-on");
    $('#drawfillpolylineBtn').removeClass("btn-econ-sw5-on");
}


function DoDrawPoint(e) {
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    //SWG-142 changes
    if (graphSe.studentSettings.isPointDisabled && graphSe.mode != 'designer') {
        return false;
    }
    //SWG-142 changes end
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();

    drawPointMode = true;
    doPointerMode = false;
    drawLineMode = false;
    drawCurveMode = false;
    theCurve = null;
    drawFillPolylineMode = false;
    doLabelMode = false;

    cancursor = "url(./cursorpoint.png),auto";
    can.style.cursor = cancursor;

    oldPt = null;
    animLine = null;

    $('#label').removeClass("btn-econ-sw5-on");
    $('#pointerBtn').removeClass("btn-econ-sw5-on");
    $('#drawpointBtn').addClass("btn-econ-sw5-on");
    $('#drawlineBtn').removeClass("btn-econ-sw5-on");
    $('#drawcurveBtn').removeClass("btn-econ-sw5-on");
    $('#drawfillpolylineBtn').removeClass("btn-econ-sw5-on");
}


function DoDrawLine(e) {
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    //SWG-142 changes
    if (graphSe.studentSettings.isLineDisabled && graphSe.mode != 'designer') {
        return false;
    }
    //SWG-142 changes end
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();

    drawLineMode = true;
    drawPointMode = false;
    doPointerMode = false;
    drawCurveMode = false;
    theCurve = null;
    drawFillPolylineMode = false;
    doLabelMode = false;

    cancursor = "url(./cursorline.png),auto";
    can.style.cursor = cancursor;

    oldPt = null;
    animLine = null;
    anchorPt = null;
    animMe = [];

    $('#label').removeClass("btn-econ-sw5-on");
    $('#pointerBtn').removeClass("btn-econ-sw5-on");
    $('#drawpointBtn').removeClass("btn-econ-sw5-on");
    $('#drawlineBtn').addClass("btn-econ-sw5-on");
    $('#drawcurveBtn').removeClass("btn-econ-sw5-on");
    $('#drawfillpolylineBtn').removeClass("btn-econ-sw5-on");
}


function DoDrawCurve(e) {
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    //SWG-142 changes
    if (graphSe.studentSettings.isCurveDisabled && graphSe.mode != 'designer') {
        return false;
    }
    //SWG-142 changes end
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();

    drawCurveMode = true;
    drawPointMode = false;
    doPointerMode = false;
    drawLineMode = false;
    drawFillPolylineMode = false;
    doLabelMode = false;

    cancursor = "url(./cursorcurve2.png),auto";
    can.style.cursor = cancursor;

    oldPt = null;

    $('#label').removeClass("btn-econ-sw5-on");
    $('#pointerBtn').removeClass("btn-econ-sw5-on");
    $('#drawpointBtn').removeClass("btn-econ-sw5-on");
    $('#drawlineBtn').removeClass("btn-econ-sw5-on");
    $('#drawcurveBtn').addClass("btn-econ-sw5-on");
    $('#drawfillpolylineBtn').removeClass("btn-econ-sw5-on");
}


function DoDrawFillPolyline(e) {
    //SWG-223 Changes
    if (graphMe.length > 0)
        graphSe.DeleteIncompleteObject(graphMe[graphMe.length - 1].what);
    //SWG-223 Changes end
    //SWG-142 changes
    if (graphSe.studentSettings.isPolygonDisabled && graphSe.mode != 'designer') {
        return false;
    }
    //SWG-142 changes end
    if (thePoly != null && !thePoly.IsDone()) thePoly.CompleteMe();

    drawFillPolylineMode = true;
    drawCurveMode = false;
    theCurve = null;
    drawPointMode = false;
    doPointerMode = false;
    drawLineMode = false;
    doLabelMode = false;

    graphSe.drawAcceptedArea = null;

    cancursor = "url(./cursorfillpolyline.png),auto";
    can.style.cursor = cancursor;

    oldPt = null;

    $('#label').removeClass("btn-econ-sw5-on");
    $('#pointerBtn').removeClass("btn-econ-sw5-on");
    $('#drawpointBtn').removeClass("btn-econ-sw5-on");
    $('#drawlineBtn').removeClass("btn-econ-sw5-on");
    $('#drawcurveBtn').removeClass("btn-econ-sw5-on");
    $('#drawfillpolylineBtn').addClass("btn-econ-sw5-on");
}

function DoAcceptedArea(gloc) {
    drawFillPolylineMode = true;
    drawCurveMode = false;
    theCurve = null;
    drawPointMode = false;
    doPointerMode = false;
    drawLineMode = false;
    doLabelMode = false;

    cancursor = "url(./cursorfillpolyline.png),auto";
    can.style.cursor = cancursor;

    graphSe.drawAcceptedArea = graphMe[gloc];
    graphMe[gloc].evalshift = null;
}


var undoTmr;

function clickElement() {
    var gi = graphMe[gmloc - 1];

    // check if the element has left/right/up/down and original coordinates set - if they are set then we dont need to click the element
    if (graphSe.mode != 'correct') return;
    if (gi.originalCoordinates != undefined) return;
    // get the line coordinates first then covert then pass it as pt
    //var pt = MouseXY(e); {x: , y: }

    if (gi.what == 'line') {
        var x = graphSe.ConvertXgToXpx(graphSe.snapIt ? gi.sxsg : gi.xsg);
        var y = graphSe.ConvertYgToYpx(graphSe.snapIt ? gi.sysg : gi.ysg);

        var pt = { x: x, y: y };

        if ((ho = graphSe.ObjSelect(pt)) != null) {
            //ShowPos( );
            //if( (graphSe.mode == "designer" || ho.gi.interactive) && !ho.gi.locked ) ho.gi.DragMe( pt );
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode))
                hgi.DragMe(pt, 'off', 'dontstartdrag'); //pass the drag state as off otherwise next time when user clicks it assumes it to be drag start
        }
        if (ho) {
            gmloc = ho.loc + 1;
            ho.gi.SetSettings();
            ho.gi.ControlMe(true);
        }
        graphSe.prevPt = pt;
    } else if (gi.what == 'point') {
        var x = gi.x;
        var y = gi.y;
        var pt = { x: x, y: y };

        if ((ho = graphSe.ObjSelect(pt)) != null) {
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode))
                hgi.DragMe(pt, 'off');
        }
        if (ho) {
            gmloc = ho.loc + 1;
            ho.gi.SetSettings();
            ho.gi.ControlMe(true);
        }
        graphSe.prevPt = pt;
    } else if (gi.what == 'curve') {
        var x = graphSe.ConvertXgToXpx(graphSe.snapIt ? gi.spts[0] : gi.pts[0]);
        var y = graphSe.ConvertYgToYpx(graphSe.snapIt ? gi.spts[1] : gi.pts[1]);

        var pt = { x: x, y: y };

        if ((ho = graphSe.ObjSelect(pt)) != null) {
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode))
                hgi.DragMe(pt, 'off', 'dontstartdrag'); //pass the drag state as off otherwise next time when user clicks it assumes it to be drag start
        }
        if (ho) {
            gmloc = ho.loc + 1;
            ho.gi.SetSettings();
            ho.gi.ControlMe(true);
        }
        graphSe.prevPt = pt;
    } else if (gi.what == 'poly') // clickelement handler of poly
    {
        var x = graphSe.ConvertXgToXpx(graphSe.snapIt ? gi.spts[0] : gi.pts[0]);
        var y = graphSe.ConvertYgToYpx(graphSe.snapIt ? gi.spts[1] : gi.pts[1]);

        var pt = { x: x, y: y };

        if ((ho = graphSe.ObjSelect(pt)) != null) {
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode))
                hgi.DragMe(pt, 'off', 'dontstartdrag'); //pass the drag state as off otherwise next time when user clicks it assumes it to be drag start
        }
        if (ho) {
            gmloc = ho.loc + 1;
            ho.gi.SetSettings();
            ho.gi.ControlMe(true);
        }
        graphSe.prevPt = pt;
    }
}

function MouseDown(e) {
    var ho;
    mouseIsDown = true;

    var pt = MouseXY(e);

    if (doPointerMode) {
        //SWG-142 changes
        // if (graphSe.studentSettings.isPointDisabled && graphSe.mode != 'designer') {
        //     return false;
        // }
        //SWG-142 changes end
        if ((ho = graphSe.ObjSelect(pt)) != null) {
            gmloc = ho.loc + 1; ////SWG-457
            //ShowPos( );
            //if( (graphSe.mode == "designer" || ho.gi.interactive) && !ho.gi.locked ) ho.gi.DragMe( pt );
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode)) hgi.DragMe(pt);
        }

        /*
        ho = null;

        if( (ho = IsAHit(pt,Line)) )
        {
            if( (graphSe.mode == "designer" || graphMe[ho.loc].interactive) && !graphMe[ho.loc].locked )
                graphMe[ho.loc].DragMe( pt );
        }
        else if( (ho = IsAHit(pt,Point)) )
        {
            if( (graphSe.mode == "designer" || graphMe[ho.loc].interactive) && !graphMe[ho.loc].locked )
                graphMe[ho.loc].DragMe( pt );
        }
        else if( (ho = IsAHit(pt,Curve)) )
        {
            if( (graphSe.mode == "designer" || graphMe[ho.loc].interactive) && !graphMe[ho.loc].locked )
                graphMe[ho.loc].DragMe( pt );
        }
        else if( (ho = IsAHit(pt,Polyline)) )
        {
            if( (graphSe.mode == "designer" || graphMe[ho.loc].interactive) && !graphMe[ho.loc].locked )
                graphMe[ho.loc].DragMe( pt );
        }
        */

        if (ho) {
            ho.gi.SetSettings();
            ho.gi.ControlMe(true);
        }

        graphSe.prevPt = pt;

    } else if (doLabelMode) {
        /*if( (ho = IsAHit(pt,Line)) )
        {
            //console.log("Hit Line: ", ho.loc, graphMe[ho.loc].xe,graphMe[ho.loc].ye);
            graphMe[ho.loc].LabelMeDrop(  );
        }

        else if( (ho = IsAHit(pt,Point)) )
        {
            //console.log("Hit Point", ho.loc);
            graphMe[ho.loc].LabelMeDrop(  );
        }
        else if( (ho = IsAHit(pt,Curve)) )
        {
            //console.log("Hit Curve", ho.loc);
            graphMe[ho.loc].LabelMeDrop(  );
        }
        else if( (ho = IsAHit(pt,Polyline)) )
        {
            graphMe[ho.loc].LabelMeDrop(  );
        }  */

        if ((ho = graphSe.ObjSelect(pt, true)) != null) {
            gmloc = ho.loc + 1; ////SWG -  247
            //ShowPos( );
            //if( (graphSe.mode == "designer" || ho.gi.interactive) && !ho.gi.locked ) ho.gi.DragMe( pt );
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode)) hgi.LabelMeDrop();
        }

        if (ho) {
            //gmloc = ho.loc + 1; //SWG - 247
            ho.gi.SetSettings();

            ////SWG-111 Changes
            if (ho.gi.studentcorrectlabel != "a") {
                var uniqueid = ho.gi.uniqueLabel;
                var objLabel = ho.gi.label;
                if ($('[data-uniqueid =' + uniqueid + ']').length > 0) {
                    $('#elabel' + objLabel).removeClass('select-class');
                    $('#elabel' + objLabel).addClass('styled-custom-select');
                    $('#elabel' + objLabel).attr('size', $('#elabel' + objLabel + '> option').length);
                    $('#elabel' + objLabel).css('height', $('#elabel' + objLabel + '> option').length * 17);
                    $('#elabel' + objLabel).focus();

                    $('#graphcontainer .styled-custom-select').each(function (index, element) {
                        if (element.id != 'elabel' + objLabel) {
                            $(element).removeAttr('size');
                            $(element).removeClass('styled-custom-select');
                            $(element).css('height', '24px');
                        }
                    })
                }
            }

            //console.log("Mouse Down:", gmloc);
        } else {
            $('#graphcontainer .styled-custom-select').each(function () {
                $(this).removeAttr('size');
                $(this).removeClass('styled-custom-select');
                $(this).css('height', '24px');
            })
        }
        ////SWG-111 Changes

    } else if (drawLineMode) {
        //SWG-142 changes
        // if (graphSe.studentSettings.isLineDisabled && graphSe.mode != 'designer') {
        //     return false;
        // }
        //SWG-142 changes end
        var hit = IsAHit(pt, Point)
        if (hit != null) pt = hit;
        //SWG-125
        var _currentx = hit != null ? hit.gi.myPath.position.x : pt.x;
        var _currenty = hit != null ? hit.gi.myPath.position.y : pt.y;

        anchorPt = { type: "point", x: _currentx, y: _currenty };
    } else if (drawCurveMode) {
        //SWG-142 changes
        // if (graphSe.studentSettings.isCurveDisabled && graphSe.mode != 'designer') {
        //     return false;
        // }
        //SWG-142 changes end
        if (theCurve == null) {
            theCurve = new Curve("black", 2);
            graphSe.AddElement(graphMe, theCurve);
        }

        var hit = IsAHit(pt, Point);
        if (hit == null) {
            //if( theCurve.selectingPts ) theCurve = new Curve( "black", 2 );
            theCurve.clickingPts = true;
            theCurve.swipingPts = true;
            ////SWG - 224 Changes Start
            for (var i = 0; i < theCurve.spts.length; i += 2) {
                if (theCurve.spts[i] == graphSe.SnapX(graphSe.ConvertXpxToXg(pt.x)) && theCurve.spts[i + 1] == graphSe.SnapY(graphSe.ConvertYpxToYg(pt.y)))
                    return;
            }
            ////SWG - 224 Changes End
            theCurve.AddPoint(pt, e);
        } else {
            theCurve.selectingPts = true;
            // SWG-125
            var _currentx = hit != null ? hit.gi.myPath.position.x : hit.x;
            var _currenty = hit != null ? hit.gi.myPath.position.y : hit.y;

            ////SWG - 224 Changes Start
            for (var i = 0; i < theCurve.spts.length; i += 2) {
                if (theCurve.spts[i] == graphSe.SnapX(graphSe.ConvertXpxToXg(_currentx)) && theCurve.spts[i + 1] == graphSe.SnapY(graphSe.ConvertYpxToYg(_currenty)))
                    return;
            }
            ////SWG - 224 Changes End
            theCurve.AddPoint({ x: _currentx, y: _currenty });
        }
        ////SWG-139 Changes
        if (theCurve.pts.length > 4)
            graphMe[gmloc - 1].SetSettings();
        ////SWG-139 Changes edn
    }
}

function TouchDown(e) {
    PosOn();

    graphSe.handleRadius = 12;

    mouseIsDown = true;
    //TouchXY();

    var ho;
    mouseIsDown = true;

    var pt = TouchXY(e);

    if (doPointerMode) {
        if ((ho = graphSe.ObjSelect(pt)) != null) {
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode)) hgi.DragMe(pt);

        }

        ////Commented code removed

        if (ho) {
            gmloc = ho.loc + 1;
            ho.gi.SetSettings();
            ho.gi.ControlMe(true);
        }

        graphSe.prevPt = pt;

    } else if (doLabelMode) {
        if ((ho = graphSe.ObjSelect(pt, true)) != null) {
            gmloc = ho.loc + 1; ////SWG-425
            var hgi = ho.gi;
            if (graphSe.mode == "designer" || (hgi.interactive && !hgi.acceptedArea) ||
                (hgi.interactive && hgi.acceptedArea && hgi.mode == graphSe.mode)) hgi.LabelMeDrop();

        }
        ////Commented code removed

        if (ho) {
            //gmloc = ho.loc + 1; //SWG - 247
            ho.gi.SetSettings();

            ////SWG-111 Changes
            if (ho.gi.studentcorrectlabel != "a") {
                var uniqueid = ho.gi.uniqueLabel;
                var objLabel = ho.gi.label;
                if ($('[data-uniqueid =' + uniqueid + ']').length > 0) {
                    // $('#elabel' + objLabel).removeClass('select-class');
                    // $('#elabel' + objLabel).addClass('styled-custom-select');
                    // $('#elabel' + objLabel).attr('size', $('#elabel' + objLabel + '> option').length);
                    // $('#elabel' + objLabel).css('height', $('#elabel' + objLabel + '> option').length * 17);
                    $('#elabel' + objLabel).focus(); ////SWG-453

                    // $('#graphcontainer .styled-custom-select').each(function (index, element) {
                    //     if (element.id != 'elabel' + objLabel) {
                    //         $(element).removeAttr('size');
                    //         $(element).removeClass('styled-custom-select');
                    //         $(element).css('height', '24px');
                    //     }
                    // })
                }
            }

            //console.log("Mouse Down:", gmloc);
        }
        //else
        // {
        //     $('#graphcontainer .styled-custom-select').each(function(){
        //         $(this).removeAttr('size');
        //         $(this).removeClass('styled-custom-select');
        //         $(this).css('height', '24px');
        //     })
        // }
        ////SWG-111 Changes

    } else if (drawLineMode) {
        var hit = IsAHit(pt, Point)
        if (hit != null) pt = hit;

        anchorPt = { type: "point", x: pt.x, y: pt.y };
    } else if (drawCurveMode) {
        if (theCurve == null) {
            theCurve = new Curve("black", 2);
            graphSe.AddElement(graphMe, theCurve);
        }

        var hit = IsAHit(pt, Point);
        if (hit == null) {
            //if( theCurve.selectingPts ) theCurve = new Curve( "black", 2 );
            theCurve.clickingPts = true;
            theCurve.swipingPts = true;

            ////SWG - 425 Changes Start
            for (var i = 0; i < theCurve.spts.length; i += 2) {
                if (theCurve.spts[i] == graphSe.SnapX(graphSe.ConvertXpxToXg(pt.x)) && theCurve.spts[i + 1] == graphSe.SnapY(graphSe.ConvertYpxToYg(pt.y)))
                    return;
            }
            ////SWG - 425 Changes End

            theCurve.AddPoint(pt, e);
        } else {
            theCurve.selectingPts = true;

            ////SWG - 425 Changes Start
            for (var i = 0; i < theCurve.spts.length; i += 2) {
                if (theCurve.spts[i] == graphSe.SnapX(graphSe.ConvertXpxToXg(pt.x)) && theCurve.spts[i + 1] == graphSe.SnapY(graphSe.ConvertYpxToYg(pt.y)))
                    return;
            }
            ////SWG - 425 Changes End

            theCurve.AddPoint({ x: hit.x, y: hit.y });
        }
    }


}

function MouseUp(e) {
    pt4NewLine = true;
    mouseIsDown = false;

    if (animLine != null) {
        //if( graphSe.mode == "student" ) animLine.CheckIsCorrect( "drawing" );
        //if( graphSe.mode == "student" )
        //    { if( !animLine.CheckIsCorrect( "drawing" ) ) animLine.CheckIsIncorrect( "drawing" ); }

        //graphSe.AddElement( graphMe, animLine )
        //SWG - 223
        if (drawLineMode && animLine.xe) {
            var newObj = animLine;

            DoPointer();
            ////SWG - 248 Changes
            var xStPt = graphSe.ConvertXgToXpx(newObj.sxsg);
            var yStPt = graphSe.ConvertYgToYpx(newObj.sysg);
            var xEdPt = graphSe.ConvertXgToXpx(newObj.sxeg);
            var yEdPt = graphSe.ConvertYgToYpx(newObj.syeg);

            var pointDistance = Math.sqrt(((xStPt - xEdPt) * (xStPt - xEdPt)) + ((yStPt - yEdPt) * (yStPt - yEdPt)));
            if (pointDistance < 25)
                UpdateLineDistanceToOneBlock(newObj);
            ////SWG - 248
        }
        //SWG - 223 End
        animLine = null;
        anchorPt = null;
        animMe = [];
        pt4NewLine = false;

    }

    var btn, evt = e ? e : event;
    if (evt.srcElement) btn = evt.srcElement.id;
    else if (evt.target) btn = evt.target.id;

    var __currentColor = !drawFillPolylineMode ? "black" : "gray"; //SWG-87

    if (theCurve != null && theCurve.pts.length == 6) {
        //SWG-142 changes
        if (graphSe.studentSettings.isCurveDisabled && graphSe.mode != 'designer') {
            return false;
        }
        //SWG-142 changes end
        theCurve.swipingPts = false;
        //graphSe.AddElement( graphMe, theCurve );
        //if( !theCurve.ghost ) theCurve.GhostMe( );
        //if( graphSe.mode == "student" ) theCurve.CheckIsCorrect( "drawing" );
        //if( graphSe.mode == "student" )
        //    { if( !theCurve.CheckIsCorrect( "drawing" ) ) theCurve.CheckIsIncorrect( "drawing" ); }

        ////SWG - 224 Changes Start
        var myCurvePointObj = {};
        myCurvePointObj.X = theCurve.pts[4];
        myCurvePointObj.Y = theCurve.pts[5];
        myCurvePointObj.snapX = theCurve.spts[4];
        myCurvePointObj.snapY = theCurve.spts[5];

        var stPtX = graphSe.ConvertXgToXpx(theCurve.pts[4]);
        var stPtY = graphSe.ConvertYgToYpx(theCurve.pts[5]);
        var edPtX = graphSe.ConvertXgToXpx(theCurve.pts[0]);
        var edPtY = graphSe.ConvertYgToYpx(theCurve.pts[1]);

        var pointDistance = Math.sqrt(((stPtX - edPtX) * (stPtX - edPtX)) + ((stPtY - edPtY) * (stPtY - edPtY)));
        if (pointDistance < 25)
            myCurvePointObj = checkPointDifferance(myCurvePointObj, theCurve, "end");

        theCurve.pts[4] = myCurvePointObj.X;
        theCurve.pts[5] = myCurvePointObj.Y;

        theCurve.spts[4] = graphSe.SnapX(myCurvePointObj.X);
        theCurve.spts[5] = graphSe.SnapY(myCurvePointObj.Y);
        ////SWG -224 Changes End


        if (graphSe.mode == "correct") theCurve.CorrectMe();
        else if (graphSe.mode.substring(0, 9) == "incorrect") theCurve.IncorrectMe();
        theCurve = null;
        animMe = [];
        DoPointer(); ////SWG - 224 Changes
    } else if (theCurve != null && theCurve.pts.length > 6) {
        if (graphSe.studentSettings.isCurveDisabled && graphSe.mode != 'designer') {
            return false;
        }
        theCurve.MidPoint();
        //if( graphSe.mode == "student" ) theCurve.CheckIsCorrect( "drawing" );
        //if( graphSe.mode == "student" )
        //    { if( !theCurve.CheckIsCorrect( "drawing" ) ) theCurve.CheckIsIncorrect( "drawing" ); }
        ////SWG - 224 Changes Start
        for (var i = 2; i < theCurve.spts.length; i += 2) {

            var myCurvePointObj = {};
            myCurvePointObj.X = theCurve.pts[i];
            myCurvePointObj.Y = theCurve.pts[i + 1];
            myCurvePointObj.snapX = theCurve.spts[i];
            myCurvePointObj.snapY = theCurve.spts[i + 1];

            var pointPos = "start";
            if (i > 0)
                pointPos = i == 2 ? "mid" : "last";

            var stPtX = graphSe.ConvertXgToXpx(myCurvePointObj.X);
            var stPtY = graphSe.ConvertYgToYpx(myCurvePointObj.Y);
            var edPtX = graphSe.ConvertXgToXpx(theCurve.pts[i - 2]);
            var edPtY = graphSe.ConvertYgToYpx(theCurve.pts[i - 1]);

            var pointDistance = Math.sqrt(((stPtX - edPtX) * (stPtX - edPtX)) + ((stPtY - edPtY) * (stPtY - edPtY)));
            if (pointDistance < 25)
                myCurvePointObj = checkPointDifferance(myCurvePointObj, theCurve, pointPos);


            theCurve.pts[i] = myCurvePointObj.X;
            theCurve.pts[i + 1] = myCurvePointObj.Y;

            theCurve.spts[i] = graphSe.SnapX(myCurvePointObj.X);
            theCurve.spts[i + 1] = graphSe.SnapY(myCurvePointObj.Y);

        }
        var myCurvePointObj = {};
        myCurvePointObj.X = theCurve.pts[4];
        myCurvePointObj.Y = theCurve.pts[5];
        myCurvePointObj.snapX = theCurve.spts[4];
        myCurvePointObj.snapY = theCurve.spts[5];

        var stPtX = graphSe.ConvertXgToXpx(theCurve.pts[4]);
        var stPtY = graphSe.ConvertYgToYpx(theCurve.pts[5]);
        var edPtX = graphSe.ConvertXgToXpx(theCurve.pts[0]);
        var edPtY = graphSe.ConvertYgToYpx(theCurve.pts[1]);

        var pointDistance = Math.sqrt(((stPtX - edPtX) * (stPtX - edPtX)) + ((stPtY - edPtY) * (stPtY - edPtY)));
        if (pointDistance < 25)
            myCurvePointObj = checkPointDifferance(myCurvePointObj, theCurve, "end");

        theCurve.pts[4] = myCurvePointObj.X;
        theCurve.pts[5] = myCurvePointObj.Y;

        theCurve.spts[4] = graphSe.SnapX(myCurvePointObj.X);
        theCurve.spts[5] = graphSe.SnapY(myCurvePointObj.Y);
        graphMe[gmloc - 1] = theCurve;
        ////SWG - 224 Changes End

        if (graphSe.mode.substring(0, 9) == "incorrect") theCurve.IncorrectMe();
        else if (graphSe.mode == "correct") theCurve.CorrectMe();
        theCurve = null;
        animMe = [];
        DoPointer(); ////SWG - 224 Changess
    }

    var pt = MouseXY(e);
    //Changes for SWG-173
    //var currentObj = graphMe[graphMe.length - 1];
    var currentObj = graphMe[gmloc - 1];
    //Changes for SWG-173 end
    if (currentObj) {
        if (btn != "CanvasAnimate" && currentObj.dragState == "off") return;
    }
    else {
        if (btn != "CanvasAnimate") return;
    }

    if (drawPointMode) {
        //SWG - 222 Changes Start
        DoPointer();
        //SWG - 222 Changes End
        //SWG-142 changes
        if (graphSe.studentSettings.isPointDisabled && graphSe.mode != 'designer') {
            return false;
        }
        //SWG-142 changes end
        newPt = new Point(__currentColor, pt.x, pt.y, 4);
        if (graphSe.mode == "correct") newPt.CorrectMe();
        if (graphSe.mode.substring(0, 9) == "incorrect") newPt.IncorrectMe();
        //if( graphSe.mode == "student" ) newPt.CheckIsCorrect( "drawing" );
        //if( graphSe.mode == "student" )
        //    { if( !newPt.CheckIsCorrect( "drawing" ) ) newPt.CheckIsIncorrect( "drawing" ); }
        graphSe.AddElement(graphMe, newPt);
    } else if (drawLineMode && pt4NewLine) {
        //SWG-142 changes
        if (graphSe.studentSettings.isLineDisabled && graphSe.mode != 'designer') {
            return false;
        }
        //SWG-142 changes end
        var hit = IsAHit(pt, Point)
        if (hit != null) pt = hit;
        // SWG-125
        var _newx = hit != null ? hit.gi.myPath.position.x : pt.x;
        var _newy = hit != null ? hit.gi.myPath.position.y : pt.y;
        if (newLine == null) {
            newLine = new Line(__currentColor, _newx, _newy);
            graphSe.AddElement(graphMe, newLine);

        } else {
            newLine.AddEndPt(_newx, _newy, true);
            newLine = null;

            var newObj = graphMe[gmloc - 1];
            var xStPt = graphSe.ConvertXgToXpx(newObj.sxsg);
            var yStPt = graphSe.ConvertYgToYpx(newObj.sysg);
            var xEdPt = graphSe.ConvertXgToXpx(newObj.sxeg);
            var yEdPt = graphSe.ConvertYgToYpx(newObj.syeg);

            var pointDistance = Math.sqrt(((xStPt - xEdPt) * (xStPt - xEdPt)) + ((yStPt - yEdPt) * (yStPt - yEdPt)));
            if (pointDistance < 25)
                UpdateLineDistanceToOneBlock(graphMe[gmloc - 1]);
            //SWG - 223 Changes Start
            DoPointer();
            //SWG - 223 Changes End
        }

    } else if (drawFillPolylineMode) {
        //SWG-142 changes
        if (graphSe.studentSettings.isPolygonDisabled && graphSe.mode != 'designer' && $('#reldropdown').val() != "Accepted Area") {
            return false;
        }
        //SWG-142 changes end
        if (thePoly == null) {

            if (thePoly == null)
                thePoly = new Polyline(__currentColor, 1, 1, graphSe.drawAcceptedArea != null);

            thePoly.AddPoint(pt);

            //graphSe.AddElement( animMe, thePoly );
            graphSe.AddElement(graphMe, thePoly);
        }
        else {
            //SWG-225 changes
            // var ptxg = graphSe.ConvertXpxToXg(pt.x + 4);
            // var ptyg = graphSe.ConvertYpxToYg(pt.y + 4);
            // var snapX = graphSe.SnapX(ptxg);
            // var snapY = graphSe.SnapY(ptyg);
            // var loopStart = thePoly.spts.length > 4 ? 2 : 0;
            // for (var i = loopStart; i <= thePoly.spts.length - 2; i += 2) {
            //     if (thePoly.pts[i] == ptxg && thePoly.pts[i + 1] == ptyg) {
            //         return false;
            //     }
            // }
            //SWG-225 changes end
            thePoly.AddPoint(pt, e);
            //SWG-225 changes
            if (thePoly == null)
                DoPointer();
            //SWG-225 changes end
        }
    }

    if (dragObj != null) {
        if (graphSe.mode == "designer" || dragObj.interactive) dragObj.DragMe(pt, "drop");
    }

}

var hoverObj = null;
var animLine = null;

function MouseMove(e) {

    var pt = MouseXY(e);
    graphSe.prevPt = pt;

    /*
    if( doPointerMode )
    {
        if( (ho = IsAHit(pt,Line)) || (ho = IsAHit(pt,Curve)) || (ho = IsAHit(pt,Polyline)) )
            { hoverObj = graphMe[ho.loc]; hoverObj.ControlMe( true ); }
        else if( hoverObj != null ) { hoverObj.ControlMe( false ); hoverObj = null; }

        if( hoverObj == null ) graphSe.NoHover( );
        else graphSe.OneHover( );

        //if( IsAHit(pt,Line) || IsAHit(pt,Point) || IsAHit(pt,Curve) ) can.style.cursor = cancursor;
        //else can.style.cursor = cancursor;
    }
    */

    if (mouseIsDown) {
        if (drawLineMode) {
            var hit = IsAHit(pt, Point);
            if (hit != null) pt = hit;

            // SWG-125
            var _newx = hit != null ? hit.gi.myPath.position.x : pt.x;
            var _newy = hit != null ? hit.gi.myPath.position.y : pt.y;
            if (animLine == null && anchorPt) {
                animLine = new Line("black", anchorPt.x, anchorPt.y, _newx, _newy, 2);
                //graphSe.AddElement( animMe, animLine );
                graphSe.AddElement(graphMe, animLine);

                animLine.SetSettings();
            } else if (animLine) {
                animLine.AddEndPt(_newx, _newy, false);
                animLine.SetSettings();
            }
        } else if (drawCurveMode && theCurve) {
            theCurve.AddPoint(pt);
        }

        if (dragObj != null) {
            if (graphSe.mode == "designer" || dragObj.interactive) dragObj.DragMe(pt);
            //dragObj.DragMe( pt );
        }
    }
}

function TouchMove(e) {
    var pt = TouchXY(e);
    graphSe.prevPt = pt;

    /*
    if( doPointerMode )
    {
        if( (ho = IsAHit(pt,Line)) || (ho = IsAHit(pt,Curve)) || (ho = IsAHit(pt,Polyline)) )
            { hoverObj = graphMe[ho.loc]; hoverObj.ControlMe( true ); }
        else if( hoverObj != null ) { hoverObj.ControlMe( false ); hoverObj = null; }

        if( hoverObj == null ) graphSe.NoHover( );
        else graphSe.OneHover( );

        //if( IsAHit(pt,Line) || IsAHit(pt,Point) || IsAHit(pt,Curve) ) can.style.cursor = cancursor;
        //else can.style.cursor = cancursor;
    }
    */

    if (mouseIsDown) {
        if (drawLineMode) {
            var hit = IsAHit(pt, Point);
            if (hit != null) pt = hit;

            if (animLine == null && anchorPt) {
                animLine = new Line("black", anchorPt.x, anchorPt.y, pt.x, pt.y, 2);
                //graphSe.AddElement( animMe, animLine );
                graphSe.AddElement(graphMe, animLine);

                animLine.SetSettings();
            } else if (animLine) {
                animLine.AddEndPt(pt.x, pt.y, false);
                animLine.SetSettings();
            }
        } else if (drawCurveMode && theCurve) {
            theCurve.AddPoint(pt);
        }

        if (dragObj != null) {
            if (graphSe.mode == "designer" || dragObj.interactive) dragObj.DragMe(pt);
            //dragObj.DragMe( pt );
        }
    }
}

function IsAHit(aPt, type) {
    var aHit = false,
        iloc = -1;
    var i, gi;
    for (i = graphMe.length - 1; i >= 0 && !aHit; i--) {
        gi = graphMe[i];
        //if( type == undefined || gi instanceof type && !gi.acceptedArea && !(graphSe.mode=="student" && gi.mode=="correct"))
        if (type == undefined || gi instanceof type && !(graphSe.mode == "student" && gi.mode == "correct")) {
            aHit = gi.HitMe(aPt);
            iloc = i
        }
    }

    return aHit ? { loc: iloc, gi: gi, x: gi.x, y: gi.y } : null;
}


function TouchUp(e) {
    PosOff();

    pt4NewLine = true;
    mouseIsDown = false;
    if (animLine != null) {
        //SWG - 425
        if (drawLineMode && animLine.xe) {
            var newObj = animLine;

            DoPointer();
            ////SWG - 248 Changes
            var xStPt = graphSe.ConvertXgToXpx(newObj.sxsg);
            var yStPt = graphSe.ConvertYgToYpx(newObj.sysg);
            var xEdPt = graphSe.ConvertXgToXpx(newObj.sxeg);
            var yEdPt = graphSe.ConvertYgToYpx(newObj.syeg);

            var pointDistance = Math.sqrt(((xStPt - xEdPt) * (xStPt - xEdPt)) + ((yStPt - yEdPt) * (yStPt - yEdPt)));
            if (pointDistance < 25)
                UpdateLineDistanceToOneBlock(newObj);
            ////SWG - 248
        }
        //SWG - 425 End

        animLine = null;
        anchorPt = null;
        animMe = [];
        pt4NewLine = false;

    }

    var btn, evt = e ? e : event;
    if (evt.srcElement) btn = evt.srcElement.id;
    else if (evt.target) btn = evt.target.id;

    if (theCurve != null && theCurve.pts.length == 6) {
        //graphSe.AddElement( graphMe, theCurve );
        if (!theCurve.ghost) theCurve.GhostMe();
        //if( graphSe.mode == "student" ) theCurve.CheckIsCorrect( "drawing" );
        //if( graphSe.mode == "student" )
        //    { if( !theCurve.CheckIsCorrect( "drawing" ) ) theCurve.CheckIsIncorrect( "drawing" ); }
        if (graphSe.mode == "correct") theCurve.CorrectMe();
        else if (graphSe.mode.substring(0, 9) == "incorrect") theCurve.IncorrectMe();
        theCurve = null;
        animMe = [];
        DoPointer(); ////SWG-425
    } else if (theCurve != null && theCurve.pts.length > 6) {
        theCurve.MidPoint();

        ////SWG - 425 Changes Start
        for (var i = 2; i < theCurve.spts.length; i += 2) {

            var myCurvePointObj = {};
            myCurvePointObj.X = theCurve.pts[i];
            myCurvePointObj.Y = theCurve.pts[i + 1];
            myCurvePointObj.snapX = theCurve.spts[i];
            myCurvePointObj.snapY = theCurve.spts[i + 1];

            var pointPos = "start";
            if (i > 0)
                pointPos = i == 2 ? "mid" : "last";

            var stPtX = graphSe.ConvertXgToXpx(myCurvePointObj.X);
            var stPtY = graphSe.ConvertYgToYpx(myCurvePointObj.Y);
            var edPtX = graphSe.ConvertXgToXpx(theCurve.pts[i - 2]);
            var edPtY = graphSe.ConvertYgToYpx(theCurve.pts[i - 1]);

            var pointDistance = Math.sqrt(((stPtX - edPtX) * (stPtX - edPtX)) + ((stPtY - edPtY) * (stPtY - edPtY)));
            if (pointDistance < 25)
                myCurvePointObj = checkPointDifferance(myCurvePointObj, theCurve, pointPos);


            theCurve.pts[i] = myCurvePointObj.X;
            theCurve.pts[i + 1] = myCurvePointObj.Y;

            theCurve.spts[i] = graphSe.SnapX(myCurvePointObj.X);
            theCurve.spts[i + 1] = graphSe.SnapY(myCurvePointObj.Y);

        }
        var myCurvePointObj = {};
        myCurvePointObj.X = theCurve.pts[4];
        myCurvePointObj.Y = theCurve.pts[5];
        myCurvePointObj.snapX = theCurve.spts[4];
        myCurvePointObj.snapY = theCurve.spts[5];

        var stPtX = graphSe.ConvertXgToXpx(theCurve.pts[4]);
        var stPtY = graphSe.ConvertYgToYpx(theCurve.pts[5]);
        var edPtX = graphSe.ConvertXgToXpx(theCurve.pts[0]);
        var edPtY = graphSe.ConvertYgToYpx(theCurve.pts[1]);

        var pointDistance = Math.sqrt(((stPtX - edPtX) * (stPtX - edPtX)) + ((stPtY - edPtY) * (stPtY - edPtY)));
        if (pointDistance < 25)
            myCurvePointObj = checkPointDifferance(myCurvePointObj, theCurve, "end");

        theCurve.pts[4] = myCurvePointObj.X;
        theCurve.pts[5] = myCurvePointObj.Y;

        theCurve.spts[4] = graphSe.SnapX(myCurvePointObj.X);
        theCurve.spts[5] = graphSe.SnapY(myCurvePointObj.Y);
        graphMe[gmloc - 1] = theCurve;
        ////SWG - 425 Changes End

        if (graphSe.mode.substring(0, 9) == "incorrect") theCurve.IncorrectMe();
        else if (graphSe.mode == "correct") theCurve.CorrectMe();
        theCurve = null;
        animMe = [];
        DoPointer(); ////SWG-425
    }

    var pt = TouchXY(e);

    if (btn != "CanvasAnimate") return;

    if (drawPointMode) {
        newPt = new Point("black", pt.x, pt.y, 4);
        if (graphSe.mode == "correct") newPt.CorrectMe();
        if (graphSe.mode.substring(0, 9) == "incorrect") newPt.IncorrectMe();
        //if( graphSe.mode == "student" ) newPt.CheckIsCorrect( "drawing" );
        //if( graphSe.mode == "student" )
        //    { if( !newPt.CheckIsCorrect( "drawing" ) ) newPt.CheckIsIncorrect( "drawing" ); }
        graphSe.AddElement(graphMe, newPt);
        DoPointer();  ////SWG-425
    } else if (drawLineMode && pt4NewLine) {
        var hit = IsAHit(pt, Point)
        if (hit != null) pt = hit;

        if (newLine == null) {
            newLine = new Line("black", pt.x, pt.y);
            graphSe.AddElement(graphMe, newLine);
        } else {
            newLine.AddEndPt(pt.x, pt.y, true);
            newLine = null;
            ////SWG-245 Changes Start
            var newObj = graphMe[gmloc - 1];
            var xStPt = graphSe.ConvertXgToXpx(newObj.sxsg);
            var yStPt = graphSe.ConvertYgToYpx(newObj.sysg);
            var xEdPt = graphSe.ConvertXgToXpx(newObj.sxeg);
            var yEdPt = graphSe.ConvertYgToYpx(newObj.syeg);

            var pointDistance = Math.sqrt(((xStPt - xEdPt) * (xStPt - xEdPt)) + ((yStPt - yEdPt) * (yStPt - yEdPt)));
            if (pointDistance < 25)
                UpdateLineDistanceToOneBlock(graphMe[gmloc - 1]);

            DoPointer();
            ////SWG-425 Changes End
        }

    } else if (drawFillPolylineMode) {
        if (thePoly == null) {

            if (thePoly == null)
                thePoly = new Polyline("gray", 1, 1, graphSe.drawAcceptedArea != null);

            thePoly.AddPoint(pt);

            //graphSe.AddElement( animMe, thePoly );
            graphSe.AddElement(graphMe, thePoly);

        } else if (!thePoly.IsDone()) {
            thePoly.AddPoint(pt);

            //graphSe.AddElement( animMe, thePoly );
            //graphSe.AddElement( graphMe, thePoly );
        } else {
            thePoly.AddPoint(pt);

            //graphSe.AddElement( animMe, thePoly );
            //graphSe.AddElement( graphMe, thePoly );
        }
    }

    if (dragObj != null) {
        if (graphSe.mode == "designer" || dragObj.interactive) dragObj.DragMe(pt, "drop");
    }

    //ShowPosTouch();
}

function MouseXY(e) {
    //if (!e) var e = event; ////SWG-381

    canX = e.pageX - can.offsetLeft;
    canY = e.pageY - can.offsetTop;

    ShowPos();

    //console.log(can.offsetLeft, can.offsetTop);

    /*ctx2.fillStyle = "black";
    ctx2.font="14px sans-serif";
    ctx2.fillText("("+canX+", "+canY+")",canX,canY);
    ctx2.font="10px sans-serif"; */

    return { x: canX, y: canY }
}

function TouchXY(e) {
    if (!e) var e = event;
    e.preventDefault();

    if (e.targetTouches[0] == undefined) {
        canX = e.changedTouches[0].pageX - can.offsetLeft;
        canY = e.changedTouches[0].pageY - can.offsetTop;
    } else {
        canX = e.targetTouches[0].pageX - can.offsetLeft;
        canY = e.targetTouches[0].pageY - can.offsetTop;
    }

    ShowPos();

    return { x: canX, y: canY }
}

function ShowPos() {
    var yoffset = 35;
    var xoffset = 30;

    if (graphSe.snapIt) {
        var xg = graphSe.SnapX(graphSe.ConvertXpxToXg(drawFillPolylineMode == true ? canX + 4 : canX)).toFixed(1);//SWG-593 changes
        var yg = graphSe.SnapY(graphSe.ConvertYpxToYg(drawFillPolylineMode == true ? canY + 4 : canY)).toFixed(1);//SWG-593 changes
    } else {
        var xg = graphSe.ConvertXpxToXg(drawFillPolylineMode == true ? canX + 4 : canX).toFixed(1);//SWG-593 changes
        var yg = graphSe.ConvertYpxToYg(drawFillPolylineMode == true ? canY + 4 : canY).toFixed(1);//SWG-593 changes
    }
    //console.log(canX, canY);

    if (canY > 345) {
        yoffset = -5;
    } else {
        yoffset = 35;
    }

    if (canX > 315) {
        xoffset = -25;
    } else {
        xoffset = 30;
    }

    if (graphSe.value) {

        if (graphSe.showpos) {
            var ho, hn;
            ctx.font = "12pt sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            var str = "(" + xg + ", " + yg + ")";
            ctx.clearRect(0, 0, 1000, 1000);
            ctx.fillText(str, canX + xoffset, canY + yoffset);
        }

    } else if (graphSe.grid) {

        if (graphSe.showpos) {
            var ho, hn;
            ctx.font = "12pt sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            var str = "(" + xg + ", " + yg + ")";
            ctx.clearRect(0, 0, 1000, 1000);
            ctx.fillText(str, canX + xoffset, canY + yoffset);
        }

    } else if (graphSe.grid && graphSe.value) {

        if (graphSe.showpos) {
            var ho, hn;
            ctx.font = "12pt sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            var str = "(" + xg + ", " + yg + ")";
            ctx.clearRect(0, 0, 1000, 1000);
            ctx.fillText(str, canX + xoffset, canY + yoffset);
        }

    } else {
    }


}

//SWG-225 changes
function checkPointDifferance(currentPoint, thePoly, isLast) {
    var xIncVal, yIncVal;
    var xIndex = thePoly.pts.length - 2;
    if (isLast)
        xIndex = isLast == "start" ? 2 : (isLast == "mid" ? thePoly.pts.length - 2 : 0);
    var yIndex = xIndex + 1;
    var slope1;

    if (document.getElementById('xinc') != undefined) xIncVal = document.getElementById('xinc').value;
    if (document.getElementById('yinc') != undefined) yIncVal = document.getElementById('yinc').value;

    var xStartPt = (graphSe.snapIt) ? thePoly.spts[xIndex] : thePoly.pts[xIndex];
    var yStartPt = (graphSe.snapIt) ? thePoly.spts[yIndex] : thePoly.pts[yIndex];
    var xEndPt = (graphSe.snapIt) ? currentPoint.snapX : currentPoint.X;
    var yEndPt = (graphSe.snapIt) ? currentPoint.snapY : currentPoint.Y;

    //Calculate slope
    var dx = graphSe.ConvertXgToXpx(xEndPt) - graphSe.ConvertXgToXpx(xStartPt);

    // if (thePoly.what == "curve") { slope1 = Math.abs(dx) > .000001 ? -(graphSe.ConvertYgToYpx(yEndPt) - graphSe.ConvertYgToYpx(yStartPt)) / dx : Number.POSITIVE_INFINITY; }
    // else { slope1 = Math.abs(dx) > .000001 ? -(yStartPt - yEndPt) / dx : Number.POSITIVE_INFINITY; }

    slope1 = Math.abs(dx) > .000001 ? -(yStartPt - yEndPt) / dx : Number.POSITIVE_INFINITY;
    if (slope1 != undefined)
        slope1 = slope1.toFixed(2);
    //end

    var xStartPt1 = thePoly.pts[xIndex];
    var yStartPt1 = thePoly.pts[yIndex];
    var xEndPt1 = currentPoint.X;
    var yEndPt1 = currentPoint.Y;

    var xDiff = xEndPt - xStartPt;
    var yDiff = yEndPt - yStartPt;

    var xMin = $('#xmin').val();
    var yMin = $('#ymin').val();
    var xMax = $('#xmax').val();
    var yMax = $('#ymax').val();

    if (((xDiff < 0 ? xDiff * -1 : xDiff) < xIncVal && xDiff != 0) || ((yDiff < 0 ? yDiff * -1 : yDiff) < yIncVal && yDiff != 0) || (xStartPt == xEndPt && yStartPt == yEndPt)) {
        var slope = slope1 == "Infinity" ? slope1 : parseFloat(slope1);
        switch (true) {
            case slope == 0:
                xEndPt = (xDiff < 0) ? xStartPt - parseFloat(xIncVal) : xStartPt + parseFloat(xIncVal);
                xEndPt1 = (xDiff < 0) ? xStartPt1 - parseFloat(xIncVal) : xStartPt1 + parseFloat(xIncVal);
                if (xEndPt > xMax) {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                }
                if (xEndPt < xMin) {
                    xEndPt = xStartPt + parseFloat(xIncVal);
                    xEndPt1 = xStartPt1 + parseFloat(xIncVal);
                }
                break;
            case slope == "Infinity":
                yEndPt = (yDiff < 0) ? yStartPt - parseFloat(yIncVal) : yStartPt + parseFloat(yIncVal);
                yEndPt1 = (yDiff < 0) ? yStartPt1 - parseFloat(yIncVal) : yStartPt1 + parseFloat(yIncVal);
                if (yEndPt > yMax) {
                    yEndPt = yStartPt - parseFloat(yIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                }
                if (yEndPt < yMin) {
                    yEndPt = yStartPt + parseFloat(yIncVal);
                    yEndPt1 = yStartPt1 + parseFloat(yIncVal);
                }
                break;

            case (slope < 0) && (xStartPt < xEndPt && yStartPt > yEndPt):
                if (yEndPt <= yMin || xEndPt >= xMax) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt + parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 + parseFloat(yIncVal);

                } else if (xEndPt <= xMin || yEndPt >= yMax) {
                    xStartPt = xEndPt + parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 + parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);

                } else {
                    xEndPt = xStartPt + parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 + parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                }
                break;

            case (slope < 0) && (xStartPt > xEndPt && yStartPt < yEndPt):
                if (xEndPt <= xMin || yEndPt >= xMax) {
                    xStartPt = xEndPt + parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 + parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);

                } else if (yEndPt <= xMin || xEndPt >= yMax) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt + parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 + parseFloat(yIncVal);

                } else {

                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt + parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 + parseFloat(yIncVal);
                }
                break;

            case (slope > 0) && (xStartPt < xEndPt && yStartPt < yEndPt):
                if (yEndPt >= yMax || xEndPt <= xMin) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);
                }
                else if (xEndPt >= xMax || yEndPt <= yMin) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);
                }
                else {
                    xEndPt = xStartPt + parseFloat(xIncVal);
                    yEndPt = yStartPt + parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 + parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 + parseFloat(yIncVal);
                }
                break;
            case (slope > 0) && (xStartPt > xEndPt && yStartPt > yEndPt):
                if (xStartPt == xMax && yStartPt == yMax) {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                } else if (xEndPt == xMax || yEndPt == yMax) {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                } else {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                }
                break;
        }
        thePoly.pts[xIndex] = xStartPt1;
        thePoly.pts[yIndex] = yStartPt1;

        currentPoint.X = xEndPt1;
        currentPoint.Y = yEndPt1;

    }
    return currentPoint;
}
//SWG-225 changes end

var gridt = 1;

function DrawGrid() {
    var xs, ys, xe, ye;
    var clr, wd;
    var cht = 386,
        cwd = 386;
    paper.projects[0].activate();
    ctx2.clearRect(0, 0, can2.width, can2.height);

    for (var g = 0, xsp = 24; g < 17; g++) {
        if (gridt == 1) {
            if (g == 0) { } else {
                clr = "#e5e5e5";
                wd = 1
            }

            xs = g * xsp - 1; ////SWG-381
            ys = 0;
            xe = xs;
            ye = ys + cht;
            DrawLine(clr, wd, xs, ys, xe, ye);

            xs = 0;
            ys = cht - g * xsp - 1; ////SWG-381
            xe = cwd;
            ye = ys;
            DrawLine(clr, wd, xs, ys, xe, ye);

        }

        if (valuet == 1) {
            var tvx = graphSe.convertY(g);
            var tvy = graphSe.convertX(g);

            if (tvx % 1 != 0) {
                var textvaluex = tvx.toFixed(1);
            } else {
                var textvaluex = tvx;
            }

            if (tvy % 1 != 0) {
                var textvaluey = tvy.toFixed(1);
            } else {
                var textvaluey = tvy;
            }

            xs = 0;
            ys = cht - g * xsp - 2;
            xe = cwd;
            ye = ys;
            ctx2.textAlign = "right";
            ctx2.fillStyle = "black";//SWG_68
            ctx2.font = "11px";//SWG_68
            ctx2.fillText(textvaluex, xs + 35, ys + 22);
            //ctx2.fillText(ys+22,xs+35,ys+22);
            if (g == 16) {
                //document.getElementById('ymax').value = convertY(g);
                //graphSe.ymax = convertY(g);
            }

            xs = g * xsp + 2;
            ys = 0;
            xe = xs;
            ye = ys + cht;
            //SWG_68 changes start
            ctx2.textAlign = "left";
            //ctx2.fillText(xe+40,xe+40,ye+28);
            ctx2.fillStyle = "black";
            ctx2.save();
            ctx2.font = "12px";
            ctx2.translate(xe + 32, ye + 28);
            ctx2.rotate(45);
            ctx2.translate(-(xe + 32), -(ye + 28));
            if (graphSe.mode == 'student') {
                ctx2.fillText(textvaluey, xe + 32, ye + 26);
            }
            else {
                ctx2.fillText(textvaluey, xe + 32, ye + 28);
            }
            ctx2.restore();
            //SWG_68 changes end

            if (g == 16) {
                //document.getElementById('xmax').value = convertX(g);
                //graphSe.xmax = convertX(g);
                //console.log("max done");
            }
        }

    }

    if (gridt == 1) {
        //DrawLine( "#ECECEC", 1, 2, 1, cwd-2, 1 );
        //DrawLine( "#ECECEC", 1, cwd-1, cht, cwd-1, 0 );
        //DrawLine( "#5A5A5A", 3, cwd-1, cht, cwd-1, 0 );
    }

    DrawLine("#515151", 4, 0, cht, 0, 0);
    DrawLine("#515151", 2, 0, cht, cwd, cht);

}



function DrawLines(cxx, pts) {

    cxx.moveTo(pts[0] * wwr, pts[1] * whr);
    for (var i = 2, l = pts.length - 1; i < l; i += 2)
        cxx.lineTo(pts[i] * wwr, pts[i + 1] * whr);

    cxx.strokeStyle = this.crvColor;
    cxx.fillStyle = this.fillClr;
    cxx.lineWidth = this.crvWidth;
    //cxx.stroke( );
    cxx.moveTo(pts[0], pts[0]);
    cxx.fill();
}

function DrawLine(colr, w, xs, ys, xe, ye, dash) {
    var path = new paper.Path();
    path.strokeColor = colr;
    path.strokeWidth = w;
    if (dash != undefined) path.dashArray = dash;

    var start = new paper.Point(xs, ys);
    path.moveTo(start);
    var end = new paper.Point(xe, ye);
    path.lineTo(end);
    path.smooth();
    return path;
}

function DrawIt(thisMode) {
    var tf = true;

    //if( graphSe.mode.indexOf("correct") == -1 && graphSe.mode != "student" && graphSe.mode != thisMode
    //  || (thisMode.indexOf("correct") != -1 && graphSe.mode == "student" && graphSe.mode != thisMode) ) tf = false;

    switch (graphSe.mode) {
        case "designer":
            if (graphSe.mode != thisMode) tf = false;
            break;
        case "correct":
            if (graphSe.mode != thisMode && thisMode != "designer" || thisMode == "student") tf = false;
            break;
        case "incorrect0":
        case "incorrect1":
        case "incorrect2":
        case "incorrect3":
            //if( graphSe.mode != thisMode && thisMode != "designer" || thisMode == "student" ) tf = false;
            if (thisMode == "student" || (thisMode.substring(0, 9) == "incorrect" && thisMode[9] != graphSe.mode[9])) tf = false;
            break;
        case "student":
            if (graphSe.mode != thisMode && thisMode != "designer") tf = false;
            break;
    }

    return tf;
}

function AnimateGraph() {
    paper.projects[1].activate();
    paper.project.activeLayer.removeChildren();

    var nn = Number(graphSe.mode[9]);

    for (var i = 0, ln = animMe.length; i < ln && nn != 0; i++) {
        var ai = animMe[i];
        if (DrawIt(ai.mode)) ai.DrawMe();
    }

    DrawGraph(nn);
}

function DrawGraph(nn) {
    var can = document.getElementById("CanvasGraph");
    var ctx = can.getContext("2d");

    paper.projects[0].activate();
    paper.project.activeLayer.removeChildren();

    DrawGrid();

    for (var i = 0, ln = graphMe.length; i < ln && nn != 0; i++) {
        var gi = graphMe[i];
        if (DrawIt(gi.mode)) gi.DrawMe(ctx);
    }

}
//SWG - 200 Changes
function HideElementTypeDropdown() {
    if ($('#drawingtools .row .col-xs-6 .tool').first().text() == "Element Type") {
        $('#drawingtools .row .col-xs-6 .tool').first().addClass('hide');
    }
    $('#drawingtools #eldropdown').addClass('hide');
}

////SWG - 223 Changes Start
function UpdateLineDistanceToOneBlock(obj) {
    var xIncVal, yIncVal;
    if (document.getElementById('xinc') != undefined) xIncVal = document.getElementById('xinc').value;
    if (document.getElementById('yinc') != undefined) yIncVal = document.getElementById('yinc').value;

    var xStartPt = (graphSe.snapIt) ? obj.sxsg : obj.xsg;
    var yStartPt = (graphSe.snapIt) ? obj.sysg : obj.ysg;
    var xEndPt = (graphSe.snapIt) ? obj.sxeg : obj.xeg;
    var yEndPt = (graphSe.snapIt) ? obj.syeg : obj.yeg;

    var xStartPt1 = obj.xsg;
    var yStartPt1 = obj.ysg;
    var xEndPt1 = obj.xeg;
    var yEndPt1 = obj.yeg;

    var xDiff = xEndPt - xStartPt;
    var yDiff = yEndPt - yStartPt;

    var xMin = $('#xmin').val();
    var yMin = $('#ymin').val();
    var xMax = $('#xmax').val();
    var yMax = $('#ymax').val();

    if (((xDiff < 0 ? xDiff * -1 : xDiff) < xIncVal && xDiff != 0) || ((yDiff < 0 ? yDiff * -1 : yDiff) < yIncVal && yDiff != 0) || (xStartPt == xEndPt && yStartPt == yEndPt)) {
        var slope = obj.m == "Infinity" ? obj.m : parseFloat(obj.m);
        switch (true) {
            case slope == 0:
                xEndPt = (xDiff < 0) ? xStartPt - parseFloat(xIncVal) : xStartPt + parseFloat(xIncVal);
                xEndPt1 = (xDiff < 0) ? xStartPt1 - parseFloat(xIncVal) : xStartPt1 + parseFloat(xIncVal);
                if (xEndPt > xMax) {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                }
                if (xEndPt < xMin) {
                    xEndPt = xStartPt + parseFloat(xIncVal);
                    xEndPt1 = xStartPt1 + parseFloat(xIncVal);
                }
                break;
            case slope == "Infinity":
                yEndPt = (yDiff < 0) ? yStartPt - parseFloat(yIncVal) : yStartPt + parseFloat(yIncVal);
                yEndPt1 = (yDiff < 0) ? yStartPt1 - parseFloat(yIncVal) : yStartPt1 + parseFloat(yIncVal);
                if (yEndPt > yMax) {
                    yEndPt = yStartPt - parseFloat(yIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                }
                if (yEndPt < yMin) {
                    yEndPt = yStartPt + parseFloat(yIncVal);
                    yEndPt1 = yStartPt1 + parseFloat(yIncVal);
                }
                break;

            case (slope < 0) && (xStartPt < xEndPt && yStartPt > yEndPt):
                if (yEndPt <= yMin || xEndPt >= xMax) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt + parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 + parseFloat(yIncVal);

                } else if (xEndPt <= xMin || yEndPt >= yMax) {
                    xStartPt = xEndPt + parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 + parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);

                } else {
                    xEndPt = xStartPt + parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 + parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                }
                break;

            case (slope < 0) && (xStartPt > xEndPt && yStartPt < yEndPt):
                if (xEndPt <= xMin || yEndPt >= xMax) {
                    xStartPt = xEndPt + parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 + parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);

                } else if (yEndPt <= xMin || xEndPt >= yMax) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt + parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 + parseFloat(yIncVal);

                } else {

                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt + parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 + parseFloat(yIncVal);
                }
                break;

            case (slope > 0) && (xStartPt < xEndPt && yStartPt < yEndPt):
                if (yEndPt >= yMax || xEndPt <= xMin) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);
                }
                else if (xEndPt >= xMax || yEndPt <= yMin) {
                    xStartPt = xEndPt - parseFloat(xIncVal);
                    yStartPt = yEndPt - parseFloat(yIncVal);

                    xStartPt1 = xEndPt1 - parseFloat(xIncVal);
                    yStartPt1 = yEndPt1 - parseFloat(yIncVal);
                }
                else {
                    xEndPt = xStartPt + parseFloat(xIncVal);
                    yEndPt = yStartPt + parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 + parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 + parseFloat(yIncVal);
                }
                break;
            case (slope > 0) && (xStartPt > xEndPt && yStartPt > yEndPt):
                if (xStartPt == xMax && yStartPt == yMax) {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                } else if (xStartPt == xMax || yStartPt == yMax) {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                } else {
                    xEndPt = xStartPt - parseFloat(xIncVal);
                    yEndPt = yStartPt - parseFloat(yIncVal);

                    xEndPt1 = xStartPt1 - parseFloat(xIncVal);
                    yEndPt1 = yStartPt1 - parseFloat(yIncVal);
                }
                break;
        }
        graphMe[gmloc - 1].xsg = xStartPt1;
        graphMe[gmloc - 1].ysg = yStartPt1;

        graphMe[gmloc - 1].xeg = xEndPt1;
        graphMe[gmloc - 1].yeg = yEndPt1;

        graphMe[gmloc - 1].SnapMe();
        if (graphMe[gmloc - 1].correct.length > 0) {
            graphMe[gmloc - 1].correct[0].xsg = graphMe[gmloc - 1].xsg;
            graphMe[gmloc - 1].correct[0].ysg = graphMe[gmloc - 1].ysg;
            graphMe[gmloc - 1].correct[0].xeg = graphMe[gmloc - 1].xeg;
            graphMe[gmloc - 1].correct[0].yeg = graphMe[gmloc - 1].yeg;

            graphMe[gmloc - 1].correct[0].sxsg = graphMe[gmloc - 1].sxsg;
            graphMe[gmloc - 1].correct[0].sysg = graphMe[gmloc - 1].sysg;
            graphMe[gmloc - 1].correct[0].sxeg = graphMe[gmloc - 1].sxeg;
            graphMe[gmloc - 1].correct[0].syeg = graphMe[gmloc - 1].syeg;
        }

        for (var i = 1; i < graphMe[gmloc - 1].incorrect.length; i++) {
            if (graphMe[gmloc - 1].incorrect[i] != undefined) {
                graphMe[gmloc - 1].incorrect[i].xsg = graphMe[gmloc - 1].xsg;
                graphMe[gmloc - 1].incorrect[i].ysg = graphMe[gmloc - 1].ysg;
                graphMe[gmloc - 1].incorrect[i].xeg = graphMe[gmloc - 1].xeg;
                graphMe[gmloc - 1].incorrect[i].yeg = graphMe[gmloc - 1].yeg;

                graphMe[gmloc - 1].incorrect[i].sxsg = graphMe[gmloc - 1].sxsg;
                graphMe[gmloc - 1].incorrect[i].sysg = graphMe[gmloc - 1].sysg;
                graphMe[gmloc - 1].incorrect[i].sxeg = graphMe[gmloc - 1].sxeg;
                graphMe[gmloc - 1].incorrect[i].syeg = graphMe[gmloc - 1].syeg;
            }
        }

        graphMe[gmloc - 1].SetSettings();
    }
}
//// SWG - 223 Changes End
window.onload = Start;