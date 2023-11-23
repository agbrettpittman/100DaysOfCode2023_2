"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Interfaces_1 = require("./Interfaces");
var isOpen = false;
var myName = 'Brett';
var myAge = 27;
var list = [0, 1, 2];
var me = ['Brett', 27, false];
var Job;
(function (Job) {
    Job[Job["WebDev"] = 0] = "WebDev";
    Job[Job["WebDesigner"] = 1] = "WebDesigner";
    Job[Job["NetworkEngineer"] = 2] = "NetworkEngineer";
})(Job || (Job = {}));
var job = Job.WebDev;
var phone = 'Galaxy';
var tablet = 3;
function sayWord(word) {
    if (word === void 0) { word = "Hello"; }
    var otherStuff = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherStuff[_i - 1] = arguments[_i];
    }
    console.log(otherStuff);
    return word;
}
sayWord("hello", "Brett");
var newName = 'Brett';
newName = 10;
var newNameTwo = newName;
newNameTwo = 10;
function makeMargin(x) {
    switch (typeof x) {
        case 'string':
            return "margin: ".concat(x);
        case 'number':
            return "margin: ".concat(x, "px");
        default:
            return "margin: 0";
    }
}
console.log(makeMargin(10));
console.log(makeMargin('auto'));
var cat;
cat = "Kiki";
function sayName(_a) {
    var name = _a.name, age = _a.age, friends = _a.friends;
    console.log(name);
    return name || 'No Name';
}
sayName({ name: "Brett", age: 27 });
function createContent(contentType) {
    console.log(contentType);
}
createContent(Interfaces_1.StringType.Quiz);
var Team = (function () {
    function Team(teamName) {
        var _this = this;
        this.score = 0;
        this.getScore = function () { return console.log("".concat(_this.teamName, " Current Score: ").concat(_this.score)); };
        this.teamName = teamName;
    }
    Team.prototype.goal = function () {
        this.score++;
        console.log("".concat(this.teamName, " \uD83C\uDFD1 \u2192 \uD83E\uDD45 | New Score: ").concat(this.score));
    };
    return Team;
}());
var redWings = new Team('Red Wings');
redWings.getScore();
redWings.goal();
function outputInput(arg) {
    return arg;
}
outputInput('hi');
outputInput(3);
var Dancer = (function () {
    function Dancer() {
    }
    return Dancer;
}());
var ElNino = new Dancer();
var fake = {
    name: "Brett",
    year: 27
};
ElNino = fake;
