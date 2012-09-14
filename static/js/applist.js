(function($){
	$(document).ready(function() {
		$("#ShowDetails").click(function() {
			var $this = $(this);
			if ($this.hasClass("open")) {
				$this.text("Details").removeClass("open").parents(".application").find(".permissions").hide("slow");
			} else {
				$this.text("Hide Details").addClass("open").parents(".application").find(".permissions").removeClass("hidden").hide().show("slow");				
			}
		})
	});
})($);