var tasks = require('tasks');

module.exports = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (!creep.memory.assignment) {
            var coworkers = creep.room.find(FIND_MY_CREEPS, { filter: (c) => c.memory.role == 'harvester' });
            var harvestFlags = creep.room.find(FIND_FLAGS, { filter: (f) => f.name.startsWith('Harvest') });

            for (var flagIndex in harvestFlags) {
                var flag = harvestFlags[flagIndex];
                var assigned = _.filter(coworkers, (c) => c.memory.assignment == flag.name).length;
                if (!flag.memory.maxAssigned) {
                    flag.memory.maxAssigned = 0;
                }
                if (assigned < flag.memory.maxAssigned) {
                    creep.memory.assignment = flag.name;
                    console.log(creep.name +': assigned to '+ creep.memory.assignment);
                    break;
                }
            }
        }
        
        if (creep.memory.task == 'harvest') {
            
            var harvestFinished = tasks.harvest.run(creep);
            if (harvestFinished) {
                creep.memory.task = 'supply';
                creep.memory.target = null;
            }
            
        } else if (creep.memory.task == 'supply') {
            
            var supplyFinished = tasks.supply.run(creep);
            if (supplyFinished) {
                creep.memory.task = 'harvest';
                creep.memory.target = null;
            }
            
        } else {
            // default task
            creep.memory.task = 'harvest';
            creep.memory.target = null;
        }
    },
    
    autoRoleSpawning: true,
    
};