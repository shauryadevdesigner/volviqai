/* eslint-disable @typescript-eslint/no-require-imports, no-undef, no-unused-vars, no-useless-escape */
const Babel = require("@babel/standalone");
const code = `
const DynamicAnimation = () => {
  return (
    <div style={{
      opacity
      transform: 'translateY(\${translateY}px)',
      display: "inline-block",
    }} />
  );
};
`;
try {
  const result = Babel.transform(code, {
    presets: ["react", "typescript"],
    filename: "dynamic-animation.tsx",
  });
  console.log("SUCCESS:", result.code);
} catch (e) {
  console.error("ERROR:", e.message);
}
