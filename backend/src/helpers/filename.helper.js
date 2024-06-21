function getRandomFileName(name) {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  var random = ("" + Math.random()).substring(2, 8);
  var random_number = name + timestamp + random;
  return random_number;
}
export default getRandomFileName;
