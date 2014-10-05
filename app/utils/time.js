var pad = function(str) {
  return str.length === 1 ? "0" + str : str;
};

export function parseTime(str) {
  if (!str) {
    return null;
  } else if (str === 'Po.fal' || str === 'P.fehl' || str === 'aufgeg.') {
    return null;
  }
  var split = str.split(":");
  var result = null;
  if (split.length === 2) {
    var negative = split[0][0] === '-';
    var minutes = parseInt(split[0], 10);
    result = (negative ? -1 : 1) * (Math.abs(minutes) * 60 + parseInt(split[1], 10));
  } else if (split.length === 3) {
    result = parseInt(split[0], 10) * 3600 + parseInt(split[1], 10) * 60 + parseInt(split[2], 10);
  }
  return isNaN(result) ? null : result;
}

export function formatTime(seconds) {
  if (seconds >= 0) {
    return Math.floor(seconds / 60) + ":" + pad("" + seconds % 60);
  } else {
    return "-" + Math.floor(-seconds / 60) + ":" + pad("" + -seconds % 60);
  }
}