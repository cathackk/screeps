var utils = require('utils');
var roles = require('roles');

module.exports = {
    spawnRoles: spawnRoles,
};

function spawnRoles() {
    for (var spawnName in Game.spawns) {
        spawnRolesAt(spawnName);
    }
}

function spawnRolesAt(spawnName) {
    var spawn = Game.spawns[spawnName];
    
    if (!spawn.room.memory.roles) {
        spawn.room.memory.roles = {};
    }
    
    if (spawn.spawning != null) {
        // already spawning
        return ERR_BUSY;
    }
        
    for (var roleName in roles) {
        var role = roles[roleName];
        
        if (!role.autoRoleSpawning) {
            continue;
        }
        
        var roomRoleSettings = spawn.room.memory.roles[roleName];
        if (!roomRoleSettings) {
            roomRoleSettings = {count: 0, body: [WORK, CARRY, MOVE]};
            spawn.room.memory.roles[roleName] = roomRoleSettings;
        }
        
        var roleSpawnTime = roomRoleSettings.body.length * CREEP_SPAWN_TIME;
        var holders = spawn.room.find(FIND_MY_CREEPS, {filter: (c) => c.ticksToLive > roleSpawnTime && c.memory.role == roleName});
        var desired = roomRoleSettings.count;
        
        //console.log(spawn.name +': role='+ roleName +', holders='+ holders.length +', desired='+ desired);
        
        if (holders.length < desired) {
            //console.log(spawn.name +': desiring new '+ roleName +' ('+ holders.length +'/'+ desired +')');
            var canSpawn = !role.spawnCondition || role.spawnCondition(spawn);
            if (canSpawn) {
                var newName = utils.createNameByRole(roleName);
                var body = roomRoleSettings.body;
                var createStatus = spawn.createCreep(body, newName, {role: roleName, spawn: spawn.name});
                if (_.isString(createStatus)) {
                    // ok
                    utils.nameByRoleWasUsed(roleName);
                    console.log(spawn.name +': spawning creep name='+ createStatus +', role='+ roleName +' ('+ (holders.length+1) +'/'+ desired +'), size='+ body.length +', cost='+ utils.bodyCost(body));
                    return createStatus;
                } else if (createStatus == ERR_NOT_ENOUGH_ENERGY) {
                    // ...
                } else {
                    console.log(spawn.name +': error while spawning name='+ newName +', status='+ createStatus);
                }
            }
            
        } else {
            //console.log('No more '+ roleName + 's needed ('+ holders.length +'/'+ desired +')');
        }
        
    }

}
