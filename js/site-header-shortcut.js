(function() {
    var isCtrl = false;

    document.addEventListener('keyup', function(e) {
        if (e.which === 17) {
            isCtrl = false;
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.which === 17) {
            isCtrl = true;
        }
        if (e.which === 82 && isCtrl === true) {
            var randomButton = document.getElementById('random-button');
            if (randomButton) {
                randomButton.click();
            }
        }
    });
})();
