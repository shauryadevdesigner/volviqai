// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import {
  RENDER_CRF,
  RENDER_IMAGE_FORMAT,
  RENDER_PIXEL_FORMAT,
} from "./src/lib/render-quality";
import { webpackOverride } from "./src/remotion/webpack-override.mjs";

Config.setVideoImageFormat(RENDER_IMAGE_FORMAT);
Config.setCrf(RENDER_CRF);
Config.setPixelFormat(RENDER_PIXEL_FORMAT);

Config.overrideWebpackConfig(webpackOverride);
