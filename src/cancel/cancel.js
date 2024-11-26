'use strict'

function Cancel(){

}
Cancel.prototype.toString = function toString(){
    return this.message ? `Cancel: ${this.message}` : 'Cancel';
}

Cancel.prototype.__CANCEL__ = true;

export default Cancel
