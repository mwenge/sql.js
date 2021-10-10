var dbFileElm = document.getElementById('dbfile');
var csvFileElm = document.getElementById('csvfile');
var vsvFileElm = document.getElementById('vsvfile');
var vsvButton = document.getElementById('vsvbutton');
var dbButton = document.getElementById('dbbutton');
var sidebarElm = document.getElementById('sidebar');
var statusElm = document.getElementById('status');
var cellsContainer = document.getElementById("container");


var lastCellID = 0;
hotkeys('ctrl+b', function (event, handler){
    switch (handler.key) {
            case 'ctrl+b':
              createCell(cellsContainer);
              break;
            default: break;
          }
});
// Start the worker in which sql.js will run
var worker = new Worker("../../dist/worker.sql-asm-debug.js");

// Open a database
worker.postMessage({ action: 'open' });

// Add column names and table names to Codemirror's hints.
let hintWords=['SELECT']; // custom hints
const jsHinter = CodeMirror.hint.sql; // copy default hinter for JavaScript
CodeMirror.hint.sql = function (editor) {
    // Find the word fragment near cursor that needs auto-complete...
    const cursor = editor.getCursor();
    const currentLine = editor.getLine(cursor.line);
    let start = cursor.ch;
    let end = start;
    const rex=/[\w.]/; // a pattern to match any characters in our hint "words"
    // Our hints include function calls, e.g. "trap.getSource()"
    // so we search for word charcters (\w) and periods.
    // First (and optional), find end of current "word" at cursor...
    while (end < currentLine.length && rex.test(currentLine.charAt(end))) ++end;
    // Find beginning of current "word" at cursor...
    while (start && rex.test(currentLine.charAt(start - 1))) --start;
    // Grab the current word, if any...
    const curWord = start !== end && currentLine.slice(start, end);
    // Get the default results object from the JavaScript hinter...
    const dflt=jsHinter(editor);
    // If the default hinter didn't hint, create a blank result for now...
    const result = dflt || {list: []};
    // Set the start/end of the replacement range...
    result.to=CodeMirror.Pos(cursor.line, end);
    result.from=CodeMirror.Pos(cursor.line, start);
    // Add our custom hintWords to the list, if they start with the curWord...
    hintWords.forEach(h=>{if (h.startsWith(curWord)) result.list.push(h);});
    result.list.sort(); // sort the final list of hints
    return result;
};

// Create a cell for entering commands
var createCell = function () {
	return function (c, sql) {
    // Connect to the HTML element we 'print' to
    function print(text) {
      output.innerHTML = text.replace(/\n/g, '<br>');
    }
    function error(e) {
      console.log(e);
      errorElm.style.height = '2em';
      errorElm.textContent = e.message;
      output.textContent = "";
    }

    function noerror() {
      errorElm.style.height = '0';
    }
    // Run a command in the database
    function execute(commands) {
      statusElm.textContent = "";
      tic();
      worker.onerror = error;
      worker.onmessage = function (event) {
        var results = event.data.results;
        toc("Executing SQL");
        if (!results) {
          error({message: event.data.error});
          return;
        }

        tic();
        output.innerHTML = "";
        for (var i = 0; i < results.length; i++) {
          output.appendChild(tableCreate(results[i].columns, results[i].values));
        }
        toc("Displaying results");
        updateSidebar();
      }
      worker.postMessage({ action: 'exec', sql: commands });
      output.textContent = "Fetching results...";
    }

    // Execute the commands when the button is clicked
    function execEditorContents() {
      noerror()
      execute(editor.getValue() + ';');
    }
    function addCell() {
      createCell(container.parentElement);
    }
    function deleteCell() {
      if (container.id == 1) {
        return;
      }
      container.parentElement.removeChild(container);
    }

		var container = document.createElement('div');
    lastCellID++;
    container.id = lastCellID;

    // Add the command pane
		var commandsElm = document.createElement('textarea');
    if (!sql) {
      sql = 'Select * from table';
    }
    commandsElm.textContent = sql;
    container.appendChild(commandsElm);
    c.appendChild(container);

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
        "Ctrl-Space": "autocomplete",
        "Ctrl-S": savedb,
        "Ctrl-B": addCell,
        "Ctrl-D": deleteCell,
      }
    });

    // Add the tips line
		var tipsElm = document.createElement('span');
    tipsElm.className = "tips";
    tipsElm.textContent = "Press Ctrl-Space to autocomplete, Ctrl-Enter to execute, Ctrl-B to add a new cell, Ctrl-D to delete this cell.";
    container.appendChild(tipsElm);

    // Add the error pane
		var errorElm = document.createElement('div');
    errorElm.className = "error";
    container.appendChild(errorElm);

    // Add the output pane
		var output = document.createElement('pre');
    output.className = "output";
    container.appendChild(output);
	}
}();
createCell(cellsContainer);

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

// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) { window.performance = { now: Date.now } }
function tic() { tictime = performance.now() }
function toc(msg) {
	var dt = performance.now() - tictime;
	console.log((msg || 'toc') + ": " + dt + "ms");
}

// Load a file into our DB by guessing the separators it uses.
dbButton.onclick = function () {
  dbFileElm.click();
};
// Load a db from a file
dbFileElm.onchange = function () {
	var f = dbFileElm.files[0];
	var r = new FileReader();
	r.onload = function () {
		worker.onmessage = function () {
			toc("Loading database from file");
      updateSidebar();
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
vsvButton.onclick = function () {
  vsvFileElm.click();
};
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

  // Take all the sheets in a workbook and return them as an
  // array of [csvdata, tablename]
  function convertExcelToCSV(d, filename) {
    var data = new Uint8Array(d);
    var wb = XLSX.read(data,{type:'array'});
    let sheets = [];
		for (let i = 0, l = wb.SheetNames.length; i < l; i += 1) {
      let s = wb.Sheets[wb.SheetNames[i]];
      var csv = XLSX.utils.sheet_to_csv(s, { type:'array', header: 1 });
      sheets.push([enc.encode(csv), filename + wb.SheetNames[i]]);
		}
    return sheets;
  }

  function getDataAndSeparator(d, filename) {
    let suff = filename.slice(-3);
    if (["xls", "lsx"].includes(suff)) {
      return [convertExcelToCSV(d, filename), '2c'];
    }
    let sep = guessSeparator(filename, d);
    return [[[d, filename]], sep];
  }

	var f = vsvFileElm.files[0];
	var r = new FileReader();
	r.onload = function () {
    let [data, sep] = getDataAndSeparator(r.result, f.name);
		if (sep == "-1") {
			console.log("Can't determine the separator from the file suffix or contents.");
      return;
    }
    worker.onmessage = function (e) {
      if (e.data.progress) {
        statusElm.textContent = e.data.progress;
        return;
      }
      // Show the schema of the loaded database
      updateSidebar();
      if (e.data.vsvFileDetail) {
        let sql = "SELECT * FROM \"" + e.data.vsvFileDetail.tableName + "\" LIMIT 10";
        createCell(cellsContainer, sql);
        return;
      }
    };
    for (let d of data) {
      try {
        worker.postMessage({ action: 'createVSVTable', buffer: d[0], fileName: d[1], separator: sep, quick: true }, [d[0]]);
      }
      catch (exception) {
        worker.postMessage({ action: 'createVSVTable', buffer: d[0], fileName: d[1], separator: sep, quick: true });
      }
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
        statusElm.textContent = e.data.progress;
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

	function addToCodeMirrorHints(vs) {
		for (v of vs) {
      if (!hintWords.includes(v)) {
        hintWords.push(v);
      }
    }
	}

  function populateSidebar(e) {
    if (e.data.progress) {
      statusElm.textContent = e.data.progress;
    }
    var results = e.data.results;
    if (!results || !results.length) {
      return;
    }

    sidebar.innerHTML = "";
    // Each row is an array of the column values
    let rows = results[0].values;
		let tables = [... new Set(rows.map(x => x[0]))];
    addToCodeMirrorHints(tables);
		for (t of tables) {
				let fields = rows.filter(x => x[0] == t).map(x => [x[1],x[2]]);
        addToCodeMirrorHints(fields.map(x => x[0]));
				sidebar.appendChild(tableCreate(t, fields));
				sidebar.appendChild(document.createElement("br"));
		}
  }
  // Run a command in the database
  function execute(commands) {
    tic();
    worker.onmessage = populateSidebar;
    worker.postMessage({ action: 'exec', sql: commands });
  }
  let schemaSQL = "SELECT DISTINCT m.name, ii.name, ii.type " +
    "  FROM sqlite_schema AS m, " +
    "       pragma_table_info(m.name) AS ii " +
    "  WHERE m.type='table' " +
    "  ORDER BY 1; ";
	execute(schemaSQL+ ';');
}

