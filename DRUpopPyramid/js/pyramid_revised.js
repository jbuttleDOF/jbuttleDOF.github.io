$(document).ready(function (){

document.body.onload = function() {
	hookEvent('slider','mousewheel',MouseWheel);
	hookEvent('slider2','mousewheel',MouseWheel2);
};

//
// LAYOUT
//

var margin = {top: 13, right: 0, bottom: 35, left: 20},
	centerPadding = 30,
	//width = 340 - margin.left - margin.right,
	//width = (window.innerWidth / 4) - 25 - margin.left - margin.right,
	width = ($(".left").width() / 2) - 25 - margin.left - margin.right,
	//height = 670 - margin.top - margin.bottom,
	height = $(".left").height() * .8//- margin.top - margin.bottom - 30,
	barHeight = Math.floor(height / 21); // 21 age bands

console.log("width: ", width);
console.log("height: ", height)
console.log("id height: ", $(".left").height())
console.log("barHeight: ", barHeight)

// set with viz holder to half of the page

var	geo = 1;

	datacsv=[];
    data1=[];
	data=[];
	dataAll=[];
	
var	year1=2070,
	age1=100,
	//year=bsyear=2010,
	year0=1970,
	bsyear=2020, // bsyear=2010,
	year=2025, // year=2020,

	clickBirthYear = 0,
	nrXticks = 7,
	nrYticks = 5,
	/*tmpFcolor = "#906",
	tmpFcolor = "rgb(123,176,218)", */
	tmpFcolor = "rgb(73,147,181)",
	tmpMcolor = "#369",
	ageLimits = [20,65],
	//highlight = "#fc3"
	highlight = "rgba(225,236,247,1)"
	;

var locale = d3.locale({
	decimal: ".",
	thousands: ",",
	grouping: [3],
	currency: ["£", ""],
	dateTime: "%a %e %b %X %Y",
	date: "%d/%m/%Y",
	time: "%H:%M:%S",
	periods: ["AM", "PM"],
	days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

/* numberformats */
var mill = locale.numberFormat(","); // .1f
var perc = locale.numberFormat("%");
var thsd = locale.numberFormat("n");
var full = d3.format(".1f");

// Mousewheel Scrolling thanks to
// http://blog.paranoidferret.com/index.php/2007/10/31/javascript-tutorial-the-scroll-wheel/

function hookEvent(element, eventName, callback)
{
  if(typeof(element) == "string")
    element = document.getElementById(element);
  if(element == null)
    return;
  if(element.addEventListener)
  {
    if(eventName == 'mousewheel')
    {
      element.addEventListener('DOMMouseScroll', 
        callback, false);  
    }
    element.addEventListener(eventName, callback, false);
  }
  else if(element.attachEvent)
    element.attachEvent("on" + eventName, callback);
}

function MouseWheel(e)
{
  e.preventDefault();
  e.stopPropagation();
  e = e ? e : window.event;
  var wheelData = e.detail ? e.detail * -1 : e.wheelDelta;
  wheelData > 0 ? year = Math.max(year0, year - 1) : year = Math.min(year1, year + 1);
  scrollPyramid(year);
}

function MouseWheel2(e)
{
  e.preventDefault();
  e.stopPropagation();
  e = e ? e : window.event;
  var wheelData = e.detail ? e.detail * -1 : e.wheelDelta;
  wheelData > 0 ? bsyear = Math.max(year0, bsyear - 1) : bsyear = Math.min(year1, bsyear + 1);
  scrollPyramid2(bsyear);
}

var yearSlider = d3.slider().value(year).orientation("vertical")
				.min(year0).max(year1).step(1)
				.axis( d3.svg.axis().orient("right") 
					.tickValues([1970,1975,1980,1985,1990,1995,2000,2005,2010,2015,2020,2025,2030,2035,2040,2045,2050,2055,2060,2065,2070])
					.tickPadding(10) 
					.tickFormat(d3.format("")) 
					)
				.on("slide", function(evt, value) {
					evt.stopPropagation();
					scrollPyramid(value);
    			});

d3.select('#sliderHolder').call(yearSlider); 

var yearSlider2 = d3.slider().value(bsyear).orientation("vertical")
				.min(year0).max(year1).step(1)
				.axis( d3.svg.axis().orient("right") 
					.tickValues([1970,1975,1980,1985,1990,1995,2000,2005,2010,2015,2020,2025,2030,2035,2040,2045,2050,2055,2060,2065,2070])
					.tickPadding(10) 
					.tickFormat(d3.format("")) 
					)
				.on("slide", function(evt, value2) {
					evt.stopPropagation();
					scrollPyramid2(value2);
					//console.log(value);
    			});

d3.select('#sliderHolder2').call(yearSlider2);

d3.select("#tAge")
.style("width", "64px");
d3.select("#tMill")
.style("width", "70px");
d3.select("#tRatio")
.style("width", "70px");

d3.select("#txLow").text("<"+ageLimits[0]);
d3.select("#txMed").text(ageLimits[0]+"–"+(ageLimits[1]-1));
d3.select("#txUp").text(ageLimits[1]+"+");
	
var x = d3.scale.linear()
		.range([width, 0]),

	w = d3.scale.linear()
		.range([0,width]),
	
	y = d3.scale.linear()
		.range([barHeight / 2, height - barHeight / 2]);

	
	// y scale for path outline
var yy = d3.scale.linear()
	.range([-barHeight,-height])
	.domain([0,age1]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(4)
	.tickSize(-height)
	.tickPadding(7)
		.tickFormat(function(d) {
			if (d < 1000) { return d; }
			/* else if (d > 999 & d < 10000) { return (d/1e3).toFixed(1) + "K";}
			else if (d > 9999 & d < 1000000) { return Math.round(d/1e3) + "K"; }
			else if (d > 999999) { return (d/1e3).toLocaleString() + "K"; }	*/
			else if (d > 999) { return d3.format(".2s")(d) ; }
		});

var wAxis = d3.svg.axis()
	.scale(w)
	.orient("bottom")
	.ticks(4)
	.tickSize(-height)
	.tickPadding(7)
		.tickFormat(function(d) {
			if (d < 1000) { return d; }
			else if (d > 999) { return d3.format(".2s")(d) ; }
		});

var svg = d3.select("#pyr_holder").append("svg")
	.attr("width", (width + margin.left + margin.right)*2+centerPadding)
	.attr("height", height + margin.top + margin.bottom + 10)
	.attr("id", "popPyr")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		var svg2 = d3.select("#box").append("svg").attr("width", 25).attr("height", 25);

svg2.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		//.attr("dy","100%")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("stroke", "none")
		.attr("fill", tmpFcolor);

var svg3 = d3.select("#box2").append("svg").attr("width", 25).attr("height",25);

svg3.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("width","100%")
		.attr("height", "100%")
		.attr("stroke-width", 4)
		.attr("stroke", "black")
		.attr("fill","none");

var birthyears = svg.append("g")
			.attr("class", "birthyears");

var baseyears = svg.append("g")
			.attr("class", "baseyears");


var dsv = d3.dsv(",","text/plain");

dsv("/data/caprojdata5yr_1970-2070.csv", function(csv){

	csv1 = csv;

	datacsv = d3.nest()
	  .key(function(d) {return d.fips;})
	  .key(function(d) {return d.year;})
	  .key(function(d) {return d.sex;})
	  .map(csv); console.log(datacsv);

	for (i=year0; i<2071; i++) {
		for (j=0; j<101; j+=5){
			data1.push({year: +i, age: +j, mw: "1", people: +datacsv[geo][i]["m"][0]["age"+j+(j+4)]});
		    data1.push({year: +i, age: +j, mw: "2", people: +datacsv[geo][i]["w"][0]["age"+j+(j+4)]});
		}
	}

	//console.log(JSON.stringify(yrTotals));

	// UPDATE THE SCALE DOMAINS
	var maxPeople = d3.max(data1, function(d) {return d.people}); console.log(maxPeople);
	x.domain([0, maxPeople]);
	w.domain([0, maxPeople]);
	y.domain([year1-age1,year1]);

	data = d3.nest()
		.key(function(d) {return d.year; })
		.key(function(d) {return d.year - d.age})
		.rollup(function(v) {return v.map(function(d) {return d.people; }); })
		.map(data1);

	//console.log(data);
		
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")		
		.style("font-family", "sans-serif")
		.call(xAxis)
		/*.append("text")
		.attr("x",width/1.75)
		.attr("y", 35)
		.attr("class", "xAxisLabel")
		.attr("font-size","12pt")
		.text("Male")*/;

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.append("text")
		.attr("text-anchor","middle")
		.attr("x", width/2)
		.attr("y", 35)
		.attr("class", "xAxisLabel")
		.attr("font-size","12pt")
		.attr("font-weight", "bold")		
		.style("font-family", "sans-serif")
		.attr("fill", "darkslategray")
		.text("Male")
	
	svg.append("g")
		.attr("class", "w axis")
		.attr("transform", "translate(" + (width+centerPadding)+","+ height + ")")		
		.style("font-family", "sans-serif")
		.call(wAxis)
		/*.append("text")
		.attr("x",120)
		.attr("y", 35)
		.attr("class", "xAxisLabel")
		.attr("font-size","12pt")
		.text("Female")*/;

	svg.append("g")
		.attr("transform", "translate(" + (width+centerPadding)+","+ height + ")")
		.append("text")
		.attr("x",width/2)
		.attr("y", 35)
		.attr("text-anchor", "middle")
		.attr("class", "xAxisLabel")
		.attr("font-size","12pt")		
		.attr("font-weight", "bold")		
		.style("font-family", "sans-serif")
		.attr("fill", "darkslategray")
		.text("Female");

	birthyears.attr("transform", "translate(0," + (y(year1) - y(year)) + ")");

	birthyear = birthyears.selectAll(".birthyear")
		.data(d3.range(year0 - age1, year1 + 1, 1))	// 1yr agebands for every year (1911,2071,1)
	  .enter().append("g")
		.attr("class", function(birthyear) { return birthyear==clickBirthYear ? "clickBirthYear" : "birthyear" }) // in case highlight birthyears was invoked by URL
		.attr("transform", function(birthyear) { return "translate(0," + y(birthyear) + ")"; })
		.on("mouseover", function(d) { 
			if (clickBirthYear==0) {
				d3.select(this).select("text").style("opacity", 0)
				// no highlight of the symmetry
				d3.select(this).select(".males").style("fill", highlight)
				d3.select(this).select(".females").style("fill", highlight)
				d3.select(this).append("text")
					.attr("class", "hoverBirthYear")
					.attr("x", width-10)
					.attr("y", -1)
					.attr("text-anchor", "end")
					//.text("Year of birth: "+d);
					.text("Year of birth: "+d)
				d3.select(this).append('text')
					.attr("class", "hoverBirthYear")
					.attr("x", width-10)
					.attr("y", -1)
					.attr("dy", "1em")
					.attr("text-anchor", "end")
					//.text("Year of birth: "+d);
					.text(thsd(Math.round(data[year][d][0]))+" men")
				d3.select(this).append("text")
					.attr("class", "hoverBirthYear hoverTotals")
					.attr("x", width+centerPadding+10)
					.attr("y", -1)
					.attr("dy", "1em")
					.attr("text-anchor", "start")				
					.text("Men "+thsd(data[year][d][0]))
					.text(thsd(Math.round(data[year][d][1]))+" women")
				d3.select(this).append("text")
					.attr("class", "hoverBirthYear hoverTotals")
					.attr("x", width+centerPadding+10)
					.attr("y", -1)
					.attr("text-anchor", "start")
					.text(thsd(Math.round(data[year][d][0]+data[year][d][1]))+" persons");
			}
		})
		.on("mouseout", function(d, i) { 
			if (clickBirthYear==0) { 	
				d3.select(this).select(".males").style("fill", tmpFcolor);
				d3.select(this).select(".females").style("fill", tmpFcolor);
				d3.select(this).select("text").style("opacity", 1);
				d3.select(this).selectAll(".hoverBirthYear").remove(); 
			}
		});
	// console.log("birthyear: ",birthyear[0][77]);
	
	birthyear.selectAll("rect")
		.data(function(birthyear) { 
				var mf = !data[year][birthyear] ? [0, 0] : data[year][birthyear]; 
			 	//console.log(mf);
				//var sym = d3.min(mf); 
				return [mf[0], mf[1]]; // , sym, sym];	// pyramid and symmetry
		})
	   .enter().append("rect")
		 .attr("y", -barHeight / 2)
		 .attr("height", barHeight)
		 .attr("x", function(d, i){ return i % 2 ? width+centerPadding : x(d)})
		 .attr("width", function(d, i){ return i % 2 ? w(d) : width - x(d)})
		 .attr("class", function(d, i){
				 if (i==0) {return "males"}
				 if (i==1) {return "females"}
				 if (i>1) {return "symmetry"}
		 })
		 .style("fill", function(d, i){		// in case initial year is in the past
				 if (i==0) {return tmpFcolor}
				 if (i==1) {return tmpFcolor}
				 // if (i==1) {return tmpFcolor}
		 })
		 ;//.style("fill-opacity", "0.5"); 

	baseyears.attr("transform", "translate(0," + (y(year1) - y(year)) + ")");

	  // Add overlay for gender contrast
	baseyear = baseyears.selectAll(".baseyear")
      .data(d3.range(year0 - age1, year1 + 1, 1))
    .enter().append("g")
      .attr("class", "baseyear" ) // "baseyear"
	  .attr("transform", function(baseyear) { return "translate(0," + y(baseyear) + ")"; }); // "+(width+centerPadding)+"
	//console.log("baseyear: ",data[2010][baseyear])
	
   	baseyear.selectAll("rect")
      .data(function(baseyear) { 
			var mf = !data[bsyear][baseyear-(year-bsyear)] ? [0, 0] : data[bsyear][baseyear-(year-bsyear)]; 
			//var mf = !data[bsyear][baseyear] ? [0, 0] : data[bsyear][baseyear]; 
			//console.log(mf);
			return [mf[0], mf[1]] })
	.enter().append("rect")	
	  .attr("y", -barHeight / 2)
	  .attr("x", function(d, i){ return i % 2 ? width+centerPadding : x(d)}) // 330, x(d)
	  .attr("width", function(d,i) { return i % 2 ? w(d) : width- x(d); })
	  .attr("height", barHeight)
	  .attr("class", function(d, i){
      		if (i==0) {return "males"}
      		if (i==1) {return "females"}
      		if (i>1) {return "symmetry"}
			})	  
	  .style("fill", "none")
	  .style("stroke", "black")
	  .style("stroke-width", "1"); // width - x(value) return x(d);
	  	  
	// Add labels to show age (separate; not animated).
	svg.selectAll(".age")
		.data(d3.range(0, age1 + 2, nrYticks))	// 5year label up to 100 (+2 ?)
      .enter().append("text")
		.attr("class", "age")
		.attr("y", function(age) { return y(year1 - age); }) // may be an issue with the original: year1 instead of year
		.attr("x", width + centerPadding/2)
		.attr("dy", ".3em")
		.style("font-family", "sans-serif")
		.text(function(age) { return age; });


	// LABELS FOR CURRENT YEAR AND SUBTITLE
	/*svg.append("text")
		.attr("class", "subtitle")
		.attr("x", 60)
		.attr("y", 25)
		.text("Age Structure") */

	//GEO TEXT SIZE BASED ON WINDOW SIZE
	if( $(window).width() < 1025 ) { // 600
			tSize = '15px';			
		} else if( $(window).width() > 1024 ) { // 599
			tSize = '20px';
		}
	//RECTANGLE AND YEAR TEXT PLACEMENT BASED ON WINDOW SIZE
	if( $(window).width() < 500 ) { // 425
			xPlc1 = 5;
			yPlc1 = 0; // 20
			xPlc2 = 5;
			yPlc2 = 30;
			xTxt1 = 30;
			yTxt1 = 15; // 35
			xTxt2 = 60;
			yTxt2 = 45;
			bxsize = 20;
			ytgeo = 15; //25
			xtgeo = width+centerPadding+10;
		} else if( ($(window).width() > 499) & ($(window).width() < 800)) { // 424 800
			xPlc1 = 20;
			yPlc1 = 15;
			xPlc2 = 20;
			yPlc2 = 55; // 85
			xTxt1 = 55; // 75
			yTxt1 = 35; // 60
			xTxt2 = 75;
			yTxt2 = 75; //110
			bxsize = 30;
			ytgeo = 35;
			xtgeo = width+centerPadding+20;
		} else if( $(window).width() > 799){
			xPlc1 = 50-20;
			yPlc1 = 40-30;
			xPlc2 = 50+80;
			yPlc2 = 45;
			xTxt1 = 105-40;
			yTxt1 = 65-30;
			xTxt2 = 105+60;
			yTxt2 = 70;
			bxsize = 30;
			ytgeo = 35; // 35
			xtgeo = width+centerPadding+20;
		}

	svg.append("rect")
		.attr("class", "agestruc")
		.attr("x", xPlc1)
		.attr("y", yPlc1)
		.attr("height", bxsize)
		.attr("width", bxsize)
		.style("fill", tmpFcolor)
		;//.style("fill-opacity", 0.5);

	title = svg.append("text")
		.attr("class","title")
		.attr("x", xTxt1)
		.attr("y", yTxt1)
		.style("font-size", tSize )
		.style("font-family", "sans-serif")
		.text(year); 

	/*svg.append("text")
		.attr("class", "subtitle")
		.attr("x", 60)
		.attr("y", 100)
		.text("Base Year") */

	svg.append("rect")
		.attr("class", "bsyr")
		.attr("x", xPlc1)
		.attr("y", yPlc2) // yPlc2
		.attr("height", bxsize)
		.attr("width", bxsize)
		.style("fill", "none")
		.style("stroke", "black")
		.style("stroke-width", "1");
		//.style("fill-opacity", 0.5);

	byTitle = svg.append("text")
		.attr("class","title")
		.attr("x", xTxt1)
		.attr("y", yTxt2) // yTxt2
		.style("font-size", tSize)		
		.style("font-family", "sans-serif")
		.text(bsyear); 

	if($(window).width() < 1025 ) { // 600
		gsize = '15px';
	} else if($(window).width() > 1024 ) { // 599
		gsize = '20px';
	};

	geo_title = svg.append("text")
		.attr("class","geoTitle")
		.attr("transform", "translate(" + (xtgeo)+","+ (ytgeo) + ")") // height * 0.10
		.attr("x", width / 2 + 20)
		.attr("text-anchor","middle")
		//.attr("x", (width+5)*(3/2))
		.attr("y", 0)
		.style("font-size", gsize)
		.style('font-family', 'sans-serif')
		.text('California');

	geo_cnty = svg.append("text")
		.attr("class","geoTitle")
		.attr("transform", "translate(" + (xtgeo)+","+ (ytgeo) + ")") // height * 0.10
		.attr("x", width / 2 + 20)
		.attr("text-anchor","middle")
		.attr("y", 0)
		.attr("dy", "1em")
		/*.style("font-weight","bold")
		.style("font-size","20px") */
		.style("font-size", gsize)
		.style('font-family', 'sans-serif')
		.text('');

	/*svg.append("text")
		.attr("class","instrc")
		.attr("x", (width-10)*(3/2))
		.attr("y", 55)
		.attr("dy", "1em")
		.html('to display population counts');

	svg.append("text")
		.attr("class","instrc")
		.attr("x", (width-10)*(3/2))
		.attr("y", 55)
		.attr("dy", "2em")
		.html('for that age group.'); */
	
	calcAgegroups();

	
	/********************************************************************************* 
	 * MAP *
	*********************************************************************************/

	colors = d3.scale.threshold()
		//.domain([-.58, .05, .47, .74])
		.domain([-.5, 0, .5, 1.0])
		.range(['#d7191c','#fdae61','#ffffbf','#abd9e9','#2c7bb6']);

	legendColors = ['#d7191c','#fdae61','#ffffbf','#abd9e9']; // ,'#2c7bb6'
	legendText = ['','-0.5%','0%','0.5%']; // ,'1%'

	var csvFilter = csv.filter(function(d) {return (d.year == '2010' || d.year == '2070'); })

	yrTotals = d3.nest()
		.key(function(d) { return d.fips; })
		.key(function(d) { return d.year; })
		.rollup (function(v) { return {
			total: d3.sum(v, function(d) {return d.All; })
		}; }).map(csvFilter);

	pctChg=[];
	for (i=6001; i<=6115; i+=2){
		pctChg.push({geo: i, pctchg: (Math.pow(+yrTotals[i][2070]["total"] / +yrTotals[i][2010]["total"], 1/50) - 1) * 100 })
	};

	csvFilter2 = csv.filter(function(d) {return (d.year >= 2010 & d.year <=2070)});

	allTotals = d3.nest()
		.key(function(d) {return d.fips;})
		.key(function(d) {return d.year;})
		.rollup(function(v) { return {
			total:d3.sum(v, function(d) {return d.All; })
		}; }).map(csvFilter2);

	allChg=[];
	for (i=6001; i<=6115; i+=2) {
		for (j=2021; j<2071; j++) {    // for (j=2011; j<2071; j++) {
			// console.log(allTotals[i][j],i,j)
			allChg.push({geo:i, year:j, chg:((+allTotals[i][j]["total"] / +allTotals[i][j-1]["total"]) - 1) * 100 })
		}
	}

	allChgCA = [];
	for (j=2021; j<2071; j++) {  
		// console.log(allTotals[i][j],i,j)
		allChgCA.push({geo:1, year:j, chg:((+allTotals[1][j]["total"] / +allTotals[1][j-1]["total"]) - 1) * 100 })
	}

	avgChg = d3.nest()
		.key(function(d) { return d.geo; })
		.rollup(function(v) {return {
			pctAll: d3.mean(v, function(d) { return d.chg; })
		}; }).map(allChg);
	console.log(avgChg)

	avgChgCA = d3.nest()
		.key(function(d) {return d.geo;})
		.rollup(function(v) {return {
			pctAllCA: d3.mean(v, function(d) { return d.chg; })
		}; }).map(allChgCA);
	console.log("avgChgCA: ", avgChgCA)

	var jwidth = $("#map").width(),// - margin.left - margin.right,
	jheight = $("#map").height(); //$(".r-right").height() - margin.top - margin.bottom;

	console.log("jwidth ",jwidth, " jheight ",jheight);

	svgj = d3.select("#map").append("svg")
			.attr("width", jwidth)
			.attr("height", jheight)
			.append("g")
			.attr("transform", "translate(" + (0) + ",0)"); 

	if( $('#map').width() > 299) 
		{
			svgj.append("text")
				.attr("x", jwidth * 0.72)
				.attr("y", jheight/13)
				.style("text-anchor", "middle")
				/*.style("font-weight", "bold")
				.style("font-size", "11px")*/
				.text("Average Annual Percent")

			svgj.append("text")
				.attr("x", jwidth * 0.72)
				.attr("y", jheight/13)
				.attr("dy", "1.2em")
				.style("text-anchor", "middle")
				/*.style("font-weight", "bold")
				.style("font-size", "11px")*/
				.text("Change, Population by County")

			svgj.append("text")
				.attr("x", jwidth * 0.72)
				.attr("y", jheight/13) // .attr("y", jheight/8) all three lines
				.attr("dy", "2.4em")
				.style("text-anchor", "middle")
				/*.style("font-weight", "bold")
				.style("font-size", "11px")*/
				.text("for the Years 2020 to 2070")
		} 
	else if( $('#map').width() < 300 )
		{
			svgj.append("text")
				.attr("x", jwidth * 0.72)
				.attr("y", jheight/13)
				.style("text-anchor", "middle")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.text("Average Annual Pct Chg,")

			svgj.append("text")
				.attr("x", jwidth * 0.72)
				.attr("y", jheight/13)
				.attr("dy", "1.1em")
				.style("text-anchor", "middle")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.text("Population by County")

			svgj.append("text")
				.attr("x", jwidth * 0.72)
				.attr("y", jheight/13)
				.attr("dy", "2.2em")
				.style("text-anchor", "middle")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.text("for the Years 2020 to 2070")
		}

	geoPct = svgj.append("text")
		.attr('x', jwidth * 0.72)
		.attr('y', jheight / 13)
		.attr("dy", "4.4em")
		.style("text-anchor", "middle")
		//.style("font-weight", "bold")
		.style("font-size", "11px")
		.text("California: " + avgChgCA[1]["pctAllCA"].toFixed(4) + "%");

	var legend = svgj.append("svg")
			.attr("id","legend")
			.attr("transform", "translate(" + (10) + ",0)");

	var legenditem = legend.selectAll(".legenditem")
		.data(d3.range(4)) // .data(d3.range(5))
		.enter()
		.append("svg")
		.attr("class", "legenditem")
		//.attr("transform", function(d,i) {
		//	return "translate(" + i * 22 + ",0)" ;	});

	
	/*if( $('#map').width() < 295 ) {
		legWidth = jwidth * (0.5);
	} else if ( ($('#map').width() > 294) && ($("#map").width() < 467) ) {
		legWidth = jwidth * (0.53);
	} else if (($("#map").width() > 466) && ($('#map').width() < 800) ){
		legWidth = jwidth * (0.638);
	} else if (($('#map').width() > 799) && ($('#map').width() < 900)) {
		legWidth = jwidth * (0.64);
	} else if ($('#map').width() > 899 ){
		legWidth = jwidth * (0.6525);
	}*/

	legWidth = (jwidth * .72 - 62);

	legenditem.append("rect")
		//.attr("x", jwidth/2 + 30)
		.attr("x", function(d,i){ return legWidth + i * 26; })
		.attr("y", jheight/4 + 5) // -10
		.attr("width", 24)
		.attr("height", 5)
		.attr("class", "rect")
		.style("fill", function(d,i){ return legendColors[i]; });

	legenditem.append("text")
		//.attr("x", jwidth/2 + 30)
		.attr("x", function(d,i) { return legWidth + i * 26; })
		.attr("y", jheight/4 + 20)
		.style("text-anchor","middle")
		.style("font-size","10px")
		.style("font-color","white")
		.text(function(d,i) {return legendText[i]; });

	d3.json('/data/cb_2014_us_county_5m.json', function(error, ca1) {
		if (error) throw error;

		ca = ca1;
		//console.log(ca);
		console.log(d3.geo.centroid(ca));

		/* 
		* Map avgChg to json file 
		*/

		for (i=6001; i<=6115; i+=2){
			var chgvalue = avgChg[i]["pctAll"];
			var chgcnty = i;

			for (j=0; j<ca.features.length; j++) {
				jsoncnty = ca.features[j].properties.GEOID.slice(1,5);
				if(chgcnty == jsoncnty) {
					ca.features[j].properties.avgchg = chgvalue;
					break;
				}		
			}
		}

		// console.log(ca);

		var projection = d3.geo.mercator()
					.center(d3.geo.centroid(ca))
					.translate([0,0]) // 209.5, 335;
					.scale(1)
					//.scale([jwidth*5.5]);

		var path = d3.geo.path().projection(projection);

		console.log(path.bounds(ca));

		b = path.bounds(ca);
		s = (0.9 / Math.max((b[1][0] - b[0][0]) / jwidth, (b[1][1] - b[0][1]) / jheight));
		console.log("s ",s);
		t = [(jwidth - s * (b[1][0] + b[0][0])) / 2, (jheight) / 2 + 5]; //  - s * (b[1][1] - b[0][1])
		console.log("t ",t);

		console.log(ca.features[0].properties.GEOID.slice(1,5));
		/*jdata = topojson.feature(ca, ca.objects.counties);

		console.log("geojson", jdata); */

		projection.scale(s).translate(t);

		map = svgj.selectAll("path")
			.data(ca.features)
			.enter().append("path")
			.attr("class",function(d) { return "mline"+d.properties.GEOID.slice(1,5)})
			.attr("id", "mLine")
			.attr("d", path)
			.style("fill", function(d){
				var value = d.properties.avgchg;
				if(value){
					return colors(value);
				}
			})
			/*.style("stroke", "red")
			.style("stroke-width", 2)*/;

	}) // close of map;

	/********************************************************************************************
	 * LINE CHART *
	 *******************************************************************************************/

	var marginj = {top: 30, right: 30, bottom: 30, left: 40},
		wj = $("#frame2").width() - marginj.left - marginj.right,
		hj = $("#frame2").height() - marginj.top - marginj.bottom; 
	
	svgb1 = d3.select("#frame2").append("svg")
		.attr("width", wj + marginj.left + marginj.right)
		.attr("height", hj + marginj.top + marginj.bottom) 
	.append("g")
		.attr("transform", "translate(" + marginj.left + "," + marginj.top + ")");

	var csvFips = csv.filter(function(d) {return d.fips == geo; })

	lineTotals = d3.nest()
		.key(function(d) {return d.year;})
		.rollup(function(v) { return {
			total:d3.sum(v, function(d) {return d.All; })
	}; }).map(csvFips);

	allLine=[];
	for (j=1970; j<2071; j++) {
		allLine.push({year:j, value: +lineTotals[j]["total"] })
	}

	//var parse = d3.time.format("%Y").parse;

	var maxLine = d3.max(allLine, function(d) { return d.value; });
	var minLine = d3.min(allLine, function(d) { return d.value; });

	console.log(minLine,maxLine);

	x1 = d3.scale.linear().range([0,wj])
		.domain(d3.extent(allLine, function(d) { return d.year; }));

	y1 = d3.scale.linear().range([hj,0])
		.domain([minLine/1.5, maxLine*1.125]);

	
	if( $('.r-right').width() < 700) {	// 900
	xAxis2 = d3.svg.axis().scale(x1)
				.orient("bottom")
				//.ticks(10)
				.tickValues([1970, 1990, 2010, 2025, 2050, 2070]) // 1980, 2000, 2025, 2050, 2070
				.tickFormat(d3.format("d"));
	}

	if( $('.r-right').width() >= 700) {
	xAxis2 = d3.svg.axis().scale(x1)
				.orient("bottom")
				//.ticks(10)
				.tickValues([1970, 1980, 1990, 2000, 2010, 2020, 2025, 2030, 2040, 2050, 2060, 2070])
				.tickFormat(d3.format("d"));
	}


	yAxis2 = d3.svg.axis().scale(y1)
				.orient("left")
				.innerTickSize(-wj)
				.outerTickSize(0)
				.tickPadding(10)
				.ticks(7)
				.tickFormat(d3.format(".2s"));

	line = d3.svg.line()
			.x(function(d) { return x1(d.year); })
			.y(function(d) { return y1(d.value); });

	area = d3.svg.area()
			.x(function(d) { return x1(d.year); })
			.y0(hj)
			.y1(function(d) { return y1(d.value); });

	/***********************************************
	 * GAUSSIAN BLUR
	 **********************************************/

	var defs = svgb1.append("defs");

	var mGradiant = defs.append("linearGradient")
		.attr('id', 'mainGradiant')
		.attr('gradientTransform', 'rotate(90)');

	mGradiant.append('stop')
		.attr('class','stop-left')
		.attr('offset', '5%');

	mGradiant.append('stop')
		.attr('class','stop-right')
		.attr('offset', '95%');

	var filter = defs.append("filter")
		.attr("id", "glow");

	filter.append("feGaussianBlur")
		.attr("stdDeviation", "2.5")
		.attr("result", "coloredBlur");

	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
		.attr("in", "coloredBlur");
	feMerge.append("feMergeNode")
		.attr("in","SourceGraphic");

	/*
	 * CONSTRUCT LINE GRAPH
	 */

	svgb1.append("path")
		.datum(allLine)
		.attr("class", "area")
		.attr("d", area);
		//.style("filter", "url(#glow)")
		;//.style("fill", "blue");

	svgb1.append("path")
		.attr("class", "line")
		.attr("stroke","black")
		.attr("d", line(allLine));

	svgb1.append("g")
		.attr("class", "x1Axis")
		.attr("transform", "translate(0," + (hj) + ")")
		.call(xAxis2);

	svgb1.append("g")
		.attr("class", "y1Axis")
		//.attr("transform", "translate(" + (0) + ", 0)")
		.call(yAxis2);

	svgb1.append("line")
		.attr("class", "line2020")
		.attr("x1", x1(2025))
		.attr("y1", 0)
		.attr("x2", x1(2025))
		.attr("y2", hj)
		.style("stroke","black")
		.style("stroke-width",1)
		.style("stroke-dasharray",2)
		;

	if ($("#frame2").width() < 328) {			
		var labH = 20;
	} else if ($("#frame2").width() >= 328 & $("#frame2").width() <= 365) {
		var labH = 20;
	} else if ($("#frame2").width() >= 365) {
		var labH = 40;
	}

	svgb1.append("text")
		.attr("transform", "translate("+(x1(2025) - 10)+ "," + labH + ")") // 40
		.attr("text-anchor", "end")
		.style("font-size", "14px")
		.style("fill", "black")
		//.style("font-weight", "bold")
		.text("\u27F8"+" Estimates");
	
	svgb1.append("text")
		.attr("transform", "translate("+(x1(2025) + 10)+ "," + labH + ")")
		//.attr("text-anchor", "start")
		.style("font-size", "14px")
		.style("fill", "black")
		//.style("font-weight", "bold")
		.text('Projections '+'\u27F9');

	line_title = svgb1.append("text")
		//.attr("x", 15)
		//.attr("y", 15)
		.attr("transform", "translate("+ ($("#frame2").width()/2 - 40)+",-10)")
		.style("text-anchor", "middle")
		.style("font-size", "14px")
		.style("font-weight", "bold")
		.text("1970 to 2070 Population - "+$('#area option:selected').text());
/*
	svgb1.append("text")
		.attr("x", 15)
		.attr("y", 15)
		.attr("dy", "1em")
		.style("font-size", "8pt")
		.text("Population: 1970 - 2010"); */


	/**********************************************************************************
	 * BAR CHART ***********
	 **********************************************************************************/
	
	marginb = {top: 30, right: 30, bottom: 50, left: 40},
			wb = $("#frame1").width() - marginb.left - marginb.right,
			hb = $("#frame1").height() - marginb.top - marginb.bottom; 

	svgb = d3.select("#frame1").append("svg")
		.attr("width", wb + marginb.left + marginb.right)
		.attr("height", hb + marginb.top + marginb.bottom) 
	.append("g")
		.attr("transform", "translate(" + marginb.left + "," + marginb.top + ")");

	datacnty=[];
	for (i=year0; i<2071; i++) {
		for (j=0; j<101; j+=5){
			datacnty.push({year: +i, age: +j, mw: "1", people: +datacsv[geo][i]["m"][0]["age"+j+(j+4)]});
			datacnty.push({year: +i, age: +j, mw: "2", people: +datacsv[geo][i]["w"][0]["age"+j+(j+4)]});
		}
	}

	datacnty20 = datacnty.filter(function(d) { return d.age < 20;});
	datacnty64 = datacnty.filter(function(d) { return d.age >=20 & d.age<65 });
	datacnty65plus = datacnty.filter(function(d) {return d.age >=65 });
	
	datagrp20 = d3.nest()
	.key(function(d) {return d.year; })
	.rollup(function(v) {return {
		value: d3.sum(v, function(d) { return d.people }) } })
	.map(datacnty20);

	datagrp64 = d3.nest()
	.key(function(d) {return d.year; })
	.rollup(function(v) {return {
		value: d3.sum(v, function(d) { return d.people }) } })
	.map(datacnty64);

	datagrp65plus = d3.nest()
	.key(function(d) {return d.year; })
	.rollup(function(v) {return {
		value: d3.sum(v, function(d) { return d.people }) } })
	.map(datacnty65plus);

	barData=[];
	for(var i=1970; i<=2070; i+=1) {
		barData.push({year: i, ageLT20: +datagrp20[i]["value"], age2064: +datagrp64[i]["value"], age65plus: +datagrp65plus[i]["value"]  })
	};

	stackData = ['ageLT20','age2064','age65plus'].map(function(c){
		return barData.map(function(d,i) {
			return {x:d.year, y:d[c]}
		})
	}); //console.log(stackData);

	var stack = d3.layout.stack().offset('expand');
	layers = stack(stackData);

	console.log(d3.layout.stack().offset('expand')(stackData));

	/*dataxyz = d3.nest()
	.key(function(d) { return d.year})
	.entries(barData); console.log(dataxyz);

	dataxyz.forEach(function(group) {
		var y0 = 0;
		group.values.forEach(function(entry,index){
			entry.y0 = y0;
			entry.y1 = +entry.value + y0;
			y0 = entry.y1;
		});
		group.total = group.values[group.values.length - 1].y1;
	});*/

	xb = d3.scale.ordinal().rangeBands([0,wb])
		//.domain(d3.extent(layers[0], function(d) { return d.x; }));
		.domain(layers[0].map(function(d) {return d.x;}));
	yb = d3.scale.linear().rangeRound([hb,0])
		.domain([0, 1]);

	// var colorsb = ['rgb(215,25,28)','rgb(253,174,97)','rgb(44,123,182)'];
	var colorsb = ['rgb(215,25,28)','rgb(253,184,30)','rgb(4,107,153)'];

	if( $('.r-right').width() < 900) { 
		xAxisb = d3.svg.axis().scale(xb)
				.orient("bottom")
				.ticks(7)
				.tickValues([1970, 1990, 2010, 2030, 2050, 2070])
				.tickFormat(d3.format("d"));
	}

	if( $('.r-right').width() >= 900) { 
		xAxisb = d3.svg.axis().scale(xb)
				.orient("bottom")
				.ticks(7)
				.tickValues([1970, 1980, 1990, 2000, 2010, 2020,2030,2040,2050,2060,2070])
				.tickFormat(d3.format("d"));
	}

	// xAxisb = d3.svg.axis().scale(xb)
	// 			.orient("bottom")
	// 			.ticks(7)
	// 			.tickValues([1970, 1980, 1990, 2000, 2010, 2020,2030,2040,2050,2060,2070])
	// 			.tickFormat(d3.format("d"));

	yAxisb = d3.svg.axis().scale(yb)
				.orient("left")
				.innerTickSize(-wj)
				.outerTickSize(0)
				.tickPadding(10)
				.ticks(7)
				.tickFormat(d3.format(".0%"));

	svgb.append("g")
				.attr("class", "xbAxis")
				.attr("transform", "translate(0," + (hb) + ")")
				.call(xAxisb);
		
	svgb.append("g")
				.attr("class", "ybAxis")
				.call(yAxisb);

	groups = svgb.selectAll('.layers')
		.data(layers)
		.enter()
		.append("g")
		.attr("class", "layers")
		.style("fill", function(d,i) {return colorsb[i]; });

	groups.selectAll("rect")
		.data(function(d) {return d})
		.enter()
		.append("rect")
		.attr("x", function(d){ return xb(d.x);})
		.attr("y", function(d) { return yb(d.y + d.y0 );})
		.attr("height", function(d) {return yb(d.y0) - yb(d.y + d.y0); })
		.attr("width", xb.rangeBand() - 1 );

	if ($("#frame2").width() < 452) {
			legplace1 = 0;
			legplace2 = wb*.33;
			legplace3 = wb*.675
			wrect='15px';
			fudge = 18;
		} else if ($("#frame2").width() >= 452 & $("#frame2").width() < 934) {
			legplace1 = wb*.125;
			legplace2 = wb*.40;
			legplace3 = wb*.7;
			wrect = '30px';
			fudge = 33;
		}else if ($("#frame2").width() >= 934) {
			legplace1 = wb*.35;
			legplace2 = wb*.5;
			legplace3 = wb*.65;
			wrect = '30px';
			fudge = 35;
		};		

	if ($("#frame1").height() < 275) {			
			var textY = $("#frame1").height() * .8;
			var rectY = $("#frame1").height() * .8 - 8;
		} else if ($("#frame1").height() >= 275 & $("#frame1").height() < 300) {
			var textY = 235;
			var rectY = 227;
		} else if ($("#frame1").height() >= 300 & $("#frame1").height() < 499) {
			var textY = 405; //375
			var rectY = 397; //367
		} else if ($("#frame1").height() >= 499) {
			var textY = 455; //375
			var rectY = 447; //367
		}

	barGraphHeader = svgb.append("text")
		.attr("transform", "translate("+ ($("#frame1").width()/2 - 40)+",-10)")
		.style("font-weight","bold")
		.style("font-size", "14px")
		.style("text-anchor","middle")
		.text("Age Group Distribution - "+$('#area option:selected').text())

	svgb.append("rect")
		.attr("width", wrect)
		.attr("height", '10px')
		.attr("transform", "translate("+(legplace1)+','+(rectY)+")")
		.style("fill", "rgb(215,25,28)");

	svgb.append("text")
		.attr("transform", "translate("+(legplace1+fudge)+','+(textY)+")")
		.text("Age 0 to 19");

	svgb.append("rect")
		.attr("width", wrect)
		.attr("height", '10px')
		.attr("transform", "translate("+(legplace2)+','+(rectY)+")")
		//.style("fill", "rgb(253,174,97)");
		.style("fill", "rgb(253,184,30)")

	svgb.append("text")
		.attr("transform", "translate("+(legplace2+fudge)+','+(textY)+")")
		.text("Age 20 to 64");

	svgb.append("rect")
		.attr("width", wrect)
		.attr("height", '10px')
		.attr("transform", "translate("+(legplace3)+','+(rectY)+")")
		//.style("fill", "rgb(44,123,182)");
		.style("fill", "rgb(4,107,153)");

	svgb.append("text")
		.attr("transform", "translate("+(legplace3+fudge)+','+(textY)+")")
		.text("Age 65 Plus");

}); // close of csv load;

$("#area").on('change', function(){
	geo = $(this).val();

	$("#vars").html('<p>geo: ' + geo + "</p><p>year: " + year + "</p><p> base yr: " + bsyear + "</p>");

	data = [];
	data1= [];

	for (i=year0; i<2071; i++) {
		for (j=0; j<101; j+=5){
			data1.push({year: +i, age: +j, mw: "1", people: +datacsv[geo][i]["m"][0]["age"+j+(j+4)]});
		    data1.push({year: +i, age: +j, mw: "2", people: +datacsv[geo][i]["w"][0]["age"+j+(j+4)]});
		}
	}; // console.log(data1);

	data = d3.nest()
		.key(function(d) {return d.year; })
		.key(function(d) {return d.year - d.age})
		.rollup(function(v) {return v.map(function(d) {return d.people; }); })
		.map(data1);
	
	//console.log(data)

	var maxPeople = d3.max(data1, function(d) {return d.people}); //console.log(maxPeople);
	x.domain([0, maxPeople]);
	w.domain([0, maxPeople]);

	svg.selectAll(".x")
		.transition()
		.ease("linear")
		.call(xAxis);

	svg.selectAll(".w")
		.transition()
		.ease("linear")
		.call(wAxis);

	birthyears
		.transition()
		.ease("linear")
		.duration(700)
		.attr("transform", "translate(0," +(y(year1) - y(year))+ ")")
	;

	birthyear.selectAll("rect")
	.data(function(birthyear) { 
		var mf = !data[year][birthyear] ? [0, 0] : data[year][birthyear]; 
		// console.log(mf);
		return [mf[0], mf[1]]; 
	})
	.transition().duration(700)
 		.attr("x", function(d, i){ return i % 2 ? width+centerPadding : x(d)})
		.attr("width", function(d, i){ return i % 2 ? w(d) : width - x(d)});

	baseyears
		.transition()
		.ease("linear")
		.duration(700)
		.attr("transform", "translate(0," +(y(year1) - y(year))+ ")")
	;

	baseyear.selectAll("rect")
		.data(function(baseyear) { 
			  var mf = !data[bsyear][baseyear-(year-bsyear)] ? [0, 0] : data[bsyear][baseyear-(year-bsyear)]; 
			  //console.log('data = '+data[bsyear][baseyear-(year-bsyear)]+' baseyear '+baseyear+ ' bsyear '+bsyear);
			  //console.log(mf);
			  return [mf[0], mf[1]] 
		})
	  .transition().duration(700)
		.attr("x", function(d, i){ return i % 2 ? width+centerPadding : x(d)}) // 330, x(d)
		.attr("width", function(d,i) { return i % 2 ? w(d) : width- x(d); })		
	
	calcAgegroups();

	document.getElementById('plc').innerHTML = $('#area option:selected').text();	
	// new_geo = $('#area option:selected').text();
	//console.log(new_geo);

		//GEO TEXT SIZE BASED ON WINDOW SIZE
	if( $(window).width() < 1100 ) { // 600
			if(geo == '1'){new_geo = 'California'; new_cnty="";};
			if(geo == '6001'){new_geo = 'Alameda'; new_cnty='County';};
            if(geo == '6003'){new_geo = 'Alpine'; new_cnty='County';};
            if(geo == '6005'){new_geo = 'Amador'; new_cnty='County';};
            if(geo == '6007'){new_geo = 'Butte'; new_cnty='County';};
            if(geo == '6009'){new_geo = 'Calaveras'; new_cnty=' County';};
            if(geo == '6011'){new_geo = 'Colusa'; new_cnty='County';};
            if(geo == '6013'){new_geo = 'Contra Costa'; new_cnty=' County';};
            if(geo == '6015'){new_geo = 'Del Norte'; new_cnty=' County';};
            if(geo == '6017'){new_geo = 'El Dorado'; new_cnty=' County';};
            if(geo == '6019'){new_geo = 'Fresno'; new_cnty='County';};
            if(geo == '6021'){new_geo = 'Glenn'; new_cnty='County';};
            if(geo == '6023'){new_geo = 'Humboldt'; new_cnty='County';};
            if(geo == '6025'){new_geo = 'Imperial'; new_cnty='County';};
            if(geo == '6027'){new_geo = 'Inyo'; new_cnty='County';};
            if(geo == '6029'){new_geo = 'Kern'; new_cnty='County';};
            if(geo == '6031'){new_geo = 'Kings'; new_cnty='County';};
            if(geo == '6033'){new_geo = 'Lake'; new_cnty='County';};
            if(geo == '6035'){new_geo = 'Lassen'; new_cnty='County';};
            if(geo == '6037'){new_geo = 'Los Angeles'; new_cnty=' County';};
            if(geo == '6039'){new_geo = 'Madera'; new_cnty='County';};
            if(geo == '6041'){new_geo = 'Marin'; new_cnty='County';};
            if(geo == '6043'){new_geo = 'Mariposa'; new_cnty='County';};
            if(geo == '6045'){new_geo = 'Mendocino'; new_cnty=' County';};
            if(geo == '6047'){new_geo = 'Merced'; new_cnty='County';};
            if(geo == '6049'){new_geo = 'Modoc'; new_cnty='County';};
            if(geo == '6051'){new_geo = 'Mono'; new_cnty='County';};
            if(geo == '6053'){new_geo = 'Monterey'; new_cnty='County';};
            if(geo == '6055'){new_geo = 'Napa'; new_cnty='County';};
            if(geo == '6057'){new_geo = 'Nevada'; new_cnty='County';};
            if(geo == '6059'){new_geo = 'Orange'; new_cnty='County';};
            if(geo == '6061'){new_geo = 'Placer'; new_cnty='County';};
            if(geo == '6063'){new_geo = 'Plumas'; new_cnty='County';};
            if(geo == '6065'){new_geo = 'Riverside'; new_cnty=' County';};
            if(geo == '6067'){new_geo = 'Sacramento'; new_cnty=' County';};
            if(geo == '6069'){new_geo = 'San Benito'; new_cnty=' County';};
            if(geo == '6071'){new_geo = 'San Bernardino'; new_cnty=' County';};
            if(geo == '6073'){new_geo = 'San Diego'; new_cnty=' County';};
            if(geo == '6075'){new_geo = 'San Francisco'; new_cnty=' County';};
            if(geo == '6077'){new_geo = 'San Joaquin'; new_cnty=' County';};
            if(geo == '6079'){new_geo = 'San Luis Obispo'; new_cnty=' County';};
            if(geo == '6081'){new_geo = 'San Mateo'; new_cnty=' County';};
            if(geo == '6083'){new_geo = 'Santa Barbara'; new_cnty=' County';};
            if(geo == '6085'){new_geo = 'Santa Clara'; new_cnty=' County';};
            if(geo == '6087'){new_geo = 'Santa Cruz'; new_cnty=' County';};
            if(geo == '6089'){new_geo = 'Shasta'; new_cnty='County';};
            if(geo == '6091'){new_geo = 'Sierra'; new_cnty='County';};
            if(geo == '6093'){new_geo = 'Siskiyou'; new_cnty='County';};
            if(geo == '6095'){new_geo = 'Solano'; new_cnty='County';};
            if(geo == '6097'){new_geo = 'Sonoma'; new_cnty='County';};
            if(geo == '6099'){new_geo = 'Stanislaus'; new_cnty=' County';};
            if(geo == '6101'){new_geo = 'Sutter'; new_cnty='County';};
            if(geo == '6103'){new_geo = 'Tehama'; new_cnty='County';};
            if(geo == '6105'){new_geo = 'Trinity'; new_cnty='County';};
            if(geo == '6107'){new_geo = 'Tulare'; new_cnty='County';};
            if(geo == '6109'){new_geo = 'Tuolumne'; new_cnty='County';};
            if(geo == '6111'){new_geo = 'Ventura'; new_cnty='County';};
            if(geo == '6113'){new_geo = 'Yolo'; new_cnty='County';};
            if(geo == '6115'){new_geo = 'Yuba'; new_cnty='County';};
					
		} else if( $(window).width() > 1099 ) { // 599
			if(geo == '1'){new_geo = 'California'; new_cnty="";};
			if(geo == '6001'){new_geo = 'Alameda County'; new_cnty='';};
			if(geo == '6003'){new_geo = 'Alpine County'; new_cnty='';};
			if(geo == '6005'){new_geo = 'Amador County'; new_cnty='';};
			if(geo == '6007'){new_geo = 'Butte County'; new_cnty='';};
			if(geo == '6009'){new_geo = 'Calaveras'; new_cnty=' County';};
			if(geo == '6011'){new_geo = 'Colusa County'; new_cnty='';};
			if(geo == '6013'){new_geo = 'Contra Costa'; new_cnty=' County';};
			if(geo == '6015'){new_geo = 'Del Norte'; new_cnty=' County';};
			if(geo == '6017'){new_geo = 'El Dorado'; new_cnty=' County';};
			if(geo == '6019'){new_geo = 'Fresno County'; new_cnty='';};
			if(geo == '6021'){new_geo = 'Glenn County'; new_cnty='';};
			if(geo == '6023'){new_geo = 'Humboldt County'; new_cnty='';};
			if(geo == '6025'){new_geo = 'Imperial County'; new_cnty='';};
			if(geo == '6027'){new_geo = 'Inyo County'; new_cnty='';};
			if(geo == '6029'){new_geo = 'Kern County'; new_cnty='';};
			if(geo == '6031'){new_geo = 'Kings County'; new_cnty='';};
			if(geo == '6033'){new_geo = 'Lake County'; new_cnty='';};
			if(geo == '6035'){new_geo = 'Lassen County'; new_cnty='';};
			if(geo == '6037'){new_geo = 'Los Angeles'; new_cnty=' County';};
			if(geo == '6039'){new_geo = 'Madera County'; new_cnty='';};
			if(geo == '6041'){new_geo = 'Marin County'; new_cnty='';};
			if(geo == '6043'){new_geo = 'Mariposa County'; new_cnty='';};
			if(geo == '6045'){new_geo = 'Mendocino'; new_cnty=' County';};
			if(geo == '6047'){new_geo = 'Merced County'; new_cnty='';};
			if(geo == '6049'){new_geo = 'Modoc County'; new_cnty='';};
			if(geo == '6051'){new_geo = 'Mono County'; new_cnty='';};
			if(geo == '6053'){new_geo = 'Monterey County'; new_cnty='';};
			if(geo == '6055'){new_geo = 'Napa County'; new_cnty='';};
			if(geo == '6057'){new_geo = 'Nevada County'; new_cnty='';};
			if(geo == '6059'){new_geo = 'Orange County'; new_cnty='';};
			if(geo == '6061'){new_geo = 'Placer County'; new_cnty='';};
			if(geo == '6063'){new_geo = 'Plumas County'; new_cnty='';};
			if(geo == '6065'){new_geo = 'Riverside'; new_cnty=' County';};
			if(geo == '6067'){new_geo = 'Sacramento'; new_cnty=' County';};
			if(geo == '6069'){new_geo = 'San Benito'; new_cnty=' County';};
			if(geo == '6071'){new_geo = 'San Bernardino'; new_cnty=' County';};
			if(geo == '6073'){new_geo = 'San Diego'; new_cnty=' County';};
			if(geo == '6075'){new_geo = 'San Francisco'; new_cnty=' County';};
			if(geo == '6077'){new_geo = 'San Joaquin'; new_cnty=' County';};
			if(geo == '6079'){new_geo = 'San Luis Obispo'; new_cnty=' County';};
			if(geo == '6081'){new_geo = 'San Mateo'; new_cnty=' County';};
			if(geo == '6083'){new_geo = 'Santa Barbara'; new_cnty=' County';};
			if(geo == '6085'){new_geo = 'Santa Clara'; new_cnty=' County';};
			if(geo == '6087'){new_geo = 'Santa Cruz'; new_cnty=' County';};
			if(geo == '6089'){new_geo = 'Shasta County'; new_cnty='';};
			if(geo == '6091'){new_geo = 'Sierra County'; new_cnty='';};
			if(geo == '6093'){new_geo = 'Siskiyou County'; new_cnty='';};
			if(geo == '6095'){new_geo = 'Solano County'; new_cnty='';};
			if(geo == '6097'){new_geo = 'Sonoma County'; new_cnty='';};
			if(geo == '6099'){new_geo = 'Stanislaus'; new_cnty=' County';};
			if(geo == '6101'){new_geo = 'Sutter County'; new_cnty='';};
			if(geo == '6103'){new_geo = 'Tehama County'; new_cnty='';};
			if(geo == '6105'){new_geo = 'Trinity County'; new_cnty='';};
			if(geo == '6107'){new_geo = 'Tulare County'; new_cnty='';};
			if(geo == '6109'){new_geo = 'Tuolumne County'; new_cnty='';};
			if(geo == '6111'){new_geo = 'Ventura County'; new_cnty='';};
			if(geo == '6113'){new_geo = 'Yolo County'; new_cnty='';};
			if(geo == '6115'){new_geo = 'Yuba County'; new_cnty='';};
		}

	geo_title.text(new_geo);	
	geo_cnty.text(new_cnty); 

	line_title.text("1970 to 2070 Population - "+$('#area option:selected').text());

	if(geo != '1'){
		geoPct.text($('#area option:selected').text() + ": " + avgChg[geo]["pctAll"].toFixed(4) + "%");
	}
	else {
		geoPct.text($('#area option:selected').text() + ": " + avgChgCA[geo]["pctAllCA"].toFixed(4) + "%");
	}

	var csvFips = csv1.filter(function(d) {return d.fips == geo; })

	lineTotals = d3.nest()
		.key(function(d) {return d.year;})
		.rollup(function(v) { return {
			total:d3.sum(v, function(d) {return d.All; })
	}; }).map(csvFips);

	allLine=[];
	for (j=1970; j<2071; j++) {
		allLine.push({year:j, value: +lineTotals[j]["total"] })
	}

	var maxLine = d3.max(allLine, function(d) { return d.value; });
	var minLine = d3.min(allLine, function(d) { return d.value; });

	//console.log(minLine,maxLine);

	y1.domain([minLine/1.5, maxLine*1.125]);

	svgb1.selectAll(".y1Axis")
		.transition()
		.duration(700)
		.ease("linear")
		.call(yAxis2);

	line.y(function(d) { return y1(d.value); });
	area.y1(function(d) { return y1(d.value); });

	svgb1.selectAll(".line")
	.transition()
	.duration(700)
	.ease("linear")
	.attr("d", line(allLine))

	svgb1.selectAll(".area")
	.datum(allLine)
	.transition()
	.duration(700)
	.ease("linear")
	.attr("d", area);

	/********************************************
	 * UPDATE BAR CHART
	 ********************************************/

	datacnty=[];
	for (i=year0; i<2071; i++) {
		for (j=0; j<101; j+=5){
			datacnty.push({year: +i, age: +j, mw: "1", people: +datacsv[geo][i]["m"][0]["age"+j+(j+4)]});
			datacnty.push({year: +i, age: +j, mw: "2", people: +datacsv[geo][i]["w"][0]["age"+j+(j+4)]});
		}
	}

	datacnty20 = datacnty.filter(function(d) { return d.age < 20;});
	datacnty64 = datacnty.filter(function(d) { return d.age >=20 & d.age<65 });
	datacnty65plus = datacnty.filter(function(d) {return d.age >=65 });
	
	datagrp20 = d3.nest()
	.key(function(d) {return d.year; })
	.rollup(function(v) {return {
		value: d3.sum(v, function(d) { return d.people }) } })
	.map(datacnty20);

	datagrp64 = d3.nest()
	.key(function(d) {return d.year; })
	.rollup(function(v) {return {
		value: d3.sum(v, function(d) { return d.people }) } })
	.map(datacnty64);

	datagrp65plus = d3.nest()
	.key(function(d) {return d.year; })
	.rollup(function(v) {return {
		value: d3.sum(v, function(d) { return d.people }) } })
	.map(datacnty65plus);

	barData=[];
	for(var i=1970; i<=2070; i+=1) {
		barData.push({year: i, ageLT20: +datagrp20[i]["value"], age2064: +datagrp64[i]["value"], age65plus: +datagrp65plus[i]["value"]  })
	};

	stackData = ['ageLT20','age2064','age65plus'].map(function(c){
		return barData.map(function(d,i) {
			return {x:d.year, y:d[c]}
		})
	}); //console.log(stackData);

	var stack = d3.layout.stack().offset('expand');
	layers = stack(stackData);

	groups
		.data(layers)		
		.transition()
		.ease("linear")
		.duration(700);

	groups.selectAll("rect")
		.data(function(d) {return d})
		.transition()
		.ease("linear")
		.duration(700)
		.attr("y", function(d) { return yb(d.y + d.y0 );})
		.attr("height", function(d) {return yb(d.y0) - yb(d.y + d.y0); })

	barGraphHeader.text("Age Group Distribution - "+$('#area option:selected').text())

	/*****************************************************************
	 * UPDATE MAP OUTLINE
	 ****************************************************************/

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        })
    }

	for (j=0; j<ca.features.length; j++){
		if(geo == ca.features[j].properties.GEOID.slice(1,5)){
			//console.log(ca.features[j]);
			d3.selectAll("#mLine")
			//	.style("fill","none")
				.style("stroke","grey")
				.style("stroke-width",0.5);
			
			sel = d3.select("path.mline"+ca.features[j].properties.GEOID.slice(1,5));
			/*	.style("fill", function(d){
					var value = ca.features[j].properties.avgchg;
					if(value){
						return colors(value);
					}
				})*/
				sel.moveToFront();
				sel.style("stroke","black")
				sel.style("stroke-width", 2);

		} else if(geo == 1) {
			d3.selectAll("#mLine")
				.style("stroke","grey")
				.style("stroke-width",0.5)
				/*.style("fill", function(d,i){
					var value = ca.features[i].properties.avgchg;
					if(value){
						return colors(value);
					}
				})*/;
		}
	}

});

function scrollPyramid(myYear){
	year = myYear;
	yearSlider.value(year);

	data = [];

	data = d3.nest()
		.key(function(d) {return d.year; })
		.key(function(d) {return d.year - d.age})
		.rollup(function(v) {return v.map(function(d) {return d.people; }); })
		.map(data1);
	
	//console.log(data)
	
	var maxPeople = d3.max(data1, function(d) {return d.people}); //console.log(maxPeople);
	x.domain([0, maxPeople]);
	w.domain([0, maxPeople]);

	svg.selectAll(".x")
		.transition()
		.ease("linear")
		.call(xAxis);

	svg.selectAll(".w")
		.transition()
		.ease("linear")
		.call(wAxis);

	birthyears
		.transition()
		.ease("linear")
		.duration(700)
		.attr("transform", "translate(0," + (y(year1) - y(year)) + ")")
	;

	birthyear.selectAll("rect")
	.data(function(birthyear) { 
		var mf = !data[year][birthyear] ? [0, 0] : data[year][birthyear]; 
		//console.log(mf);
		return [mf[0], mf[1]];
	})
	.transition().duration(700)
		.attr("x", function(d, i){ return i % 2 ? width+centerPadding : x(d)})
		.attr("width", function(d, i){ return i % 2 ? w(d) : width - x(d)});

	title
		.text(year); 

	calcAgegroups();

	document.getElementById('yr').innerHTML = year;
			
};

function scrollPyramid2(mbYear){

	bsyear = mbYear;
	yearSlider2.value(bsyear);

	//console.log(year);

	data = [];
	data1= [];

	for (i=year0; i<2071; i++) {
		for (j=0; j<101; j+=5){
			data1.push({year: +i, age: +j, mw: "1", people: +datacsv[geo][i]["m"][0]["age"+j+(j+4)]});
			data1.push({year: +i, age: +j, mw: "2", people: +datacsv[geo][i]["w"][0]["age"+j+(j+4)]});
		}
	}; //console.log(data1);

	data = d3.nest()
		.key(function(d) {return d.year; })
		.key(function(d) {return d.year - d.age})
		.rollup(function(v) {return v.map(function(d) {return d.people; }); })
		.map(data1);
	
	// console.log(data)

	var maxPeople = d3.max(data1, function(d) {return d.people}); //console.log(maxPeople);
	x.domain([0, maxPeople]);
	w.domain([0, maxPeople]);

	svg.selectAll(".x")
		.transition()
		.ease("linear")
		.call(xAxis);

	svg.selectAll(".w")
		.transition()
		.ease("linear")
		.call(wAxis);

	baseyears
		.transition()
		.ease("linear")
		.duration(700)
		.attr("transform", "translate(0," +(y(year1) - y(year))+ ")")
	;

/*	birthyear.selectAll("rect")
	.data(function(birthyear) { 
		var mf = !data[year][birthyear] ? [0, 0] : data[year][birthyear]; 
		console.log(mf);
		return [mf[0], mf[1]]; 
	})
	.transition().duration(700)
			.attr("x", function(d, i){ return i % 2 ? width+centerPadding : x(d)})
		.attr("width", function(d, i){ return i % 2 ? w(d) : width - x(d)}); */
	
	baseyear.selectAll("rect")
	.data(function(baseyear) {
				var mf = !data[bsyear][baseyear-(year-bsyear)] ? [0, 0] : data[bsyear][baseyear-(year-bsyear)]; 
				//console.log(mf);
				return [mf[0], mf[1]] })
		.transition().duration(700)
		.attr("x", function(d, i){ return i % 2 ? width+centerPadding : x(d)}) // 330, x(d)
		.attr("width", function(d,i) { return i % 2 ? w(d) : width- x(d); })		
		
	//$("#vars").html('<p>geo: ' + geo + "</p><p>year: " + year + "</p><p> base yr: " + bsyear + "</p>");

	byTitle
		.text(bsyear);	

};

function calcAgegroups() {
	
	// Reverts outline and population statistics back to total population 
	// year < beginProjection ? tmpVariant = "v1" : tmpVariant = currVariant;
	// ageLimits = [20,65]

	var young = 0;
	var medium = 0;
	var old = 0;

	for (var i=0;i<ageLimits[0];i+=5)	{
		// console.log(data[year]);
		young += data[year][year-i][0] + data[year][year-i][1];
		//console.log(data[year]);
	}

	console.log("young: "+young)

	for (var j=ageLimits[0];j<ageLimits[1];j+=5)	{
		medium += data[year][year-j][0] + data[year][year-j][1];
		//console.log(medium);
	}
	console.log("medium: "+medium)

	for (var k=ageLimits[1];k<=100;k+=5)	{
		old += data[year][year-k][0] + data[year][year-k][1];
		//console.log(medium);
	}
	console.log("old: "+old)

	// Total Pop incl. 100+ AGE GROUP (males and females)
	// var tmpVariantInt = +tmpVariant.split("v")[1]; 
	//var sum = +datacsv[year].m[tmpVariantInt][0].Bev + ( datacsv[year].w[tmpVariantInt][0].Bev -0);
	//var sum = +datacsv[geo][year]["m"][0]['All'] + ( +datacsv[geo][year]["w"][0]['All'] -0);
	var sum = Math.round(young) + Math.round(medium) + Math.round(old);
	//console.log(sum);
	//old = sum - medium - young;

	var OldPercMed = old/medium*100;
	//console.log(OldPercMed);
	
	d3.select("#youngAbs").text(mill(Math.round(young)));
	d3.select("#mediumAbs").text(mill(Math.round(medium)));
	d3.select("#oldAbs").text(mill(Math.round(old)));
	d3.select("#totals").text(mill(Math.round(sum)));

	//d3.select("#altQ").text(medianAge[language]+" "+mill(datacsv[year].m[tmpVariantInt][0].Median)+"\xa0 \xa0 | \xa0 \xa0"+oldAgeDepRatio[language]+"\xa0"+full(OldPercMed));
	d3.select("#altQ").html("Median age "+parseFloat(datacsv[geo][year]["m"][0]["mage_bothsexes"]).toFixed(1)+"<br/>"+"Old-age dependency ratio:\xa0"+full(OldPercMed)+" "+"<button style='padding:0; border: none;' class='btn' id='openPU'>&#128196</button>"); 
	d3.select("#youngPerc").text(perc(young/sum));
	d3.select("#mediumPerc").text(perc(medium/sum));
	d3.select("#oldPerc").text(perc(old/sum));


	// SCRIPT TO CONTROL POP-UP
	const openPopupBtn = document.getElementById('openPU');
	const closePopupBtn = document.getElementById('closePopupBtn');
	const myPopup = document.getElementById('adPopup');

	openPopupBtn.addEventListener('click', () => {
		myPopup.style.display = 'flex'; // Show the popup
	});

	closePopupBtn.addEventListener('click', () => {
		myPopup.style.display = 'none'; // Hide the popup
	});

	// Optional: Close popup when clicking outside the content
	myPopup.addEventListener('click', (event) => {
		if (event.target === myPopup) {
			myPopup.style.display = 'none';
		}
	});

}

//function imgDownload() {
$("#imgDL").click(function(){
	DOMURL = (window.URL || window.webkitURL || window);

	var prefix = {
		xmlns: "http://www.w3.org/2000/xmlns/",
		xlink: "http://www.w3.org/1999/xlink",
		svg: "http://www.w3.org/2000/svg"
	}

	svg0 = document.querySelectorAll("svg")[0];
	svg0.setAttribute("version", "1.1");

	console.log(svg0);
	
	var defsEl = document.createElement("defs");
	svg0.insertBefore(defsEl, svg0.firstChild);
	console.log(svg0);

	var styleEl = document.createElement("style")
	defsEl.appendChild(styleEl);
	styleEl.setAttribute("type", "text/css");
	console.log(svg0);
	
	// removing attributes so they aren't doubled up
	svg0.removeAttribute("xmlns");
	svg0.removeAttribute("xlink");
	console.log(svg0);
	
	// These are needed for the svg
	if (!svg0.hasAttributeNS(prefix.xmlns, "xmlns")) {
		svg0.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg0);
	}
	console.log(svg0);

	if (!svg0.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
		svg0.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
	}
	console.log(svg0);
	
	var styleStr = '';
	
	var sheets = document.styleSheets
	Array.prototype.forEach.call(sheets, function(sheet){
		try{ // we need a try-catch block for external stylesheets that could be there...
				styleStr += Array.prototype.reduce.call(sheet.cssRules, function(a, b){
					return a + b.cssText; // just concatenate all our cssRules' text
				}, "");
		}
		catch(e){console.log(e);}
	});
	// console.log(styleStr);
	var source = (new XMLSerializer()).serializeToString(svg0).replace('</style>', '<![CDATA[' + styleStr + ']]></style>');

	console.log(source)
	
	var t0 = performance.now();
	var blob = new Blob([source], {type: "image/svg+xml;base64"});
	var t1 = performance.now();
	console.log("Call to blob took "+(t1-t0)+" milliseconds.");

	/*var reader = new FileReader();
	reader.onload = function(event){
		console.log(JSON.stringify(reader.result));
	};
	reader.readAsText(blob);   */

	var url = DOMURL.createObjectURL(blob);

	image = new Image();
	//image.src = url;
	console.log(image);
	
	image.onload = function() {
		console.log("Image.onload fired!")

		canvas = document.createElement("canvas");
		console.log(canvas);
		canvas.width = image.width
		canvas.height = image.height
		console.log(image.width, image.height);

		var context = canvas.getContext("2d");
		context.drawImage(image, 0, 0,image.width, image.height);
		
		var a = document.createElement("a");
		a.download = "image.png";
		//document.getElementById("getImage").src = canvas.toDataURL("image/png")
		window.open(canvas.toDataURL("image/png"));
		a.href = canvas.toDataURL("image/png");
		console.log(a.href);
		//a.click();
	}
	image.src = url;

	/*image.onerror = function() {
		alert("Error loading: " + this.src);
	}*/
});

$("#imgDL2").click(function(){
	if(typeof saveSvgAsPng === 'undefined'){
		alert("To download the pyramid as an image, please right-click inside the pyramid frame and choose 'Save Picture As'.");
	} else {
		saveSvgAsPng(document.getElementById('popPyr'), 'popPyramid.png')
		// saveSvgAsPng(document.querySelectorAll("svg")[0], "pyramid.png")
	}
	/*svgAsDataUri(document.querySelectorAll("svg")[0], {}, function(uri) {
		console.log('uri', uri);
	}); */
});

}); // end of javascript
