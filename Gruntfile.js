'use strict';
module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		simplemocha: {
			options: {
				timeout: 2000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'spec'
			},
			all: {
				src: [
					// 'test/**/*.test.js'
					'test/trope.test.js'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask('test', 'simplemocha');

	grunt.registerTask('default', 'test');

	/**
		sets up task to generate code coverage report and open web browser to show the report

		grunt coverage
			generates code coverage report and serves it to web browser, then exits
		grunt coverage:long
			generates code coverage report and serves it to web browser and keeps the server running
		grunt coverage:dump
			generates code coverage report and writes it to disk at ./test/CoverageReport.html or ./CoverageReport.html
		grunt coverage:dump:<FilePathName>
			generates code coverage report and writes it to disk at <FilePathName>
	*/
	grunt.registerTask('coverage', 'run code coverage', function (arg1, arg2) {
		var async = require('async');
		var done = this.async();
		var exec = require('child_process').exec;
		var coverageReportHTML;
		var httpServer;
		var option = {};
		var tasks = [];
		var dumpFilePath = arg2 || './test/CoverageReport.html';

		// set option flags for passed in args to true
		if (arg1) {
			option[arg1] = true;
		}

		// run the coverage command and get the HTML output for the report
		tasks.push(function (next) {
			exec('mocha --require blanket -R html-cov', function (err, stdout, stderr) {
				coverageReportHTML = stdout;
				next(err);
			});
		});

		// if 'dump' flag is set, write file to disk, otherwise serve report via web server
		if (option.dump) {
			// write report HTML to a file
			tasks.push(function (next) {
				var fs = require('fs');
				var path = require('path');
				fs.exists(path.dirname(dumpFilePath), function (exists) {
					// if target directory doesn't exist, dump file into current directory
					if (exists) {
						fs.writeFile(dumpFilePath, coverageReportHTML, next);
					} else {
						dumpFilePath = path.basename(dumpFilePath);
						fs.writeFile(dumpFilePath, coverageReportHTML, next);
					}
				});
			});

			// ouput the path of the file written
			tasks.push(function (next) {
				console.log('>> code coverage report file written to: ' + dumpFilePath);
				next();
			});
		} else {
			// spin up a web server to server that report HTML
			tasks.push(function (next) {
				httpServer = require('http').createServer(function (req, res) {
					res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': coverageReportHTML.length });
					res.end(coverageReportHTML);
				});
				httpServer.listen(7357);
				next();
			});

			// open default browser and point to newly created web server
			tasks.push(function (next) {
				exec('open http://localhost:7357/coverage', next);
			});

			// wait
			tasks.push(function (next) {
				setTimeout(next, 1000);
			});
		}

		async.series(tasks, function (err) {
			if (err) {
				throw err;
			}
			if (!option.long) {
				if (httpServer) {
					httpServer.close();
				}
				done();
			}
		});
	});
};
