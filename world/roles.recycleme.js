module.exports = {
    run: run,
};

function run(creep) {
    
    var target = Game.getObjectById(creep.memory.target);
    if (!target) {
        target = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        creep.memory.target = target.id;
        console.log(creep.name +': located recycle target '+ target);
    }
    
    if (target) {
        var recycleStatus = target.recycleCreep(creep);
        if (recycleStatus == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }

}

