# rsa-calculator-tool
An educational demonstration of the RSA scheme for asymmetric public key encryption.

This tool demonstrates the RSA encryption procedures, from prime number selection to key generation to encryption and decryption of numeric messages.

It works best on the Chrome browser. It will work on other browsers, but possibly only for relatively small prime numbers. If you calculate a private exponent (d) value of more than about fifty thousand, your browser may not allow the underlying Javascript to allocate a large enough String to perform the exponentiation required for decryption. This tool does not catch such errors, but they should appear in your browser's console if you wish to verify that you are experiencing this problem.

Numeric messages only at this time. I have not implemented the ability to encrypt and decrypt non-numeric ciphertext, as this functionality is neither necessary nor appropriate for demonstration of the RSA algorithm.

Some limited error checking does take place, but I make no guarantees that any of this is airtight. Also, if you try to use primes greater than the ones I make available for testing (d > ~10^6), I can't promise that it will work, but I can promise that it will take a lot of time to do it, one way or the other. The longest I've waited is about 20 minutes, and it was ultimately successful.

I hope this can serve as a useful tool to anyone studying or wanting a clear demonstration of this popular cryptographic scheme.
