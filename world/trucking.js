var utils = require('utils');

module.exports = {
    initTruckingMemory: initTruckingMemory,
    createTargetStation: createTargetStation,
    createFlagStation: createFlagStation,
    getStations: getStations,
    getStation: getStation,
    createRoute: createRoute,
    renameRoute: renameRoute,
    addRouteStop: addRouteStop,
    clearRouteStops: clearRouteStops,
    findStopTarget: findStopTarget,
    getRoutes: getRoutes,
    getRoute: getRoute,
    findRouteTruckers: findRouteTruckers,
    spawnTruckers: spawnTruckers,
    runTrucker: runTrucker,
};

function initTruckingMemory() {
    if (!Memory.global.trucking) {
        console.log('initializing global.trucking memory');
        Memory.global.trucking = {
            stations: {},
            routes: {},
        };
    }
}

function createTargetStation(stationName, target) {
    if (Memory.global.trucking.stations[stationName]) {
        return ERR_NAME_EXISTS;
    } else if (!target) {
        return ERR_INVALID_TARGET;
    }
    Memory.global.trucking.stations[stationName] = {
        name: stationName,
        type: 'target',
        target: target.id,
    };
    return stationName;
}
function createFlagStation(stationName, structureTypes, range, flagName) {
    if (flagName == undefined) {
        flagName = stationName;
    }
    if (Memory.global.trucking.stations[stationName]) {
        return ERR_NAME_EXISTS;
    } else if (!Game.flags[flagName]) {
        return ERR_INVALID_TARGET;
    }
    Memory.global.trucking.stations[stationName] = {
        name: stationName,
        type: 'flag',
        flagName: flagName,
        range: range,
        structureTypes: structureTypes
    };
    return stationName;
}
function getStations() {
    return Memory.global.trucking.stations;
}
function getStation(stationName) {
    return getStations()[stationName];
}

function createRoute(routeName, truckersCount, truckersBody, spawnName) {
    if (Memory.global.trucking.routes[routeName]) {
        return ERR_NAME_EXISTS;
    } else if (!Game.spawns[spawnName]) {
        return ERR_INVALID_TARGET;
    }
    Memory.global.trucking.routes[routeName] = {
        name: routeName,
        truckersCount: truckersCount,
        truckersBody: truckersBody,
        spawnName: spawnName,
        active: true,
        report: false,
        stops: []
    };
    return routeName;
}
function renameRoute(oldRouteName, newRouteName) {
    var route = getRoute(oldRouteName);
    if (!route) {
        return ERR_INVALID_TARGET;
    } else if (getRoute(newRouteName)) {
        return ERR_NAME_EXISTS;
    }
    
    var truckers = findRouteTruckers(oldRouteName);
    for (var truckerIndex in truckers) {
        var trucker = truckers[truckerIndex];
        trucker.memory.route = newRouteName;
    }
    
    route.name = newRouteName;
    Memory.global.trucking.routes[newRouteName] = route;
    delete Memory.global.trucking.routes[oldRouteName];
    
    return newRouteName;
}
function getRoutes() {
    return Memory.global.trucking.routes;
}
function getRoute(routeName) {
    return getRoutes()[routeName];
}

function addRouteStop(routeName, stationName, action, resource, amount) {
    var route = Memory.global.trucking.routes[routeName];
    
    if (!route) {
        return ERR_NOT_FOUND;
    } else if (!Memory.global.trucking.stations[stationName]) {
        return ERR_INVALID_TARGET;
    } else if (action != 'load' && action != 'unload') {
        return ERR_INVALID_ARGS;
    }
    
    route.stops.push({
        stationName: stationName,
        action: action,
        resource: resource,
        amount: amount
    });
    
    return route.stops.length;
}
function clearRouteStops(routeName) {
    var route = Memory.global.trucking.routes[routeName];
    if (!route) {
        return ERR_NOT_FOUND;
    }
    route.stops.length = 0;
    return OK;
}
function findStopTarget(stop, currentPos) {
    var station = getStation(stop.stationName);
    if (!station) {
        return ERR_NOT_FOUND;
    }
    
    if (station.type == 'target') {
        
        // direct reference
        return Game.getObjectById(station.target);
        
    } else if (station.type == 'flag') {
        // station flag rules:
        
        // (1) is of given type
        var typeFilter = (s) => _.some(station.structureTypes, (st) => s.structureType == st);
        
        // (2) has energy or capacity available
        var storedFilter;
        if (stop.action == 'load') {
            storedFilter = (s) => (utils.storedResource(s, stop.resource) > 0);
        } else if (stop.action == 'unload') {
            storedFilter = (s) => (utils.freeCapacity(s) > 0);
        } else {
            return ERR_INVALID_ARGS;
        }
        
        // (3) is in area
        var flag = Game.flags[station.flagName];
        var rangeFilter = (s) => (flag.pos.inRangeTo(s, station.range));
        
        var filter = (s) => (typeFilter(s) && storedFilter(s) && rangeFilter(s));
        
        if (flag.pos.roomName == currentPos.roomName) {
            return currentPos.findClosestByPath(FIND_STRUCTURES, { filter: filter });
        } else {
            return flag;
        }
        
    } else {
        return null;
    }
}

function spawnTruckers() {
    initTruckingMemory();
    for (var routeName in getRoutes()) {
        spawnRouteTruckers(routeName);
    }
}
function spawnRouteTruckers(routeName) {
    // get route
    var route = getRoute(routeName);
    if (!route) {
        return ERR_NOT_FOUND;
    } else if (!route.active || route.stops.length < 2 || route.truckersCount == 0) {
        return ERR_INVALID_TARGET;
    }
    
    // get spawn assigned to the route
    var spawn = Game.spawns[route.spawnName];
    if (!spawn) {
        return ERR_NOT_FOUND;
    } else if (spawn.spawning) {
        return ERR_BUSY;
    }

    // check the truckers assigned to the route
    var desiredTruckersCount = route.truckersCount;
    var truckerSpawnTime = route.truckersBody.length * CREEP_SPAWN_TIME;
    var currentTruckers = _.filter(findRouteTruckers(route.name), (c) => c.ticksToLive > truckerSpawnTime);
    if (currentTruckers.length >= desiredTruckersCount) {
        return OK;
    }
    
    // spawn a new trucker
    var newName = utils.createNameByRole('trucker');
    var body = route.truckersBody;
    var createStatus = spawn.createCreep(body, newName, {
        role: 'trucker',
        spawn: spawn.name,
        route: route.name,
        nextStopIndex: 0,
        nextStop: null,
        nextStopTarget: null,
    });
    
    // check createCreep result
    if (_.isString(createStatus)) {
        // ok, trucker spawned
        utils.nameByRoleWasUsed('trucker');
        console.log(spawn.name +': spawning trucker name='+ createStatus +', route='+ route.name +' ('+ (currentTruckers.length+1) +'/'+ desiredTruckersCount +'), size='+ body.length +', cost='+ utils.bodyCost(body));
    } else if (createStatus == ERR_NOT_ENOUGH_ENERGY) {
        // ...
    } else {
        //console.log(spawn.name +': error while spawning trucker name='+ newName +', status='+ createStatus);
    }

    return createStatus;
}
function findRouteTruckers(routeName) {
    return _.filter(Game.creeps, (c) => c.memory.role == 'trucker' && c.memory.route == routeName);
}
function runTrucker(creep) {
    
    if (creep.memory.role != 'trucker') {
        return ERR_INVALID_TARGET;
    }
    
    var route = getRoute(creep.memory.route);
    if (!route) {
        return ERR_NOT_FOUND;
    } else if (!route.active) {
        return ERR_INVALID_TARGET;
    } else if (route.stops.length < 2) {
        return ERR_INVALID_TARGET;
    }
    
    var nextStopIndex = creep.memory.nextStopIndex;

    // determine which route stop is the next one
    var nextStop = creep.memory.nextStop;
    if (!nextStop) {
        nextStop = route.stops[nextStopIndex];
        creep.memory.nextStop = nextStop;
    }

    // unload and empty or load and full? next stop!
    if (nextStop.action == 'load' && _.sum(creep.carry) == creep.carryCapacity) {
        //console.log(creep.name +': finished loading full');
        truckerStopFinished(creep);
        return OK;
    } else if (nextStop.action == 'unload' && !creep.carry[nextStop.resource]) {
        //console.log(creep.name +': finished unloading empty');
        truckerStopFinished(creep);
        return OK;
    }

    // determine the target of the stop
    var nextStopTarget = Game.getObjectById(creep.memory.nextStopTarget);
    if (!nextStopTarget) {
        nextStopTarget = findStopTarget(nextStop, creep.pos)
        if (nextStopTarget) {
            creep.memory.nextStopTarget = nextStopTarget.id;
            if (route.report) {
                console.log(creep.name +' @ ['+ route.name +':'+ nextStopIndex +':'+ nextStop.stationName +']: located next trucking target '+ nextStopTarget);
            }
        }
    }
    
    // no more stop targets - go to next stop!
    if (!nextStopTarget) {
        //console.log(creep.name +': finished with no targets');
        truckerStopFinished(creep);
        return OK;
    }
    
    // load / unload
    var transferStatus;
    if (nextStopTarget.name == nextStop.stationName) {
        // target is flag
        transferStatus = ERR_NOT_IN_RANGE;
    } else if (nextStop.action == 'load') {
        transferStatus = creep.withdraw(nextStopTarget, nextStop.resource, nextStop.amount);
    } else if (nextStop.action == 'unload') {
        transferStatus = creep.transfer(nextStopTarget, nextStop.resource, nextStop.amount);
    }
    if (transferStatus == OK) {
        var amount = nextStop.amount ? nextStop.amount : 'all';
        //console.log(creep.name +' @ ['+ route.name +':'+ nextStopIndex +':'+ nextStop.stationName +']: '+ nextStop.action +'ed '+ amount +' '+ nextStop.resource +' at '+ nextStopTarget);
        creep.memory.nextStopTarget = null;
    } else if (transferStatus == ERR_NOT_IN_RANGE) {
        creep.moveTo(nextStopTarget);
    } else {
        //console.log(creep.name +' @ ['+ route.name +':'+ nextStopIndex +':'+ nextStop.stationName +']: error while '+ nextStop.action +'ing at '+ nextStopTarget +': '+ utils.err(transferStatus));
    }
    return transferStatus;
    
}
function truckerStopFinished(creep) {
    if (creep.memory.role != 'trucker') {
        return ERR_INVALID_TARGET;
    }
    var route = getRoute(creep.memory.route);
    var stationLeavingName = route.stops[creep.memory.nextStopIndex].stationName;
    var stopIndex = creep.memory.nextStopIndex;
    //console.log(creep.name +' @ ['+ route.name +':'+ stopIndex +':'+ stationLeavingName +']: stop finished');
    
    var nextStopIndex = (stopIndex + 1) % route.stops.length;
    creep.memory.nextStopIndex = nextStopIndex;
    creep.memory.nextStop = null;
    creep.memory.nextStopTarget = null;
}
