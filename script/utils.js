const fs = require("fs");
const path = require("path");


let files=  ['D:\\Users\\Michael\\repos\\angular-common-patterns\\common-patterns\\src\\app\\code\\utils.ts',
'D:\\Users\\Michael\\repos\\beercss\\src\\shared\\utils.ts',
'D:\\Users\\Michael\\repos\\drender\\client\\dist\\out-tsc\\drender\\processing\\utils.js',
'D:\\Users\\Michael\\repos\\drender\\client\\drender\\dloader\\processing\\utils.ts',
'D:\\Users\\Michael\\repos\\drender\\client\\drender\\module\\drapp\\object-utils.ts',
'D:\\Users\\Michael\\repos\\drender\\client\\drender\\module\\utils.ts',
'D:\\Users\\Michael\\repos\\drender\\DeckRenderer\\projects\\common\\dloader\\src\\lib\\processing\\utils.ts',
'D:\\Users\\Michael\\repos\\drender\\DeckRenderer\\projects\\common\\drender\\src\\lib\\drapp\\object-utils.ts',
'D:\\Users\\Michael\\repos\\drender\\DeckRenderer\\projects\\common\\drender\\src\\lib\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\ConfigApp\\src\\app\\code\\three-util.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\DeckRenderer\\projects\\common\\drender\\src\\lib\\color-utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\DeckRenderer\\projects\\common\\drender\\src\\lib\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\DeckRenderer\\projects\\common\\plan-compile\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\DeckRenderer\\projects\\common\\processing\\pipeline_v5\\fileutils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\DeckRenderer\\projects\\common\\processing\\pipeline_v5\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\example-migrate\\files\\Utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\glb-load-raw-webgl\\example\\Utils.js',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\glb-load-raw-webgl\\src\\code\\Utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\imageprocessor-sdf\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\imageprocessor-sdf-2\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\new-imageprocessor\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\pixel-shaders\\src\\code\\imageUtils.js',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\shader-run\\color-utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\shader-run\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\shaders\\pipeline_v5\\fileutils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\shaders\\pipeline_v5\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\shaders\\src\\code\\color-utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\experiments\\shaders\\src\\code\\utils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\PlanApp\\src\\app\\code\\three-util.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\TexturePipeline\\src\\fileutils.ts',
'D:\\Users\\Michael\\repos\\lcars-layout\\TexturePipeline\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\materialize-kitchensink\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\docs\\.vuepress\\plugins\\code-demo\\utils.js',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\cubemap-adapter\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\cubemap-tiles-adapter\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\equirectangular-tiles-adapter\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\map-plugin\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\markers-plugin\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\plan-plugin\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\shared\\autorotate-utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\shared\\tiles-utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\shared\\video-utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\stereo-plugin\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\video-plugin\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\Photo-Sphere-Viewer\\packages\\virtual-tour-plugin\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\dr-icon-lib\\src\\lib\\function\\icon-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\dr-icon-lib\\src\\lib\\function\\math-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\dr-icon-lib\\src\\lib\\function\\path-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\dr-icon-lib\\src\\lib\\function\\point-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\dr-icon-lib\\src\\lib\\function\\utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\yet-another-revamp\\src\\dr-lib\\function\\icon-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\yet-another-revamp\\src\\dr-lib\\function\\math-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\yet-another-revamp\\src\\dr-lib\\function\\path-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\yet-another-revamp\\src\\dr-lib\\function\\point-utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\iconwork\\yet-another-revamp\\src\\dr-lib\\function\\utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\multi-project\\projects\\planconf-icons\\src\\lib\\utils.ts',
'D:\\Users\\Michael\\repos\\PlanConfig\\ng\\src\\app\\code\\three-util.ts',
'D:\\Users\\Michael\\repos\\public_html\\r2b\\webgl-utils.js',
'D:\\Users\\Michael\\repos\\public_html\\shadertest\\resources\\webgl-utils.js',
'D:\\Users\\Michael\\repos\\SiteReaderV2\\src\\utils.ts',
'D:\\Users\\Michael\\repos\\stable-diffusion-webui\\extensions\\openOutpaint-webUI-extension\\app\\js\\lib\\util.js' ]

let i = 0;

files.forEach(n => {
    i++;

    let newName = i.toString().padStart(3, "0") + "_" + path.basename(n);
    console.log(n, i, newName);
    fs.copyFileSync(n, path.join(".","utils",newName));
})


