/*
 * Copyright (c) 2020 MICHAEL LOGAN GARRETT.
 * This file is licensed under the MIT License.
 * A copy of the license may be found at:
 * https://cefns.nau.edu/~mlg238/rsa/license.txt
 */

/* 
 * This is a file which Web Worker will use to do expensive computations
 * asynchronously. It receives a message from the parent "rsa.js" file, and
 * either computes the secret exponent d from parameters, or encrypts/decrypts 
 * a message.
 */

/* ========== BEGIN ========== */

self.onmessage = function(event) {
	var startTime
	var endTime
	var timeElapsed
	if(event.data.length == 4)
	{
		if(event.data[3] === 'decrypt')
		{
			startTime = performance.now()
			var workerResult = decrypt(event.data[0], event.data[1], event.data[2])
			endTime = performance.now()
			console.log("\tdone")
		}
		else if(event.data[3] === 'encrypt')
		{
			startTime = performance.now()
			var workerResult = encrypt(event.data[0], event.data[1], event.data[2])
			endTime = performance.now()
			console.log("\tdone")
		}
		timeElapsed = (endTime - startTime)/1000
		timeElapsed = timeElapsed.toFixed(6)
		timeElapsed += "s"
		postMessage([workerResult, timeElapsed])
	}
	else if(event.data.length == 2)
	{
		var workerResult = calculateD(event.data[0], event.data[1])
		console.log("\tdone")
		postMessage(workerResult)
	}
}

/* decrypts the given ciphertext from the secret exponent d */
function decrypt(ciphertext, d, n)
{
	console.log("computing " + ciphertext + "^" + d + " mod " + n)
	console.log("\tthis may take some time...")
	return ciphertext ** d % n
}

/* encrypts the given message from the public exponent e */
function encrypt(message, e, n)
{
	console.log("computing " + message + "^" + e + " mod " + n)
	return message ** e % n
}

/* computes d from e and phi using the modInverse function */
function calculateD(e, phi)
{
	console.log("solving "+e+"d=1(mod"+phi+") for d")
	console.log("\tthis may take some time...")
	return modInverse(e, phi)
}

/* computes the mod inverse by extended euclidean algorithm */
function modInverse(a, b)
{
	a = a % b
	for(var i=1n; i<b; i++)
	{
		if((a*i)%b==1n)
		{
			return i
		}
	}
}

/* ========== END ========== */
