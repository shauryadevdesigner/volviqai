import { ResolvedBrief } from "../../design-system";
import { GeneratedAssets, SceneLayouts, SceneLayoutItem } from "../types";

export function runStage7(
  resolvedBrief: ResolvedBrief,
  assets: GeneratedAssets,
): SceneLayouts {
  const layouts: SceneLayoutItem[] = resolvedBrief.scenes.map((scene) => {
    const layoutDirection = scene.layout.direction;
    const hasAsset = assets.sceneAssets[scene.sceneNumber] !== undefined;

    let compositionStyle:
      | "split"
      | "editorial"
      | "asymmetric"
      | "bento"
      | "layered_depth" = "editorial";
    let elementCoords: Record<string, string> = {};

    if (layoutDirection === "split-left" || layoutDirection === "split-right") {
      compositionStyle = "split";
      elementCoords = {
        container:
          "display: flex; flex-direction: row; width: 100%; height: 100%; align-items: center;",
        assetWrapper: `width: 50%; height: 100%; display: flex; justify-content: center; align-items: center; order: ${
          layoutDirection === "split-left" ? 1 : 2
        };`,
        textWrapper: `width: 50%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: ${
          layoutDirection === "split-left" ? "flex-start" : "flex-end"
        }; padding: 64px; text-align: ${
          layoutDirection === "split-left" ? "left" : "right"
        }; order: ${layoutDirection === "split-left" ? 2 : 1};`,
      };
    } else if (layoutDirection === "layered-overlap") {
      compositionStyle = "layered_depth";
      elementCoords = {
        container: "position: relative; width: 100%; height: 100%;",
        assetWrapper:
          "position: absolute; bottom: 10%; right: 10%; width: 55%; height: auto; z-index: 10; display: flex; justify-content: center;",
        textWrapper:
          "position: absolute; top: 15%; left: 10%; width: 50%; display: flex; flex-direction: column; z-index: 20; text-align: left; align-items: flex-start;",
      };
    } else if (layoutDirection === "asymmetric-grid") {
      compositionStyle = "asymmetric";
      elementCoords = {
        container:
          "display: grid; grid-template-columns: 3fr 2fr; gap: 32px; padding: 64px; width: 100%; height: 100%; align-items: center;",
        assetWrapper:
          "grid-column: 2; height: 100%; display: flex; align-items: center; justify-content: center;",
        textWrapper:
          "grid-column: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; text-align: left;",
      };
    } else {
      // centered or standard
      compositionStyle = hasAsset ? "split" : "editorial";
      if (hasAsset) {
        elementCoords = {
          container:
            "display: flex; flex-direction: column; align-items: center; justify-content: space-around; width: 100%; height: 100%; padding: 48px;",
          assetWrapper:
            "width: 60%; height: 50%; display: flex; justify-content: center; align-items: center;",
          textWrapper:
            "width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center;",
        };
      } else {
        elementCoords = {
          container:
            "display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 64px;",
          assetWrapper: "display: none;",
          textWrapper:
            "width: 80%; display: flex; flex-direction: column; align-items: center; text-align: center;",
        };
      }
    }

    return {
      sceneNumber: scene.sceneNumber,
      compositionStyle,
      canvasUtilizationPct: 96,
      elementCoords,
    };
  });

  return { layouts };
}
