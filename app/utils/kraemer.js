function strip(str) {
  if (!str) {
    return '';
  } else if (str.length > 0 && str[0] === '"') {
    return str.substring(1, str.length - 1);
  } else {
    return str;
  }
}

export function parseKraemer(lines, event, map, date, startTime) {
  // OE0014;Stnr;XStnr       ;Chipnr;  Datenbank Id;Nachname;Vorname;Jg;   G;Block; AK;  Start;Ziel;   Zeit;    Wertung;Gutschrift -;Zuschlag +;Kommentar;Club-Nr.;Abk; Ort; Nat; Sitz;Region;Katnr;Kurz; Lang;     MeldeKat. Nr;MeldeKat. (kurz);MeldeKat. (lang);Rang;Ranglistenpunkte;Num1;Num2; Num3;     Text1;   Text2;    Text3;  Adr. Nachname;Adr. Vorname;Straße;Zeile2;PLZ;        Adr. Ort;Tel;         Mobil;      Fax;    EMail;   Gemietet;Startgeld;Bezahlt;Mannschaft;Bahnnummer;Bahn;   km;     Hm;      Bahn Posten;Platz;   Startstempel;Zielstempel;Posten1;Stempel1;Posten2;Stempel2;Posten3; Stempel3;Posten4;Stempel4;Posten5;Stempel5;Posten6;Stempel6;Posten7;Stempel7;Posten8;Stempel8;Posten9;Stempel9;Posten10;Stempel10;Posten11;Stempel11;Posten12;Stempel12;Posten13;Stempel13;Posten14;Stempel14;Posten15;Stempel15;Posten16;Stempel16;Posten17;Stempel17;Posten18;Stempel18;Posten19;Stempel19;Posten20;Stempel20;Posten21;Stempel21;Posten22;Stempel22;Posten23;Stempel23;Posten24;Stempel24;Posten25;Stempel25;Posten26;Stempel26;Posten27;Stempel27;Posten28;Stempel28;Posten29;Stempel29;Posten30;Stempel30;Posten31;Stempel31;Posten32;Stempel32;Posten33;Stempel33;Posten34;Stempel34;Posten35;Stempel35;Posten36;Stempel36;Posten37;Stempel37;Posten38;Stempel38;Posten39;Stempel39;Posten40;Stempel40;Posten41;Stempel41;Posten42;Stempel42;Posten43;Stempel43;Posten44;Stempel44;Posten45;Stempel45;Posten46;Stempel46;Posten47;Stempel47;Posten48;Stempel48;Posten49;Stempel49;Posten50;Stempel50;Posten51;Stempel51;Posten52;Stempel52;Posten53;Stempel53;Posten54;Stempel54;Posten55;Stempel55;Posten56;Stempel56;Posten57;Stempel57;Posten58;Stempel58;Posten59;Stempel59;Posten60;Stempel60;Posten61;Stempel61;Posten62;Stempel62;Posten63;Stempel63;Posten64;Stempel64;
  // Stnr  ;Chip;Datenbank Id;Nachname;Vorname;     Jg;      G;      Block;AK;Start;Ziel;Zeit; Wertung;Club-Nr.;Abk;    Ort;         Nat;       Katnr;    Kurz;    Lang;Num1;Num2;Num3;Text1; Text2;Text3;Adr. Name;Straße;      Zeile2;          PLZ;             Ort; Tel;             Fax; EMail;Id/Verein;Gemietet;Startgeld;Bezahlt;Bahnnummer;   Bahn;        km;    Hm;    Bahn Posten;Pl;      Startstempel;Zielstempel;Posten1;Stempel1;Posten2; Stempel2; Posten3;Stempel3;  Posten4;  Stempel4;Posten5;Stempel5;Posten6;    Stempel6;Posten7;     Stempel7;   Posten8;Stempel8;Posten9;Stempel9;Posten10;Stempel10;(und weitere)...
         
  // drop first line (header)
  var header = lines[0].split(";");
  var firstTimeIdx;
  
  var indices = { };
  indices['Nachname'] = header.indexOf('Nachname');
  indices['Vorname'] = header.indexOf('Vorname');
  indices['Jg'] = header.indexOf('Jg');
  indices['G'] = header.indexOf('G');
  indices['Datenbank Id'] = header.indexOf('Datenbank Id');
  indices['Abk'] = header.indexOf('Abk');
  indices['Club'] = header.indexOf('Ort');
  indices['Ort'] = header.indexOf('Adr. Ort');
  indices['Nat'] = header.indexOf('Nat');
  indices['Start'] = header.indexOf('Start');
  indices['Ziel'] = header.indexOf('Ziel');
  indices['Zeit'] = header.indexOf('Zeit');
  indices['Katnr'] = header.indexOf('Katnr');
  indices['Wertung'] = header.indexOf('Wertung');
  indices['Posten'] = header.indexOf('Bahn Posten');
  indices['km'] = header.indexOf('km');
  indices['hm'] = header.indexOf('Hm');
  
  if (header[0] === 'OE0014') {
    indices['Chip'] = header.indexOf('Chipnr');
    firstTimeIdx = 56;
  } else {
    indices['Chip'] = header.indexOf('Chip');
    firstTimeIdx = 46;
  }
  
  lines = lines.slice(1);
  
  // the result object
  var categories = { };
  
  function objectify(cols) {
    var result = { };
    Object.keys(indices).forEach(function(key) {
      result[key] = cols[indices[key]];
    });
    return result;
  }
  
  lines.forEach(function(line) {
    var cols = line.split(";");
    var lineObj = objectify(cols);
    
    if (lineObj['Wertung'] !== '0') {
      return;
    }
    
    var runner = {
      name: strip(lineObj['Nachname']),
      firstName: strip(lineObj['Vorname']),
      ecard: strip(lineObj['Chip']),
      fednr: strip(lineObj['Datenbank Id']) || '',
      yearOfBirth: lineObj['Jg'],
      sex: strip(lineObj['G']),
      club: (strip(lineObj['Abk']) + ' ' + strip(lineObj['Club'])).trim(),
      city: strip(lineObj['Ort']),
      nation: strip(lineObj['Nat']),
      startTime: lineObj['Start'],
      finishTime: lineObj['Ziel'],
      runTime: lineObj['Zeit'],
      splits: []
    };

    var category = categories[strip(lineObj['Katnr'])];
    if (typeof category === 'undefined') {
      category = {
        name: strip(lineObj['Katnr']),
        distance: parseInt(strip(lineObj['km'])) * 1000,
        ascent: strip(lineObj['hm']),
        controls: strip(lineObj['Posten']),
        runners: []
      };
      categories[category.name] = category;
    }

    var split = null;
    var times = cols.slice(firstTimeIdx);
    for (var idx = 0; idx < parseInt(lineObj['Posten']) * 2; idx += 2) {
      if (idx === times.length - 1) {
        continue;
      }
      split = {
        code: times[idx],
        time: times[idx + 1]
      };
      runner.splits.push(split);
    }

    category.runners.push(runner);
  });

  return {
    name: event,
    map: map,
    date: date,
    startTime: startTime,
    categories: categories
  }; 
}
