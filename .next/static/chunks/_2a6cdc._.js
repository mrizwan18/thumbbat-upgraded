(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/_2a6cdc._.js", {

"[project]/src/env.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "env": (()=>env)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/zod/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
;
const envSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].object({
    MONGODB_URI: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().url(),
    JWT_SECRET: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().min(1),
    EMAIL_USER: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().email(),
    EMAIL_PASS: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().min(1),
    NEXT_PUBLIC_API_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().url(),
    NEXT_PUBLIC_SOCKET_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().url()
});
const env = envSchema.parse({
    MONGODB_URI: ("TURBOPACK compile-time value", "mongodb+srv://thumbbatdev:thumbDevBat1@thumbbat.gnmkw.mongodb.net/?retryWrites=true&w=majority&appName=thumbBat"),
    JWT_SECRET: ("TURBOPACK compile-time value", "thumb_jwt_secret"),
    EMAIL_USER: ("TURBOPACK compile-time value", "ashkechum.official@gmail.com"),
    EMAIL_PASS: ("TURBOPACK compile-time value", "pmyssaiexdltcglf"),
    NEXT_PUBLIC_API_URL: ("TURBOPACK compile-time value", "http://localhost:5001"),
    NEXT_PUBLIC_SOCKET_URL: ("TURBOPACK compile-time value", "http://localhost:5001")
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/services/socketService.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "socketService": (()=>socketService)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/env.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
;
;
class SocketService {
    static instance;
    socket = null;
    gameState = {
        users: {}
    };
    constructor(){}
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    connect() {
        if (!this.socket) {
            this.socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_SOCKET_URL, {
                transports: [
                    "polling",
                    "websocket"
                ],
                withCredentials: true,
                forceNew: true,
                reconnectionAttempts: 5,
                timeout: 10000
            });
            console.log("Socket connecting to:", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_SOCKET_URL);
        }
        return this.socket;
    }
    // Game Actions
    findMatch(username) {
        this.socket?.emit("findMatch", {
            username
        });
    }
    sendMove(move) {
        this.socket?.emit("playerMove", {
            move
        });
    }
    gameOver(data) {
        this.socket?.emit("gameOver", data);
    }
    // Event Listeners
    onConnect(callback) {
        this.socket?.on("connect", callback);
    }
    onDisconnect(callback) {
        this.socket?.on("disconnect", callback);
    }
    onMatchFound(callback) {
        this.socket?.on("matchFound", callback);
    }
    onNoMatchFound(callback) {
        this.socket?.on("noMatchFound", callback);
    }
    onOpponentMove(callback) {
        this.socket?.on("opponentMove", callback);
    }
    onOpponentDisconnected(callback) {
        this.socket?.on("opponentDisconnected", callback);
    }
    // Cleanup
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }
    // Specific event cleanup
    cleanup() {
        if (this.socket) {
            this.socket.off("matchFound");
            this.socket.off("noMatchFound");
            this.socket.off("opponentMove");
            this.socket.off("opponentDisconnected");
        }
    }
}
const socketService = SocketService.getInstance();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/Scoreboard.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const Scoreboard = ({ userScore, opponentScore, opponentName })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-800 p-6 rounded-lg shadow-lg flex gap-10 text-xl font-semibold",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-blue-400",
                        children: "User:"
                    }, void 0, false, {
                        fileName: "[project]/components/Scoreboard.tsx",
                        lineNumber: 12,
                        columnNumber: 7
                    }, this),
                    " ",
                    userScore
                ]
            }, void 0, true, {
                fileName: "[project]/components/Scoreboard.tsx",
                lineNumber: 11,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-red-400",
                        children: [
                            opponentName,
                            ":"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Scoreboard.tsx",
                        lineNumber: 15,
                        columnNumber: 7
                    }, this),
                    " ",
                    opponentScore
                ]
            }, void 0, true, {
                fileName: "[project]/components/Scoreboard.tsx",
                lineNumber: 14,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Scoreboard.tsx",
        lineNumber: 10,
        columnNumber: 3
    }, this);
_c = Scoreboard;
const __TURBOPACK__default__export__ = Scoreboard;
var _c;
__turbopack_refresh__.register(_c, "Scoreboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/MoveSelection.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const MoveSelection = ({ playerMove, playMove, isDisabled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-6 flex gap-4",
        children: [
            1,
            2,
            3,
            4,
            5,
            6
        ].map((num)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `px-6 py-3 rounded-md text-lg ${playerMove === num ? "bg-yellow-500" : "bg-purple-500 hover:bg-purple-600"} text-white`,
                onClick: ()=>playMove(num),
                disabled: isDisabled,
                children: num
            }, num, false, {
                fileName: "[project]/components/MoveSelection.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/MoveSelection.tsx",
        lineNumber: 10,
        columnNumber: 3
    }, this);
_c = MoveSelection;
const __TURBOPACK__default__export__ = MoveSelection;
var _c;
__turbopack_refresh__.register(_c, "MoveSelection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/OpponentMoveDisplay.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const OpponentMoveDisplay = ({ opponent, opponentMove })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-xl mt-4",
        children: [
            opponent,
            " chose:",
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-red-400",
                children: opponentMove !== null ? opponentMove : "-"
            }, void 0, false, {
                fileName: "[project]/components/OpponentMoveDisplay.tsx",
                lineNumber: 10,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/OpponentMoveDisplay.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, this);
_c = OpponentMoveDisplay;
const __TURBOPACK__default__export__ = OpponentMoveDisplay;
var _c;
__turbopack_refresh__.register(_c, "OpponentMoveDisplay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/1u.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/1u.fae9579b.png");}}),
"[project]/public/images/1u.png.mjs { IMAGE => \"[project]/public/images/1u.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/1u.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP3x6ST749RN+sCYyPu7jOj81LaV/eDJb/3j0GP+59dVAPm5i9/6toTv+rN+//itev/6vI/j/ePPZf7r3Uf+7uI+AP3SsaD8zamw+76R3Pm0gfX928J+//79Bf///wD///8AZr9KCzMeUEYAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/2u.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/2u.b5cff7cf.png");}}),
"[project]/public/images/2u.png.mjs { IMAGE => \"[project]/public/images/2u.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/2u.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP3x6ij75NVQ+sGYzPu5iPL6wJbZ+82rsvzUtZ/83MR/APm5i+L6toXw+rN+//aqdv/5tofu+9e8jv3r3Ez+9/EgAPzQrrD8y6a++7yO5/mxfvr81rmV/enaU/zgynb84s5xfu9KxzpKHQoAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/3u.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/3u.ba039bf6.png");}}),
"[project]/public/images/3u.png.mjs { IMAGE => \"[project]/public/images/3u.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/3u.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP707h7859lE/Na5ivzNqav8y6W2/NCvpv3cw4D/+PMcAPzawXf6toTw+rN+/fmwev/6uYnr/NS1m/3exnf+8egyAP7u4Tv928F+/MyprPrAl9H8z66q/Na4lf3izWv//PkNZcFKMs0SwgsAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/4u.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/4u.675f1128.png");}}),
"[project]/public/images/4u.png.mjs { IMAGE => \"[project]/public/images/4u.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/4u.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP/+/gP97OE5/NvDdfzNq6n7yqW1/NS2m/7t4UP///8BAP/9/Af80rKZ+rqK5Pixffj6vpLb/dvBhP7v4zz///4BAP///gH/+PMZ/vHnMv3m1Fn81rmU/d/Jdv/38h7///8AT9lJc00vWDYAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/5u.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/5u.ed6af5e0.png");}}),
"[project]/public/images/5u.png.mjs { IMAGE => \"[project]/public/images/5u.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/5u.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP///wD//v4C/vbxHP3exnr+6dhW/vPrLP/+/gT///8AAP///wD+9e8g+sagt/q3hfD7x5/E/eHMcP/8+Q3///8AAP///wD/+/kN/unaS/3bwnz807Sf/urbUP/+/QX///8AM9pI+bfiNjIAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/6u.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/6u.88bb36f9.png");}}),
"[project]/public/images/6u.png.mjs { IMAGE => \"[project]/public/images/6u.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/6u.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6u$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAYklEQVR42kWKsQpAUBhGlcjgBTyP5/EONqM3YJNFXoCkyHizScpgthm4vvv/kjCc5ZyjMbP2sW+OWoTHkPbrnkCk0zq7EFl6FOGEoQyYYP6DOi30eYIuamQbVxhrn0kZd7sAJ8ZI4qXm0CIAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/1c.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/1c.f0d79fa7.png");}}),
"[project]/public/images/1c.png.mjs { IMAGE => \"[project]/public/images/1c.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/1c.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP7o11X949Bj/eDJb/zUtpT7u4zo+sCYyPvj1E398ekkAP7u4j7+691H/ePPZPq8j+L4rXr/+rN+//q2hO/5uYvfAP///wD///8A//79Bf3cw3z5tIH1+76R3PzNqbD90rGgXNhKCYAur3oAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/2c.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/2c.59784ae3.png");}}),
"[project]/public/images/2c.png.mjs { IMAGE => \"[project]/public/images/2c.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/2c.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP3izWr81biT/M+upPvCmMv7uorq+sSeu/zn2kH98+0gAP/48xv+691H/Ni+hfm4iOr3q3b/+rN9/vq3hev6wZfLAP7p2lD94s1o/uvcSf3Zvof5tYPw+8GV1PzQrab92LyLZf1KQwHPhrMAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/3c.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/3c.f740eaa9.png");}}),
"[project]/public/images/3c.png.mjs { IMAGE => \"[project]/public/images/3c.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/3c.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP/48xz93MOA/NCvpvzLpbb8zamr/Na5ivzn2UT+9O4eAP7x6DL93sZ3/NS1m/q5iev5sHr/+rN+/fq2hPD82sF3AP/8+Q394s1r/Na4lfzPrqr6wJfR/MyprP3bwX7+7uE7ZwVKMqfNxMwAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/4c.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/4c.f3233e90.png");}}),
"[project]/public/images/4c.png.mjs { IMAGE => \"[project]/public/images/4c.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/4c.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP///wH+7eFD/NS2m/vKpbX8zaup/NvDdf3s4Tn//v4DAP///gH+7+M8/dvBhPq+ktv4sX34+rqK5PzSspn//fwHAP///wD/9/Ie/d/JdvzWuZT95tRZ/vHnMv/48xn///4BUalJc7cs5aMAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/5c.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/5c.900c14be.png");}}),
"[project]/public/images/5c.png.mjs { IMAGE => \"[project]/public/images/5c.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/5c.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/AP///wD//v4E/vPrLP7p2Fb93sZ6/vbxHP/+/gL///8AAP///wD//PkN/eHMcPvHn8T6t4Xw+sagt/717yD///8AAP///wD//v0F/urbUPzTtJ/928J8/unaS//7+Q3///8ANLpI+fugKhEAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/6c.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/6c.0186134d.png");}}),
"[project]/public/images/6c.png.mjs { IMAGE => \"[project]/public/images/6c.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/6c.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6c$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 185,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAZElEQVR42k2KvQpAUBiGT4kMbsD1uB73YDO6AzZZ5AZIiownm6QMZpuB4/vxVzI89fY+j2Bm8QDKwlm6vK329128g8CAvvD3PBhBpgktk8NE2i9AHYbKU01UQhvW0GUx42He7gQoSkji3rHOkAAAAABJRU5ErkJggg==",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/getMoveImage.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "getOpponentMoveImage": (()=>getOpponentMoveImage),
    "getPlayerMoveImage": (()=>getPlayerMoveImage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$1u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/1u.png.mjs { IMAGE => "[project]/public/images/1u.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$2u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/2u.png.mjs { IMAGE => "[project]/public/images/2u.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$3u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/3u.png.mjs { IMAGE => "[project]/public/images/3u.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$4u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/4u.png.mjs { IMAGE => "[project]/public/images/4u.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$5u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/5u.png.mjs { IMAGE => "[project]/public/images/5u.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$6u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/6u.png.mjs { IMAGE => "[project]/public/images/6u.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$1c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/1c.png.mjs { IMAGE => "[project]/public/images/1c.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$2c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/2c.png.mjs { IMAGE => "[project]/public/images/2c.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$3c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/3c.png.mjs { IMAGE => "[project]/public/images/3c.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$4c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/4c.png.mjs { IMAGE => "[project]/public/images/4c.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$5c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/5c.png.mjs { IMAGE => "[project]/public/images/5c.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$6c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/6c.png.mjs { IMAGE => "[project]/public/images/6c.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
;
;
;
;
;
;
;
;
;
;
;
;
const getPlayerMoveImage = (move)=>{
    switch(move){
        case 1:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$1u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 2:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$2u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 3:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$3u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 4:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$4u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 5:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$5u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 6:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6u$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$6u$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        default:
            return "";
    }
};
const getOpponentMoveImage = (move)=>{
    switch(move){
        case 1:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$1c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$1c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 2:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$2c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$2c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 3:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$3c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$3c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 4:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$4c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$4c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 5:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$5c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$5c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        case 6:
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$6c$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$6c$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"];
        default:
            return "";
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/GameMoveImages.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$getMoveImage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/lib/getMoveImage.ts [app-client] (ecmascript)"); // Import helper methods
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/image.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
;
;
;
const GameMoveImages = ({ move, isPlayer, startImage })=>{
    _s();
    const [imageAnimating, setImageAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // Track animation state
    const [finalMoveImage, setFinalMoveImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameMoveImages.useEffect": ()=>{
            // Start bounce animation if move is selected
            if (move) {
                setImageAnimating(true);
                // After 2 bounces, switch to the actual move image
                setTimeout({
                    "GameMoveImages.useEffect": ()=>{
                        setImageAnimating(false);
                        setFinalMoveImage(isPlayer ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$getMoveImage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlayerMoveImage"])(move) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$getMoveImage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOpponentMoveImage"])(move)); // Update with the selected move image
                    }
                }["GameMoveImages.useEffect"], 1000); // 1000ms = duration of 2 bounces
            }
        }
    }["GameMoveImages.useEffect"], [
        move,
        isPlayer
    ]);
    const renderImage = ()=>{
        const imageSrc = move == null || imageAnimating ? startImage : finalMoveImage ?? startImage;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            src: imageSrc,
            alt: `Move ${move}`,
            width: 100,
            height: 100,
            className: `move-image ${imageAnimating ? "bounce" : ""} ${finalMoveImage ? "transform" : ""}`,
            style: {
                width: "auto",
                height: "auto"
            }
        }, void 0, false, {
            fileName: "[project]/components/GameMoveImages.tsx",
            lineNumber: 42,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center gap-6 mb-4",
        children: renderImage()
    }, void 0, false, {
        fileName: "[project]/components/GameMoveImages.tsx",
        lineNumber: 55,
        columnNumber: 10
    }, this);
};
_s(GameMoveImages, "3KqWgHLISNkJyhzTLSE0nQJh9vk=");
_c = GameMoveImages;
const __TURBOPACK__default__export__ = GameMoveImages;
var _c;
__turbopack_refresh__.register(_c, "GameMoveImages");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/start-r.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/start-r.8bffa09d.png");}}),
"[project]/public/images/start-r.png.mjs { IMAGE => \"[project]/public/images/start-r.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2d$r$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/start-r.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2d$r$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 119,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAsElEQVR42gGlAFr/AP/9/Af+7N5K/Madzfu6iuz60reH/vbxGf///wD///8AAPzQr6j7u4zm+rJ9//u0f//6s3/6+L+at/rbx2D63cxUAPvDmtH6tIL++K58//muef/7tYD/+rR///mxffz5sHz7AP7r3U37vZDh+a96//eqdP/7tYD/+7aB/fu3hPj7t4T3AP/9/Ab928KB+rWB+/q6i+f8y6a6/d7Ge/7n1lb+6NdSB3p8WA8Qgb0AAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 5
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/public/images/start.png [app-client] (static)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__("/_next/static/media/start.6df52fb4.png");}}),
"[project]/public/images/start.png.mjs { IMAGE => \"[project]/public/images/start.png [app-client] (static)\" } [app-client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2e$png__$5b$app$2d$client$5d$__$28$static$29$__ = __turbopack_import__("[project]/public/images/start.png [app-client] (static)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2e$png__$5b$app$2d$client$5d$__$28$static$29$__["default"],
    width: 119,
    height: 80,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAsElEQVR42gGlAFr/AP///wD///8A/vbyGPrSuIT7u4vs/MWcz/7r3E3//fwIAPrdy1T628hf+MCctfqzf/r7tH//+rJ9//u7jOf8z62rAPmwfPv5sX38+rN///u1gP/5rnn/9617//q0gv77wpfWAPu3hPf7t4T4+7aB/fu1gP/3qnX/+a96//u9j+P+6ttRAP7o11L+59ZW/d7Ge/zLp7n6uozm+rWB+/3awIj//fwH/QV8X8Wqw/8AAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 5
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/game/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/services/socketService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Scoreboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/Scoreboard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MoveSelection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/MoveSelection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OpponentMoveDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/OpponentMoveDisplay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameMoveImages$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/GameMoveImages.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2d$r$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$start$2d$r$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/start-r.png.mjs { IMAGE => "[project]/public/images/start-r.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$start$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_import__('[project]/public/images/start.png.mjs { IMAGE => "[project]/public/images/start.png [app-client] (static)" } [app-client] (structured image object, ecmascript)');
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
;
;
;
;
;
;
;
const Game = ()=>{
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searching, setSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchTime, setSearchTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [matchFound, setMatchFound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [opponent, setOpponent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gameStarted, setGameStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [score, setScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        user: 0,
        opponent: 0,
        firstInningScore: null
    });
    const [inning, setInning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isGameOver, setIsGameOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [winner, setWinner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [opponentMove, setOpponentMove] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [playerMove, setPlayerMove] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [secondInningStarted, setSecondInningStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPopup, setShowPopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // ✅ Game over popup
    const [showInningsOverlay, setShowInningsOverlay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // ✅ Innings transition popup
    const [showGameStartPopup, setShowGameStartPopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // ✅ New: Game start popup
    const [playerMovesHistory, setPlayerMovesHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [botMovesHistory, setBotMovesHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [gameResults, setGameResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const updateGameResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Game.useCallback[updateGameResults]": (result)=>{
            setGameResults({
                "Game.useCallback[updateGameResults]": (prevResults)=>[
                        ...prevResults,
                        result
                    ]
            }["Game.useCallback[updateGameResults]"]);
        }
    }["Game.useCallback[updateGameResults]"], []);
    const restartGame = ()=>{
        setMode(null);
        setSearching(false);
        setSearchTime(0);
        setMatchFound(false);
        setGameStarted(false);
        setScore({
            user: 0,
            opponent: 0,
            firstInningScore: null
        });
        setInning(null);
        setIsGameOver(false);
        setWinner(null);
        setPlayerMove(null);
        setOpponentMove(null);
        setSecondInningStarted(false);
        setShowPopup(false);
        setShowInningsOverlay(false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Game.useEffect": ()=>{
            if (!localStorage.getItem("token")) {
                router.push("/login");
            }
            // Connect socket service
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].connect();
            // Set up event listeners using socketService methods
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].onMatchFound({
                "Game.useEffect": (data)=>{
                    setOpponent(data.opponent);
                    setMatchFound(true);
                    setSearching(false);
                    setGameStarted(true);
                    setMode("player");
                    setInning(data.role);
                    setShowGameStartPopup(true);
                    setTimeout({
                        "Game.useEffect": ()=>{
                            setShowGameStartPopup(false);
                        }
                    }["Game.useEffect"], 3000);
                }
            }["Game.useEffect"]);
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].onNoMatchFound({
                "Game.useEffect": ()=>{
                    alert("❌ No player found, try again!");
                    setMode(null);
                    setSearching(false);
                }
            }["Game.useEffect"]);
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].onOpponentMove({
                "Game.useEffect": (move)=>{
                    setOpponentMove(move);
                    if (playerMove !== null) {
                        handleGameLogic(playerMove, move);
                    }
                }
            }["Game.useEffect"]);
            // Cleanup
            return ({
                "Game.useEffect": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].cleanup();
                }
            })["Game.useEffect"];
        }
    }["Game.useEffect"], [
        router,
        playerMove
    ]);
    const startSearch = ()=>{
        setSearching(true);
        setSearchTime(0);
        setMatchFound(false);
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].findMatch(localStorage.getItem("username") || "");
        const interval = setInterval(()=>{
            setSearchTime((prev)=>prev + 1);
        }, 1000);
        setTimeout(()=>{
            setSearching(false);
            clearInterval(interval);
        }, 20000);
    };
    // Example of a more sophisticated transition matrix considering move, inning, and score difference
    const transitionMatrix = {
        batting: {
            scoreDifferencePositive: {
                1: [
                    0.1,
                    0.3,
                    0.2,
                    0.1,
                    0.2,
                    0.1
                ],
                2: [
                    0.2,
                    0.1,
                    0.3,
                    0.1,
                    0.2,
                    0.2
                ],
                3: [
                    0.3,
                    0.1,
                    0.2,
                    0.1,
                    0.2,
                    0.1
                ],
                4: [
                    0.2,
                    0.2,
                    0.1,
                    0.3,
                    0.1,
                    0.1
                ],
                5: [
                    0.2,
                    0.1,
                    0.3,
                    0.1,
                    0.2,
                    0.1
                ],
                6: [
                    0.1,
                    0.3,
                    0.2,
                    0.1,
                    0.2,
                    0.1
                ]
            },
            scoreDifferenceNegative: {
                1: [
                    0.2,
                    0.1,
                    0.3,
                    0.2,
                    0.1,
                    0.1
                ],
                2: [
                    0.2,
                    0.3,
                    0.1,
                    0.1,
                    0.2,
                    0.2
                ],
                3: [
                    0.1,
                    0.2,
                    0.3,
                    0.1,
                    0.2,
                    0.2
                ],
                4: [
                    0.3,
                    0.2,
                    0.1,
                    0.2,
                    0.1,
                    0.1
                ],
                5: [
                    0.1,
                    0.3,
                    0.2,
                    0.2,
                    0.1,
                    0.2
                ],
                6: [
                    0.2,
                    0.1,
                    0.3,
                    0.2,
                    0.1,
                    0.1
                ]
            }
        },
        bowling: {
            scoreDifferencePositive: {
                1: [
                    0.2,
                    0.2,
                    0.2,
                    0.1,
                    0.1,
                    0.2
                ],
                2: [
                    0.2,
                    0.1,
                    0.3,
                    0.1,
                    0.2,
                    0.1
                ],
                3: [
                    0.2,
                    0.3,
                    0.1,
                    0.2,
                    0.1,
                    0.2
                ],
                4: [
                    0.1,
                    0.2,
                    0.3,
                    0.1,
                    0.1,
                    0.2
                ],
                5: [
                    0.3,
                    0.2,
                    0.1,
                    0.1,
                    0.2,
                    0.1
                ],
                6: [
                    0.1,
                    0.3,
                    0.2,
                    0.1,
                    0.1,
                    0.2
                ]
            },
            scoreDifferenceNegative: {
                1: [
                    0.3,
                    0.1,
                    0.2,
                    0.2,
                    0.1,
                    0.1
                ],
                2: [
                    0.2,
                    0.3,
                    0.1,
                    0.1,
                    0.2,
                    0.1
                ],
                3: [
                    0.2,
                    0.1,
                    0.3,
                    0.2,
                    0.1,
                    0.1
                ],
                4: [
                    0.1,
                    0.2,
                    0.2,
                    0.3,
                    0.1,
                    0.1
                ],
                5: [
                    0.2,
                    0.1,
                    0.3,
                    0.1,
                    0.2,
                    0.1
                ],
                6: [
                    0.1,
                    0.2,
                    0.1,
                    0.3,
                    0.2,
                    0.1
                ]
            }
        }
    };
    const getBotMove = (playerMove, inning, scoreDifference)=>{
        const scoreDifferenceKey = scoreDifference > 0 ? "scoreDifferencePositive" : "scoreDifferenceNegative";
        const transition = transitionMatrix[inning][scoreDifferenceKey];
        const probabilities = transition[playerMove];
        const randomValue = Math.random();
        let cumulativeProbability = 0;
        for(let i = 0; i < probabilities.length; i++){
            cumulativeProbability += probabilities[i];
            if (randomValue < cumulativeProbability) {
                return i + 1;
            }
        }
        return 1;
    };
    const startBotGame = ()=>{
        restartGame();
        setMode("bot");
        setGameStarted(true);
        setOpponent("Rizzwon (Bot)");
        const initialInning = Math.random() < 0.5 ? "batting" : "bowling";
        setInning(initialInning);
        setShowGameStartPopup(true); // ✅ Show game start popup
        setTimeout(()=>{
            setShowGameStartPopup(false);
        }, 3000);
    };
    const playMove = (move)=>{
        if (isGameOver) return;
        setPlayerMove(move);
        setPlayerMovesHistory((prevHistory)=>[
                ...prevHistory,
                move
            ]);
        if (mode === "bot") {
            const scoreDifference = score.user - score.opponent;
            if (inning === "batting" || inning === "bowling") {
                const botMove = getBotMove(move, inning, scoreDifference);
                setOpponentMove(botMove);
                setBotMovesHistory((prevHistory)=>[
                        ...prevHistory,
                        botMove
                    ]);
                handleGameLogic(move, botMove);
            }
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].sendMove(move);
        }
    };
    const declareWinner = (userScore, opponentScore)=>{
        setIsGameOver(true);
        setShowPopup(true);
        let result = "draw";
        let winnerMessage = "🟡 It's a Draw!";
        if (userScore === opponentScore) {
            setWinner(winnerMessage);
        } else {
            winnerMessage = userScore > opponentScore ? localStorage.getItem("username") || "Player" : opponent || "Opponent";
            setWinner(winnerMessage + " Wins");
            result = userScore > opponentScore ? "win" : "lose";
        }
        updateGameResults(result);
        updateTransitionMatrix();
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$socketService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].gameOver({
            username: localStorage.getItem("username") || "",
            userScore: userScore,
            opponentScore: opponentScore
        });
    };
    const handleGameLogic = (userMove, opponentMove)=>{
        if (!userMove || !opponentMove || isGameOver) return;
        if (inning === "batting") {
            // ✅ If moves are different, update batting player's score
            if (userMove !== opponentMove) {
                setScore((prev)=>{
                    const newScore = prev.user + userMove;
                    // ✅ If second innings & score surpasses first innings, end game
                    if (secondInningStarted && prev.firstInningScore !== null && newScore > prev.firstInningScore) {
                        declareWinner(newScore, score.opponent);
                    }
                    return {
                        ...prev,
                        user: newScore
                    };
                });
            } else {
                // ✅ If moves are the same, end the innings
                setOpponentMove(null);
                setPlayerMove(null);
                if (!secondInningStarted) {
                    // ✅ First innings over, store the score and switch innings
                    setScore((prev)=>({
                            ...prev,
                            firstInningScore: prev.user
                        }));
                    setShowInningsOverlay(true);
                    setTimeout(()=>{
                        setInning("bowling"); // Switch innings
                        setSecondInningStarted(true);
                        setShowInningsOverlay(false);
                    }, 3000);
                } else {
                    // ✅ Second innings over, check scores and declare winner
                    setScore((prev)=>({
                            ...prev,
                            firstInningScore: prev.user
                        }));
                    declareWinner(score.user, score.opponent);
                }
            }
        } else {
            // ✅ If moves are different, update opponent's score
            if (userMove !== opponentMove) {
                setScore((prev)=>{
                    const newOpponentScore = prev.opponent + opponentMove;
                    // ✅ If second innings & score surpasses first innings, end game
                    if (secondInningStarted && prev.firstInningScore !== null && newOpponentScore > prev.firstInningScore) {
                        declareWinner(score.user, newOpponentScore);
                    }
                    return {
                        ...prev,
                        opponent: newOpponentScore
                    };
                });
            } else {
                // ✅ If moves are same, end the innings
                setOpponentMove(null);
                setPlayerMove(null);
                if (!secondInningStarted) {
                    // ✅ If first innings ends when the user was bowling, start second innings correctly
                    setScore((prev)=>({
                            ...prev,
                            firstInningScore: prev.opponent
                        }));
                    setShowInningsOverlay(true);
                    setTimeout(()=>{
                        setInning("batting"); // Switch innings
                        setSecondInningStarted(true);
                        setShowInningsOverlay(false);
                    }, 3000);
                } else {
                    // ✅ Second innings over, check scores and declare winner
                    setScore((prev)=>({
                            ...prev,
                            firstInningScore: prev.user
                        }));
                    declareWinner(score.user, score.opponent);
                }
            }
        }
    };
    const updateTransitionMatrix = ()=>{
        for(let i = 0; i < playerMovesHistory.length; i++){
            const playerMove = playerMovesHistory[i];
            const botMove = botMovesHistory[i];
            if (inning === "batting" && botMove !== playerMove) {
                transitionMatrix[inning]["scoreDifferencePositive"][playerMove][botMove - 1] += 0.1;
            } else if (inning === "bowling" && playerMove !== botMove) {
                transitionMatrix[inning]["scoreDifferenceNegative"][playerMove][botMove - 1] += 0.1;
            }
        }
        normalizeTransitionMatrix();
    };
    const normalizeTransitionMatrix = ()=>{
        Object.keys(transitionMatrix).forEach((inning)=>{
            Object.keys(transitionMatrix[inning]).forEach((scoreDiff)=>{
                Object.keys(transitionMatrix[inning][scoreDiff]).map(Number).forEach((move)=>{
                    const total = transitionMatrix[inning][scoreDiff][move].reduce((acc, val)=>acc + val, 0);
                    transitionMatrix[inning][scoreDiff][move] = transitionMatrix[inning][scoreDiff][move].map((val)=>val / total);
                });
            });
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-900 text-white min-h-screen",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-[80vh]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-4xl font-bold mb-6",
                    children: "🎮 Play the Game"
                }, void 0, false, {
                    fileName: "[project]/src/app/game/page.tsx",
                    lineNumber: 380,
                    columnNumber: 9
                }, this),
                !mode && !gameStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-6 relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "bg-blue-500 px-6 py-3 rounded text-white text-lg font-semibold",
                            onClick: startBotGame,
                            children: "Play Against Rizzwon, the Bot 🤖"
                        }, void 0, false, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 384,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "bg-green-500 px-6 py-3 rounded text-white text-lg font-semibold opacity-50 cursor-not-allowed",
                                    disabled: true,
                                    children: "Play Against Player 🏏"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/game/page.tsx",
                                    lineNumber: 391,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full transform translate-x-2 -translate-y-2",
                                    children: "Coming Soon"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/game/page.tsx",
                                    lineNumber: 397,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 390,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/game/page.tsx",
                    lineNumber: 383,
                    columnNumber: 11
                }, this),
                searching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-lg mt-4",
                    children: [
                        "Searching for a player...",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-yellow-400",
                            children: [
                                searchTime,
                                "s"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 407,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/game/page.tsx",
                    lineNumber: 405,
                    columnNumber: 11
                }, this),
                gameStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl mb-2",
                            children: [
                                localStorage.getItem("username"),
                                ", you are",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-yellow-400",
                                    children: inning
                                }, void 0, false, {
                                    fileName: "[project]/src/app/game/page.tsx",
                                    lineNumber: 415,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 413,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Scoreboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            userScore: score.user,
                            opponentScore: score.opponent,
                            opponentName: opponent || "Opponent"
                        }, void 0, false, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 418,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center gap-6 mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameMoveImages$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    move: playerMove === null ? 0 : playerMove,
                                    isPlayer: true,
                                    startImage: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$start$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"].src
                                }, void 0, false, {
                                    fileName: "[project]/src/app/game/page.tsx",
                                    lineNumber: 424,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameMoveImages$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    move: opponentMove === null ? 0 : opponentMove,
                                    isPlayer: false,
                                    startImage: __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$images$2f$start$2d$r$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$public$2f$images$2f$start$2d$r$2e$png__$5b$app$2d$client$5d$__$28$static$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"].src
                                }, void 0, false, {
                                    fileName: "[project]/src/app/game/page.tsx",
                                    lineNumber: 429,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 423,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MoveSelection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            playerMove: playerMove === null ? 0 : playerMove,
                            playMove: playMove,
                            isDisabled: isGameOver
                        }, void 0, false, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 435,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OpponentMoveDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            opponent: opponent || "Opponent",
                            opponentMove: opponentMove === null ? 0 : opponentMove
                        }, void 0, false, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 440,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true),
                showGameStartPopup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-2xl font-bold text-yellow-400",
                            children: [
                                "🏏 Cricket Gods Have Chosen You for",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-green-400",
                                    children: inning
                                }, void 0, false, {
                                    fileName: "[project]/src/app/game/page.tsx",
                                    lineNumber: 453,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/game/page.tsx",
                            lineNumber: 451,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/game/page.tsx",
                        lineNumber: 450,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/game/page.tsx",
                    lineNumber: 449,
                    columnNumber: 11
                }, this),
                showInningsOverlay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-2xl font-bold text-yellow-400",
                                children: "🏏 Innings Over!"
                            }, void 0, false, {
                                fileName: "[project]/src/app/game/page.tsx",
                                lineNumber: 462,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg mt-2",
                                children: [
                                    "First innings score: ",
                                    score.firstInningScore
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/game/page.tsx",
                                lineNumber: 465,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg",
                                children: [
                                    "Now ",
                                    opponent,
                                    "'s time for ",
                                    inning,
                                    ". Target:",
                                    " ",
                                    score.firstInningScore ? score.firstInningScore + 1 : 0
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/game/page.tsx",
                                lineNumber: 468,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/game/page.tsx",
                        lineNumber: 461,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/game/page.tsx",
                    lineNumber: 460,
                    columnNumber: 11
                }, this),
                showPopup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-3xl font-bold text-yellow-400",
                                children: [
                                    winner,
                                    "🏆"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/game/page.tsx",
                                lineNumber: 480,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg mt-2",
                                children: [
                                    "Final Score: ",
                                    score.user,
                                    " - ",
                                    score.opponent
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/game/page.tsx",
                                lineNumber: 481,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex justify-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white font-semibold",
                                        onClick: ()=>router.push("/"),
                                        children: "Exit"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/game/page.tsx",
                                        lineNumber: 487,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold",
                                        onClick: startBotGame,
                                        children: "Restart"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/game/page.tsx",
                                        lineNumber: 493,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/game/page.tsx",
                                lineNumber: 486,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/game/page.tsx",
                        lineNumber: 479,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/game/page.tsx",
                    lineNumber: 478,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/game/page.tsx",
            lineNumber: 379,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/game/page.tsx",
        lineNumber: 378,
        columnNumber: 5
    }, this);
};
_s(Game, "ECS4qMC7mq5i2+Dn5/AaQ+khTAs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Game;
const __TURBOPACK__default__export__ = Game;
var _c;
__turbopack_refresh__.register(_c, "Game");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/game/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=_2a6cdc._.js.map