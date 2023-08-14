import { Action } from './Action';
import { ContextFactory } from './ContextFactory';
import { ExecSync } from './ExecSync';
import { InputFactory } from './InputFactory';
import { RepositoryFactory } from './RepositoryFactory';

new Action(new InputFactory(), new ContextFactory(new RepositoryFactory()), new ExecSync(__dirname)).run();
