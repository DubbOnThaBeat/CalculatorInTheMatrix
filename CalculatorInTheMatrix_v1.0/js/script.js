// CalculatorInTheMatrix v1.0
// written by Jason Riley


(function () {
    //declare variables
    // const matrixFx = document.getElementById("matrix-fx");
    // const mainPage = document.getElementById("main-page");
    // const floatingOuts = document.getElementsByClassName("floating-outs");
    const floatingOut1 = document.getElementById("floating-out1");
    const floatingOut2 = document.getElementById("floating-out2");
    const floatingOut3 = document.getElementById("floating-out3");
    const output = document.getElementById("output");
    // const buttons = document.getElementsByClassName("buttons");
    // const valButtons = document.querySelectorAll(".val-buttons");
    const opers = document.getElementsByClassName("opers");
    const numbers = document.getElementsByClassName("numbers");
    const allClear = document.getElementById("all-clear");
    const posNeg = document.getElementById("pos-neg");
    const percent = document.getElementById("percent");
    const decimal = document.getElementById("decimal");
    const equals = document.getElementById("equals");
    const matrix = document.getElementById("matrix-btn");

    let mainStr = "";
    let eqStr = "";
    let currentEq = "";
    let currentOp = "";
    let currentVal = "";
    let currentNum = "";
    let result3 = "";
    let tempVal = "";
    let tempMainStr = "";
    let negCurrVal = "";
    let negMainStr = "";
    // let opersList = [];
    // let numList = [];
    let valList = [];
    // let resultsList = [];
    let opToggled = false;
    let numToggled = false;
    let eqToggled = false;
    let replaceVal = false;
    let lastVal = false;
    let opEval = false;
    let eqLoop = false;
    let initEqLoop = false;
    let posNegOn = false;
    let posNegToggled = false;
    let percToggled = false;
    let mtxClicked = false;
    //possible input santizing reg expressions.
    // const regTest = /^[+\-\d\.\s\*\/]+$/;
    // const regTest2 = /^[0-9+\-*/().\s]*$/;
    const regTest2 = /^[e0-9+\-*/().\s]*$/;

    //Check why equation occasionally turns up errors when testing multiple operators - seems to happen when equation gets cleared or last value maybe isn't a number? Fixed some of these issues but still might be some errors. Check long strings of multiple operators.
    //Resolve try catch situation in procOper() - Errors are created when using operators after pressing equals. Equations still show up on one line. Equals loop. After equalsLoop if you press a different operator the equations get messed up. After pressing equals if you press a number right after, this should start a new set of values. Equations is having strange results throughout operations with standard procEval() and the EqLoop().
    //procPosNeg only works with output value currently. 010 and other sequences leading with 0 still produce octal results. Look over console to review flow of variables. Review each variable globally. Resolve the issue with the current equations floating output and chains of equal loops to standard evalEq with different operators producing strange results.
    //Probably have to remove the evalEq() function from procOper and just write the same functions into it to allow for separation of lines in the equations display. procNeg needs to check for already negative numbers.
    //crash occured when clicking equals many times allowing for a large eqloop value to grow and grow(memory leak?). Data or objects are building up quickly as equals is processed over and over. Also a lot of outputs are being generated on console, could this be contributing to lag?
    //some of these issues have been resolved. Recheck everything. Research validating user input before any of the eval() cases are implemented.
    //procNum removes the last char from mainStr but as a result when typing "0*/+0" the equations floatingout1 is cleared after the operator. To deal with memory leak, try replacing event handler with "element.onclick" in html or js. Losing the operator in equations such as "0*0" for example is probably not a huge issue overall, but still a bug.
    //Memory Leak, filter input before eval(), complete programming for percentage button.
    //regex could be used to filter input before eval.
    //this may work as a replacement for eval(): console.log(Function(`return ${a}*${b}`)());
    //The variable equation can probably be almost completely eliminated.
    //There's an issue with processing posNeg on multiple values in the same equation. floatingOut1 clears the equation and only displays current value.
    //noticed some random bugs/calculation errors introduced when using multiple numbers/operators in sequence with posNeg on some of the values.
    //floatingOut1 gets cleared when any of a series of values are processed with posNeg or procPerc.
    //Use devtools to watch the values of all conditionals and troublshoot calculator.
    //Memory leak seems to be an issue when evaluating a bunch of numbers in Firefox, but not in Chrome.
    //New updated code for procPosNeg seems to be working better overall and is simpler to follow. One remaining issue is that when chaining certain values together(possibly in connection with eqToggled) the last operator in the chain of calculations gets erased when pressing procPosNeg.
    //Try adding an output.textContent.endsWith(".") conditional to address decimal issues causing an evalutation error.
    //Because you cannot enter a decimal point if one is already present in the display, the user has to enter "0" and then "." for the decimal to be processed. This is a noticeable issue when stringing together values where the previous value or current result in the display has a decimal point.

    /*Would it be too intense/distracting to add a matrix code on/off button to create cool background effects? Version 11 will be this version plus the implementation of this idea.*/

    //display current equation in floating window
    function displayEq(eq) {
        floatingOut1.innerText = eq;
        floatingOut1.scrollTop = floatingOut1.scrollHeight;
    }

    //display current number value in equation
    //using String(parseFloat(val)) might be a good enough solution for correctly displaying values with unecessary decimal point.
    function displayVal(val) {
        valList.push(val);
        floatingOut2.innerText += String(parseFloat(val)) + "\n";
        floatingOut2.scrollTop = floatingOut2.scrollHeight;
    }

    //display current result in floating window
    function displayRes(res) {
        // resultsList.push(res);
        floatingOut3.innerText += res + "\n";
        floatingOut3.scrollTop = floatingOut3.scrollHeight;
    }

   //check for calculator errors
    function chkError() {
        if (output.textContent === "Error" || output.textContent === "undefined" || output.textContent === "Infinity" || output.textContent === "NaN") {
        procAC();
        // console.log(mainStr, "procAC");
        }
    }

    //check for strings ending in decimal point
    function chkLastDec(str) {
        if (str.endsWith(".")) {
            if (text.output === ".") {
                str = "0" + str;
            }
            str += "0";
            return str;
        }
        return str;
    }

    //clear currently selected operator
    function clearOper() {
        for (let o of opers) {
            o.classList.remove("oper-selected");
        }
    }

    //convert operator button symbols to mathematical symbols
    function convOpers(optxt) {
        if (optxt === "X") {
            optxt = "*";
        }
        else if (optxt === "•/•") {
            optxt = "/";
        }
        else if (optxt ==="—") {
            optxt = "-";
        }
        return optxt;
    }

   //process and add highlight for current operator
    for (let oper of opers) {
        oper.addEventListener("click", procOper);
    }
    
    //displayVal might need to get moved to catch updated values.
    //checkLastDec might need to be moved so that it catches equations starting with (".+4=").
    function procOper() {
        clearOper();
        chkError();
        mainStr = chkLastDec(mainStr);
        let op = this;
        op.classList.toggle("oper-selected");
        if (mainStr === "" && parseFloat(output.textContent) === 0) {
            return;
        }
        currentVal = output.textContent;
        let opText = op.textContent;
        let convOper = convOpers(opText);
        try {
            if (mainStr.endsWith("/") || mainStr.endsWith("*") || mainStr.endsWith("-") || mainStr.endsWith("+")) {
                // console.log(mainStr, "replaceOpBefore");
                mainStr = mainStr.slice(0, -1);
                // console.log(mainStr, "replaceOpafter");
            }
        }
        catch (e) {
            console.log(mainStr, "replaceOpError", "error: ", e);
            output.innerText = "Error";
        }
        //if operator is active and the mainStr is not empty
        if (opToggled === true && mainStr !== "") {
            try {
                if (numToggled === true && lastVal === true && opToggled === false) {
                    lastVal = false;
                }
                currentVal = output.textContent;
                displayVal(currentVal);
                // console.log(mainStr, "standEvalBefore");
                eqStr = mainStr;
                displayEq(eqStr);
                let result = sanitizeEval(mainStr);
                // console.log(mainStr, "standEvalAfter", result, result, numList, valList, currentVal);
                output.innerText = result;
                displayRes(result);
                result3 = "";
                numToggled = false;
                eqToggled = false;
                opEval = true;
                posNegOn = false;
                posNegToggled = false;
                percToggled = false;
            } 
            catch (e) {
                output.innerText = "Error";
                console.log(e);
            }
        }
        else if (opEval === false && mainStr !== "") {
            currentVal = chkLastDec(currentVal);
            displayVal(currentVal);
        }
        //issue with transistion from eqLoop to opToggled
        else if (eqLoop === true && initEqLoop === true) {
            mainStr = output.textContent;
        }
        else if (eqToggled === true) {
            mainStr = output.textContent;
            displayVal(mainStr);
        }
        if (eqToggled === true) {
            mainStr = output.textContent;
        }
        // numList.push(currentVal);
        mainStr += convOper;
        eqStr = mainStr;
        displayEq(eqStr);
        // opersList.push(convOper);
        currentOp = convOper;
        // console.log(mainStr, "procOper", currentOp, opersList, numList, valList)
        opToggled = true;
        numToggled = false;
        eqToggled = false;
        replaceVal = true;
        lastVal = false;
        eqLoop = false;
        initEqLoop = false;
        posNegOn = false;
        posNegToggled = false;
        percToggled = false;
    }

    //process current number
    for (n of numbers) {
        n.addEventListener("click", procNum);
    }

    //consider other options for handling multiple inputs of zero such as just using return instead of clearing the output and slicing the mainStr.
    function procNum() {
        chkError();
        if (output.textContent === "0") {
            //error here with this conditional below. Seems to be causing issues with equations including multiple zeros: "0+0".
            if (this.textContent === "0" && parseFloat(output.textContent) === 0) {
                mainStr = mainStr.slice(0, -1);
                // console.log(mainStr);
            }
            output.innerText = "";
        }
        if (opToggled === true && replaceVal === true) {
            output.innerText = "";
            replaceVal = false;
        }
        if (initEqLoop === true || eqToggled === true || posNegToggled === true || percToggled === true) {
            mainStr = "";
            output.innerText = "";
        }
        let num = this.textContent;
        output.innerText += num;
        mainStr += num;
        eqStr = mainStr;
        displayEq(eqStr);
        allClear.innerText = "C";
        // console.log(mainStr, "procNum", numList, valList, currentVal, num);
        numToggled = true;
        eqToggled = false;
        lastVal = true;
        eqLoop = false;
        initEqLoop = false;
        posNegOn = false;
        posNegToggled = false;
        percToggled = false;
    }

    //process all clear button
    allClear.addEventListener("click", procAC);
    
    function procAC() {
        clearOper();
        output.innerText = "0";
        mainStr = "";
        eqStr = "";
        currentEq = "";
        currentOp = "";
        currentVal = "";
        currentNum = "";
        result3 = "";
        tempVal = "";
        tempMainStr = "";
        negCurrVal = "";
        negMainStr = "";
        allClear.innerText = "AC";
        // opersList = [];
        // numList = [];
        valList = [];
        // resultsList = [];
        opToggled = false;
        numToggled = false;
        eqToggled = false;
        replaceVal = false;
        lastVal = false;
        opEval = false;
        eqLoop = false;
        initEqLoop = false;
        posNegOn = false;
        posNegToggled = false;
        percToggled = false;
        floatingOut1.innerText = "";
        floatingOut2.innerText = "";
        floatingOut3.innerText = "";
    }

    //process positive/negative button
    posNeg.addEventListener("click", procPosNeg);

    function procPosNeg() {
        chkError();
        mainStr = chkLastDec(mainStr);
        //(old)might not need this first conditional checking for 0. Consider replacing with the parseFloat() version? Could use parseFloat() or Math.sign() to check for value of zero.
        if (eqToggled === true && mainStr !== "") {
            mainStr = output.textContent;
            eqStr = mainStr;
            displayEq(eqStr);
        }
        if (mainStr === "" || parseFloat(output.textContent) === 0) {
            return;
        }
        else {
            tempVal = output.textContent;
            negCurrVal = String(parseFloat(tempVal) * -1);
            currentVal = negCurrVal;
            output.innerText = negCurrVal;
            tempMainStr = mainStr;
            if (Math.sign(negCurrVal) === -1) {
                negMainStr = mainStr.slice(0, mainStr.lastIndexOf(tempVal));
                negMainStr += `(${negCurrVal})`;
            }
            else if (Math.sign(negCurrVal) === 1) {
                let tempMain2 = mainStr.slice(mainStr.lastIndexOf("("));
                mainStr = mainStr.slice(0, mainStr.lastIndexOf("("));
                tempMain2 = tempMain2.replace("(","").replace(")", "");
                mainStr += tempMain2;
                negMainStr = mainStr.slice(0, mainStr.lastIndexOf(tempVal));
                negMainStr += negCurrVal; 
            }            
            mainStr = negMainStr;
            eqStr = mainStr;
            displayEq(eqStr);
            posNegOn = true;
            posNegToggled = true;
        }
        // console.log(mainStr, tempVal, currentVal);
        eqToggled = false;
    }

    //process percentage button
    percent.addEventListener("click", procPerc);

    function procPerc() {
        chkError();
        if (mainStr === "" || parseFloat(output.textContent) === 0) {
            return;
        }
        mainStr = chkLastDec(mainStr);
        if (eqToggled === true && mainStr !== "") {
            mainStr = output.textContent;
            eqStr = mainStr;
            displayEq(eqStr);
        }
        let origVal = output.textContent;
        let percVal = parseFloat(output.textContent/100);
        output.innerText = percVal;
        let altMainStr = mainStr.slice(mainStr.lastIndexOf(origVal -1));
        if (Math.sign(origVal) === -1 && (altMainStr.includes("(") || altMainStr.includes(")"))) {
            mainStr = mainStr.slice(0, mainStr.lastIndexOf(origVal));
            mainStr += `${percVal})`;
        }
        else {
            mainStr = mainStr.slice(0, mainStr.lastIndexOf(origVal));
            mainStr += percVal;    
        }
        eqStr = mainStr;
        displayEq(eqStr);
        percToggled = true;
    }

    //process decimal point
    decimal.addEventListener("click", procDec);

    function procDec() {
        chkError();
        if (output.textContent.includes(".")) {
            return;
        }
        if (opToggled === true && replaceVal === true) {
            output.innerText = "";
            replaceVal = false;
        }
        //this might be a problem causing mainStr to clear
        if (initEqLoop === true || eqToggled === true || posNegToggled === true || percToggled === true) {
            output.innerText = "";
            mainStr = "";
        }
        if (mainStr === "" && parseFloat(output.textContent) === 0 || opToggled === true && numToggled === false || mainStr.endsWith("/")|| mainStr.endsWith("*") || mainStr.endsWith("-") || mainStr.endsWith("+") || posNegToggled === true || percToggled === true || initEqLoop === true || eqToggled === true) {
            mainStr += "0.";
        }
        else {
            mainStr += ".";    
        }
        output.innerText += ".";
        if (output.textContent[0] === ".") {
            output.innerText = "0" + output.textContent;
        }
        eqStr = mainStr;
        displayEq(eqStr);
        allClear.innerText = "C";
        numToggled = true;
        eqToggled = false;
        lastVal = true;
        eqLoop = false;
        initEqLoop = false;
        posNegOn = false;
        posNegToggled = false;
        // console.log(mainStr, "procDec", numList, valList, currentVal);
    }

    //process equals loop
    function evalLoop() {
        // console.log(mainStr, "standEvalBefore", numList, valList, currentVal);
        currentVal = output.textContent;
        displayVal(currentVal);
        if (initEqLoop === false) {
            currentNum = valList[valList.length - 2];
            result3 = `${currentVal} ${currentOp} ${currentNum}`;
            currentEq = result3;
            // result3 = String(math.evaluate(result3));
            result3 = sanitizeEval(result3);
            initEqLoop = true;
            // console.log(mainStr, "initLoopFalse");
        }
        else if (initEqLoop === true) {
            result3 = `${currentVal} ${currentOp} ${currentNum}`;
            currentEq = result3;
            // result3 = String(math.evaluate(result3));
            result3 = sanitizeEval(result3);
            // console.log(mainStr, "initLoopTrue");
        }
        output.innerText = result3;
        mainStr += currentEq;
        eqStr = currentEq
        displayEq(eqStr);
        displayRes(result3);
        // console.log(mainStr, "standEvalAfter", result3, numList, valList, currentVal);
        eqLoop = true;
    }

    //evaluate the equation
    equals.addEventListener("click", evalEq);

    function evalEq() {
        if (mainStr === "") {
            return;
        }
        else if (output.textContent === "0" && eqLoop === true && numToggled === false && mainStr === "") {
            return;
        }
        clearOper();
        mainStr = chkLastDec(mainStr);
        if (eqToggled === true && opToggled === false && numToggled === false) {
            try {
                // console.log(mainStr, "evalLoop", currentVal);
                evalLoop();
            }
            catch (e) {
                output.innerText = "Error";
                console.log(mainStr, "standEvalError/evalLoopError", valList, currentVal, "Error: ", e);

            }

        }
        else {
            try {
                if (numToggled === true && lastVal === true && opToggled === false) {
                    lastVal = false;
                }
                currentVal = output.textContent;
                // console.log("currentVal: ", currentVal);
                if ((parseFloat(currentVal) > 0 && parseFloat(currentVal) || parseFloat(currentVal) === 0) < 1 && (currentVal.includes(".") && currentVal[0] !== "0") || currentVal[0] === ".") {
                    currentVal = "0" + currentVal;
                }
                currentVal = chkLastDec(currentVal);
                displayVal(currentVal);
                // console.log(mainStr, "standEvalBefore", "currentVal: ", currentVal);
                eqStr = mainStr;
                displayEq(eqStr);
                let result = sanitizeEval(mainStr);
                // console.log(mainStr, "standEvalAfter", result, numList, valList, currentVal);
                output.innerText = result;
                displayRes(result);
                result3 = "";
                opToggled = false;
                numToggled = false;
                eqToggled = true;
                posNegOn = false;
                posNegToggled = false;
                percToggled = false;
            } 
            catch (e) {
                output.innerText = "Error";
                console.log(e);
            }
        }
    }
    //Attempt to sanitize input before math.evaluate(eq).
    function sanitizeEval(equation) {
        if (regTest2.test(equation)) {
            try {
                return String(math.evaluate(equation));
            }
            catch (e) {
                console.log("Equation Error: ", e, "Equation: ", equation);
                return "Equation Error";
            }
        }
        else {
            console.log("Illegal Input: ", equation);
            return "Illegal Input!";
        }
    }

//Process matrix effect when switch is toggled.
matrix.addEventListener("click", procMatrix)
    
function procMatrix() {
    if (mtxClicked === true) {
        noCanvas();
        noLoop();
        streams = [];
        streamsX = [];
        mtxClicked = false;
    }
    else  {
        let myCanvas = createCanvas(innerWidth, innerHeight);
        myCanvas.parent("matrix-fx");
        reset();
        frameRate(60);
        colorMode(HSB);
        textSize(charSize);
        textFont("'Courier New', courier, monospace");
        textAlign(CENTER);
        background(0);  
        loop();  
        mtxClicked = true;
    }
}
    

/********** Matrix FX  **********/


//review this array to make sure it works properly/looks good.
const langs = [
    "int *p=&v;",
    "void printSecret() {cout<<'rNum: '<<rNum<<endl<<'userNum: '<<userNum<<endl; cout<<'inputsActive: '<<inputsActive<<endl;}",
    "5>8?5:8;",
    "{if(optxt==='X') {optxt='*';} else if(optxt==='•/•') {optxt='/';} else if(optxt==='—') {optxt='-';} return optxt;}",
    "area=πr*r",
    "int nums2[2][2][2] = {{{1,2},{3,4}},{{5,6},{7,8}}};",
    "int *arr[]=new int[size];",
    "for (int i=1;i>=0;i--) {for(int j=1;j>=0;j--) {for(int k=1;k>=0;k--) {cout<<nums2[i][j][k];}}}",
    "11000110 00010011 11010011 1011111",
    "(a+ib)-(c+id)=(a-c)+i(b-d)",
    "192.168.3.26",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width, inital-scale=1.0'>",
    "<link rel='stylesheet' href='styles.css'>",
    "#00FF00;",
    "int a=9; int b=a*a/3-4*7; cout<<((2*a-b*4)*b>a)+1; return 0;",
    "int b=47, c=11;",
    "@keyframes spin {0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);}}",
    "static int a[]={10,20,30,40,50}; static int *p[]={a,a+3,a+4,a+1,a+2}; int **ptr=p; ptr++; cout<<ptr-p<<**ptr; return 0;",
    "char* f(char* const s, int n) {int i=0;n--;while(i<n) {s[i]+=s[n]; s[n]=s[i]-s[n]; s[i]-=s[n]; i++; --n;} return s;}", 
    "int main() {char s[]='desrever'; cout<<f(s,6+2); return 0;}",
    "vector<int> numsV1({1,2,3,4});",
    "else if(oper=='/') {if(zeroDivisor()) {cout<<'Equation error. Cannot divide by '0', please try again.'; return 0;} cout<<val1<<' '<<oper<<' '<<val2<<' = '<<divide();}",
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもらりるれろやゆよわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ",
    "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン",
    "x+y=z",
    "mATrIx",
    "xIrTAm"
]; 

// console.log(langs);

let charSize = 19;
let fallRate = charSize / 2;
const columns = innerWidth/(charSize * 0.98);
const spacing = innerWidth/columns;
let streams = [];
let streamsX = [];

//function to shuffle array items
// function shuffle(arr) {
//     let currIndex = arr.length;
//     while (currIndex !== 0) {
//         let randomIndex = Math.floor(Math.random() * currIndex);
//         currIndex--;
//         [arr[currIndex], arr[randomIndex]] = [arr[randomIndex], arr[currIndex]];
//     }
// }

//create random number for x coordinate
function newRandNum() {
    let rndX = spacing * Math.floor(Math.random() * Math.floor(columns) + 1);
    // console.log(rndX);
    return rndX;
}

//Creating character class and draw method.
class Char {
    constructor(value, x, y, speed) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.speed = speed;
}

    draw() {
        const flick = random(100);
        // 10 percent chance of flickering a number instead
        if (this.value) {
            if (flick < 9) {
                fill(120, 30, 97);
                text(round(random(9)), this.x, this.y);
            } 
            else {
                text(this.value, this.x, this.y);
            } 
            this.y = this.y > height ? 0 : this.y + this.speed;
        }
    }
}

//Creating Stream class.
class Stream { 
    constructor(text, x) { 
        const y = random(text.length * 3); 
        const speed = random(3, 10); 
        this.x = x;
        this.chars = []; 
        for (let i = text.length - 1; i >= 0; i--) {
            this.chars.push( new Char(text[i], x, (y + text.length - i) * charSize, speed) ); 
        }
        // console.log(this.chars[this.chars.length - 1]);        
    }

    //change all x coordinates for current stream
    changeX() {
        let rndX = newRandNum();
        // console.log(rndX);
        for (let i = 0;i < this.chars.length;i++) {
            // console.log(this.chars);
            this.chars[i].x = rndX;
            this.chars[i].y = this.chars[i].y > height ? 0 : this.chars[i].y;
        }
    }

    //change individual x coordinates for each char of current stream
    changeAllX() {
        this.chars.forEach(function(chr) {
            if (chr.y > height) {
                // console.log("changeALlX");
                if (chr.x > innerWidth) {
                    chr.x = 0;
                }
                else {
                    chr.x += spacing*3;
                }
                chr.y = 0;
            }
        });
    }

    draw() {
        fill(120, 100, 100); 
        this.chars.forEach((c, i) => {
            // 30 percent chance of lit tail 
            const lit = random(100); 
            if (lit < 95) { 
                if (i === this.chars.length - 1) {
                    // rect(this.chars[0].x,this.chars[0].y,charSize, charSize);
                    // fill(120, 30, 100);
                    // fill(120, 88, 100);
                    fill(120, 28, 100);
                    textStyle(BOLD);
                    stroke(120, 88, 100);
                    strokeWeight(1);
                    // rect(c.x,c.y,charSize,charSize, 2);
                    // fill(200, 90, 100); 
                } 
                else {
                    // fill(120, 100, 90);
                    fill(120, 100, 85); 
                    textStyle(NORMAL);
                    // noStroke();
                    // strokeWeight(0);
                }
            }
            c.draw(); 
        });

        //random char conditional
        // this.changeAllX();

        //random stream conditional
        if (this.chars[0].y > height) {
            // console.log(this.chars[this.chars.length -1].y, height);
            // let rndX = Math.floor(random(streams.length));
            // c.x = rndX;
            // setTimeout(this.changeX(), 10000);
            this.changeX();
            // c.y = 0;
        }
    } 
} 

function createStreams() { 
// create random streams from langs that span the width 
    for (let i = 0;i < innerWidth;i += charSize * 0.98) {
        streams.push(new Stream(random(langs), i)); 
        // console.log(streams[i]);
        streamsX.push(i);
    }
    // console.log(columns, spacing, streams.length, streamsX.length);
} 

function reset() {
    streams = [];
    streamsX = [];
    createStreams();
} 

function setup() { 
    let myCanvas = createCanvas(innerWidth, innerHeight);
    myCanvas.parent("matrix-fx");
    noLoop();
}

function draw() {
    background(0, 0.4); 
    streams.forEach((s) => {
        s.draw();
    });
}

function windowResized() {
    resizeCanvas(innerWidth, innerHeight);
    background(0);
    reset(); 
} 

//Property "setup" may not exist on type "window & typeof globalThis".
//windowResized caused the calculator to get displaced - due to creation of canvas element?
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;

})();