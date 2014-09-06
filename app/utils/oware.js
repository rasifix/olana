function parseCategory(row) {
	return {
		name: row[0],
		distance: parseInt(row[1]),
		ascent: parseInt(row[2]),
		controls: parseInt(row[3]),
		runners: []
	};
}

function parseRunner(row) {
	var headerLength = 15;
	
	var splits = [];
	for (var i = headerLength; i < row.length; i += 2) {
		splits.push([row[i], row[i + 1]]);
	}
			
	return {
	  fednr: row[5] ? row[5] : null,
		name: row[1],
		firstName: row[2],
		yearOfBirth: row[3],
		sex: row[4],
		club: row[8],
		city: row[7],
		nation: row[9],
		time: row[12],
		startTime: row[13],
		ecard: row[11],
		splits: splits
	};
}

export function parseOWare(lines) {  
  // throw away column headers
  lines = lines.splice(1);
  
  var header = lines[0].split(';');
  
  var event = {
    name: header[0].substring(2, header[0].length),
    map: header[1],
    date: header[2],
    startTime: header[3],
    categories: [ ]
  };
  
  // throw a way the now parsed header
  lines = lines.splice(1);
  
  var category = null;
	
	lines.forEach(function(line) {
	  var cols = line.split(';');
	  if (cols.length === 4) {
	    category = parseCategory(cols);
	    event.categories.push(category);
	  } else {
	    category.runners.push(parseRunner(cols));
	  }
	});	
  
  return event;
}