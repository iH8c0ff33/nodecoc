var fs = require('fs');
var crypto = require('crypto');

function analyzePacket(argPacket, argNonce, argCallback) {
  var packet = {};
  var basekey = 'fhsd6f86f67rt8fw78fw789we78r9789wer6re';
  var nonce = 'nonce';
  if (process.argv[3]) {
    nonce = process.argv[3];
  }
  if (argNonce) {
    nonce = argNonce;
  }
  var key = basekey+nonce;
  var decipher = crypto.createDecipheriv('rc4', key, '');
  var drop = new Buffer(key.length);
  decipher.update(drop);
  packet.messageId = argPacket.readUIntBE(0, 2);
  packet.payloadLength = argPacket.readUIntBE(2, 3);
  if (argPacket.slice(7).length === packet.payloadLength) {
    console.log('payload length is ok');
    fs.readFile(__dirname+'/messages/'+packet.messageId+'.json', function (err, data) {
      if (err) {
        return argCallback('file read '+err, packet);
      } else {
        var message = JSON.parse(data);
        packet.messageName = message.name;
        decipher.write(argPacket.slice(7), function () {
          decipher.on('data', function (chunk) {
            if (typeof(packet.decryptedPayload) == 'undefined') {
              packet.decryptedPayload = new Buffer(chunk);
            } else {
              packet.decryptedPayload += chunk;
            }
          });
          decipher.on('end', function() {
            parseMessage(message, packet.decryptedPayload, function (payload) {
              packet.payload = payload;
              return argCallback(undefined, packet);
            });
          });
          decipher.end();
        });
      }
    });
  } else {
    return argCallback('invalid payload length', packet);
  }
}

function parseMessage(argMessage, argPayload, argCallback) {
  var offsetNow = 0;
  var payload = {};
  var rawPayload = argPayload;
  function parseDWORD(data, offset, name, callback) {
    var dword = data.readUIntBE(offset, 4);
    return callback(offset+4, dword, name);
  }
  function parseQWORD(data, offset, name, callback) {
    var qword = data.readUIntBE(offset, 8);
    return callback(offset+8, qword, name);
  }
  function parseSTRING(data, offset, name, callback) {
    var length = data.readUIntBE(offset, 4);
    if (length == 0xFFFFFFFF) {
      var string = undefined;
      length = 0;
    } else {
      var string = data.slice(offset+4, offset+4+length).toString();
    }
    return callback(offset+4+length, string, name);
  }
  function parseBYTE(data, offset, name, callback) {
      var byte = data.readUIntBE(offset, 1);
    return callback(offset+1, byte, name);
  }
  argMessage.fields.forEach(function (field) {
    switch (field.type) {
      case 'INT':
      parseDWORD(rawPayload, offsetNow, field.name, function (newOffset, data, name) {
        offsetNow = newOffset;
        if (name) {
          payload[name] = data;
        }
      });
      break;
      case 'LONG':
      parseQWORD(rawPayload, offsetNow, field.name, function (newOffset, data, name) {
        offsetNow = newOffset;
        if (name) {
          payload[name] = data;
        }
      });
      break;
      case 'STRING':
      parseSTRING(rawPayload, offsetNow, field.name, function (newOffset, data, name) {
        offsetNow = newOffset;
        if (name) {
          payload[name] = data;
        }
      });
      break;
      case 'BYTE':
      parseBYTE(rawPayload, offsetNow, field.name, function (newOffset, data, name) {
        offsetNow = newOffset;
        if (name) {
          payload[name] = data;
        }
      });
      break;
    }
  });
  return argCallback(payload);
}

fs.readFile(process.argv[2], function (err, data) {
  if (err) {
    console.log('error reading file');
  } else {
    analyzePacket(data,'', function (err, packet) {
      if (err) {
        console.log('ERR: '+err);
      } else {
        console.log('got packet');
        console.log(packet);
      }
    });
  }
});
