$(document).ready(function() {

	var hideall = function() {
		$('#panelcontroller li').removeClass("selected");
		$('.panel').hide();
	}
	var showone = function(one) {
		$('#'+one).show();
		$('#ctrl_'+one).addClass("selected");
	}
	
	$('#ctrl_summary').click(function() {
		hideall();
		showone("summary");
	});
	$('#ctrl_parameters').click(function() {
		hideall();
		showone("parameters");
	});
	

});
