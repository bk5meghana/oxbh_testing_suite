module.exports = {
  parseInput(input) {
    let parsedData;
    if (typeof input === "object" && input !== null) {
      return input;
    }
    try {
      parsedData = JSON.parse(input);
    } catch (e) {
      console.error("Invalid JSON:", e);
      // Handle the error or return null/undefined or throw the error again based on your requirement
      return null;
    }
    return parsedData;
  },
};
