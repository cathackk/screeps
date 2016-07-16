module.exports = {
    runTowers: runTowers,
};

function runTowers() {
    for (var roomName in Game.rooms) {
        runTowersAt(roomName);
    }
}

function runTowersAt(roomName) {
    var room = Game.rooms[roomName];
    
    // room towers
    var roomTowers = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TOWER });
    for (var towerIndex in roomTowers) {
        var tower = roomTowers[towerIndex];
        runTower(tower);
    }
}

function runTower(tower) {
    if (!tower) {
        return ERR_NOT_FOUND;
    } else if (tower.energy == 0) {
        return ERR_NOT_ENOUGH_ENERGY;
    }

    var closestEnemy = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestEnemy) {
        tower.attack(closestEnemy);
    }
    
    /*
    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });
    if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
    }
    */
}