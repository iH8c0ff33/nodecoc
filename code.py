class scramble7prng:
    def __init__(self, seed):
        self.ix= 0
        self.buffer= [ 0 for i in range(624) ]
        self.seedbuffer(seed)
    def dumpbuffer(self):
        for x in self.buffer:
            print " %08x" % x,
        print
    def seedbuffer(self, seed):
        for i in range(624):
            self.buffer[i]= seed
            seed= (1812433253 * ((seed ^ rshift(seed, 30)) + 1)) & 0xFFFFFFFF
    def getbyte(self):
        x= self.getint()
        if isneg(x):
            x= negate(x)
        return x % 256
    def getint(self):
        if self.ix==0:
            self.mixbuffer()
        val= self.buffer[self.ix]
        self.ix = (self.ix+1) % 624

        val ^= rshift(val, 11) ^ lshift((val ^ rshift(val, 11)), 7) & 0x9D2C5680;
        return rshift((val ^ lshift(val, 15) & 0xEFC60000), 18) ^ val ^ lshift(val, 15) & 0xEFC60000;
    def mixbuffer(self):
        i=0
        j=0
        while i<624:
            i += 1
            v4= (self.buffer[i%624] & 0x7FFFFFFF) + (self.buffer[j]&0x80000000)
                  self.ix= 0
        suf        self.buff          self.seedbuffer(seed)
    def dumpbuf08    def dumpbuffer(self):
  [j        for x in self.bu1
            print " %08x" % om        print
    def seedbufrn    def seedfo        for i in range(624):
 e1            self.buffer[i]=rn            seed= (1812433253 *te    def getbyte(self):
        x= s
