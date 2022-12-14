import run from './main';
import { getInput } from './utils';

const { mainFile, releaseType: releaseTypeInput, type, value } = getInput();
run(mainFile, releaseTypeInput, type, value);
