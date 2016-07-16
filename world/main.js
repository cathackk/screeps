var roles = require('roles');
var tasks = require('tasks');
var spawning = require('spawning');
var towers = require('towers');
var links = require('links');
var utils = require('utils');
var trucking = require('trucking');

module.exports.loop = function () {
    
    //console.log('>> '+ Game.time);
    

    // clean memory each N ticks
    utils.memoryCleanup(9600); // 9600 ticks = cca 8 hours
    
    // spawning
    spawning.spawnRoles();
    trucking.spawnTruckers();

    // run active object
    links.runLinks();
    towers.runTowers();

    // creeps in game
    for (var creepName in Memory.creeps) {
        var creep = Game.creeps[creepName];
        
        if (creep) {
            
            // pickup dropped energy
            if (tasks.pickupDroppedEnergy(creep) == OK) {
                continue;
            }
            // tasks by role
            if (!creep.spawning && creep.memory.role) {
                roles[creep.memory.role].run(creep);
            }
            // born record
            if (!creep.spawning && !creep.memory.born) {
                creep.memory.born = Game.time;
                console.log('born: '+ creep.name);
            }
            // death countdown
            if (creep.ticksToLive <= 4) {
                creep.say((creep.ticksToLive-1) +'...');
            }
            
        } else {
            // dead creeps
            if (!Memory.creeps[creepName].died) {
                Memory.creeps[creepName].died = Game.time;
                var age = Game.time - Memory.creeps[creepName].born;
                console.log('died: '+ creepName +' ('+ age + ')');
            }
        }
        
    }
    
}
