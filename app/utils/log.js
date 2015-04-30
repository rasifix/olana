export default function log(message) {
  if (typeof console !== 'undefined' && console.log) {
    console.log(message);
  }
}
