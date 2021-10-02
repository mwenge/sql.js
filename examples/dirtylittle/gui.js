var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('dbfile');
var csvFileElm = document.getElementById('csvfile');
var vsvFileElm = document.getElementById('vsvfile');
var savedbElm = document.getElementById('savedb');
var sidebarElm = document.getElementById('sidebar');

// Start the worker in which sql.js will run
var worker = new Worker("../../dist/worker.sql-asm-debug.js");
worker.onerror = error;

// Open a database
worker.postMessage({ action: 'open' });

// Connect to the HTML element we 'print' to
function print(text) {
	outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
function error(e) {
	console.log(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
}

function noerror() {
	errorElm.style.height = '0';
}

// Run a command in the database
function execute(commands) {
	tic();
	worker.onmessage = function (event) {
		var results = event.data.results;
		toc("Executing SQL");
		if (!results) {
			error({message: event.data.error});
			return;
		}

		tic();
		outputElm.innerHTML = "";
    console.log(results);
		for (var i = 0; i < results.length; i++) {
			outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
		}
		toc("Displaying results");
	}
	worker.postMessage({ action: 'exec', sql: commands });
	outputElm.textContent = "Fetching results...";
}

// Create an HTML table
var tableCreate = function () {
	function valconcat(vals, tagName) {
		if (vals.length === 0) return '';
		var open = '<' + tagName + '>', close = '</' + tagName + '>';
		return open + vals.join(close + open) + close;
	}
	return function (columns, values) {
		var tbl = document.createElement('table');
		var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
		var rows = values.map(function (v) { return valconcat(v, 'td'); });
		html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
		tbl.innerHTML = html;
		return tbl;
	}
}();

// Execute the commands when the button is clicked
function execEditorContents() {
	noerror()
	execute(editor.getValue() + ';');
}
execBtn.addEventListener("click", execEditorContents, true);

// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) { window.performance = { now: Date.now } }
function tic() { tictime = performance.now() }
function toc(msg) {
	var dt = performance.now() - tictime;
	console.log((msg || 'toc') + ": " + dt + "ms");
}

// Add syntax highlihjting to the textarea
var editor = CodeMirror.fromTextArea(commandsElm, {
	mode: 'text/x-mysql',
	viewportMargin: Infinity,
	indentWithTabs: true,
	smartIndent: true,
	lineNumbers: true,
	matchBrackets: true,
	autofocus: true,
	extraKeys: {
		"Ctrl-Enter": execEditorContents,
		"Ctrl-S": savedb,
	}
});

// Load a db from a file
dbFileElm.onchange = function () {
	var f = dbFileElm.files[0];
	var r = new FileReader();
	r.onload = function () {
		worker.onmessage = function () {
			toc("Loading database from file");
			// Show the schema of the loaded database
			editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
			execEditorContents();
		};
		tic();
		try {
			worker.postMessage({ action: 'open', buffer: r.result }, [r.result]);
		}
		catch (exception) {
			worker.postMessage({ action: 'open', buffer: r.result});
		}
	}
	r.readAsArrayBuffer(f);
}

const suffixToSep = new Map([ 
  ["csv", ","],
  ["tsv", "\t"],
  ["psv", "|"],
]);
var enc = new TextEncoder(); // always utf-8

// Load a file into our DB by guessing the separators it uses.
vsvFileElm.onchange = function () {
  // Returns the guessed separator as a decimal integer, e.g. '\t' as 9.
  // Returns -1 if we can't figure out the separator used in the file.
  function guessSeparatorFromData(d) {
    function getPossibleSeps(seps) {
      // Guess the separator as the char that occurs a consistent number of times
      // in each line.
      let s = [];
      for (const [k, v] of seps) {
        let max = Math.max(...v);
        if (!max)
          continue
        let min = Math.min(...v);
        if (min == max) {
          s.push(k);
        }
      }
      return s;
    }

    // Number of lines to use for guessing is the number of newlines, to a max of 10
    let ltc = Math.min(d.filter(x => x === 0x0a).length, 10);

    let seps = new Map();
    suffixToSep.forEach((x,y,z) => seps.set(enc.encode(x)[0], new Array(ltc).fill(0)));

    let cl = 0; // line count
    // Count the appearances of each separator in each line.
    for (let i = 0; i < d.byteLength; i++) {
      if (d[i] == 0x0a) {
        cl++;
        if (cl == ltc)
          break;
        continue;
      }
      if (seps.has(d[i])) {
        let cv = seps.get(d[i]);
        cv[cl]++
        seps.set(d[i], cv);
      }
    }
    let s = getPossibleSeps(seps);
    if (s.length != 1)
        return -1;
    return s[0];
  }

  let toHex = x => x.toString(16).padStart(2,'0')
  function guessSeparator(filename, data) {
    let suff = filename.slice(-3);
    if (suffixToSep.has(suff)) {
      return toHex(enc.encode(suffixToSep.get(suff))[0]);
    }
    // Use the first 10,000 bytes for guessing.
    let d = data.slice(0,10000);
    return toHex(guessSeparatorFromData(d));
  }

  function convertExcelToCSV(d, filename) {
    var data = new Uint8Array(d);
    var wb = XLSX.read(data,{type:'array'});
    var csv = XLSX.write(wb,{type:'array',bookType:'csv'});
    return new Uint8Array(csv);
  }

  function getDataAndSeparator(d, filename) {
    let suff = filename.slice(-3);
    if (["xls", "lsx"].includes(suff)) {
      return [convertExcelToCSV(d), '2c'];
    }
    let sep = guessSeparator(filename, d);
    return [d, sep];
  }

	var f = vsvFileElm.files[0];
	var r = new FileReader();
	r.onload = function () {
		worker.onmessage = function (e) {
      if (e.data.progress) {
        outputElm.textContent = e.data.progress;
        return;
      }
			toc("Loading database from vsv file");
			// Show the schema of the loaded database
      updateSidebar();
		};
		tic();

    let [data, sep] = getDataAndSeparator(r.result, f.name);
		if (sep == "-1") {
			console.log("Can't determine the separator from the file suffix or contents.");
			toc("Can't determine the separator from the file suffix or contents.");
      return;
    }
		try {
			worker.postMessage({ action: 'createVSVTable', buffer: data, fileName: f.name, separator: sep }, [data]);
		}
		catch (exception) {
			worker.postMessage({ action: 'createVSVTable', buffer: data, fileName: f.name, separator: sep });
		}
	}
	r.readAsArrayBuffer(f);
}


// Load a csv file into the db.
csvFileElm.onchange = function () {
	var f = csvFileElm.files[0];
	var r = new FileReader();
	r.onload = function () {
		worker.onmessage = function (e) {
      if (e.data.progress) {
        outputElm.textContent = e.data.progress;
        return;
      }
			toc("Loading database from csv file");
			// Show the schema of the loaded database
      updateSidebar();
		};
		tic();
		try {
			worker.postMessage({ action: 'createCSVTable', buffer: r.result, fileName: f.name }, [r.result]);
		}
		catch (exception) {
			worker.postMessage({ action: 'createCSVTable', buffer: r.result, fileName: f.name });
		}
	}
	r.readAsArrayBuffer(f);
}

// Save the db to a file
function savedb() {
	worker.onmessage = function (event) {
		toc("Exporting the database");
		var arraybuff = event.data.buffer;
		var blob = new Blob([arraybuff]);
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.href = window.URL.createObjectURL(blob);
		a.download = "sql.db";
		a.onclick = function () {
			setTimeout(function () {
				window.URL.revokeObjectURL(a.href);
			}, 1500);
		};
		a.click();
	};
	tic();
	worker.postMessage({ action: 'export' });
}
savedbElm.addEventListener("click", savedb, true);

function updateSidebar() {
  // Create an HTML table
	var tableCreate = function () {
		function valconcat(vals, tagName) {
			if (vals.length === 0) return '';
			var open = '<' + tagName + '>', close = '</' + tagName + '>';
			return open + vals.join(close + open) + close;
		}
		return function (tableName, values) {
			var tbl = document.createElement('table');
			var html = '<thead><th colspan=2>' + tableName + '</th></thead>';
			let rows = values.map(x => valconcat(x, 'td'))
			html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
			tbl.innerHTML = html;
			return tbl;
		}
	}();


  function populateSidebar(e) {
    var results = e.data.results;
    if (!results) {
      error({message: e.data.error});
      return;
    }

    sidebar.innerHTML = "";
    // Each row is an array of the column values
    let rows = results[0].values;
    console.log(rows);
		let tables = [... new Set(rows.map(x => x[0]))];
		for (t of tables) {
				let fields = rows.filter(x => x[0] == t).map(x => [x[1],x[2]]);
				sidebar.appendChild(tableCreate(t, fields));
		}
  }
  // Run a command in the database
  function execute(commands) {
    tic();
    worker.onmessage = populateSidebar;
    worker.postMessage({ action: 'exec', sql: commands });
  }
	noerror()
  let schemaSQL = "SELECT DISTINCT m.name, ii.name, ii.type " +
    "  FROM sqlite_schema AS m, " +
    "       pragma_table_info(m.name) AS ii " +
    "  WHERE m.type='table' " +
    "  ORDER BY 1; ";
	execute(schemaSQL+ ';');
}

