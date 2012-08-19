(function($){
	$(document).ready(function() {
		$('#SaveButton').click(function(){
			$("#ProfileForm").submit();
			return false;
		});
	});
})($);