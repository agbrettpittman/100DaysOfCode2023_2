import Person, { Type, StringType} from "./Interfaces"

const isOpen:boolean = false;
const myName:string = 'Brett';
const myAge:number = 27;
const list:number[] = [0, 1, 2];
const me:[string, number, boolean] = ['Brett', 27, false];
enum Job { WebDev, WebDesigner, NetworkEngineer }
const job:Job = Job.WebDev;
const phone:any = 'Galaxy';
const tablet:any = 3;

// Functions
// ? makes the parameter optional
function sayWord(word:string = "Hello", ...otherStuff:string[]):string {
    console.log(otherStuff)
    return word;
}

sayWord("hello", "Brett")

let newName: string | number | boolean = 'Brett';
newName = 10;

let newNameTwo = newName;
newNameTwo = 10;

function makeMargin(x:string | number):string {
    switch (typeof x) {
        case 'string':
            return `margin: ${x}`;
        case 'number':
            return `margin: ${x}px`;
        default:
            return `margin: 0`;
    }
}

console.log(makeMargin(10))
console.log(makeMargin('auto'))

// Null Types
let cat: string
cat = "Kiki";



function sayName({name, age, friends}:Person):string {
    console.log(name)
    return name || 'No Name';
}

sayName({name: "Brett", age: 27})

// Enums

//numeric enums

function createContent(contentType:StringType){
    console.log(contentType)

}

createContent(StringType.Quiz)

// Classes

class Team {

    readonly teamName: string;
    private score: number = 0
    constructor(teamName:string) {
        this.teamName = teamName
    }
    
    getScore = ():void => console.log(`${this.teamName} Current Score: ${this.score}`)

    goal():void {
        this.score++
        console.log(`${this.teamName} 🏑 → 🥅 | New Score: ${this.score}`)
    }

}

const redWings = new Team('Red Wings')
redWings.getScore()
redWings.goal()


//Generics

function outputInput <T> (arg:T):T {
    return arg
}

outputInput('hi')
outputInput(3)

//Duck Typing

class Dancer implements Person {
    name: string;
    age?: number;
    friends?: Person[];
}

let ElNino: Person = new Dancer()

const fake = {
    name: "Brett",
    year: 27
}

ElNino = fake;