#!/bin/sh -l

EE_VERSION=${1-master}

if [ -z "$event_espresso_core_dir" ]; then
    event_espresso_core_dir="/tmp/event-espresso-core"
fi

# commands taking care of ee core setup
# receives an argument indicating what branch to checkout.
function eeCoreSetup {
    local BRANCH=$1
    git clone https://github.com/eventespresso/event-espresso-core.git $event_espresso_core_dir
    cd $event_espresso_core_dir/tests
    if [ "$BRANCH" = "master" ]; then
        git checkout master
    else
        git fetch --tags
        git checkout tags/$BRANCH -b $BRANCH
    fi
    #back to previous directory
    cd -
    echo "Building against EE core" $BRANCH
}


eeCoreSetup $EE_VERSION
