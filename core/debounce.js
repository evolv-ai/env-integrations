
export function debounce(fnc){
    var timeout;
    return function(...args){
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }

        // Setup the new requestAnimationFrame()
        timeout = window.requestAnimationFrame(function () {
            fnc.apply(null, ...args)
        });
    }
}