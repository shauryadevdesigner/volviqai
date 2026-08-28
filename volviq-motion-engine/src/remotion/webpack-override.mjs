import path from "path";

export const webpackOverride = (config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
  };
};
