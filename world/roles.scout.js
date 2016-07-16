module.exports = {
    
    run: function(creep) {
        
        // still exists?
        if (creep.memory.target && !Game.flags[creep.memory.target]) {
            console.log(creep.name +': invalid target '+ creep.memory.target +', '+ resetting);
            creep.memory.target = null;
        }
        
        // arrived?
        if (creep.memory.target) {
            var target = Game.flags[creep.memory.target];
            if (creep.pos.isEqualTo(target.pos)) {
                creep.memory.target = null;
                creep.say('Arrived!')
                console.log(creep.name +': arrived at '+ creep.pos);
            }
        }
        
        // move
        if (creep.memory.target) {
            var target = Game.flags[creep.memory.target];
            var moveStatus = creep.moveTo(target);
        }
        
        
    },
    
    autoRoleSpawning: false,
    
};