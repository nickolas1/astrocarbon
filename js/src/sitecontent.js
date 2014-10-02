// hide scroll bar on android 
$(function() {
    if (navigator.userAgent.match(/Android/i)) {
        window.scrollTo(0,0); // reset in case prev not scrolled  
        var nPageH = $(document).height();
        var nViewH = window.outerHeight;
        if (nViewH > nPageH) {
        nViewH = nViewH / window.devicePixelRatio;
            $('BODY').css('height',nViewH + 'px');
        }
        window.scrollTo(1,0); // switched this from (0,1) to (1,0) to make it work for landscape
    }
});
// need this until chrome bug fixed
var altcrement = -1;
$(window).resize(function(){
    var currentFontSize = parseFloat($('html').css('font-size'));
    $('html').css('font-size', currentFontSize + (altcrement *= -1) + 'px');
});

// do we need to recalculate the costs
var globalretally;

/**************************/
// background images
// load the backgrounds all up with different z-heights: use some function to change opacity 
var lbexcess, //letterbox excess
    stepheight, //transition length for fading background images
    mapw, //width of map svg
    maph, //height of map svg
    mapscale, 
    uw; //width of a 1u div
var letterboxcalc = function() {
    lbexcess = Math.max(0, ($(window).height() - 0.5625 * $(window).width()) / 2); // that number is 9/16
    stepheight = 1.15*Math.max($(window).width()*0.5625, $(window).height() - 2*lbexcess); // that number is 16/9
    mapw = Math.floor($(window).width() * 10/12 * 0.9);
    maph = Math.floor(mapw * 0.42);
    mapscale = 105 * ($(window).width() / 900)
    uw = $(window).width() / 12;
};
letterboxcalc();
   

var backgroundScrollController = function( event ) {
    var fromTop = $(window).scrollTop(),
        frac = 0,
        transition = 0.1;
        frac = fromTop/stepheight;
    $("#background0").css("opacity", Math.max(1 - 4*(frac - 0.4), 0) );
    if(fromTop >= stepheight) {
        frac = (fromTop - stepheight+0.001)/stepheight;
        $("#background1").css("opacity", Math.max(1 - 4*(frac - 0.4), 0) );
    }
    if(fromTop >= 2*stepheight) {
        frac = (fromTop - 2*stepheight+0.001)/stepheight;
        $("#background2").css("opacity", Math.max(1 - 4*(frac - 0.4), 0) );
    }
    if(fromTop >= 3*stepheight) {
        frac = (fromTop - 3*stepheight+0.001)/stepheight;
        $("#background3").css("opacity", Math.max(1 - 4*(frac - 0.4), 0) );
    }
    if(fromTop >= 4*stepheight) {
        frac = (fromTop - 4*stepheight+0.001)/stepheight;
        $("#background4").css("opacity", Math.max(1 - 4*(frac - 0.4), 0) );
    }
};
$(window).scroll(backgroundScrollController);


/**************************/
// pulsing continue prompts
var pulseduration = 1700;
var pulse = function(element, duration, easing, props_to, props_from){
    if(element.attr("class") !== "continuebutton invisible") {
        element.animate(
            props_to,
            duration,
            easing,
            function() {
                pulse(element, duration, easing, props_from, props_to);
            }
        );
    } else {
        element.animate({opacity: 0}, duration/2, easing);
    };
};
$(function() {
    $(".continuebutton").each( function(i) {
        pulse($(this), pulseduration, "swing", {opacity: 0.3}, {opacity: 0.8});
    });
});


/**************************/
// set up some colors 
var mapBaseGrey = "rgb(93, 88, 86)",
    mapHoverOrange = "#ffac0d",
    mapSelectedOrange = "#ff8600",
    mapPulseWhite = "#ffdcbd",
    mapOceanBlue = "rgb(250, 250, 255)",
    textColor = "#302407";


/**************************/
// set up svg container for the map 
var svgMap = d3.select("#introWorldMap").append("svg")
    .attr("width", mapw)
    .attr("height", maph);
    
var worldmap = svgMap.append("g")
    .attr("width", mapw)
    .attr("height", maph);
    
var projection = d3.geo.bromley()
    .scale(mapscale)
    .translate([mapw / 2, maph / 2]);

var graticule = d3.geo.graticule();

var path = d3.geo.path()
    .projection(projection);

worldmap.append("path")
    .datum({type: "Sphere"})
    .attr("class", "globe")
    .attr("d", path);
    
worldmap.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);
    
/**************************/
// set up svg container for the selected region text    
var maptextw = mapw;
var maptexth = maph / 5.5;
var svgSelectedRegion = d3.select("#selectedRegionText").append("svg")
    .attr("width", maptextw)
    .attr("height", maptexth);

var selectionText = svgSelectedRegion.append("g")
    .attr("width", maptextw)
    .attr("height", maptexth)
  .append("text")
    .attr("x", 0.5 * maptextw)
    .attr("y", 0.6 * maptexth)
    .attr("class", "regiontitle")
    .attr("id", "regiontitle")
    .attr("text-anchor", "middle")
    .attr("fill", "rgb(240, 241, 245)")
    .attr("font-size", "20px")
    .text("");

var selectionSubText = svgSelectedRegion.append("g")
    .attr("width", maptextw)
    .attr("height", maptexth)
  .append("text")
    .attr("x", 0.5 * maptextw)
    .attr("y", 0.95 * maptexth)
    .attr("class", "regionsubtitle")
    .attr("id", "regionsubtitle")
    .attr("text-anchor", "middle")
    .attr("fill", "rgb(240, 241, 245)")
    .text("");

/**************************/
// read in region boundary json files and define their names indices etc. 
var regionNames = [
    {id:0, name:"africa"}, {id:1, name:"antarctica"}, {id:2, name:"asia"}, {id:3, name:"europe"}, {id:4, name:"hawaii"}, {id:5, name:"northernamericas"}, {id:6, name:"oceania"}, {id:7, name:"southamerica"}
    ];
var clicked = [false, false, false, false, false, false, false, false];
var regionTitles = ["Africa", "Antarctica", "Asia", "Europe", "Hawaii", "Northern Americas", "Oceania", "South America"];
var regionSubTitles = ["", "(awesome)", "(defined as AFC minus Australia)", "(defined as UEFA)", "", "(including Caribbean but not Hawaii)", "(defined as OFC plus Australia)",""];
var confFlight0, confFlight1, confFlight2, confFlight3, confFlight4, 
    confFlight5, confFlight6, confFlight7;
var confFlight = [0, 0, 0, 0, 0, 0, 0, 0]; //one counter for each potential inter-regional flight, plus one for regional flights
var obsFlight = [0, 0, 0, 0, 0, 0, 0, 0]; //one counter for each potential inter-regional flight, plus one for regional flights
var compPersonal = 0;
var compHPC = 0;   
            
/**************************/
// this function handles populating the conference travel panel 
var populateConferences = function() {
    var knobid, 
        knobparentid,
        knbotextid,
        regionalstring,
        i,
        confi = 0,
        confistring;
    for (i = 0; i < regionNames.length; i++) {
        confFlight[i] = 0;
        if (i == 1) continue; // don't allow conferences in antarctica
        if (!clicked[i]) {
            var setupknob = (function (index) {
                confistring = String(confi);
                knobid = "#confknob"+confistring;
                knobparentid = "#confknob"+confistring+"parent";
                knobtextid = "#confregion"+confistring;
                $(knobid).css("visibility", "visible");
                $(knobparentid).css("visibility", "visible");
                $(knobtextid).html(regionTitles[i]);
                $(knobid).knob({
                    "scroll": false,
                    "change": function (v) {
                                confFlight[index] = v;
                                globalretally = true;
                              }    
                });
                $(knobid)
                    .val(0)
                    .trigger('change');
            }) (confi);
            confi += 1; 
        }
        else {
            regionalstring = "within "+regionTitles[i];
        };
    };
    if (!clicked[1]){  //don't allow internal conference travel in antarctica
        confistring = String(confi);
        knobid = "#confknob"+confistring;
        knobparentid = "#confknob"+confistring+"parent";
        knobtextid = "#confregion"+confistring;
        $(knobid).css("visibility", "visible");
        $(knobparentid).css("visibility", "visible");
        $(knobtextid).html(regionalstring);
        $(knobid).knob({
            "scroll": false,
            "change": function (v) {
                            confFlight[confi] = v;
                            globalretally = true;
                        }   
        });
        $(knobid)
            .val(1)
            .trigger('change');
        confFlight[confi] = 1;
    } else {
        confi -= 1;
    } 
    
    for (i = confi+1; i < 8; i++) {  // hide extraneous knobs
        knobid = "#confknob"+String(i);
        knobparentid = "#confknob"+String(i)+"parent";
        $(knobid)
            .val(0)
            .trigger('change'); // set to 0 for future cost calculation purposes
        $(knobid).css("visibility", "hidden");
        $(knobparentid).css("visibility", "hidden");
    };
};



/**************************/
// this function handles populating the observations travel panel 
var populateObservations = function() {
    var knobid, 
        knobparentid,
        knbotextid,
        regionalstring,
        i,
        obsi = 0,
        obsistring;
    for (i = 0; i < regionNames.length; i++) {
        obsFlight[i] = 0;
        if (!clicked[i]) {
            var setupknob = (function (index) {
                obsistring = String(obsi);
                knobid = "#obsknob"+obsistring;
                knobparentid = "#obsknob"+obsistring+"parent";
                knobtextid = "#obsregion"+obsistring;
                $(knobid).css("visibility", "visible");
                $(knobparentid).css("visibility", "visible");
                $(knobtextid).html(regionTitles[i]);
                $(knobid).knob({
                    "scroll": false,
                    "change": function (v) {
                                obsFlight[index] = v;
                                globalretally = true;
                              }    
                });
                $(knobid)
                    .val(0)
                    .trigger('change');
            }) (obsi);
            obsi += 1; 
        }
        else {
            regionalstring = "within "+regionTitles[i];
        };
    };
    obsistring = String(obsi);
    knobid = "#obsknob"+obsistring;
    knobparentid = "#obsknob"+obsistring+"parent";
    knobtextid = "#obsregion"+obsistring;
    $(knobid).css("visibility", "visible");
    $(knobparentid).css("visibility", "visible");
    $(knobtextid).html(regionalstring);
    $(knobid).knob({
        "scroll": false,
        "change": function (v) {
                        obsFlight[obsi] = v;
                        globalretally = true;
                    }   
    });
    $(knobid)
        .val(0)
        .trigger('change');
    
    for (i = obsi+1; i < 8; i++) {  // hide extraneous knobs
        knobid = "#obsknob"+String(i);
        knobparentid = "#obsknob"+String(i)+"parent";
        $(knobid).css("visibility", "hidden");
        $(knobparentid).css("visibility", "hidden");
    };
};

/**************************/
// this bit handles populating the computer hours knobs
$("#compknob0").knob({
        "width": Math.floor(2.5*uw),
        "height": Math.floor(2.5*uw),
        "thickness": 0.15,
        "min": 0,
        "max": 24,
        "cursor": 15,
        "scroll": false,
        "change": function (v) {
                        compPersonal = v * 365; // convert daily to yearly total
                        globalretally = true;
                    }   
    });
    
$("#compknob1").knob({
        "width": Math.floor(2.5*uw),
        "height": Math.floor(2.5*uw),
        "thickness": 0.15,
        "min": 5,
        "max": 16,
        "cursor": 32,
        "scroll": false,
        "displayInput": false,
        "change": function (v) {
                        var compHPCstring = "0";
                        if (v < 6) {
                            compHPC = 0;
                        }
                        else {
                            var rawvalue = Math.pow(10, v/2)
                            compHPC = rawvalue.toPrecision(1);
                            compHPCstring = String(compHPC).charAt(0)+"x10<sup>"+String(compHPC).charAt(3)+"</sup>"
                        }
                        $("#fauxHPCval").html(compHPCstring);
                        globalretally = true;
                    }   
    });

// god this is ugly
var addFauxHPCval = function() {
    var a = parseInt($("#compknob1parent").css("width")) * 2.5/4; //width of dial compared to it's container div
    var b = parseInt($("#compknob1parent").css("width")) * 1.5/8; //remaining width / 2 (4 - 2.5)/4/4
    $("#fauxHPCval").css({
        "position": "absolute",
        "top": $("#compknob1parent").position().top,
        "left": $("#compknob1parent").position().left + b,
        "width": a,
        "height": a,
        "font-size": $("#compknob0").css("font-size"),
        "line-height": a+"px",
        "z-index": "-1"
    });
};

// set up placeholder dials at first
$(function() {
    populateConferences();
    populateObservations();
    setLetterboxes();
    addFauxHPCval();
    styleKnobs();
});

/**************************/
// this bit handles populating the map and attaching event listeners to highlight 
// the selected region.
var globalclicked = -1;
for (i = 0; i < regionNames.length; i++) {
    var makeRegion = (function (index) {
        d3.json("data/"+regionNames[i].name+".json", function(error, region) {
            var thisregion = worldmap.append("g");
            if(index === 4){ // make hawaii larger than it really is so that you can actually click it
                thisregion.selectAll(".countries")
                    .data(topojson.feature(region, region.objects.countries).features)
                  .enter().append("path")
                    .attr("class", "region "+regionNames[index].name)
                    .style("fill", mapBaseGrey)
                    .attr("d", path)
                    .attr("transform", function(d) {
                        var centroid = path.centroid(d),
                            x = centroid[0],
                            y = centroid[1];
                        return "translate(" + x + "," + y + ")"
                        + "scale(2)"
                        + "translate(" + -x + "," + -y + ")";
                    });
            } else {
                thisregion.selectAll(".countries")
                    .data(topojson.feature(region, region.objects.countries).features)
                  .enter().append("path")
                    .attr("class", "region "+regionNames[index].name)
                    .style("fill", mapBaseGrey)
                    .attr("d", path);
            };
            thisregion
              .on("mouseover", function(d) {
                if(!clicked[index]){
                    d3.selectAll("."+regionNames[index].name)
                        .transition()
                        .duration(150)
                        .style("fill", mapHoverOrange)
                }
              })
              .on("mouseout", function(d) {
                if(!clicked[index]){
                    d3.selectAll("."+regionNames[index].name)
                        .transition()
                        .duration(200)
                        .style("fill", mapBaseGrey)
                }
              })  
              .on("click", function(d) {
                d3.selectAll("."+regionNames[index].name)
                    .style("fill", mapHoverOrange)
                    .transition()
                    .duration(60)
                    .style("fill", mapPulseWhite)
                    .transition()
                    .delay(60)
                    .duration(180)
                    .style("fill", mapSelectedOrange)
                    .attr("class", regionNames[index].name+" selected");
                d3.select("#regiontitle")
                    .text(regionTitles[index])
                    .attr("opacity", "0")
                    .transition()
                    .duration(200)
                    .attr("opacity", "1");
                d3.select("#regionsubtitle")
                    .text(regionSubTitles[index])
                    .attr("opacity", "0")
                    .transition()
                    .delay(100)
                    .duration(200)
                    .attr("opacity", "1");
                $("#introDone").attr("class", "continuebutton");
                pulse($("#introDone"), pulseduration, "swing", {opacity: 0.8}, {opacity: 0.3});  
                clicked[index] = true;
                globalretally = true;
        
                if(globalclicked >= 0) { // unset whatever was chosen before
                    clicked[globalclicked] = !clicked[globalclicked];
                    d3.selectAll("."+regionNames[globalclicked].name)
                        .attr("class", "region "+regionNames[globalclicked].name)
                        .transition()
                        .duration(200)
                        .style("fill", mapBaseGrey);
                }
                
                if(globalclicked != index) { // this if else allows unclicking a selected region to work properly
                    globalclicked = regionNames[index].id;
                    populateConferences();
                    populateObservations();
                    addFauxHPCval();
                }
                else {
                    globalclicked = -1;
                    d3.select("#regiontitle")
                        .attr("opacity", "1")
                        .transition()
                        .duration(180)
                        .attr("opacity", "0");
                    d3.select("#regionsubtitle")
                        .attr("opacity", "1")
                        .transition()
                        .duration(180)
                        .attr("opacity", "0");
                   /* d3.select("#introDone")
                        .style("opacity", "0.7")
                        .transition()
                        .duration(100)
                        .style("opacity", "0");*/
                    $("#introDone").attr("class","continuebutton invisible");
                };
              });
        });
    }) (i); 
};


/**************************/
// this bit parses the flight results
var confFlightMatrix = [
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [00, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    obsFlightMatrix = [
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
var parseFlights = function() {
    var confFlightParsed = confFlight.slice(0),
        obsFlightParsed = obsFlight.slice(0);
    var i,
        j,
        confmax = 6,
        obsmax = 7,
        tokill;
    for (i = 0; i < regionNames.length; i++) { // in case a new country was selected, reset these costs
        for (j = i; j < regionNames.length; j++) {
            confFlightMatrix[i][j] = 0;
            obsFlightMatrix[i][j] = 0;
        };
    };
    if (globalclicked === 1) {
        confmax = 7; // this will be zero- internal conferences in antarctica are unlikely
    };
    console.log(confFlight)
    console.log(obsFlight)
    // insert antarctica into confFlightParsed
    if( globalclicked !== 1) confFlightParsed.splice(1, 0, 0); 
    confFlightParsed.splice(globalclicked, 0, confFlight[confmax]); // move internal flights into their place
    obsFlightParsed.splice(globalclicked, 0, obsFlight[obsmax]);
    console.log(confFlightParsed)
    console.log(obsFlightParsed)
    tokill = confmax+1;
    if( globalclicked > confmax ) {
        tokill = confmax;
    };
    confFlightParsed[obsmax+1] = 0;
    obsFlightParsed[obsmax+1] = 0; 
    console.log(confFlightParsed)
    console.log(obsFlightParsed)
    console.log(confFlightParsed)
    console.log(obsFlightParsed)
    for (i = 0; i <= obsmax; i++) {
        var ind0 = Math.min(Math.max(globalclicked,0), i),
            ind1 = Math.max(Math.max(globalclicked,0), i);
        console.log(ind0,ind1,i,confFlightParsed[i]);
        confFlightMatrix[ind0][ind1] = confFlightParsed[i];
        obsFlightMatrix[ind0][ind1] = obsFlightParsed[i];
    };
}
//["Africa", "Antarctica", "Asia", "Europe", "Hawaii", "Northern Americas", "Oceania", "South America"];

/**************************/
// this bit calculates the carbon tonnage for flights. values in tons of CO2
var flightCostMatrix = [
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [00, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
// calculated from these airports using http://www.travelnav.com/
// units are metric tons of co2            
flightCostMatrix[0][0] = 0.5; //intra Africa     JNB
flightCostMatrix[0][1] = 1.34; //Africa - Antarctica  'Antarctica'
flightCostMatrix[0][2] = 2.48; //Africa - Asia      PEK
flightCostMatrix[0][3] = 1.9; //Africa - Europe    AMS
flightCostMatrix[0][4] = 4.06; //Africa - Hawaii      HNL
flightCostMatrix[0][5] = 2.96; //Africa - N America     ORD
flightCostMatrix[0][6] = 2.34; //Africa - Oceania      SYD
flightCostMatrix[0][7] = 1.94; //Africa - S America      SCL

flightCostMatrix[1][1] = 0.1; //intra Antarctica
flightCostMatrix[1][2] = 3.06; //Antarctica - Asia
flightCostMatrix[1][3] = 3.18; //Antarctica - Europe
flightCostMatrix[1][4] = 2.76; //Antarctica - Hawaii
flightCostMatrix[1][5] = 3.12; //Antarctica - N America
flightCostMatrix[1][6] = 1.44; //Antarctica - Oceania
flightCostMatrix[1][7] = 1.34; //Antarctica - S America

flightCostMatrix[2][2] = 0.5; //intra Asia
flightCostMatrix[2][3] = 1.66; //Asia - Europe
flightCostMatrix[2][4] = 1.92; //Asia - Hawaii
flightCostMatrix[2][5] = 2.24; //Asia - N America
flightCostMatrix[2][6] = 1.88; //Asia - Oceania
flightCostMatrix[2][7] = 4.02; //Asia - S America

flightCostMatrix[3][3] = 0.5; //intra Europe
flightCostMatrix[3][4] = 2.46; //Europe - Hawaii
flightCostMatrix[3][5] = 1.4; //Europe - N America
flightCostMatrix[3][6] = 3.52; //Europe - Oceania
flightCostMatrix[3][7] = 2.54; //Europe - S America

flightCostMatrix[4][4] = 0.1; //intra Hawaii
flightCostMatrix[4][5] = 2.16; //Hawaii - N America
flightCostMatrix[4][6] = 1.92; //Hawaii - Oceania
flightCostMatrix[4][7] = 2.34; //Hawaii - S America

flightCostMatrix[5][5] = 0.5; //intra N America
flightCostMatrix[5][6] = 3.14; //N America - Oceania
flightCostMatrix[5][7] = 1.8; //N America - S America

flightCostMatrix[6][6] = 0.5; //intra Oceania
flightCostMatrix[6][7] = 2.4; //Oceania - S America

flightCostMatrix[7][7] = 0.5; //intra S America

var confFlightCost,
    obsFlightCost,
    compPersonalCost,
    compHPCCost;
    
var costFlights = function() {
    confFlightCost = 0;
    obsFlightCost = 0;
    var i,
        j;
    for (i = 0; i < regionNames.length; i++) {
        for (j = i; j < regionNames.length; j++) {
            confFlightCost += flightCostMatrix[i][j] * confFlightMatrix[i][j];
            obsFlightCost += flightCostMatrix[i][j] * obsFlightMatrix[i][j];
        };
    };
};


var costComputers = function() {
    // compPersonal is yearly hours of use
    // compHPC is yearly core hours 
    var compPeronsalWh,
        compHPCWh;
    // get kW for computers
    compPersonalWh = compPersonal * 60 / 1000.0; // assuming 60 Watts during use. doesn't really matter, this is negligible compared to flights
    compHPCWh = compHPC * 10.e9 / 750.e6 / 1000.0; // assuming 10 GFLOPS per core, 750 MFLOPS per Watt
    // assume 0.5 kg CO2 per kWh, convert to tons
    compPersonalCost = compPersonalWh * 0.5 / 1000.0;
    compHPCCost = compHPCWh * 0.5 / 1000.0;
    console.log(compHPCCost, compPersonalCost);
};



var setLetterboxes = function() {
    $(".letterbox").css("height", lbexcess);
    $(".backgroundimage").css("top", lbexcess);
    $("#topspacer").css("height", lbexcess);
    $("#bottomspacer").css("height", lbexcess);
    $(".frame").css("height", stepheight);
   // var creditheight = 
    $(".imagecredit").css("bottom", lbexcess +10);
};

// letterbox resize handling
var resizeEverything = function() {
    letterboxcalc();
    addFauxHPCval();
    setLetterboxes();
};
$(window).resize( resizeEverything );

var styleFlightKnobs = function() {
    $(".knoby.flight").trigger(
                    "configure",   
                        {
                        "width": Math.floor(1.5*uw),
                        "height": Math.floor(1.5*uw),
                        "thickness": 0.15,
                        "min": 0,
                        "max": 8,
                        "cursor": 32,
                        }
                    );
};

var styleKnobs = function() {
    $(".knoby").trigger(
                    "configure",   
                        {
                        "angleOffset": 18,
                        "angleArc": 324, 
                        "fgColor": "rgba(186, 70, 135, 1.0)",
                        "bgColor": "rgba(99, 49, 82, 0.5)",
                        "inputColor": "#302407",
                        "font": "Open Sans",
                        "fontWeight": 400
                        }
                    );
    styleFlightKnobs();
};


/**************************/
// plot the co2 usage. start out with just the world data, add user data later
var margin = {top: maph/6, right: 0, bottom: maph/15, left: maph/5},
    width = mapw - margin.left - margin.right,
    height = 1.1*maph - margin.top - margin.bottom;

$("#tally").css("height", height);  
    
var xscale = d3.scale.linear()
    .range([0, width]);
var yscale = d3.scale.linear()
    .range([height, 0]);
    
var line = d3.svg.line()
    .x(function(d) { return xscale(d.rank); })
    .y(function(d) { return yscale(d.co2); });
    
var co2plot = d3.select("#usagechart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "co2chartsvg");
    
var bisectRank = d3.bisector(function(d) { return d.rank; }).left,
    bisectTons = d3.bisector(function(d) { return -d.co2; }).left;

var formatCO2val = d3.format(",.2f"),
    formatCO2 = function(d) { return formatCO2val(d)+" tons";};

var worldCO2Data;
d3.csv("data/cdiac-2010-carbon-emission-ranking.csv", function(d) {
    return {
        rank: +d.rank,
        name: d.name,
        co2: +d.carbon*3.67
    };
},  function(error, data) {   
        worldCO2Data = data;  
        var maxrank = d3.max(data.map( function(d) { return d.rank })),
            minrank = d3.min(data.map( function(d) { return d.rank })),
            minco2 = d3.min(data.map( function(d) { return d.co2 })),
            maxco2 = d3.max(data.map( function(d) { return d.co2 }));
        
        xscale.domain([maxrank+2, minrank]);
        yscale.domain([0, maxco2+2]);            
});

var mydata
$("#tally").onScreen({
    doIn: function() {
        if(globalretally){
            // get the cost of the computers and flights
            parseFlights();
            costFlights();
            costComputers();
            globalretally = false;
            $("#co2chartsvg").empty();
            
            var compCost = compPersonalCost + compHPCCost,
                totalCost = compCost + confFlightCost + obsFlightCost;
            
            $("#compTallyVal").html(compCost.toString());   
            $("#obsTallyVal").html(obsFlightCost.toString());  
            $("#confTallyVal").html(confFlightCost.toString());  
            $("#totTallyVal").html(totalCost.toString());   
        
           // compCost = 1.3;
            //confFlightCost = 2.5;
            //obsFlightCost = 4.1;
           // totalCost = compCost + confFlightCost + obsFlightCost;
            mydata = [ //bisect by negative of cost here- data array is increasing in rank, decreasing in co2
                {rank: bisectTons(worldCO2Data, -compCost), co2: compCost, cl: "compCost", txt: "computing"},
                {rank: bisectTons(worldCO2Data, -obsFlightCost), co2: obsFlightCost, cl: "obsCost", txt: "observing"},
                {rank: bisectTons(worldCO2Data, -confFlightCost), co2: confFlightCost, cl: "confCost", txt: "conferences"},
                {rank: bisectTons(worldCO2Data, -totalCost), co2: totalCost, cl: "totalCost", txt: "total"}
            ];
            var mydatasort = function (sortfunc, field){
                return function(a, b){
                    return sortfunc(a[field], b[field]);
                };
            };
            mydata.sort(mydatasort(d3.ascending, "co2"));
        
            for (var i = 0; i < 4; i++) {
                $("#tallyText"+i.toString()).html(mydata[i].txt);
                $("#tallyVal"+i.toString()).html(mydata[i].co2.toPrecision(2));
                $("#tallyVal"+i.toString()).attr("class",mydata[i].cl);
            }
        
            maxrank = d3.max(worldCO2Data.map( function(d) { return d.rank }));
            minrank = Math.min(10, d3.min(mydata.map( function(d) { return d.rank })) - 2)
            maxco2 = Math.max(20, d3.max(mydata.map( function(d) { return d.co2 })) + 2)
            if(minrank < 5) {
                maxco2 = 40;
            };
            minco2 = d3.min(worldCO2Data.map( function(d) { return d.co2 }));
        
            xscale.domain([maxrank, minrank]);
            yscale.domain([0, maxco2]);
        
            co2plot.append("path")
                .datum(worldCO2Data)
                .attr("class", "co2line")
                .attr("d", line);
        
            var focus = co2plot.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("circle")
                .attr("r", 4.5)
                .attr("opacity", 0.5);

            focus.append("text")
                .attr("id", "co2text")
                .attr("x", 0)
                .attr("y",-20)
                .attr("font-weight",300)
                .attr("font-size", "0.9em")
                .attr("text-anchor","end");
            focus.append("text")
                .attr("id", "nametext")
                .attr("x", 0)
                .attr("y", -37)
                .attr("font-size", "1.1em")
                .attr("text-anchor","end");
          
            co2plot.selectAll("line.horizontalGrid").
            //data(spScale.ticks(4)).enter().append("line")
                data([0,5,10,20,40]).enter().append("line")
                .attr("class", "horizontalGrid")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", function(d){ return yscale(d);})
                .attr("y2", function(d){ return yscale(d);});   
            
            /*co2plot.selectAll(".myvals") 
                .data(mydata)
              .enter().append("rect")
                .attr("x", function(d, i) { return xscale(maxrank + 2+i); })
                .attr("y", function(d) { return yscale(d.co2); })
                .attr("class", "myvals")
                .attr("id", function(d) { return d.cl; })
                .attr("width", 2)
                .attr("height",function(d) { return(height - yscale(d.co2)); })
              .transition().delay( function(d, i) { return 700 + i * 100; } )
                .attr("x", function(d) { return(xscale(d.rank)); })
                .duration(function(d, i) { return 200 + i * 150; });*/
             co2plot.selectAll(".myvals") 
                .data(mydata)
              .enter().append("rect")
                .attr("x", function(d, i) { return xscale(maxrank + 2+i); })
                .attr("y", function(d) { return yscale(d.co2); })
                .attr("class", "myvals")
                .attr("id", function(d) { return d.cl; })
                .attr("width", 2)
                .attr("height",function(d) { return(height - yscale(d.co2)); })
              .transition().delay( function(d, i) { return 700 + i * 100; } )
                .attr("x", function(d) { return(xscale(d.rank)); })
                .duration(function(d, i) { return 200 + i * 150; }); 
          
          /*  co2plot.selectAll(".myvalslabel") 
                .data(mydata)  
              .enter().append("text")
                .attr("id", function(d) { return d.cl+"Text"; })
                .attr("class", "myvalslabel")
                .attr("x", function(d) { return xscale(d.rank); })
                .attr("y", function(d, i) { return yscale(-2.5 + 0.5*Math.pow(-1,i)); })
                .text( function(d) { return d.txt; } )*/
            
            co2plot.append("rect")
              .attr("class", "overlay")
              .attr("width", width)
              .attr("height", height)
              .on("mouseover", function() { focus.style("display", null); })
              .on("mouseout", function() { focus.style("display", "none"); })
              .on("mousemove", mousearound);    
        
            if(maxco2 > 23){ 
                co2plot.append("text")
                    .attr("x", 0)
                    .attr("y", yscale(40))
                    .attr("dy", -2)
                    .attr("class", "co2label")
                    .text("40 tons of CO2 / person / year");  
                co2plot.append("text")
                    .attr("x", 0)
                    .attr("y", yscale(20))
                    .attr("dy", -2)
                    .attr("class", "co2label")
                    .text("20 tons");
            } else {
                co2plot.append("text")
                    .attr("x", 0)
                    .attr("y", yscale(20))
                    .attr("dy", -2)
                    .attr("class", "co2label")
                    .text("20 tons of CO2 / person / year");
            };
            co2plot.append("text")
                .attr("x", 0)
                .attr("y", yscale(10))
                .attr("dy", -2)
                .attr("class", "co2label")
                .text("10 tons");
            co2plot.append("text")
                .attr("x", 0)
                .attr("y", yscale(5))
                .attr("dy", -2)
                .attr("class", "co2label")
                .text("5 tons");
           /* var negy = -maxco2/20;
            co2plot.append("text")
                .attr("x", xscale(10))
                .attr("y", yscale(negy))
                .attr("dy", -2)
                .attr("text-anchor", "end")
                .attr("class", "co2label")
                .text("world rank = 10");
            co2plot.append("text")
                .attr("x", xscale(200))
                .attr("y", yscale(negy))
                .attr("dy", -2)
                .attr("text-anchor", "end")
                .attr("class", "co2label")
                .text("world rank = 200");*/
        
            function mousearound() {
                var x0 = xscale.invert(d3.mouse(this)[0]),
                    i = bisectRank(worldCO2Data, x0, d3.min(worldCO2Data.map( function(d) { return d.rank })), d3.max(worldCO2Data.map( function(d) { return d.rank }))),
                    d0 = worldCO2Data[i - 1],
                    d1 = worldCO2Data[i],
                    d = x0 - d0.rank > d1.rank - x0 ? d1 : d0;
                focus.attr("transform", "translate(" + xscale(d.rank) + "," + yscale(d.co2) + ")");
                focus.select("#co2text").text(formatCO2(d.co2));
                focus.select("#nametext").text(d.name);
            
            }
        }
    },
    /*doOut: function() {
        $("#co2chartsvg").empty();
    },*/
    tolerance: Math.floor(0.8*$(window).height()-lbexcess)
});