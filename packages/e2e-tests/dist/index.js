require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 397:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(147)
const path = __nccwpck_require__(17)
const os = __nccwpck_require__(37)
const crypto = __nccwpck_require__(113)
const packageJson = __nccwpck_require__(661)

const version = packageJson.version

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

// Parse src into an Object
function parse (src) {
  const obj = {}

  // Convert buffer to string
  let lines = src.toString()

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/mg, '\n')

  let match
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]

    // Default undefined or null to empty string
    let value = (match[2] || '')

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }

    // Add to object
    obj[key] = value
  }

  return obj
}

function _parseVault (options) {
  const vaultPath = _vaultPath(options)

  // Parse .env.vault
  const result = DotenvModule.configDotenv({ path: vaultPath })
  if (!result.parsed) {
    throw new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`)
  }

  // handle scenario for comma separated keys - for use with key rotation
  // example: DOTENV_KEY="dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenv.org/vault/.env.vault?environment=prod"
  const keys = _dotenvKey(options).split(',')
  const length = keys.length

  let decrypted
  for (let i = 0; i < length; i++) {
    try {
      // Get full key
      const key = keys[i].trim()

      // Get instructions for decrypt
      const attrs = _instructions(result, key)

      // Decrypt
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key)

      break
    } catch (error) {
      // last key
      if (i + 1 >= length) {
        throw error
      }
      // try next key
    }
  }

  // Parse decrypted .env string
  return DotenvModule.parse(decrypted)
}

function _log (message) {
  console.log(`[dotenv@${version}][INFO] ${message}`)
}

function _warn (message) {
  console.log(`[dotenv@${version}][WARN] ${message}`)
}

function _debug (message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`)
}

function _dotenvKey (options) {
  // prioritize developer directly setting options.DOTENV_KEY
  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
    return options.DOTENV_KEY
  }

  // secondary infra already contains a DOTENV_KEY environment variable
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY
  }

  // fallback to empty string
  return ''
}

function _instructions (result, dotenvKey) {
  // Parse DOTENV_KEY. Format is a URI
  let uri
  try {
    uri = new URL(dotenvKey)
  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      throw new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=development')
    }

    throw error
  }

  // Get decrypt key
  const key = uri.password
  if (!key) {
    throw new Error('INVALID_DOTENV_KEY: Missing key part')
  }

  // Get environment
  const environment = uri.searchParams.get('environment')
  if (!environment) {
    throw new Error('INVALID_DOTENV_KEY: Missing environment part')
  }

  // Get ciphertext payload
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`
  const ciphertext = result.parsed[environmentKey] // DOTENV_VAULT_PRODUCTION
  if (!ciphertext) {
    throw new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`)
  }

  return { ciphertext, key }
}

function _vaultPath (options) {
  let dotenvPath = path.resolve(process.cwd(), '.env')

  if (options && options.path && options.path.length > 0) {
    dotenvPath = options.path
  }

  // Locate .env.vault
  return dotenvPath.endsWith('.vault') ? dotenvPath : `${dotenvPath}.vault`
}

function _resolveHome (envPath) {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

function _configVault (options) {
  _log('Loading env from encrypted .env.vault')

  const parsed = DotenvModule._parseVault(options)

  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  DotenvModule.populate(processEnv, parsed, options)

  return { parsed }
}

function configDotenv (options) {
  let dotenvPath = path.resolve(process.cwd(), '.env')
  let encoding = 'utf8'
  const debug = Boolean(options && options.debug)

  if (options) {
    if (options.path != null) {
      dotenvPath = _resolveHome(options.path)
    }
    if (options.encoding != null) {
      encoding = options.encoding
    }
  }

  try {
    // Specifying an encoding returns a string instead of a buffer
    const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }))

    let processEnv = process.env
    if (options && options.processEnv != null) {
      processEnv = options.processEnv
    }

    DotenvModule.populate(processEnv, parsed, options)

    return { parsed }
  } catch (e) {
    if (debug) {
      _debug(`Failed to load ${dotenvPath} ${e.message}`)
    }

    return { error: e }
  }
}

// Populates process.env from .env file
function config (options) {
  const vaultPath = _vaultPath(options)

  // fallback to original dotenv if DOTENV_KEY is not set
  if (_dotenvKey(options).length === 0) {
    return DotenvModule.configDotenv(options)
  }

  // dotenvKey exists but .env.vault file does not exist
  if (!fs.existsSync(vaultPath)) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`)

    return DotenvModule.configDotenv(options)
  }

  return DotenvModule._configVault(options)
}

function decrypt (encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), 'hex')
  let ciphertext = Buffer.from(encrypted, 'base64')

  const nonce = ciphertext.slice(0, 12)
  const authTag = ciphertext.slice(-16)
  ciphertext = ciphertext.slice(12, -16)

  try {
    const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce)
    aesgcm.setAuthTag(authTag)
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`
  } catch (error) {
    const isRange = error instanceof RangeError
    const invalidKeyLength = error.message === 'Invalid key length'
    const decryptionFailed = error.message === 'Unsupported state or unable to authenticate data'

    if (isRange || invalidKeyLength) {
      const msg = 'INVALID_DOTENV_KEY: It must be 64 characters long (or more)'
      throw new Error(msg)
    } else if (decryptionFailed) {
      const msg = 'DECRYPTION_FAILED: Please check your DOTENV_KEY'
      throw new Error(msg)
    } else {
      console.error('Error: ', error.code)
      console.error('Error: ', error.message)
      throw error
    }
  }
}

// Populate process.env with parsed values
function populate (processEnv, parsed, options = {}) {
  const debug = Boolean(options && options.debug)
  const override = Boolean(options && options.override)

  if (typeof parsed !== 'object') {
    throw new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate')
  }

  // Set process.env
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key]
      }

      if (debug) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`)
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`)
        }
      }
    } else {
      processEnv[key] = parsed[key]
    }
  }
}

const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
}

module.exports.configDotenv = DotenvModule.configDotenv
module.exports._configVault = DotenvModule._configVault
module.exports._parseVault = DotenvModule._parseVault
module.exports.config = DotenvModule.config
module.exports.decrypt = DotenvModule.decrypt
module.exports.parse = DotenvModule.parse
module.exports.populate = DotenvModule.populate

module.exports = DotenvModule


/***/ }),

/***/ 286:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Repository = void 0;
const os = __importStar(__nccwpck_require__(37));
const fs = __importStar(__nccwpck_require__(147));
const Path = __importStar(__nccwpck_require__(17));
const ChildProcess = __importStar(__nccwpck_require__(81));
class Repository {
    constructor(params) {
        this.name = this.sanitizeName(params.name);
        this.cwd = this.determineCwd(params.localOrRemote);
    }
    exec(command) {
        ChildProcess.spawnSync(command, {
            shell: true,
            stdio: 'inherit',
            cwd: this.cwd,
        });
    }
    getCwd() {
        // conceal cwd behind method to enforce validation
        return this.cwd;
    }
    determineCwd(localOrRemote) {
        const type = this.getType(localOrRemote);
        if (type === 'local')
            return this.checkPath(localOrRemote);
        if (type === 'remote')
            return this.clone(localOrRemote);
        throw new Error(`Unknown git repository format: \n${localOrRemote}`);
    }
    checkPath(path) {
        if (!fs.existsSync(path)) {
            throw new Error(`Path does not exist: \n${path}`);
        }
        return path;
    }
    getType(localOrRemote) {
        if (localOrRemote.startsWith('https://'))
            return 'remote';
        if (localOrRemote.endsWith('.git'))
            return 'remote';
        if (localOrRemote.startsWith('.'))
            return 'local';
        if (localOrRemote.startsWith('/'))
            return 'local';
        throw new Error(`Unsupported git path: \n${localOrRemote}`);
    }
    sanitizeName(name) {
        return name
            .toLowerCase() // all lower case, easy to work with cli
            .replaceAll(' ', '-') // no spaces
            .replaceAll(/[^a-z0-9]/, ''); // only letters and digits
    }
    /**
     * @return local path to repository
     */
    clone(remote) {
        const path = this.getPath(this.name);
        const cmd = `git clone ${remote} ${path}`;
        ChildProcess.execSync(cmd);
        return path;
    }
    getPath(subpath) {
        return Path.resolve(os.tmpdir(), subpath !== null && subpath !== void 0 ? subpath : '');
    }
}
exports.Repository = Repository;


/***/ }),

/***/ 433:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const main_1 = __importDefault(__nccwpck_require__(168));
(0, main_1.default)();


/***/ }),

/***/ 168:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const dotenv_1 = __importDefault(__nccwpck_require__(397));
const process = __importStar(__nccwpck_require__(282));
const Repository_1 = __nccwpck_require__(286);
const ChildProcess = __importStar(__nccwpck_require__(81));
const e2eTests = () => {
    dotenv_1.default.config({
        path: '../.dotenv',
    });
    // ### prepare cafe repo
    const cafeEnv = process.env['CAFE'];
    if (!cafeEnv) {
        throw new Error('Missing environment variable: CAFE');
    }
    const cafeRepo = new Repository_1.Repository({ name: 'cafe', localOrRemote: cafeEnv });
    // TODO: cache for composer deps here
    cafeRepo.exec('composer install');
    // ### prepare barista repo (optional)
    const baristaEnv = process.env['BARISTA'];
    if (!baristaEnv) {
        throw new Error('Missing environment variable: BARISTA');
    }
    const baristaRepo = new Repository_1.Repository({ name: 'barista', localOrRemote: baristaEnv });
    // TODO:: barista can be optional as cafe contains all assets
    // TODO: cache for yarn deps here
    baristaRepo.exec('npm ci');
    baristaRepo.exec('yarn build');
    // ### prepare e2e tests repo
    const e2eTestsEnv = process.env['E2E_TESTS'];
    if (!e2eTestsEnv) {
        throw new Error('Missing environment variable: E2E_TESTS');
    }
    const e2eTestsRepo = new Repository_1.Repository({ name: 'e2e-tests', localOrRemote: e2eTestsEnv });
    e2eTestsRepo.exec('npm ci');
    // ### prepare environment
    ChildProcess.execSync('sudo apt-get install --yes mkcert');
    ChildProcess.execSync('curl -fsSL https://ddev.com/install.sh | bash');
    ChildProcess.execSync('npx playwright install --with-deps');
    // ### run actual tests
    e2eTestsRepo.exec('yarn test');
};
exports["default"] = e2eTests;


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 37:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 282:
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ 661:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"dotenv","version":"16.3.1","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","lint-readme":"standard-markdown","pretest":"npm run lint && npm run dts-check","test":"tap tests/*.js --100 -Rspec","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"funding":"https://github.com/motdotla/dotenv?sponsor=1","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@definitelytyped/dtslint":"^0.0.133","@types/node":"^18.11.3","decache":"^4.6.1","sinon":"^14.0.1","standard":"^17.0.0","standard-markdown":"^7.1.0","standard-version":"^9.5.0","tap":"^16.3.0","tar":"^6.1.11","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(433);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map