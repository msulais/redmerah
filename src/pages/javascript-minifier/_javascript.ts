export const DEFAULT_JAVASCRIPT_INPUT_TEXT = `console.log("Hello world")

function add(num1, num2){
    return num1 + num2
}

const PI = Math.PI
console.log(add(90, PI))

(() => {
    'use strict'
    let firstName = 'Lorem'
    let secondName = 'Ipsum'

    function log(...data) {
        return console.log(...data)
    }

    log(firstName, secondName)
    log(1, 2, 0xE123, firstName, secondName)
})()`