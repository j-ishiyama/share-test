import { SSL_OP_SINGLE_DH_USE } from "constants";

function hello(name: string): string {
    return `Hello, ${name}!`;
};

function func1(aaa: string): void {
    console.log(aaa);
}


function func2(s: string[]): void {
    console.log(s);
}

function func3(aaa: string[][]): void {
    console.log(aaa);
}

function func4(aaa: string[][]): void {
    aaa.forEach(bbb => {
        bbb.forEach(ccc => {
            console.log(ccc);
        })
        console.log("--------------");
    })
}

function func5(aaa: string[][]): void {

    // ここ、うまくshift()したらメモリ減るかな？
    console.log(aaa.length);
    while (aaa.length > 0) {
        var bbb = aaa.shift();
        while (bbb?.length) {
            console.log(bbb?.shift());
        }
        console.log(aaa.length);
    }
}

// console.log(hello("TypeScript"));

// func1("function1");

// console.log(["aaa", "bbb"]);
// func2(["aaa", "bbb"]);

// console.log([["aaa", "bbb"], ["111", "222"]]);
// func3([["aaa", "bbb"], ["111", "222"]]);


// var sss: string[] = [];
// sss.push("111", "222");
// console.log(sss);
// func2(sss);

// var mmm: string[][] = [];
// var iii: string[] = [];
// var lll: string[] = [];
// iii.push("aaa", "bbb");
// mmm.push(iii);
// lll.push("111", "222");
// mmm.push(lll);
// func3(mmm);
// func4(mmm);

// var mmm: string[][] = [];
// var iii: string[] = [];
// iii.push("aaa");
// iii.push("bbb");
// mmm.push(iii);
// iii = [];
// iii.push("ccccc", "444444444");
// mmm.push(iii);
// func5(mmm);

// ここから連想配列

// var hash1: { [key: string]: string[]} = {};
// hash1['yyyymmdd'] = ["aaa", "bbb"];
// console.log(hash1);

class MyClass {
    private name:string = "";
    
    constructor(name:string) {
        this.name=name;
    }
}

var hhh: {[key: string]:MyClass[]} = {};
hhh['yyyymmdd'] = [new MyClass("aaa"), new MyClass("bbb")];
console.log(hhh);
