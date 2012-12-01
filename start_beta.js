// prevent global namespace pollution
$(function() {
	$.ajax({
        type:'GET',
        url:"https://raw.github.com/tribalCarigan/Tribalwars/master/htmlsnippets/contentContainer.html",
        success:function(result) {
            $(result.htmlSnippet).insertBefore('#contentContainer');
			init();
        },
        dataType:'jsonp'
    });
	var outPut, hiddenFrame, resetCoordsButton, attackButton, sAttackButton, buttons, messages;
	
	var initialized = false;

	function init() {
		outPut = $('#newContent');
		hiddenFrame = $('<iframe src="/game.php?village=' + game_data.village.id + '&screen=place" />').load(frameLoaded).attr('width', '0px').attr('height','0px').appendTo(outPut).hide();
		resetCoordsButton = $('#resetCoords').click(resetCoords).appendTo(outPut).hide();
		attackButton = $('#attackButton').click(attack).appendTo(outPut);
		sAttackButton = $('#sAttackButton').click(stopAttack).appendTo(outPut).hide();
		buttons = $('#buttons').css('margin-left', '300px');
		messages = $('#messages').css({float:'left',width:'300px',height:'200px',overflow:'auto'});
		initialized = true;
	}
	
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
		messages.scrollTop(messages[0].scrollHeight); 
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
});
