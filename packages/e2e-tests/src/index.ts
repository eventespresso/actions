import { Action } from './Action';
import { InputFactory } from './InputFactory';
import { RepositoryFactory } from './RepositoryFactory';

new Action(new InputFactory(), new RepositoryFactory()).run();
