import run from './main';
import { getInput } from './utils';

const { mainFile, infoJsonFile, readmeFile, releaseType, bumpType, customValue } = getInput();
run(mainFile, infoJsonFile, readmeFile, bumpType, releaseType, customValue);
