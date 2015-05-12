!function(){
	var bP={};	
	var b=30, bb=150, height=600, buffMargin=1, minHeight=14, bz = 100;
	var c1=[-150, 40], c2=[-50, 160], c3=[-15, 200]; //Column positions of labels.
	var colors =["#0431B4", "#BCA9F5",  "#FF8000","#00BFFF", "#4C0B5F", "#5FB404"];
            
	bP.partData = function(data,p){
		var sData={};
		
		sData.keys=[
			// Descending order of Legend games		
			d3.set(data.map(function(d){ return d[0];})).values().sort(function(a,b){ return ( b<a? -1 : b>a ? 1 : 0);}),
			// Ascending order of players' name
			d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})		
		];
		
		sData.data = [	sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
						sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); }) 
		];
		
		data.forEach(function(d){ 
			sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
			sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p]; 
		});
		
		return sData;
	}
	
	function visualize(data){
		var vis ={};
		function calculatePosition(a, s, e, b, m){
			var total=d3.sum(a);
			var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
			var ret =[];
			
			a.forEach(
				function(d){ 
					var v={};
					v.percent = (total == 0 ? 0 : d/total); 
					v.value=d;
					v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
					(v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
					ret.push(v);
				}
			);
			
			var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;
			
			ret.forEach(
				function(d){ 
					d.percent = scaleFact*d.percent; 
					d.height=(d.height==m? m : d.height*scaleFact);
					d.middle=sum+b+d.height/2;
					d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
					d.h= d.percent*(e-s-2*b*a.length);
					d.percent = (total == 0 ? 0 : d.value/total);
					sum+=2*b+d.height;
				}
			);
			return ret;
		}

		vis.mainBars = [ 
			calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
			calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight)
		];
		
		vis.subBars = [[],[]];
		vis.mainBars.forEach(function(pos,p){
			pos.forEach(function(bar, i){	
				calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){ 
					sBar.key1=(p==0 ? i : j); 
					sBar.key2=(p==0 ? j : i); 
					vis.subBars[p].push(sBar); 
				});
			});
		});
		vis.subBars.forEach(function(sBar){
			sBar.sort(function(a,b){ 
				return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 
						1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
		});
		
		vis.edges = vis.subBars[0].map(function(p,i){
			return {
				key1: p.key1,
				key2: p.key2,
				y1:p.y,
				y2:vis.subBars[1][i].y,
				h1:p.h,
				h2:vis.subBars[1][i].h
			};
		});
		vis.keys=data.keys;
		return vis;
	}
	
	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t) {
			return edgePolygon(i(t));
		};
	}
	
	function drawPart(data, id, p){
		d3.select("#"+id).append("g").attr("class","part"+p)
			.attr("transform","translate("+( p*(bb+b))+",0)");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");
		
		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").data(data.mainBars[p])
			.enter().append("g").attr("class","mainbar");

		mainbar.append("rect").attr("class","mainrect")
			.attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
			.attr("width",b).attr("height",function(d){ return d.height; })
			.style("shape-rendering","auto")
			.style("fill-opacity",0).style("stroke-width","0.5")
			.style("stroke","black").style("stroke-opacity",0);
			
		mainbar.append("text").attr("class","barlabel")
			.attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return data.keys[p][i];})
			.attr("text-anchor","start" );
			
		mainbar.append("text").attr("class","barvalue")
			.attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return d.value ;})
			.attr("text-anchor","end");
			
		mainbar.append("text").attr("class","barpercent")
			.attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
			.attr("text-anchor","end").style("fill","grey");
			
		d3.select("#"+id).select(".part"+p).select(".subbars")
			.selectAll(".subbar").data(data.subBars[p]).enter()
			.append("rect").attr("class","subbar")
			.attr("x", 0).attr("y",function(d){ return d.y})
			.attr("width",b).attr("height",function(d){ return d.h})
			.style("fill",function(d){ return colors[d.key1];});
	}
	
	function drawEdges(data, id){
		d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge")
			.data(data.edges).enter().append("polygon").attr("class","edge")
			.attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
			.style("opacity",0.5).each(function(d) { this._current = d; });	
	}	
	
	function drawHeader(header, id){
		d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
			.style("font-size","20").attr("x",108).attr("y",-20).style("text-anchor","middle")
			.style("font-weight","bold");
		
		[0,1].forEach(function(d){
			var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");
			
			h.append("text").text(header[d]).attr("x", (c1[d]-5))
				.attr("y", -5).style("fill","grey");
			
			h.append("text").text("Count").attr("x", (c2[d]-10))
				.attr("y", -5).style("fill","grey");
			
			h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
				.attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
				.style("stroke-width","1").style("shape-rendering","crispEdges");
		});
	}

    function segColor(c){ return {  HARD:"#3182bd", CLAY:"#e08214",GRASS:"#31a354"}[c]; }
    
   
    //--------------------------------------------------Claimed title pie----------------------------------------------------------------------------------------------------
	function drawPieChart(data, id){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
        
        

		
				// create svg for pie chart.
        var piesvg = d3.select("#"+id)
            .attr("width", pieDim.w).attr("height", pieDim.h)
            .append("g").attr("class","part"+2) // third parts of the g.
			.attr("transform","translate("+ 1290+",480)");
            
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);    
        
        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });
        
        piesvg.append("text")
        //.attr("x", (-250))             
        .attr("y", (-140))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .style("font-weight","bold")
        .text("Claimed Titles by Court Type");    

        /*
        var g =piesvg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class","arc");
            
        g.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".5em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.type;});
          */

		
		var tooltip = d3.select("#"+id)                               
          .append('div')    
          .attr('class', 'tooltip');     

        tooltip.append('div')                                           
          .attr('class', 'label');                                      
             
        tooltip.append('div')                                           
          .attr('class', 'count');                                      

        tooltip.append('div')                                           
          .attr('class', 'percent');  
		         
        // Draw the pie slices.
        var arcs = piesvg.selectAll("path").data(pie(data)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })           
            .style("text-anchor", "middle")
            .on("mouseover",mouseover).on("mouseout",mouseout);                                 

        var sum = caltotal(data);             
		
        arcs.append("svg:title")
            .text( function(d) { 
                    if (d.data.type == "HARD" ) {
                        return d.data.type + " court: " + d.data.freq + " (" + Math.round(1000 * d.data.freq / sum) / 10 + "%)" +"\r\n" 
                        +"\r\n" +"Roger Federer  58" + " (" + Math.round(1000 * 58/sum)/10 + "%)" 
                        +"\r\n" +"Stan Wawrinka  51" + " (" + Math.round(1000 * 51/sum)/10 + "%)" 
                        +"\r\n" +"Novak Djokovic 40" + " (" + Math.round(1000 * 40/sum)/10 + "%)" 
                        +"\r\n" +"Andy Murray  25" + " (" + Math.round(1000 * 25/sum)/10 + "%)" 
                        +"\r\n" +"Rafael Nadal  16" + " (" + Math.round(1000 * 16/sum)/10 + "%)" 
                        +"\r\n" +"Marin Cilic  11" + " (" + Math.round(1000 * 11/sum)/10 + "%)" 
                        +"\r\n" +"David Ferrer 10" + " (" + Math.round(1000 * 10/sum)/10 + "%)" 
                        +"\r\n" +"Kei Nishikori  7" + " (" + Math.round(1000 * 7/sum)/10 + "%)" 
                        +"\r\n" +"Tomáš Berdych 6" + " (" + Math.round(1000 * 6/sum)/10 + "%)" 
                        +"\r\n" +"Milos Raonic 6" + " (" + Math.round(1000 * 6/sum)/10 + "%)" ;
                    }
                    else if (d.data.type == "CLAY" ) {
                        return d.data.type + " court: " + d.data.freq + " (" + Math.round(1000 * d.data.freq / sum) / 10  + "%)" +"\r\n" 
                        +"\r\n" +"Rafael Nadal  46" + " (" + Math.round(1000 * 46/sum)/10 + "%)" 
                        +"\r\n" +"David Ferrer 12" + " (" + Math.round(1000 * 12/sum)/10 + "%)" 
                        +"\r\n" +"Roger Federer 11" + " (" + Math.round(1000 * 11/sum)/10 + "%)" 
                        +"\r\n" +"Novak Djokovic 10" + " (" + Math.round(1000 * 10/sum)/10 + "%)" 
                        +"\r\n" +"Stan Wawrinka  3" + " (" + Math.round(1000 * 3/sum)/10 + "%)" 
                        +"\r\n" +"Marin Cilic  11" + " (" + Math.round(1000 * 11/sum)/10 + "%)" 
                        +"\r\n" +"Andy Murray  3" + " (" + Math.round(1000 * 3/sum)/10 + "%)" 
                        +"\r\n" +"Tomáš Berdych  2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"Kei Nishikori  2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"Milos Raonic 0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" ;
                    }
                    else if (d.data.type == "GRASS" ) {
                        return d.data.type + " court: " + d.data.freq + " (" + Math.round(1000 * d.data.freq / sum) / 10 + "%)"+"\r\n" 
                        +"\r\n" +"Roger Federer 14" + " (" + Math.round(1000 * 14/sum)/10 + "%)" 
                        +"\r\n" +"Andy Murray  5" + " (" + Math.round(1000 * 5/sum)/10 + "%)" 
                        +"\r\n" +"Rafael Nadal  3" + " (" + Math.round(1000 * 3/sum)/10 + "%)" 
                        +"\r\n" +"Novak Djokovic 2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"David Ferrer 2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"Tomáš Berdych  1" + " (" + Math.round(1000 * 1/sum)/10 + "%)" 
                        +"\r\n" +"Marin Cilic  1" + " (" + Math.round(1000 * 1/sum)/10 + "%)" 
                        +"\r\n" +"Stan Wawrinka  0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" 
                        +"\r\n" +"Kei Nishikori  0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" 
                        +"\r\n" +"Milos Raonic 0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" ;
                    };                      
                })
        
        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        } 

        function caltotal(d){
  
			var total = d3.sum(data.map(function(d) {               
              return d.freq;                                       
            }));
            return total;
        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
  
			var total = d3.sum(data.map(function(d) {               
              return d.freq;                                       
            }));
            
			var percent = Math.round(1000 * d.data.freq / total) / 10;
			tooltip.select('.label').html(d.data.type);
            tooltip.select('.count').html(d.data.freq);
            tooltip.select('.percent').html(percent + '%');
            tooltip.style('display', 'block'); 	
            //tooltip.style('background','gray');
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
			tooltip.style('display', 'none'); 
        }		
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    
		
		piesvg.append("text")
        .attr("x", (-65))             
        .attr("y", (-30))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("Clay"); 
		
		piesvg.append("text")
        .attr("x", (-65))             
        .attr("y", (-14))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("89");  
		
		piesvg.append("text")
        .attr("x", (-65))             
        .attr("y", 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("25.6%");    		

		piesvg.append("text")
        .attr("x", 48)             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("Hard");   
		
		piesvg.append("text")
        .attr("x", 48)             
        .attr("y", 16)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("230");  
		
		piesvg.append("text")
        .attr("x", 48)             
        .attr("y", 32)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("66.3%");  
		
		piesvg.append("text")
        .attr("x", (-25))             
        .attr("y", (-90))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("Grass");  
		
		piesvg.append("text")
        .attr("x", (-25))             
        .attr("y", (-74))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("28"); 
		
		piesvg.append("text")
        .attr("x", (-16))             
        .attr("y", (-58))
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .text("8.1%"); 	
        return pC;
	}
 //--------------------------------------------------attempted finals pie----------------------------------------------------------------------------------------------------
    function drawPieChart2(data, id){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
        
        
		// create svg for pie chart.
        var piesvg = d3.select("#"+id)
            .attr("width", pieDim.w).attr("height", pieDim.h)
            .append("g").attr("class","part"+2) // third parts of the g.
			.attr("transform","translate("+ 640+",120)");
            
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);    
        
        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });
        
        piesvg.append("text")
        //.attr("x", (-310))             
        .attr("y", (-140))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .style("font-weight","bold")
        .text("Attempted Finals by Court Type");  

		
		var tooltip = d3.select("#"+id)                               
          .append('div')    
          .attr('class', 'tooltip');     

        tooltip.append('div')                                           
          .attr('class', 'label');                                      
             
        tooltip.append('div')                                           
          .attr('class', 'count');                                      

        tooltip.append('div')                                           
          .attr('class', 'percent');  
		         
        // Draw the pie slices.
        var arcs = piesvg.selectAll("path").data(pie(data)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })           
            .style("text-anchor", "middle")
            .on("mouseover",mouseover).on("mouseout",mouseout);                                 
		piesvg.append("text")
        .attr("x", (-65))             
        .attr("y", (-30))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("Clay"); 
		
		piesvg.append("text")
        .attr("x", (-65))             
        .attr("y", (-14))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("89");  
		
		piesvg.append("text")
        .attr("x", (-65))             
        .attr("y", 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("25.6%");    		

		piesvg.append("text")
        .attr("x", 48)             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("Hard");   
		
		piesvg.append("text")
        .attr("x", 48)             
        .attr("y", 16)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("230");  
		
		piesvg.append("text")
        .attr("x", 48)             
        .attr("y", 32)
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("66.3%");  
		
		piesvg.append("text")
        .attr("x", (-25))             
        .attr("y", (-90))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("Grass");  
		
		piesvg.append("text")
        .attr("x", (-25))             
        .attr("y", (-74))
        .attr("text-anchor", "middle")  
        .style("font-size", "13px") 
        .text("28"); 
		
		piesvg.append("text")
        .attr("x", (-16))             
        .attr("y", (-58))
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .text("8.1%"); 	
		
        var sum = caltotal(data);             

        arcs.append("svg:title")
            .text( function(d) { 
                    if (d.data.type == "HARD" ) {
                        return d.data.type + " court: " + d.data.freq + " (" + Math.round(1000 * d.data.freq / sum) / 10 + "%)" +"\r\n" 
                        +"\r\n" +"Roger Federer  58" + " (" + Math.round(1000 * 58/sum)/10 + "%)" 
                        +"\r\n" +"Stan Wawrinka  51" + " (" + Math.round(1000 * 51/sum)/10 + "%)" 
                        +"\r\n" +"Novak Djokovic 40" + " (" + Math.round(1000 * 40/sum)/10 + "%)" 
                        +"\r\n" +"Andy Murray  25" + " (" + Math.round(1000 * 25/sum)/10 + "%)" 
                        +"\r\n" +"Rafael Nadal  16" + " (" + Math.round(1000 * 16/sum)/10 + "%)" 
                        +"\r\n" +"Marin Cilic  11" + " (" + Math.round(1000 * 11/sum)/10 + "%)" 
                        +"\r\n" +"David Ferrer 10" + " (" + Math.round(1000 * 10/sum)/10 + "%)" 
                        +"\r\n" +"Kei Nishikori  7" + " (" + Math.round(1000 * 7/sum)/10 + "%)" 
                        +"\r\n" +"Tomáš Berdych 6" + " (" + Math.round(1000 * 6/sum)/10 + "%)" 
                        +"\r\n" +"Milos Raonic 6" + " (" + Math.round(1000 * 6/sum)/10 + "%)" ;
                    }
                    else if (d.data.type == "CLAY" ) {
                        return d.data.type + " court: " + d.data.freq + " (" + Math.round(1000 * d.data.freq / sum) / 10  + "%)" +"\r\n" 
                        +"\r\n" +"Rafael Nadal  46" + " (" + Math.round(1000 * 46/sum)/10 + "%)" 
                        +"\r\n" +"David Ferrer 12" + " (" + Math.round(1000 * 12/sum)/10 + "%)" 
                        +"\r\n" +"Roger Federer 11" + " (" + Math.round(1000 * 11/sum)/10 + "%)" 
                        +"\r\n" +"Novak Djokovic 10" + " (" + Math.round(1000 * 10/sum)/10 + "%)" 
                        +"\r\n" +"Stan Wawrinka  3" + " (" + Math.round(1000 * 3/sum)/10 + "%)" 
                        +"\r\n" +"Marin Cilic  11" + " (" + Math.round(1000 * 11/sum)/10 + "%)" 
                        +"\r\n" +"Andy Murray  3" + " (" + Math.round(1000 * 3/sum)/10 + "%)" 
                        +"\r\n" +"Tomáš Berdych  2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"Kei Nishikori  2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"Milos Raonic 0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" ;
                    }
                    else if (d.data.type == "GRASS" ) {
                        return d.data.type + " court: " + d.data.freq + " (" + Math.round(1000 * d.data.freq / sum) / 10 + "%)"+"\r\n" 
                        +"\r\n" +"Roger Federer 14" + " (" + Math.round(1000 * 14/sum)/10 + "%)" 
                        +"\r\n" +"Andy Murray  5" + " (" + Math.round(1000 * 5/sum)/10 + "%)" 
                        +"\r\n" +"Rafael Nadal  3" + " (" + Math.round(1000 * 3/sum)/10 + "%)" 
                        +"\r\n" +"Novak Djokovic 2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"David Ferrer 2" + " (" + Math.round(1000 * 2/sum)/10 + "%)" 
                        +"\r\n" +"Tomáš Berdych  1" + " (" + Math.round(1000 * 1/sum)/10 + "%)" 
                        +"\r\n" +"Marin Cilic  1" + " (" + Math.round(1000 * 1/sum)/10 + "%)" 
                        +"\r\n" +"Stan Wawrinka  0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" 
                        +"\r\n" +"Kei Nishikori  0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" 
                        +"\r\n" +"Milos Raonic 0" + " (" + Math.round(1000 * 0/sum)/10 + "%)" ;
                    };                      
                })
        
        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        } 

        function caltotal(d){
  
			var total = d3.sum(data.map(function(d) {               
              return d.freq;                                       
            }));
            return total;
        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
  
			var total = d3.sum(data.map(function(d) {               
              return d.freq;                                       
            }));
            
			var percent = Math.round(1000 * d.data.freq / total) / 10;
			tooltip.select('.label').html(d.data.type);
            tooltip.select('.count').html(d.data.freq);
            tooltip.select('.percent').html(percent + '%');
            tooltip.style('display', 'block'); 	
            //tooltip.style('background','gray');
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
			tooltip.style('display', 'none'); 
        }		
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    
		
	
		
		
        return pC;
	}
    
	function edgePolygon(d){
		return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
	}	
	
	function transitionPart(data, id, p){
		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").data(data.mainBars[p]);
		
		mainbar.select(".mainrect").transition().duration(500)
			.attr("y",function(d){ return d.middle-d.height/2;})
			.attr("height",function(d){ return d.height;});
			
		mainbar.select(".barlabel").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;});
			
		mainbar.select(".barvalue").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return d.value ;});
			
		mainbar.select(".barpercent").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;});
			
		d3.select("#"+id).select(".part"+p).select(".subbars")
			.selectAll(".subbar").data(data.subBars[p])
			.transition().duration(500)
			.attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
	}
	
	function transitionEdges(data, id){
		d3.select("#"+id).append("g").attr("class","edges")
			.attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
			.transition().duration(500)
			.attrTween("points", arcTween)
			.style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});	
	}
	
	function transition(data, id){
		transitionPart(data, id, 0);
		transitionPart(data, id, 1);
		transitionEdges(data, id);
	}
	
	bP.draw = function(data, tF, svg){
		data.forEach(function(biP,s){
			svg.append("g")
				.attr("id", biP.id)
				.attr("transform","translate("+ (650*s)+",0)");
//------------------------------------------------------------------------------------------------draw pie----------------------------------------------------------------------------
            
			if (biP.id == "SinglesFinals" ) {
                var pC = drawPieChart(tF, biP.id); // create the pie-chart.
            };
            if (biP.id == "SinglesTitles" ) {
                var pC = drawPieChart2(tF, biP.id); // create the pie-chart.
            };
        
			var visData = visualize(biP.data);
			drawPart(visData, biP.id, 0);
			drawPart(visData, biP.id, 1); 
			drawEdges(visData, biP.id);
			drawHeader(biP.header, biP.id);
            
			[0,1].forEach(function(p){			
				d3.select("#"+biP.id)
					.select(".part"+p)
					.select(".mainbars")
					.selectAll(".mainbar")
					.on("mouseover",function(d, i){ return bP.selectSegment(data, p, i); })
					.on("mouseout",function(d, i){ return bP.deSelectSegment(data, p, i); });	
			});
		});
	}
	
	bP.selectSegment = function(data, m, s){
		data.forEach(function(k){
			var newdata =  {keys:[], data:[]};	
				
			newdata.keys = k.data.keys.map( function(d){ return d;});
			
			newdata.data[m] = k.data.data[m].map( function(d){ return d;});
			
			newdata.data[1-m] = k.data.data[1-m]
				.map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });
			
			transition(visualize(newdata), k.id);
				
			var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
				.selectAll(".mainbar").filter(function(d,i){ return (i==s);});
			
			selectedBar.select(".mainrect").style("stroke-opacity",1);			
			selectedBar.select(".barlabel").style('font-weight','bold');
			selectedBar.select(".barvalue").style('font-weight','bold');
			selectedBar.select(".barpercent").style('font-weight','bold');
		});
	}	
	
	bP.deSelectSegment = function(data, m, s){
		data.forEach(function(k){
			transition(visualize(k.data), k.id);
			
			var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
				.selectAll(".mainbar").filter(function(d,i){ return (i==s);});
			
			selectedBar.select(".mainrect").style("stroke-opacity",0);			
			selectedBar.select(".barlabel").style('font-weight','normal');
			selectedBar.select(".barvalue").style('font-weight','normal');
			selectedBar.select(".barpercent").style('font-weight','normal');
		});		
	}	  
    
	this.bP = bP;

}();
