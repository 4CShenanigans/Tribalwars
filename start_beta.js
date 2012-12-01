var c;
$(function() {
	$.ajax({
        type:'GET',
        url: 'https://raw.github.com/tribalCarigan/Tribalwars/master/htmlsnippets/contentContainerBeta.html',
		data: 'callback=c',
        success: function(data){c(data);},
        dataType:'jsonp'
    });
	var outPut, hiddenFrame, resetCoordsButton, attackButton, sAttackButton, rAttackButton, messages, spinner;
	
	var attackTemplates = {};
	
	var initialized = false;

	c = function(data) {
		$(data.htmlSnippet).insertBefore('#contentContainer');
		outPut = $('#newContent');
		$('<link rel="stylesheet" type="text/css" href="https://raw.github.com/tribalCarigan/Tribalwars/master/htmlsnippets/contentContainer.css" />').appendTo('body');
		hiddenFrame = $('<iframe src="/game.php?village=' + game_data.village.id + '&screen=place" />').load(frameLoaded).attr('width', '0px').attr('height','0px').appendTo(outPut).hide();
		resetCoordsButton = $('#resetCoords').click(resetCoords).hide();
		attackButton = $('#attackButton').click(attack);
		sAttackButton = $('#sAttackButton').click(stopAttack).hide();
		rAttackButton = $('#resetAttack').click(resetAttack);
		spinner = $('#loading').css({'float':'right'});
		// css isn't loaded in chrome when served from github because of faulty headers
		$('#buttons').css({'margin-left': '300px'});
		messages = $('#messages').css({'list-style': 'none','float': 'left','width': '250px','height': '90px','overflow': 'auto'});
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
			storeVal('coords', villages);
			hideCoords();
			writeOut('Saved the coords!');
		});
		initialized = true;
	}
	
	var villages = loadVal('coords');
	var villagearr;
	var targets;
	var position = loadVal('position') || 0;
	var attacking = false;
	var continueAttack = true;

	var unitTypes = {
		'unit_input_spear': 'Spears', 
		'unit_input_sword': 'Swords', 
		'unit_input_axe': 'Olafs', 
		'unit_input_spy': 'Scouts', 
		'unit_input_light': 'LC', 
		'unit_input_heavy': 'HC', 
		'unit_input_ram': 'Rams', 
		'unit_input_catapult': 'Catas', 
		'unit_input_knight': 'Palas', 
		'unit_input_snob':'Nobles'
	};
	var unitPerAttack = [];

	for(unitType in unitTypes) {
		unitPerAttack[unitType] = loadVal(unitType) || 0;
	}
	function sendUnits(unitType) {
		if(unitPerAttack[unitType] == 0) return true;
		var unitAmount = hiddenFrame.contents().find('#' + unitType).siblings().last().html();
		if(parseInt(unitAmount.substr(1, unitAmount.length - 2)) >= parseInt(unitPerAttack[unitType])) {
			hiddenFrame.contents().find('#' + unitType).val(unitPerAttack[unitType]);
			return true;
		}
		UI.ErrorMessage(('Not enough units of type: ' + unitTypes[unitType]), 3000);
		stopAttack();
		return false;
	}
	function writeOut(message) {
		messages.append('<li>' + message + '</li>');
		messages.scrollTop(messages[0].scrollHeight); 
	}
	function storeVal(name, value) {
		localStorage.setItem(game_data.village.id + '_' + name, value);
	}
	function loadVal(name) {
		return localStorage.getItem(game_data.village.id + '_' + name);
	}
	function deleteVal(name) {
		localStorage.removeItem(game_data.village.id + '_' + name)
	}
	function resetCoords() {
		$('#coords').val(villages).fadeIn();
		$('#saveCoords').fadeIn();
		resetCoordsButton.hide();
		writeOut('reset the coords');
	}
	function frameLoaded() {
		spinner.fadeOut();
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
						storeVal(e.target.id, unitPerAttack[e.target.id]);
						writeOut('Updated amount for ' + unitTypes[e.target.id] + ' to: ' + unitPerAttack[e.target.id]);
					});
				var unitAmount = hiddenFrame.contents().find('#' + unitType).siblings().last().html();
				$('#amount_of_' + unitType).html(unitAmount.substr(1, unitAmount.length - 2));
			}
			if(attacking && continueAttack) {
				attack();
			}
		} else {
			position++;
			storeVal('position', position);
			spinner.show();
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
			spinner.show();
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
			$('#attackedVillages').val(position);
			storeVal('position', 0);
		}
	}
	function resetAttack() {
			UI.SuccessMessage("Resetting to first Coords.", 3000);
			position=0;
			$('#attackedVillages').val(position);
			storeVal('position', 0);
			
	}
});
