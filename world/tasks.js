var taskHarvest = require('tasks.harvest');
var taskSupply = require('tasks.supply');
var taskUpgrade = require('tasks.upgrade');
var taskBuild = require('tasks.build');
var taskRepair = require('tasks.repair');
var taskWithdraw = require('tasks.withdraw');
var taskRestock = require('tasks.restock');

module.exports = {

    harvest: taskHarvest,
    supply: taskSupply,
    upgrade: taskUpgrade,
    build: taskBuild,
    repair: taskRepair,
    withdraw: taskWithdraw,
    restock: taskRestock,
    
    pickupDroppedEnergy: pickupDroppedEnergy,

};

function pickupDroppedEnergy(creep) {
    if (creep.spawnin) {
        return ERR_BUSY;
    } else if (_.sum(creep.carry) == creep.carryCapacity) {
        return ERR_FULL;
    }
    
    var drops = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
    if (drops.length == 0) {
        return ERR_NOT_FOUND;
    }
    
    var pickupTarget = drops[0];
    var pickupStatus = creep.pickup(pickupTarget);
    if (pickupStatus == OK) {
        //console.log(creep.name +': picking up '+ pickupTarget);
        return OK;
    } else {
        //console.log(creep.name + ': cannot pickup '+ pickupTarget +' ('+ pickupStatus +')');
        return pickupStatus;
    }
}
