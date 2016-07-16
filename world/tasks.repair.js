module.exports = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy > 0) {
        
            if (!creep.memory.repairs) {
                creep.memory.repairs = 0;
            }
            if (!creep.room.memory.repairs) {
                creep.room.memory.repairs = {};
            }
        
            // recheck target each 20 ticks
            if (creep.memory.target && creep.memory.repairs >= 20) {
                creep.memory.target = null;
                creep.memory.repairs = 0;
            }
        
            // check if repair target is still valid
            if (creep.memory.target) {
                var target = Game.getObjectById(creep.memory.target);
                if (!target || target.hits == target.hitsMax) {
                    creep.memory.target = null;
                    creep.memory.repairs = 0;
                }
            }
        
            // find repair target
            if (!creep.memory.target) {
                var repairWalls = creep.room.memory.repairs.walls;
                if (repairWalls == undefined) {
                    repairWalls = true;
                    creep.room.memory.repairs.walls = repairWalls;
                }
                
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.hits < s.hitsMax && (repairWalls == true || s.structureType != STRUCTURE_WALL)
                });
            
                if (targets.length > 0) {
                    var minFitness = _.min(_.map(targets, module.exports.fitness ));
                    var fitnessThreshold = minFitness * 1.2;
                    var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => (s.hits < s.hitsMax && module.exports.fitness(s) <= fitnessThreshold)
                    });
                    creep.memory.target = target.id;
                    creep.memory.repairs = 0;
                    //console.log(creep.name +': located repair target: '+ target +' (hits='+ target.hits +'/'+ target.hitsMax +', fitness='+ module.exports.fitness(target) +')');
                }
            }
        
            // repair
            if (creep.memory.target) {
                var target = Game.getObjectById(creep.memory.target);
                var repairStatus = creep.repair(target);
                if (repairStatus == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else {
                    // counting the repair ticks
                    ++creep.memory.repairs;
                }
            }
        
        }
    
        return creep.carry.energy == 0;
    },
    
    fitness: function(structure) {
        if (structure.hitsMax <= 100000) {
            return structure.hits / structure.hitsMax;
        } else {
            return structure.hits / 100000;
        }
    }

    
}
