const getTargetColor = (Target) => {
    if (target === "_blank") return 'orange'; // Strict equality
    if (target === "_self") return 'pink';   // Strict equality
    return null; // Explicitly return null or a default value for unmatched cases
  };
  
  module.exports = getTargetColor;
  