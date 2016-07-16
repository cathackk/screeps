var utils = require('utils');

module.exports = {
    runLinks: runLinks,
    createLink: createLink
};

function runLinks() {
    for (var roomName in Game.rooms) {
        runLinksAt(roomName);
    }
}

function runLinksAt(roomName) {
    var room = Game.rooms[roomName];
    if (!room.memory.links) {
        room.memory.links = {};
    }
    for (var linkName in room.memory.links) {
        runLink(room.memory.links[linkName]);
    }
}

function runLink(link) {
    if (!link.active) {
        return OK;
    }
    
    var source = Game.getObjectById(link.source);
    var target = Game.getObjectById(link.target);
    
    if (!source || !target) {
        return ERR_NOT_FOUND;
    } else if (source.energy == 0) {
        return ERR_NOT_ENOUGH_ENERGY;
    } else if (source.cooldown > 0) {
        return ERR_BUSY;
    } else if (target.energy == target.energyCapacity) {
        return ERR_FULL;
    }
    
    return source.transferEnergy(target);
}

function createLink(linkName, source, target) {
    if (!source || !target) {
        return ERR_NOT_FOUND;
    } else if (source.room != target.room) {
        return ERR_INVALID_TARGET;
    }
    
    var room = source.room;
    if (room.memory.links[linkName]) {
        return ERR_NAME_EXISTS;
    }
    
    room.memory.links[linkName] = {
        name: linkName,
        roomName: room.name,
        source: source.id,
        target: target.id,
        active: true
    };
    
    return linkName;
}