(function($){
	$(document).ready(function() {
		$('#SaveButton').click(function(){
			$("#ProfileForm").submit();
			return false;
		});

		$(".RemoveEmail").click(function(){
			var $this = $(this);

			$this.addClass('hidden');			
			$this.siblings('input[name="keepEmail"]').attr('name', 'removeEmail');
			$this.siblings('.RemoveNote').removeClass('hidden');

			return false;
		});

		$(".AddEmail").click(function(){
			var $this = $(this);
			$this.parent().clone(true).appendTo($this.closest('.inforow')).find('input[name="addEmail"]').val('');
			$this.remove();
		})
	});
})($);