"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryFactory = void 0;
const Repository_1 = require("./Repository");
class RepositoryFactory {
    constructor(cache) {
        this.cache = cache;
    }
    cafe(branch) {
        return new Repository_1.Repository({
            name: 'cafe',
            branch: branch,
            remote: 'git@github.com:eventespresso/cafe.git',
        }, this.cache);
    }
    barista(branch) {
        return new Repository_1.Repository({
            name: 'barista',
            branch: branch,
            remote: 'git@github.com:eventespresso/barista.git',
        }, this.cache);
    }
    e2e(branch) {
        return new Repository_1.Repository({
            name: 'e2e-tests',
            branch: branch,
            remote: 'git@github.com:eventespresso/barista.git',
        }, this.cache);
    }
}
exports.RepositoryFactory = RepositoryFactory;
