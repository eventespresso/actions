"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryFactory = void 0;
const Repository_1 = require("./Repository");
class RepositoryFactory {
    cafe(branch) {
        return new Repository_1.Repository({
            name: 'cafe',
            branch: branch,
            remote: 'git@github.com:eventespresso/cafe.git',
        });
    }
    barista(branch) {
        return new Repository_1.Repository({
            name: 'barista',
            branch: branch,
            remote: 'git@github.com:eventespresso/barista.git',
        });
    }
    e2e(branch) {
        return new Repository_1.Repository({
            name: 'e2e-tests',
            branch: branch,
            remote: 'git@github.com:eventespresso/barista.git',
        });
    }
}
exports.RepositoryFactory = RepositoryFactory;
