/* 
 * Copyright (c) 2020 MICHAEL LOGAN GARRETT.
 * This file is licensed under the MIT License.
 * A copy of the license may be found at:
 * https://cefns.nau.edu/~mlg238/rsa/license.txt
 */

/* 
 * This file drives an implementation of the RSA cryptographic algorithm
 * in Javascript. It interacts with inputs and outputs in the interface file
 * "index.html", and performs expensive computations asynchronously with 
 * Web Workers via "doCrypto.js".
 *
 * Because RSA involves rather extreme exponentiation, this implementation
 * uses Javascript's "BigInt" datatype. Javascript represents BigInts with
 * Strings behind the scenes, and while this (allegedly) allows for 
 * operations on arbitrarily large numbers, it's slow as hell. Furthermore,
 * some browsers are configured by default to disallow large Javascript memory
 * allocations, so if your decryption isn't working and your secret exponent
 * 'd' is more than about 50000, your browser might be shutting it down. 
 * Modifications to browser configuration settings may enable you to do some
 * pretty big numbers, but obviously I cannot endorse this sort of thing. Use 
 * at your own risk.
 */

/* ========== BEGIN ========== */

/* some primes for testing */
var largePrimes =
	[149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 
	419, 421, 431, 433, 439, 839, 853, 857, 859, 863,
	1523, 1531, 1543, 1549, 1553, 2311, 2333, 2339, 2341, 2347]

/* elements of RSA encryption */
var p // the p
var q // the q
var m // the message
var n // rsa modulus
var keyBits // number of bits in the key
var phi // the phi
var e // the e
var d // the d

/* textboxes */
var pBox = document.getElementById("p")
var qBox = document.getElementById("q")
var nBox = document.getElementById("n")
var phiBox = document.getElementById("phi")
var eBox = document.getElementById("e")
var dBox = document.getElementById("d")
var mBox = document.getElementById("m")
var cBox = document.getElementById("c")
var encTextBox = document.getElementById("encryptedText")
var decTextBox = document.getElementById("decryptedText")
var primesTable = document.getElementById("primesTable")
var btnCalculateN = document.getElementById("btn_calculateN")
var keyBitsTextBox = document.getElementById("keyBits")
var btnCalculatePhi = document.getElementById("btn_calculatePhi")
var btnCalculateE = document.getElementById("btn_calculateE")
var btnCalculateD = document.getElementById("btn_calculateD")
var encTimeBox = document.getElementById("encTime")
var encTimerTextBox = document.getElementById("encTimerTextBox")
var decTimeBox = document.getElementById("decTime")
var decTimerTextBox = document.getElementById("decTimerTextBox")
var encErrBox = document.getElementById("encErrBox")

/* image to show while async processing */
var loadingImage = document.getElementById("loading")

/* webworker for doing asynchronous computation of d, encryption,
 * decryption
 */
var webWorker = new Worker('doCrypto.js')

/* computes N from the input values */
function calculateN()
{
	p = BigInt(pBox.value)
	q = BigInt(qBox.value)
	n = p * q
	keyBits = parseInt(Math.log2(n.toString()))+1
	nBox.innerHTML = n
	keyBitsTextBox.innerHTML = "("+keyBits+"-bit key)"
}

/* computes phi from p, q, and n */
function calculatePhi()
{
	phi = (p-1n)*(q-1n)
	phiBox.innerHTML = phi
}

/* chooses an E with the chooseE function */
function getE()
{
	e = chooseE(p, q, phi)
	eBox.innerHTML = e
}

/* calculates the secret exponent d asynchronously via web worker */
function calculateD()
{
	dBox.innerHTML = "&nbsp;"
	webWorker.onmessage = function(event) {
		result = event.data
		swapButtonClass('btn_calculateD', 'buttons')
		dBox.innerHTML = result
		d = result
	}

	swapButtonClass('btn_calculateD', 'buttonDLoading')
	webWorker.postMessage([e, phi])
}

/* chooses an e that meets the RSA criteria by brute force */
function chooseE(p, q, phi)
{
	var e = 2n
	while(e < phi)
	{
		if(gcd(e, phi)==1)
			break;
		else
			e++
	}
	return e
}

/* encrypts the input message asynchronously */
function doEncrypt()
{
	encErrBox.innerHTML = ""
	var result
	m = BigInt(document.getElementById("m").value)

	if(BigInt(mBox.value) >= (n-1n))
	{
		encErrBox.innerHTML += "must be < " + (n-1n) + "<br>"
		return
	}
	if(pBox.value == qBox.value)
	{
		encErrBox.innerHTML += "p and q must be different<br>"
		dBox.innerHTML = "&nbsp;"
		eBox.innerHTML = "&nbsp;"
		phiBox.innerHTML = "&nbsp;"
		nBox.innerHTML = "&nbsp;"
		return;
	}
	
	encErrBox.innerHTML = ""
	webWorker.onmessage = function(event) {
		result = event.data
		encTextBox.innerHTML = result[0]	
		encTimeBox.innerHTML = result[1]
		setLoadingImageVisible('loadingEnc', false)
	}
	encTextBox.innerHTML = "&nbsp;"
	setLoadingImageVisible('loadingEnc', true)
	webWorker.postMessage([m, e, n, 'encrypt'])
	encTimeBox.innerHTML = "&nbsp;"
}

/* decrypts the input ciphertext asynchronously */
function doDecrypt()
{
	var result
	c = BigInt(document.getElementById("c").value)
	webWorker.onmessage = function(event) {
		result = event.data
		decTextBox.innerHTML = result[0]
		decTimeBox.innerHTML = result[1]
		setLoadingImageVisible('loadingDec', false)
	}
	decTextBox.innerHTML = "&nbsp;"
	setLoadingImageVisible('loadingDec', true)
	webWorker.postMessage([c, d, n, 'decrypt'])
	decTimeBox.innerHTML = "&nbsp;"
}

/* computes the gcd of two values by recursion */
function gcd(a, b) {
		if (b == 0)
		return a
		else
		return gcd(b, (a % b))
}		

/* function called when form fields are modified
 * can be used to validate input in real time
 */
function validateForm()
{
	// does nothing at this time
}

/* generates the table of primes at the bottom of the page from the
 * list in this file
 */
function generateTable()
{
	var pIndex = 0
	var table = document.getElementById("primesTable")
	for(var i=0; i<3; i++)
	{
		var row = document.createElement("tr")
		row.setAttribute("class", "primes")
		for(var j=0; j<10; j++)
		{
			var col = document.createElement("td")
			col.setAttribute("class", "primes")
			col.innerHTML = largePrimes[pIndex]
			pIndex++
			row.appendChild(col)
		}
	table.appendChild(row)
	}
}

/* helper function to toggle visibility of loading animations */
function setLoadingImageVisible(id, visible)
{    		
	var img = document.getElementById(id);
	img.style.visibility = (visible ? 'visible' : 'hidden')
}

/* helper function to toggle visibility of timer textboxes */
function setTimerTextBoxVisible(id, visible)
{
	var element = document.getElementById(id)
	id.style.visibility = (visible ? 'visible' : 'hidden')
}

/* helper function to swap the class of a button
 * used for "calculate d" button to show loading image
 * during asynchronous computation
 */
function swapButtonClass(id, cls)
{
	var button = document.getElementById(id)
	button.className = cls
	if(cls === "buttonDLoading")
	{
		button.value = ""
	}
	else if(cls === "buttons")
	{
		button.value = "calculate d"
	}
}

/* resets the form fields and calculated textboxes */
function resetFields()
{
	nBox.innerHTML = "&nbsp;"
	keyBitsTextBox.innerHTML = "&nbsp;"
	phiBox.innerHTML = "&nbsp;"
	eBox.innerHTML = "&nbsp;"
	dBox.innerHTML = "&nbsp;"

	pBox.value = ""
	qBox.value = ""

	encTextBox.innerHTML = "&nbsp;"
	decTextBox.innerHTML = "&nbsp;"
	cBox.value = ""
	
	encErrBox.innerHTML = ""

	mBox.value = ""

	encTimeBox.innerHTML = "&nbsp;"
	decTimeBox.innerHTML = "&nbsp;"

}

/* ========== END ========== */
