var utils = require('utils');

module.exports = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy > 0) {
            
            // validate target
            if (creep.memory.target) {
                var target = Game.getObjectById(creep.memory.target);
                if (!target) {
                    creep.memory.target = null;
                }
            }
            
            // find a priority construction site
            if (!creep.memory.target) {
                for (var flagName in Game.flags) {
                    var flag = Game.flags[flagName];
                    if (flag.room == creep.room && flagName.startsWith('Build')) {
                        var targets = flag.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 0);
                        if (targets.length > 0) {
                            var target = targets[0];
                            creep.memory.target = target.id;
                            console.log(creep.name +' located priority build target: '+ target);
                            break;
                        }
                    }
                }
            }
            
            // find a construction site
            if (!creep.memory.target) {
                var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (target) {
                    creep.memory.target = target.id;
                    //console.log(creep.name +': located build target: '+ target);
                }
            }
        
            // build
            if (creep.memory.target) {
                var target = Game.getObjectById(creep.memory.target);
                var buildStatus = creep.build(target);
                if (buildStatus == 0) {
                    // ok
                } else if (buildStatus == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else {
                    console.log('build status: '+ utils.err(buildStatus) +', resetting target');
                    creep.memory.target = null;
                    return false;
                }
                //console.log(creep.name +': build status '+ buildStatus);
            }
        
        }
        
        return creep.carry.energy == 0;
    }
    
}
