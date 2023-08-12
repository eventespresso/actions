"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Action_1 = require("./Action");
const InputFactory_1 = require("./InputFactory");
const RepositoryFactory_1 = require("./RepositoryFactory");
new Action_1.Action(new InputFactory_1.InputFactory(), new RepositoryFactory_1.RepositoryFactory()).run();
