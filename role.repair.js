module.exports = {

  run: function(creep) {
    const source = Game.getObjectById(creep.memory.idSource); //creep.pos.findPathTo(Game.getObjectById(creep.memory.idSource))
    const storage = creep.room.storage;
    let droppedEnergy = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
      filter: s => s.resourceType == RESOURCE_ENERGY
    });
    let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s => s.structureType == STRUCTURE_CONTAINER
    })[0];
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter:
        // structureType: STRUCTURE_ROAD ||
        function(object) {
          return ((object.hits < (object.hitsMax / 1000)) && object.structureType == STRUCTURE_RAMPART)
        }

    });
    targets.sort((a, b) => creep.pos.findClosestByRange(a) - creep.pos.findClosestByRange(b));


    let isDoubleSourced = false;
    let sourcesInRoom = creep.room.find(FIND_SOURCES);

    if (sourcesInRoom[1])
      isDoubleSourced = true;

    if ((!storage || storage.store[RESOURCE_ENERGY] < creep.carryCapacity) && creep.memory.isDelivering) {
      if (container.store[RESOURCE_ENERGY] < creep.carryCapacity && creep.memory.isDelivering) {
        if (!droppedEnergy) {
          let idNextSource = null;
          if (isDoubleSourced && creep.memory.idSource == sourcesInRoom[0].id)
            idNextSource = sourcesInRoom[1].id
          else
            idNextSource = sourcesInRoom[0].id

          let nextContainer = Game.getObjectById(idNextSource).pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
          })[0];

          if (nextContainer.store[RESOURCE_ENERGY] > creep.carryCapacity) {
            container = nextContainer
          }
        } else {
          if (creep.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedEnergy[0]);
            //console.log(creepsInRoom.length)
          }
        }
      } else {
        container = storage
      }
    }

    //console.log(storage)
    if (container && _.sum(creep.carry) != creep.carryCapacity && creep.memory.isDelivering) {
      if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
        //console.log(creepsInRoom.length)
      }

    } else if (_.sum(creep.carry) == creep.carryCapacity || !creep.memory.isDelivering) {

      if (targets.length > 0) {
        if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0]);
        }
      }

      if (_.sum(creep.carry) == 0) {
        creep.memory.isDelivering = true;
      } else {
        creep.memory.isDelivering = false;
      }
    }
  }
};
