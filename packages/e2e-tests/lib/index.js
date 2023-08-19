"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Action_1 = require("./Action");
const ContextFactory_1 = require("./ContextFactory");
const SpawnSync_1 = require("./SpawnSync");
const InputFactory_1 = require("./InputFactory");
const RepositoryFactory_1 = require("./RepositoryFactory");
new Action_1.Action(new InputFactory_1.InputFactory(), new ContextFactory_1.ContextFactory(new RepositoryFactory_1.RepositoryFactory()), new SpawnSync_1.SpawnSync(__dirname)).run();
