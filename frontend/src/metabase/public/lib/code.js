
import { optionsToHashParams } from "./embed";

export const getPublicEmbedOptions = ({ iframeUrl }) => [
    { name: "HTML",    source: () => html({ iframeUrl: `"${iframeUrl}"` }), mode: "ace/mode/html" }
];

export const getSignedEmbedOptions = () => [
    { name: "HTML (Mustache)", source: () => html({ iframeUrl: `"{{iframeUrl}}"`, mode: "ace/mode/html" })},
    { name: "JSX",             source: () =>  jsx({ iframeUrl: `{iframeUrl}`,     mode: "ace/mode/jsx" })},
    { name: "Pug/Jade",        source: () =>  pug({ iframeUrl: `iframeUrl` })},
];

export const getSignTokenOptions = (params) => [
    { name: "Node.js", source: () => node(params),    mode: "ace/mode/javascript" },
    { name: "Ruby",    source: () => ruby(params),    mode: "ace/mode/ruby" },
    { name: "Clojure", source: () => clojure(params), mode: "ace/mode/clojure" },
];

const html = ({ iframeUrl }) =>
`<iframe
    src=${iframeUrl}
    frameborder="0"
    allowtransparency
/>`

const jsx = ({ iframeUrl }) =>
`<iframe
    src=${iframeUrl}
    frameBorder={0}
    allowTransparency
/>`

const pug = ({ iframeUrl }) =>
`iframe(
    src=${iframeUrl}
    frameborder="0"
    allowtransparency
)`

const node = ({ siteUrl, secretKey, resourceType, resourceId, params, displayOptions }) =>
`var jwt = require("jsonwebtoken");

var METABASE_SITE_URL = ${JSON.stringify(siteUrl)};
var METABASE_SECRET_KEY = ${JSON.stringify(secretKey)};

var payload = {
  resource: { ${resourceType}: ${resourceId} },
  params: ${JSON.stringify(params, null, 2).split("\n").join("\n  ")}
};
var token = jwt.sign(payload, METABASE_SECRET_KEY);

var iframeUrl = METABASE_SITE_URL + "/embed/${resourceType}/" + token${optionsToHashParams(displayOptions) ? " + " + JSON.stringify(optionsToHashParams(displayOptions)) : "" };`;

const ruby = ({ siteUrl, secretKey, resourceType, resourceId, params, displayOptions }) =>
`require 'jwt'

METABASE_SITE_URL = ${JSON.stringify(siteUrl)}
METABASE_SECRET_KEY = ${JSON.stringify(secretKey)}

payload = {
  :resource => {:${resourceType} => ${resourceId}},
  :params => {
    ${Object.entries(params).map(([key,value]) => JSON.stringify(key) + " => " + JSON.stringify(value)).join(",\n    ")}
  }
}
token = JWT.encode payload, METABASE_SECRET_KEY

iframeUrl = METABASE_SITE_URL + "/embed/${resourceType}/" + token${optionsToHashParams(displayOptions) ? " + " + JSON.stringify(optionsToHashParams(displayOptions)) : "" }
`;

const clojure = ({ siteUrl, secretKey, resourceType, resourceId, params, displayOptions }) =>
`(require '[buddy.sign.jwt :as jwt])

(def metabase-site-url   ${JSON.stringify(siteUrl)})
(def metabase-secret-key ${JSON.stringify(secretKey)})

(def payload
  {:resource {:${resourceType} ${resourceId}}
   :params   {${Object.entries(params).map(([key,value]) => JSON.stringify(key) + " " + JSON.stringify(value)).join(",\n              ")}}})

(def token (jwt/sign payload metabase-secret-key))

(def iframe-url (str metabase-site-url "/embed/${resourceType}/" token${optionsToHashParams(displayOptions) ? (" " + JSON.stringify(optionsToHashParams(displayOptions))) : ""}))
`;
