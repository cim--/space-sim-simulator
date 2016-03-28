function Options() {
	
}

/* Ship property options */
Options.prototype.shipProp = function(type, prop) {
	return parseInt($('[name='+type+'_'+prop+']').val());
}

Options.prototype.speed = function(type) {
	return this.shipProp(type,"speed");
}
Options.prototype.hull = function(type) {
	return this.shipProp(type,"hull");
}
Options.prototype.shields = function(type) {
	return this.shipProp(type,"shields");
}
Options.prototype.weapons = function(type) {
	return this.shipProp(type,"weapons");
}
Options.prototype.turn = function(type) {
	return this.shipProp(type,"turn");
}
Options.prototype.cargo = function(type) {
	return this.shipProp(type,"cargo");
}
Options.prototype.cost = function(type) {
	return this.shipProp(type,"cost");
}
Options.prototype.running = function(type) {
	return this.shipProp(type,"running");
}

/* Trade prices */
Options.prototype.tradePrice = function(good, station) {
	return parseInt($('[name='+good+'_'+station+']').val());
}

/* Fines */
Options.prototype.fine = function(crime) {
	return parseInt($('[name='+crime+'_fine]').val());
}
Options.prototype.bounty = function(crime) {
	return parseInt($('[name='+crime+'_bounty]').val());
}

/* Settings */
Options.prototype.flag = function(flag) {
	return $('[name='+flag+']').is(':checked');
}
Options.prototype.opt = function(opt) {
	return $('[name='+opt+']').val();
}

/* Import/export */

var OPTION_SETTINGS = [
	"trader_speed","trader_hull","trader_shields","trader_weapons","trader_turn","trader_cargo","trader_cost","trader_running",
	"pirate_speed","pirate_hull","pirate_shields","pirate_weapons","pirate_turn","pirate_cargo","pirate_cost","pirate_running",
	"hunter_speed","hunter_hull","hunter_shields","hunter_weapons","hunter_turn","hunter_cargo","hunter_cost","hunter_running",
	"food_buy","food_sell",
	"rocks_buy","rocks_sell",
	"tech_buy","tech_sell",
	"metal_buy","metal_sell",
	"inter_fine","inter_bounty",
	"assault_fine","assault_bounty",
	"theft_fine","theft_bounty",
	"murder_fine","murder_bounty",
	"piracy_fence",
	"death_cost","death_per","damage_per"
];

var OPTION_FLAGS = [
	"piracy_dump","piracy_hack","piracy_break","piracy_death",
	"death_fine","death_bounty","death_cargo"
];

Options.prototype.import = function() {
	var opts = JSON.parse($('#settings_box').val());
	OPTION_SETTINGS.forEach(function(setting) {
		$('[name='+setting+']').val(opts[setting]);
	});
	OPTION_FLAGS.forEach(function(flag) {
		if (opts[flag]) {
			$('[name='+flag+']').prop('checked', true);
		} else {
			$('[name='+flag+']').prop('checked', false);
		}
	});
}

Options.prototype.export = function() {
	var opts = {};
	OPTION_SETTINGS.forEach(function(setting) {
		opts[setting] = $('[name='+setting+']').val();
	});
	OPTION_FLAGS.forEach(function(flag) {
		if ($('[name='+flag+']').is(':checked')) {
			opts[flag] = 1;
		}
	});
	
	$('#settings_box').val(JSON.stringify(opts));
}



var OPTIONS = new Options();

$(document).ready(function() {
	$('#button_import').click(OPTIONS.import);
	var eoc = function(name) {
		$('[name='+name+']').change(OPTIONS.export);
	}
	OPTION_SETTINGS.forEach(eoc);
	OPTION_FLAGS.forEach(eoc);
});
