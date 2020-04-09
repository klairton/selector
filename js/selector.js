angular.module('selectorApp', [])
  .controller('SelectorController', function() {
    var selector = this;

    selector.reset = function() {
      selector.step = 1;
      selector.players = [];
      selector.team = [];
      selector.teams = [];
      selector.log = ""; 
      selector.min = {ek: 2, ed: 4, rp: 3, ms: 1};
      selector.fill = {ek: false, ed: true, rp: true, ms: true};
      selector.team_size = 10;
      selector.error = false;
      selector.errors = [];
      selector.swap = {x: {i: -1, j: -1}, y: {i: -1, j: -1}};
      selector.click_one = false;
      selector.click_two = false;
    }

    selector.reselect = function() {
      selector.step = 2;
      selector.team = [];
      selector.error = false;
      selector.errors = [];
      selector.swap = {x: {i: -1, j: -1}, y: {i: -1, j: -1}};
      selector.click_one = false;
      selector.click_two = false;
    }

    selector.reset();

    selector.parseLog = function() {
      var players = []
      var regex = /^[\d]{2}:[\d]{2}(.+): (EK|ED|RP|MS)$/i;
      selector.log = selector.log + "\n"
      var lines = selector.log.split("\n");

      for (var i = 0; i < lines.length; i++) {
        line = lines[i]
        if(regex.test(line)) {
          var result = regex.exec(line);
          var name = result[1];
          name = name.trim();
          var voc = result[2].toUpperCase();
          if(!players.some(function(el){ return el.name === name})){
            players.push({name: name, voc: voc, priority: false});
          }
        }
      }
      selector.players = players;
      selector.step = 2;
    }

    selector.check = function() {
      var fill = 0;
      selector.error = false;
      selector.errors = [];
      var min_players = (parseInt(selector.min.ek) + parseInt(selector.min.ed) + parseInt(selector.min.rp) + parseInt(selector.min.ms));
      var total_players = selector.countByVoc('EK') + selector.countByVoc('ED') + selector.countByVoc('RP') + selector.countByVoc('MS');
      
      if(min_players > selector.team_size) {
        selector.error = true;
        selector.errors.push("Quantidade de mímina de players superior ao tamanho do time.");
      }
      if(parseInt(selector.team_size) > total_players) {
        selector.error = true;
        selector.errors.push("Quantidade de players insuficiente para formar o time.");
      }
      if(parseInt(selector.min.ek) > selector.countByVoc('EK')) {
        selector.error = true;
        selector.errors.push("Quantidade de knights é insuficiente.");
      }
      if(parseInt(selector.min.ed) > selector.countByVoc('ED')) {
        selector.error = true;
        selector.errors.push("Quantidade de druids é insuficiente.");
      }
      if(parseInt(selector.min.rp) > selector.countByVoc('RP')) {
        selector.error = true;
        selector.errors.push("Quantidade de paladins é insuficiente.");
      }
      if(parseInt(selector.min.ms) > selector.countByVoc('MS')) {
        selector.error = true;
        selector.errors.push("Quantidade de sorcerers é insuficiente.");
      }

      if(selector.fill.ek) {
        fill += selector.countByVoc('EK') - (parseInt(selector.min.ek));
      }

      if(selector.fill.ed) {
        fill += selector.countByVoc('ED') - (parseInt(selector.min.ed));
      }

      if(selector.fill.rp) {
        fill += selector.countByVoc('RP') - (parseInt(selector.min.rp));
      }

      if(selector.fill.ms) {
        fill += selector.countByVoc('MS') - (parseInt(selector.min.ms));
      }

      if((parseInt(selector.team_size) - min_players) > fill) {
        selector.error = true;
        selector.errors.push("Quantidade de players para completar o time é insuficiente.");
      }

      if(!selector.error) {
        selector.step = 3;
      }
    }

    selector.selectPriorityByVoc = function(voc) {
      var players = []

      for (var i = 0; i < selector.players.length; i++) {
        player = selector.players[i]
        if(player.priority && player.voc == voc) {
          players.push(player);
        }
      }
      return players;
    }

    selector.selectByVoc = function(voc) {
      var players = []

      for (var i = 0; i < selector.players.length; i++) {
        player = selector.players[i]
        if(player.voc == voc) {
          players.push(player);
        }
      }
      return players;
    }

    selector.countByVoc = function(voc) {
      var players = 0

      for (var i = 0; i < selector.players.length; i++) {
        player = selector.players[i]
        if(player.voc == voc) {
          players += 1;
        }
      }
      return players;
    }

    selector.removePlayerfromPool = function(name) {
      names = selector.players.map(function(el) { return el.name; });
      index = names.indexOf(name);
      selector.players.splice(index, 1);
    }

    selector.selectPlayersByVoc = function(voc, min) {
      var aux, i, player, names, index;
      var players = [];

      // Reserve the space by priority and vocation
      aux = selector.selectPriorityByVoc(voc);
      if(aux.length > min) {
        while(players.length < min) {
          i = randomInt(0, aux.length - 1);
          player = aux[i];
          if(!players.some(function(el){ return el.name === player.name})){
            players.push({name: player.name, voc: player.voc, priority: player.priority});
            selector.removePlayerfromPool(player.name);
            names = aux.map(function(el) { return el.name; });
            index = names.indexOf(player.name);
            aux.splice(index, 1);
          }
        }
      } else {
        players = aux;
      }

      // Reserve the space by vocation
      aux = selector.selectByVoc(voc);
      while(players.length < min) {
        i = randomInt(0, aux.length - 1);
        player = aux[i];
        if(!players.some(function(el){ return el.name === player.name})){
          players.push({name: player.name, voc: player.voc, priority: player.priority});
          selector.removePlayerfromPool(player.name);
          names = aux.map(function(el) { return el.name; });
          index = names.indexOf(player.name);
          aux.splice(index, 1);
        }
      }

      // Add the players in the team
      for (i = 0; i < players.length; i++) {
        player = players[i];
        selector.team.push({name: player.name, voc: player.voc, priority: player.priority})
      }
    }

    selector.fillTeamWithPriority = function() {
      var aux, i, player, names, index;
      var players = [];

      // Create a pool considering the priority and vocations allowed to fill the team
      if(selector.fill.ek){
        aux = selector.selectPriorityByVoc('EK');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }
      if(selector.fill.ed){
        aux = selector.selectPriorityByVoc('ED');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }
      if(selector.fill.rp){
        aux = selector.selectPriorityByVoc('RP');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }
      if(selector.fill.ms){
        aux = selector.selectPriorityByVoc('MS');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }

      // Select the players randomly the players from the pool
      while(selector.team.length < selector.team_size && players.length > 0) {
        i = randomInt(0, players.length - 1);
        player = players[i];
        selector.team.push({name: player.name, voc: player.voc, priority: player.priority});
        selector.removePlayerfromPool(player.name);
        names = players.map(function(el) { return el.name; });
        index = names.indexOf(player.name);
        players.splice(index, 1);
      }
    }

    selector.fillTeam = function() {
      var aux, i, player, names, index;
      var players = [];

      // Create a pool considering the vocations allowed to fill the team
      if(selector.fill.ek){
        aux = selector.selectByVoc('EK');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }
      if(selector.fill.ed){
        aux = selector.selectByVoc('ED');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }
      if(selector.fill.rp){
        aux = selector.selectByVoc('RP');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }
      if(selector.fill.ms){
        aux = selector.selectByVoc('MS');
        for(i = 0; i < aux.length; i++) {
          player = aux[i];
          players.push({name: player.name, voc: player.voc, priority: player.priority});
        }
      }

      // Select the players randomly the players from the pool
      while(selector.team.length < selector.team_size && players.length > 0) {
        i = randomInt(0, players.length - 1);
        player = players[i];
        selector.team.push({name: player.name, voc: player.voc, priority: player.priority});
        selector.removePlayerfromPool(player.name);
        names = players.map(function(el) { return el.name; });
        index = names.indexOf(player.name);
        players.splice(index, 1);
      }
    }    

    selector.select = function() {
      if(!selector.error) {
        selector.selectPlayersByVoc('EK', parseInt(selector.min.ek));
        selector.selectPlayersByVoc('ED', parseInt(selector.min.ed));
        selector.selectPlayersByVoc('RP', parseInt(selector.min.rp));
        selector.selectPlayersByVoc('MS', parseInt(selector.min.ms));
        selector.fillTeamWithPriority();
        selector.fillTeam();
        selector.team.sort(function(a, b) {return (a.voc < b.voc) ? -1 : 1;});
        selector.players.sort(function(a, b) {return (a.voc < b.voc) ? -1 : 1;});
        selector.teams.push(selector.team);
        selector.team = [];
      }
    }

    selector.clickPlayer = function(i, j) {
      if(selector.click_one && selector.click_two) {
        selector.swap.x = {i: -1, j: -1};
        selector.swap.y = {i: -1, j: -1};
        selector.click_one = false;
        selector.click_two = false;
      }
      if(selector.click_one && !selector.click_two) {
        selector.swap.y = {i: i, j: j};
        selector.click_two = true;
      }
      if(!selector.click_one) {
        selector.swap.x = {i: i, j: j};
        selector.click_one = true;
      }
    }

    selector.swapPlayers = function() {
      if(selector.click_one && selector.click_two) {
        temp = selector.teams[selector.swap.x.i][selector.swap.x.j];
        selector.teams[selector.swap.x.i][selector.swap.x.j] = selector.teams[selector.swap.y.i][selector.swap.y.j];
        selector.teams[selector.swap.y.i][selector.swap.y.j] = temp;
        selector.swap.x = {i: -1, j: -1};
        selector.swap.y = {i: -1, j: -1};
        selector.click_one = false;
        selector.click_two = false;
      }
    }

    selector.countByVoc = function(voc) {
      var players = 0

      for (var i = 0; i < selector.players.length; i++) {
        player = selector.players[i]
        if(player.voc == voc) {
          players += 1;
        }
      }
      return players;
    }

    function randomInt(min, max) {
      return min + Math.round((max - min) * Math.random());
    }

  });