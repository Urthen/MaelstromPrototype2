(function($){

	function applyPermissions() {
		var scopes = []
		$(".permissions .allowed").each(function() {
			scopes.push($(this).attr('data-scope'));
		})
		$("#ScopeInput").val(scopes.join(','));
	}

	$(document).ready(function() {
		applyPermissions();

		$(".permissions li .button").each(function() {
			var $this = $(this);
			$this.click(function() {
				console.log($this);
				if ($this.hasClass('affirmative')) {
					console.log("affirmative")
					$this.parents('li').removeClass('denied').addClass('allowed');
				} else {
					console.log("negative", $this.parents('li'))
					$this.parents('li').removeClass('allowed').addClass('denied');
				}
				applyPermissions();
			});
		});
	});
})($);