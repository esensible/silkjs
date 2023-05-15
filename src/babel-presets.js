import pluginTransformReactJSX from "@babel/plugin-transform-react-jsx";

export default function (api, opts) {
  return {
    plugins: [
      [pluginTransformReactJSX, 
        {
          runtime: "automatic",
          importSource: "silkjs"
        }
      ]
    ]
  };
};