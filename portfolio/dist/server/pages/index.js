"use strict";
(() => {
var exports = {};
exports.id = 405;
exports.ids = [405];
exports.modules = {

/***/ 543:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ Home),
  "getStaticProps": () => (/* binding */ getStaticProps)
});

// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(689);
;// CONCATENATED MODULE: external "next/head"
const head_namespaceObject = require("next/head");
var head_default = /*#__PURE__*/__webpack_require__.n(head_namespaceObject);
;// CONCATENATED MODULE: external "microcms-js-sdk"
const external_microcms_js_sdk_namespaceObject = require("microcms-js-sdk");
;// CONCATENATED MODULE: ./libs/client.ts

const client = (0,external_microcms_js_sdk_namespaceObject.createClient)({
  serviceDomain: 'portfolio202201',
  apiKey: process.env.API_KEY
});
// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
;// CONCATENATED MODULE: ./pages/index.tsx






function Home({
  portfolio
}) {
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
    children: [/*#__PURE__*/(0,jsx_runtime_.jsxs)((head_default()), {
      children: [/*#__PURE__*/jsx_runtime_.jsx("title", {
        children: "Portfolio | Ayaka Nakamura"
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        charSet: "UTF-8"
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        httpEquiv: "X-UA-Compatible",
        content: "IE=edge"
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        name: "description",
        content: ""
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        property: "og:locale",
        content: "ja_JP"
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        property: "og:type",
        content: "website"
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        property: "og:title",
        content: ""
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        property: "og:description",
        content: ""
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        property: "og:url",
        content: ""
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        property: "og:image",
        content: ""
      }), /*#__PURE__*/jsx_runtime_.jsx("meta", {
        name: "twitter:card",
        content: "summary_large_image"
      }), /*#__PURE__*/jsx_runtime_.jsx("link", {
        rel: "canonical",
        href: ""
      })]
    }), /*#__PURE__*/jsx_runtime_.jsx("div", {
      children: /*#__PURE__*/jsx_runtime_.jsx("ul", {
        children: portfolio.map(work => /*#__PURE__*/jsx_runtime_.jsx("li", {
          children: /*#__PURE__*/jsx_runtime_.jsx("p", {
            children: work.title
          })
        }, work.id))
      })
    })]
  });
}
const getStaticProps = async () => {
  const data = await client.get({
    endpoint: 'portfolio'
  });
  return {
    props: {
      portfolio: data.contents
    }
  };
};

/***/ }),

/***/ 689:
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(543));
module.exports = __webpack_exports__;

})();