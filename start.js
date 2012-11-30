var newTr = $('<table align="center" id="contentContainer" width="100%"><tr><td><table class="content-border" width="100%" cellspacing="0"><tr><td id="inner-border"><div id="newContent">Hi</div></td></tr></table></td></tr></table>').insertBefore('#contentContainer');
var outPut = $('#newContent').html('<ul id="messages" style="float:left;"><li id="loading">Loading ... please wait</li><li>Creating the conf table</li></ul>');
var configTable = $('<input type="text" id="coords"/><button id="saveCoords">Save Villages to attack</button><table style="float:left;"><tbody><tr><td valign="top"><table class="vis" width="100%"><tbody><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_spear.png?48b3b" title="Spear fighter" alt="" class=""><input id="unit_input_spear" name="spear" type="text" style="width: 40px" tabindex="1" value="" class="unitsInput" /><i id="amount_of_unit_input_spear">0</i>&nbsp;</td></tr><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_sword.png?b389d" title="Swordsman" alt="" class=""><input id="unit_input_sword" name="sword" type="text" style="width: 40px" tabindex="2" value="" class="unitsInput" /><i id="amount_of_unit_input_sword">0</i>&nbsp;</td></tr><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_axe.png?51d94" title="Axeman" alt="" class=""><input id="unit_input_axe" name="axe" type="text" style="width: 40px" tabindex="3" value="" class="unitsInput" /><i id="amount_of_unit_input_axe">0</i>&nbsp;</td></tr></tbody></table></td><td valign="top"><table class="vis" width="100%"><tbody><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_spy.png?eb866" title="Scout" alt="" class=""><input id="unit_input_spy" name="spy" type="text" style="width: 40px" tabindex="4" value="" class="unitsInput" /><i id="amount_of_unit_input_spy">0</i>&nbsp;</td></tr><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_light.png?2d86d" title="Light cavalry" alt="" class=""><input id="unit_input_light" name="light" type="text" style="width: 40px" tabindex="5" value="" class="unitsInput" /><i id="amount_of_unit_input_light">0</i>&nbsp;</td></tr><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_heavy.png?a83c9" title="Heavy cavalry" alt="" class=""><input id="unit_input_heavy" name="heavy" type="text" style="width: 40px" tabindex="6" value="" class="unitsInput" /><i id="amount_of_unit_input_heavy">0</i>&nbsp;</td></tr></tbody></table></td><td valign="top"><table class="vis" width="100%"><tbody><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_ram.png?2003e" title="Ram" alt="" class=""><input id="unit_input_ram" name="ram" type="text" style="width: 40px" tabindex="7" value="" class="unitsInput" /><i id="amount_of_unit_input_ram">0</i>&nbsp;</td></tr><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_catapult.png?5659c" title="Catapult" alt="" class=""><input id="unit_input_catapult" name="catapult" type="text" style="width: 40px" tabindex="8" value="" class="unitsInput" /><i id="amount_of_unit_input_spear">0</i>&nbsp;</td></tr></tbody></table></td><td valign="top"><table class="vis" width="100%"><tbody><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_knight.png?58dd0" title="Paladin" alt="" class=""><input id="unit_input_knight" name="knight" type="text" style="width: 40px" tabindex="9" value="" class="unitsInput" /><i id="amount_of_unit_input_knight">0</i>&nbsp;</td></tr><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/unit/unit_snob.png?0019c" title="Nobleman" alt="" class=""><input id="unit_input_snob" name="snob" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" /><i id="amount_of_unit_input_snob">0</i>&nbsp;</td></tr><tr><td class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/command/attack.png?0019c" title="Attacked villages" alt="" class=""><input id="attackedVillages" name="attackedVillages" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" disabled="disabled" /><i id="amount_of_attackedVillages">0</i>&nbsp;</td></tr></tbody></table></td></tr></tbody></table>').appendTo(outPut);
var rallyPointUrl = '/game.php?village=' + game_data.village.id + '&screen=place';
var hiddenFrame = $('<iframe src="' + rallyPointUrl + '" />').load(frameLoaded).attr('width', '0px').attr('height','0px').appendTo(outPut).hide();
var resetCoordsButton = $('<button id="resetCoords">Change coords</button>').click(resetCoords).appendTo(outPut).hide();
var attackButton = $('<button id="attackButton">Attack</button>').click(attack).appendTo(outPut);
var sAttackButton = $('<button id="sAttackButton">Stop attacking</button>').click(stopAttack).appendTo(outPut).hide();

var villages = readCookie('coords');
var villagearr;
var targets;
var position = readCookie('position') || 0;
var attacking = false;
var continueAttack = true;

if(villages!=null) {
	hideCoords();
}
function hideCoords() {
	$('#coords').hide();
	$('#saveCoords').hide();
	villagearr = villages.split(" ");
	targets = villagearr.length;
	resetCoordsButton.show();
}
$('#saveCoords').click(function(e) {
	villages = $('#coords').val().trim();
	writeCookie('coords', villages);
	hideCoords();
	writeOut('Saved the coords!');
});
var unitTypes = {'unit_input_spear': 'Spears', 'unit_input_sword': 'Swords', 'unit_input_axe': 'Olafs', 'unit_input_spy': 'Scouts', 'unit_input_light': 'LC', 'unit_input_heavy': 'HC', 'unit_input_ram': 'Rams', 'unit_input_catapult': 'Catas', 'unit_input_knight': 'Palas', 'unit_input_snob':'Nobles'};
var unitPerAttack = [];
for(unitType in unitTypes) {
	unitPerAttack[unitType] = readCookie(unitType) || 0;
}
function sendUnits(unitType) {
	if(unitPerAttack[unitType] == 0) return true;
	if(parseInt(hiddenFrame.contents().find('#' + unitType).siblings().last().html().replace(/^\(|\)$/g, "")) >= parseInt(unitPerAttack[unitType])) {
		hiddenFrame.contents().find('#' + unitType).val(unitPerAttack[unitType]);
		return true;
	}
	UI.ErrorMessage(('Not enough units of type: ' + unitTypes[unitType]), 3000);
	stopAttack();
	return false;
}
function writeOut(message) {
	$('#messages').append('<li>' + message + '</li>');
}
function writeCookie(name, value) {
	document.cookie = game_data.village.id + '_' + name + '=' + value;
}
function readCookie(name) {
	var nameEQ = game_data.village.id + '_' + name + "=";
	var ca = document.cookie.split(';');
	for(var j=0;j < ca.length;j++) {
		var c = ca[j];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
function resetCoords() {
	writeCookie('coords', '');
	$('#coords').val(villages).fadeIn();
	$('#saveCoords').fadeIn();
	resetCoordsButton.hide();
	writeOut('reset the coords');
}
function frameLoaded() {
	$('#loading').fadeOut();
	var submitAttack = hiddenFrame.contents().find('#troop_confirm_go');
	var botProtection = hiddenFrame.contents().find('#bot_check');
	if(botProtection.size() != 0) {
	}
	if(submitAttack.size() == 0) {
		$('#attackedVillages').val(position);
		$('#amount_of_attackedVillages').html(targets);
		for(unitType in unitPerAttack) {
			$('#' + unitType).val(unitPerAttack[unitType]).change(
				function(e){
					unitPerAttack[e.target.id] = $(e.target).val();
					writeCookie(e.target.id, unitPerAttack[e.target.id]);
					writeOut('Updated amount for ' + unitTypes[e.target.id] + ' to: ' + unitPerAttack[e.target.id]);
				});
			$('#amount_of_' + unitType).html(hiddenFrame.contents().find('#' + unitType).siblings().last().html().replace(/^\(|\)$/g, ""));
		}
		if(attacking && continueAttack) {
			attack();
		}
	} else {
		position++;
		writeCookie('position', position);
		$('#loading').show();
		submitAttack.click();
	}
}
function attack() {
	attackButton.hide();
	sAttackButton.show();
    coordData = villagearr[position];
    getCoords = coordData.split("|");
	continueAttack = true;
	for(unitType in unitPerAttack) {
		if(continueAttack) {
			continueAttack = sendUnits(unitType);
		}
	}
	if(continueAttack) {
		hiddenFrame.contents().find('#inputx').val(getCoords[0]);
		hiddenFrame.contents().find('#inputy').val(getCoords[1]);
		hiddenFrame.contents().find('#target_attack').click();
		attacking = true;
		$('#loading').show();
		writeOut('Attacking: [' + coordData + ']');
		if(position >= targets - 1) {
			stopAttack();
		}
	}
}
function stopAttack() {
	attackButton.show();
	sAttackButton.hide();
	attacking = false;
	continueAttack = false;
	if(position >= targets - 1) {
		UI.SuccessMessage("Cycle complete, stopping attack and resetting to first Coords.", 3000);
		position=0;
		writeCookie('position', 0);
	}
}