var blackBox = {
	
	grid: {
		data: [[],[],[],[],[],[],[],[]],
		
		codes: {FULL:1,EMPTY:0,OFF:2},
		
		get: function(x,y) {
			if((0<=x && x<8)&&(0<=y && y<8)) {
				return(blackBox.grid.data[x][y]);
				}
			else {
				return(blackBox.grid.codes.OFF);
				}
			},
		
		getAhead: function(beam) {
			var dx=[[-1,0,1],[1,1,1],[1,0,-1],[-1,-1,-1]];
			var dy=[[1,1,1],[1,0,-1],[-1,-1,-1],[-1,0,1]];
			var ahead = [];
			var gridData = blackBox.grid.data;
			
			dx=dx[beam.dir];
			dy=dy[beam.dir];
			
			for(var i=0;i<3;i++) {
				var tx=beam.x+dx[i];
				var ty=beam.y+dy[i];
				if((0<=tx && tx<8)&&(0<=ty && ty<8)) {
					ahead.push(gridData[tx][ty]);
					}
				else {
					ahead.push(blackBox.grid.codes.OFF);
					}
				}
			return(ahead);
			},
		
		set: function(x,y,value) {
			blackBox.grid.data[x][y] = value;
			},
		
		init: function() {
			for(var ix=0;ix<8;ix++) {
				for(var iy=0;iy<8;iy++) {
					blackBox.grid.data[ix][iy] = blackBox.grid.codes.EMPTY
					}
				}
			}
		},
	
	Beam: {
		Build: function(x,y,dir,end) {
			this.x=x;this.y=y;this.dir=dir;this.end=end;
			},
		
		advance: function(beam) {
			var dx=[0,1,0,-1],dy=[1,0,-1,0];
			var tx=(beam.x + dx[beam.dir]);
			var ty=(beam.y + dy[beam.dir]);
			var ahead = blackBox.grid.getAhead(beam);
			var gridCodes = blackBox.grid.codes;
			
			if(ahead[1]==gridCodes.FULL) {
				return(new blackBox.Beam.Build(-1,-1,-1,-1));//Beam is absorbed
				}
			if(ahead[0]==gridCodes.FULL && ahead[2]==gridCodes.FULL) {
				return(new blackBox.Beam.Build(beam.x,beam.y,blackBox.Beam.turn.reverseFrom(beam.dir),0));
				}
			if(ahead[0]==gridCodes.OFF && ahead[1]==gridCodes.OFF && ahead[2]==gridCodes.OFF) {
				return(new blackBox.Beam.Build(-1,-1,-1,blackBox.Beam.exits(beam)));
				}
			if((ahead[2]==gridCodes.FULL || ahead[0]==gridCodes.FULL) && blackBox.grid.get(beam.x,beam.y)==gridCodes.OFF) {
				return(new blackBox.Beam.Build(tx,ty,blackBox.Beam.turn.reverseFrom(beam.dir),0));
				}
			if(ahead[0]==gridCodes.FULL) {
				return(new blackBox.Beam.Build(beam.x,beam.y,blackBox.Beam.turn.rightFrom(beam.dir),0));
				}
			if(ahead[2]==gridCodes.FULL) {
				return(new blackBox.Beam.Build(beam.x,beam.y,blackBox.Beam.turn.leftFrom(beam.dir),0));
				}
			else {
				return(new blackBox.Beam.Build(tx,ty,beam.dir,0));
				}
			},
		
		exits: function(beam) {
			switch(beam.dir) {
				case(0):
					return(24-beam.x);
				case(1):
					return(9+beam.y);
				case(2):
					return(beam.x+1);
				case(3):
					return(32-beam.y);
				}
			},
		
		turn: {
			leftFrom: function(dir) {switch(dir){case(0):return(3);case(1):return(0);case(2):return(1);case(3):return(2);}},
			rightFrom: function(dir) {switch(dir){case(0):return(1);case(1):return(2);case(2):return(3);case(3):return(0);}},
			reverseFrom: function(dir) {switch(dir){case(0):return(2);case(1):return(3);case(2):return(0);case(3):return(1);}}
			},
		
		start: function(startPos) {
			if(0<startPos && startPos<9){return(new blackBox.Beam.Build(startPos-1,-1,0,0));}
			if(8<startPos && startPos<17){return(new blackBox.Beam.Build(8,(startPos-9),3,0));}
			if(16<startPos && startPos<25){return(new blackBox.Beam.Build((24-startPos),8,2,0));}
			if(24<startPos && startPos<33){return(new blackBox.Beam.Build(-1,(32-startPos),1,0));}
			}
		},
	
	setup: {
		
		molecule: function(atoms) {
			var placed=0;
			while(placed<atoms) {
				var x=Math.floor((Math.random()*8));
				var y=Math.floor((Math.random()*8));
				if(blackBox.grid.get(x,y)!=blackBox.grid.codes.FULL) {
					blackBox.grid.set(x,y,blackBox.grid.codes.FULL);
					placed++;
					}
				}
			},
		
		grid: function() {
			blackBox.grid.init();
			}
		
		},
	
	play: {
		
		guesses: [],
		
		traceFrom: function(startPos) {
			var beam = blackBox.Beam.start(startPos);
			while(beam.end == 0) {
				beam = blackBox.Beam.advance(beam);
				}
			return(beam.end);
			},
		
		reveal: function() {
				
			},
			
		placeGuess: function(x,y) {
			var gIdx = blackBox.play.guesses.length;
			var guessObj = {gX:x,gY:y,idx:gIdx};
			blackBox.play.guesses[gIdx]=guessObj;
			blackBox.drawing.addToSVG(blackBox.drawing.guess(guessObj));
			},
		
	    clearGuess: function(guessObj) {
		    document.getElementById('guess'+guessObj.idx.toString()).remove();
		    blackBox.play.guesses.splice(guessObj.idx,1);
			},
		
		placeTrace: function(entry) {
			var exit = blackBox.play.traceFrom(entry);
			if(exit == entry) {
				//Reflected, place white pawn
				blackBox.drawing.pawn(entry,'white');
				}
			if(exit == -1) {
				//Absorbed, place black pawn
				blackBox.drawing.pawn(entry,'black');
				}
			if((exit!=entry)&&(exit!=-1)) {
				//Passed through, mark exit and entry
				colour = blackBox.drawing.colours.pop();
				if(colour!=undefined) {
					blackBox.drawing.pawn(exit,colour);
					blackBox.drawing.pawn(entry,colour);
					}
				else {
					console.log("Out of colours...")
					}
				}
			}
		
		},
	
	drawing: {
		colours: ["brown","blue","darkgreen","orange","purple","red","yellow","lightgreen"],
		
		exitPoints: function() {
			var x,y;
			var groupBundle = '<g id="exitPoints">';
			for(var i=1;i<33;i++) {
				if(0<i && i<9){x=100*i;y=900;}
				if(8<i && i<17){x=900;y=100*(17-i);}
				if(16<i && i<25){x=100*(25-i);y=0;}
				if(24<i && i<33){x=0;y=100*(i-24);}
				groupBundle += '<g transform="translate('+x.toString()+','+y.toString()+')" width="100" height="100" id="ep'+i.toString()+'" \
				onclick="top.blackBox.play.placeTrace('+i.toString()+')">\n\
				<circle cx="50" cy="50" r="40" stroke="#aaaaaa" stroke-width="4" fill="none"/>\n\
				<text x="50" y="68" style="font-size:60;fill:#aaaaaa;text-anchor:middle;">'+i.toString()+'</text>\n\
				</g>\n';
				}
			groupBundle += '</g>';
			return(groupBundle);
			},
		
		gridSquares: function() {
			var dx,dy;
			var groupBundle = '<g id="squares">';
			for(var cx=0;cx<8;cx++) {
				for(var cy=0;cy<8;cy++) {
					dx=((cx+1)*100)+5;dy=((8-cy)*100)+5;
					groupBundle += '<rect x="'+dx.toString()+'" y="'+dy.toString()+'" rx="10" ry="10" width="90" height="90" fill="#ffffff" \
					onclick="top.blackBox.play.placeGuess('+cx.toString()+','+cy.toString()+')"/>\n'
					}
				}
			groupBundle += '</g>';
			return(groupBundle);
			},
		
		guess: function(guessObj) {
			var dx,dy;
			dx=((guessObj.gX+1)*100)+50;dy=((8-guessObj.gY)*100)+50;
			return('<circle id="guess'+guessObj.idx.toString()+'" \
				   onclick="top.blackBox.play.clearGuess({gX:'+guessObj.gX.toString()+',gY:'+guessObj.gY.toString()+',idx:'+guessObj.idx.toString()+'})" \
				   cx="'+dx.toString()+'" cy="'+dy.toString()+'" r="40" fill="#dddddd"/>\n');
				   },
		
		pawn: function(exitPoint,colour) {
			cDict = {black:"Black",brown:"Brown",blue:"DBlue",darkgreen:"DGreen",lightgreen:"LGreen",orange:"Orange",purple:"Purple",red:"Red",white:"White",yellow:"Yellow"};
			var x,y;
			if(0<exitPoint && exitPoint<9){x=100*exitPoint;y=900;}
			if(8<exitPoint && exitPoint<17){x=900;y=100*(17-exitPoint);}
			if(16<exitPoint && exitPoint<25){x=100*(25-exitPoint);y=0;}
			if(24<exitPoint && exitPoint<33){x=0;y=100*(exitPoint-24);}
			blackBox.drawing.addToSVG('<image xlink:href="resources/pawn'+cDict[colour]+'.svg" x="'+x.toString()+'" y="'+y.toString()+'" height="100" width="100">');
			},
		
		board: function() {
			var bundle;
			bundle = blackBox.drawing.gridSquares() + blackBox.drawing.exitPoints();
			blackBox.drawing.addToSVG(bundle);
			},
		
		addToSVG: function(toAdd) {
			svgDiv = document.getElementById("gameWrapper");
			svgDiv.innerHTML = (svgDiv.innerHTML.replace("</svg>","")) + toAdd + "</svg>";
			}
		}
	}