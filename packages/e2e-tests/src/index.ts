import { Action } from './Action';
import { ContextFactory } from './ContextFactory';
import { SpawnSync } from './SpawnSync';
import { InputFactory } from './InputFactory';
import { RepositoryFactory } from './RepositoryFactory';

new Action(new InputFactory(), new ContextFactory(new RepositoryFactory()), new SpawnSync(__dirname)).run();
