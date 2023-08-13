import { Action } from './Action';
import { Cache } from './Cache';
import { InputFactory } from './InputFactory';
import { RepositoryFactory } from './RepositoryFactory';

new Action(new InputFactory(), new RepositoryFactory(new Cache())).run();
