#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var url = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fierce-reaches-1073.herokuapp.com";

var rest = require('restler');

function getResp(url){
    console.log(url);
  rest.get(url).on('complete', function(response){
    processResponse(response);
  });
}

// data will be a Buffer
function processResponse(data) {
  // converting Buffers to strings is expensive, so I prefer
  // to do it explicitely when required
    //console.log(data);
    var str = data.toString();
    fs.writeFileSync('./downloaded.html',str, "UTF-8");
    //fs.closeS();
    //console.log(str);
    var checkJson = checkHtmlFile('./downloaded.html', program.checks);
    outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}



var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    //console.log(htmlfile);
    //var buf = fs.readFileSync(htmlfile);
    //console.log(buf);
    //var content = buf.toString();
    //console.log(content);
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var outJson="";
if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'Path to http://fierce-reaches-1073.herokuapp.com', URL_DEFAULT)
	.parse(process.argv);
    if (program.file==HTMLFILE_DEFAULT) {

	getResp(program.url);

    } else {
	var checkJson = checkHtmlFile(program.file, program.checks);
	outJson = JSON.stringify(checkJson, null, 4);

	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
