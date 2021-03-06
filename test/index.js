var assert = require('assert');
var fs = require('fs');
var im = require('../');

describe('im()', function () {

  it('should have an .input property', function () {
    assert(im().input == '-');
  });

  it('should have an .output property', function () {
    assert(im().output == '-');
  });

  it('should be pipe-able', function (done) {
    var img = im();
    fs.createReadStream(__dirname + '/test.jpg').pipe(img);
    img.pipe(fs.createWriteStream(__dirname + '/test-resized.jpg'));
    img.on('finish', function () {
      assert(fs.existsSync(__dirname + '/test-resized.jpg'));
      assert(fs.statSync(__dirname + '/test-resized.jpg')['size'] > 0);
      fs.unlinkSync(__dirname + '/test-resized.jpg');
      done();
    });
  });

  it('should emit errors from stderr', function (done) {
    var img = im();
    img.write('invalid data');
    img.end();
    img.on('error', function (err) {
      assert(/^convert/.test(err.message));
      done();
    });
  });

  describe('.from()', function () {
    it('should read from the given path', function (done) {
      var img = im().from(__dirname + '/test.jpg');
      img.pipe(fs.createWriteStream(__dirname + '/test-resized.jpg'));
      img.on('finish', function () {
        assert(fs.existsSync(__dirname + '/test-resized.jpg'));
        assert(fs.statSync(__dirname + '/test-resized.jpg')['size'] > 0);
        fs.unlinkSync(__dirname + '/test-resized.jpg');
        done();
      });
    });
  });

  describe('.to()', function () {
    it('should write to the given path', function (done) {
      var img = im().to(__dirname + '/test-resized.jpg');
      fs.createReadStream(__dirname + '/test.jpg').pipe(img);
      img.on('finish', function () {
        assert(fs.existsSync(__dirname + '/test-resized.jpg'));
        assert(fs.statSync(__dirname + '/test-resized.jpg')['size'] > 0);
        fs.unlinkSync(__dirname + '/test-resized.jpg');
        done();
      });
    });
  });

  describe('.spawn()', function () {
    it('should call .spawn() with setImmediate', function (done) {
      im().on('spawn', function (proc) {
        assert(proc.stdin);
        assert(proc.stdout);
        done();
      });
    });

    it('should add input and output format to args', function (done) {
      var img = im();
      var args = img.args();
      assert.equal(img.input, args[0]);
      assert.equal(img.output, args[args.length - 1]);
      done();
    });
  });

  describe('.quality()', function () {
    it('should set the quality option', function () {
      var img = im().quality(90);
      var args = img.args();
      assert(args.length == 4);
      assert(args[1] == '-quality');
      assert(args[2] == '90');
    });
  });

  describe('.resize()', function () {
    it('should set the resize option', function () {
      var img = im().resize('200x200');
      var args = img.args();
      assert(args.length == 4);
      assert(args[1] == '-resize');
      assert(args[2] == '200x200');
    });
  });

  describe('.scale()', function () {
    it('should set the scale option', function () {
      var img = im().scale('200x200');
      var args = img.args();
      assert(args.length == 4);
      assert(args[1] == '-scale');
      assert(args[2] == '200x200');
    });
  });

  describe('.crop()', function () {
    it('should set the crop option', function () {
      var img = im().crop('200x200');
      var args = img.args();
      assert(args.length == 4);
      assert(args[1] == '-crop');
      assert(args[2] == '200x200');
    });
  });

  describe('.gravity()', function () {
    it('should set the gravity option', function () {
      var img = im().gravity('North');
      var args = img.args();
      assert(args.length == 4);
      assert(args[1] == '-gravity');
      assert(args[2] == 'North');
    });
  });

  describe('.thumbnail()', function () {
    it('should set the thumbnail option', function () {
      var img = im().thumbnail('200x200');
      var args = img.args();
      assert(args.length == 4);
      assert(args[1] == '-thumbnail');
      assert(args[2] == '200x200');
    });
  });

  describe('.autoOrient()', function () {
    it('should set the auto-orient option', function () {
      var img = im().autoOrient();
      var args = img.args();
      assert(args.length == 3);
      assert(args[1] == '-auto-orient');
    });
  });

  describe('.type()', function () {
    it('should set the type option', function () {
      var img = im().type('jpg');
      var args = img.args();
      assert(args.length == 4);
      assert(args[1] == '-type');
      assert(args[2] == 'jpg');
    });
  });

  describe('.inputFormat()', function () {
    it('should set the input format', function () {
      var img = im().inputFormat('test');
      var args = img.args();
      assert(args[0] == 'test:-');
    });
  });

  describe('.outputFormat()', function () {
    it('should set the output format', function () {
      var img = im().outputFormat('test');
      var args = img.args();
      assert(args[1] == 'test:-');
    });
  });

  describe('.op()', function () {
    it('should accept a key-value pair', function () {
      var img = im();
      img.op('gaussian-blur', 0.05);
      img.op('interlace', 'Plane');

      var args = img.args();
      assert(args[1] == '-gaussian-blur');
      assert(args[2] == '0.05');
      assert(args[3] == '-interlace');
      assert(args[4] == 'Plane');
    });

    it('should accept an object', function () {
      var img = im().op({
        'gaussian-blur': 0.05,
        'interlace': 'Plane'
      });

      var args = img.args();
      assert(args[1] == '-gaussian-blur');
      assert(args[2] == '0.05');
      assert(args[3] == '-interlace');
      assert(args[4] == 'Plane');
    });
  });

  describe('.operations()', function () {
    it('should alias .op()', function () {
      var img = im();
      assert(img.op === img.operations);
    });
  });

  describe('.set()', function() {
    it('should accept a key-value pair', function() {
      var img = im();
      img.set('density', 500)
      img.set('channel', 'RGB');

      var args = img.args();
      assert(args[0] == '-density');
      assert(args[1] == 500);
      assert(args[2] == '-channel');
      assert(args[3] == 'RGB');
      assert(args[4] == '-');
      assert(args[5] == '-');
    });

    it('should accept an object', function() {
      var img = im().set({
        'density': 500,
        'channel': 'RGB'
      });

      var args = img.args();
      assert(args[0] == '-density');
      assert(args[1] == 500);
      assert(args[2] == '-channel');
      assert(args[3] == 'RGB');
      assert(args[4] == '-');
      assert(args[5] == '-');
    });

    it('should be combinable with freehand operations', function() {
      var img = im();
      img.set('density', 500);
      img.op('gaussian-blur', 0.05);

      var args = img.args();
      assert(args[0] == '-density');
      assert(args[1] == 500);
      assert(args[2] == '-');
      assert(args[3] == '-gaussian-blur');
      assert(args[4] == 0.05);
      assert(args[5] == '-');
    });
  });

  describe('.settings()', function () {
    it('should alias .set()', function () {
      var img = im();
      assert(img.set === img.settings);
    })
  })
});
