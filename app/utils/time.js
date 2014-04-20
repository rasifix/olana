var pad = function(str) {
  return str.length === 1 ? "0" + str : str;
};

export function parseTime(str) {
  if (!str) {
    return -1;
  }
  var split = str.split(":");
  var result = parseInt(split[0]) * 60 + parseInt(split[1]);
  return isNaN(result) ? -1 : result;
}

export function formatTime(seconds) {
  if (seconds >= 0) {
    return Math.floor(seconds / 60) + ":" + pad("" + seconds % 60);
  } else {
    return "-" + Math.floor(-seconds / 60) + ":" + pad("" + -seconds % 60);
  }
}