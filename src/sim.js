function Simulation() {
	this.paused = true;
	this.ships = [];
	this.loop = null;
	this.ticks = 0;
	this.report = {};
	for (var i=0;i<12;i++) { // max should be multiple of cL.l
		this.addShip(SHIP_TRADER, cargoList[i % cargoList.length]);
		this.addShip(SHIP_PIRATE);
		this.addShip(SHIP_HUNTER);
	}
}

Simulation.prototype.unpause = function() {
	if (this.paused) {
		this.paused = false;
		this.loop = window.setInterval(this.step.bind(this), 5);
	}
}

Simulation.prototype.pause = function() {
	if (!this.paused) {
		this.paused = true;
		window.clearInterval(this.loop); 
	}
}

Simulation.prototype.step = function() {
	this.ticks++;
	if (this.ticks % 10 == 0) {
		this.removeShip();
		this.addShip(null);
	}
	this.ships.forEach(this.stepShip.bind(this));
	this.makeReport();
}

Simulation.prototype.addShip = function(type, cpref) {
	if (type === null) {
		if (Math.random() > 0.5) {
			// half of all ships take a random type
			switch (Math.floor(Math.random()*3)) {
			case 0:
				type = SHIP_TRADER;
				break;
			case 1:
				type = SHIP_PIRATE;
				break;
			case 2:
				type = SHIP_HUNTER;
				break;
			}
		} else {
			// the other half take the currently highest average
			// profit profession
			// skip arrival if no professions are profitable...
			var types = Object.keys(this.report);
			var max = 0;
			for (var i=0; i<types.length; i++) {
				if (this.report[types[i]].avg > max) {
					max = this.report[types[i]].avg;
					if (types[i].substr(0,6) == "trader") {
						cpref = types[i].substr(7);
						type = "trader";
					} else {
						cpref = null;
						type = types[i];
					}
				}
			}
			if (max == 0) {
				return;
			}
		}
	}
	this.ships.push(new Ship(type, cpref));
}

Simulation.prototype.removeShip = function() {
	// ship with worst profitability leaves if negative
	// and has been around a while (don't count latest 10)
	var min = 0;
	var idx = -1;
	for (var i=0; i<this.ships.length-10; i++) {
		if (this.ships[i].profit < min) {
			min = this.ships[i].profit;
			idx = i;
		}
	}
	if (idx != -1) {
		this.ships.splice(idx,1);
	}
}

Simulation.prototype.stepShip = function(ship) {
	ship.evaded = false;
	ship.recharge();
	switch (ship.type) {
	case SHIP_TRADER:
		if (ship.location == 0) {
			ship.loadCargo();
			ship.repair();
		} else if (ship.location == 10) {
			ship.unloadCargo();
		} 
		ship.location++;
		if (ship.location > 10) {
			ship.location = 0;
		}
		break;
	case SHIP_PIRATE:
		if (ship.cargo.length > 0 || (ship.isDamaged() && ship.location != 0)) {
			if (ship.location == 10) {
				ship.unloadCargo();
				ship.location = 0;
			} else {
				ship.location++;
			}
		} else if (ship.location == 0) {
			ship.repair();
			ship.location++;
		} else if (ship.location == 10) {
			ship.location = 0;
		} else {
			var trader = this.findTrader(ship.location);
			if (trader) {
				this.piracy(ship,trader);
			} else if (ship.location == 1) {
				ship.location++;
			} else {
				ship.location += (Math.random()<0.7 ? 1 : -1);
			}
		}
		break;
	case SHIP_HUNTER:
		if (ship.isDamaged() && ship.location != 0) {
			if (ship.location == 10) {
				ship.location = 0;
			} else {
				ship.location++;
			}
		} else if (ship.location == 0) {
			ship.repair();
			ship.location++;
		} else if (ship.location == 10) {
			ship.location = 0;
		} else {
			var pirate = this.findPirate(ship.location);
			if (pirate) {
				this.hunting(ship,pirate);
			} else if (ship.location == 1) {
				ship.location++;
			} else {
				ship.location += (Math.random()<0.7 ? 1 : -1);
			}
		}
		break;
		
	}
}


Simulation.prototype.findTrader = function(loc) {
	return this.find(loc, SHIP_TRADER);
}

Simulation.prototype.findPirate = function(loc) {
	return this.find(loc, SHIP_PIRATE);
}

Simulation.prototype.find = function(loc, type) {
	var candidates = [];
	for (var i=0; i<this.ships.length; i++) {
		if (this.ships[i].location == loc && this.ships[i].type == type) {
			if (type == SHIP_TRADER && this.ships[i].cargo.length > 0) {
				// only hunt traders with cargo
				candidates.push(this.ships[i]);
			} else if (type == SHIP_PIRATE && this.ships[i].bounty > 0) {
				// only hunt pirates with a bounty
				candidates.push(this.ships[i]);
			}
		}
	}
	if (candidates.length == 0) {
		return false;
	} else {
		return candidates[Math.floor(Math.random()*candidates.length)];
	}
}

Simulation.prototype.piracy = function(pirate, trader) {
	var pscore, tscore;
	trader.evaded = true;
	// intercept
	if (pirate.interceptScore() < trader.interceptScore()) {
		trader.location++;
		console.log("Pirate failed intercept");
		return;
	}
	console.log("Pirate intercepted trader");
	pirate.offend("inter");
	var assault = false; var theft = false;
	while (trader.cargo.length > 0 && pirate.hull > 0 && trader.hull > 0) {
		if (trader.isDamaged()) {
			// try to flee
			tscore = trader.evadeScore();
			pscore = pirate.attackScore();
			if (OPTIONS.flag("piracy_dump") && pirate.hasFreeSpace()) {
				pirate.cargo.push(trader.cargo.pop());
				tscore *= 2;
				if (!theft) {
					theft = true;
					pirate.offend("theft");
				}
			}
			if (pscore > tscore) {
				if (trader.takeDamage(pirate)) {
					if (!theft) {
						theft = true;
						pirate.offend("theft");
					}
				}
				if (!assault) {
					assault = true;
					pirate.offend("assault");
				}
			} else {
				tscore += trader.fleeScore();
				pscore += pirate.attackScore();
				if (tscore > pscore) {
					break;
				} else {
					if (trader.takeDamage(pirate)) {
						if (!theft) {
							theft = true;
							pirate.offend("theft");
						}
					}
					if (!assault) {
						assault = true;
						pirate.offend("assault");
					}
				}
			}
		} else if (pirate.isDamaged()) {
			// try to flee
			tscore = trader.attackScore();
			pscore = pirate.evadeScore();
			if (tscore > pscore) {
				pirate.takeDamage(trader);
			} else {
				tscore += trader.attackScore();
				pscore += pirate.fleeScore();
				if (tscore > pscore) {
					pirate.takeDamage(trader);
				} else {
					console.log("Pirate escaped from trader");
					break;
				}
			}
		} else {
			// fight!
			tscore = trader.attackScore();
			pscore = pirate.evadeScore();
			if (tscore > pscore) {
				pirate.takeDamage(trader);
			}			
			tscore = trader.evadeScore();
			pscore = pirate.attackScore();
			if (tscore < pscore) {
				if (trader.takeDamage(pirate)) {
					if (!theft) {
						theft = true;
						pirate.offend("theft");
					}
				}
				if (!assault) {
					assault = true;
					pirate.offend("assault");
				}
			}			
		}
	}
	if (trader.hull <= 0) {
		pirate.offend("murder");
		console.log("Trader died to pirate");
		if (OPTIONS.flag("piracy_death")) {
			if (pirate.hasFreeSpace() && trader.cargo.length > 0) {
				pirate.cargo.push(trader.cargo.pop());
				if (!theft) {
					theft = true;
					pirate.offend("theft");
				}
			}
		}
		trader.die();
	} else {
		console.log("Trader escaped pirate");
		trader.location++;
	}
	if (pirate.hull <= 0) {
		console.log("Pirate died to trader");
		if (trader.hull > 0) {
			trader.profit += pirate.bounty;
		}
		pirate.die();
	} else {
		pirate.location--;
	}
}

Simulation.prototype.hunting = function(hunter, pirate) {
	// intercept
	pirate.evaded = true;
	if (hunter.interceptScore() < pirate.interceptScore()) {
		pirate.location++;
		console.log("Hunter failed intercept");
		return;
	}
	console.log("Hunter intercepted pirate");
	var assault = false;
	while (pirate.hull > 0 && hunter.hull > 0) {
		if (pirate.isDamaged()) {
			// try to flee
			hscore = hunter.attackScore();
			pscore = pirate.evadeScore();
			if (hscore > pscore) {
				pirate.takeDamage(hunter);
			} else {
				hscore += hunter.attackScore();
				pscore += pirate.fleeScore();
				if (pscore > hscore) {
					console.log("Pirate escaped from hunter");
					break;
				} else {
					pirate.takeDamage(hunter);
				}
			}
		} else if (hunter.isDamaged()) {
			// try to flee
			hscore = hunter.evadeScore();
			pscore = pirate.attackScore();
			if (pscore > hscore) {
				hunter.takeDamage(pirate);
				if (!assault) {
					assault = true;
					pirate.offend("assault");
				}
			} else {
				hscore += hunter.fleeScore();
				pscore += pirate.attackScore();
				if (hscore > pscore) {
					console.log("Hunter escaped from pirate");
					break;
				} else {
					hunter.takeDamage(pirate);
					if (!assault) {
						assault = true;
						pirate.offend("assault");
					}
				}
			}

		} else {
			// fight!
			hscore = hunter.attackScore();
			pscore = pirate.evadeScore();
			if (hscore > pscore) {
				pirate.takeDamage(hunter);
			}			
			hscore = hunter.evadeScore();
			pscore = pirate.attackScore();
			if (hscore < pscore) {
				hunter.takeDamage(pirate);
				if (!assault) {
					assault = true;
					pirate.offend("assault");
				}
			}			
		}
	}
	if (hunter.hull <= 0) {
		pirate.offend("murder");
		console.log("Pirate killed hunter");
		hunter.die();
	} else {
		hunter.location--;
	}
	if (pirate.hull <= 0) {
		console.log("Hunter killed pirate");
		if (hunter.hull > 0) {
			hunter.profit += pirate.bounty;
		}
		pirate.die();
	} else {
		pirate.location++;
	}
}

Simulation.prototype.makeReport = function() {
	var big = 1E12;
	var report = {
		trader : { count:0, min:big, t:0, max:-big, avg: 0 },
		trader_food : { count:0, min:big, t:0, max:-big, avg: 0 },
		trader_rocks : { count:0, min:big, t:0, max:-big, avg: 0 },
		trader_tech : { count:0, min:big, t:0, max:-big, avg: 0 },
		trader_metal : { count:0, min:big, t:0, max:-big, avg: 0 },
		pirate : { count:0, min:big, t:0, max:-big, avg: 0 },
		hunter : { count:0, min:big, t:0, max:-big, avg: 0 },
	}
	var rephtml = {};
	for (var i=0;i<=10;i++) {
		rephtml['#location_'+i] = "";
	}
	this.ships.forEach(function(ship) {
		var t = ship.type;
		var p = ship.profit;
		report[t].count++;
		report[t].t+=p;
		if (report[t].min > p) {
			report[t].min = p;
		}
		if (report[t].max < p) {
			report[t].max = p;
		}
		report[t].avg = report[t].t / report[t].count;
		var sym = ship.type.substr(0,1);
		if (!ship.isDamaged()) {
			sym = sym.toUpperCase();
		}
		rephtml['#location_'+ship.location] += "<span class='"+ship.type+" skill"+ship.skill+"'>"+sym+"</span>&#8203;";

		if (t == SHIP_TRADER) {
			t += "_"+ship.cargopref;
			report[t].count++;
			report[t].t+=p;
			if (report[t].min > p) {
				report[t].min = p;
			}
			if (report[t].max < p) {
				report[t].max = p;
			}
			report[t].avg = report[t].t / report[t].count;

		}
		
	});
	var xs = Object.keys(report);
	var ys = ["count", "min", "avg", "max"];
	xs.forEach(function(x) {
		if (report[x].count == 0) {
			report[x].min = 0;
			report[x].max = 0;
		}
		ys.forEach(function(y) {
			$('#result_'+x+'_'+y).html(report[x][y].toFixed(0));
		});
	});
	this.report = report;
	$('#button_step').html("Step "+this.ticks);
	for (var i=0;i<=10;i++) {
		$('#location_'+i).html(rephtml['#location_'+i]);
	}

}





var SIMULATION = null;
$(document).ready(function() {
	SIMULATION = new Simulation();
	$('#button_go').click(function() {
		SIMULATION.unpause();
	});
	$('#button_stop').click(function() {
		SIMULATION.pause();
	});
	$('#button_step').click(function() {
		SIMULATION.step();
	});
	$('#button_reset').click(function() {
		SIMULATION.pause();
		delete SIMULATION;
		SIMULATION = new Simulation();
		SIMULATION.step();
	});
	SIMULATION.step();

});
